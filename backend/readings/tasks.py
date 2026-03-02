from __future__ import annotations

import base64
import json
import logging
import os
import random
import re
import time
from dataclasses import asdict, dataclass
from datetime import timedelta
from typing import Callable, Dict, TypeVar

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone
from openai import OpenAI, RateLimitError

from .models import EventLog, Reading, ReadingStatus

log = logging.getLogger(__name__)

T = TypeVar("T")


def retry_on_rate_limit(
    func: Callable[[], T],
    max_retries: int = 3,
    base_delay: float = 2.0,
) -> T:
    """
    Retry a function call with exponential backoff on RateLimitError.
    
    Args:
        func: The function to call
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds (will be doubled each retry)
    
    Returns:
        The result of the function call
    
    Raises:
        RateLimitError: If all retries are exhausted
        Any other exception raised by func
    """
    last_exception = None
    for attempt in range(max_retries + 1):
        try:
            return func()
        except RateLimitError as e:
            last_exception = e
            if attempt < max_retries:
                # Extract retry-after from error if available, otherwise use exponential backoff
                delay = base_delay * (2 ** attempt)
                error_msg = str(e)
                if "try again in" in error_msg.lower():
                    # Try to extract seconds from message like "Please try again in 20s"
                    try:
                        match = re.search(r"try again in (\d+)s?", error_msg, re.IGNORECASE)
                        if match:
                            delay = float(match.group(1)) + 1  # Add 1 second buffer
                    except Exception:
                        pass  # Use exponential backoff if parsing fails
                
                log.warning(
                    "Rate limit hit (attempt %d/%d), retrying in %.1f seconds...",
                    attempt + 1,
                    max_retries + 1,
                    delay,
                )
                time.sleep(delay)
            else:
                log.error("Rate limit retries exhausted after %d attempts", max_retries + 1)
                raise
        except Exception as e:
            # Don't retry on non-rate-limit errors
            raise
    # This should never be reached, but type checker needs it
    if last_exception:
        raise last_exception
    raise RuntimeError("Unexpected error in retry logic")


@dataclass
class LineInterpretation:
    quality: str
    score: float  # 0–1 confidence which will be converted to 0–100 on the frontend
    meaning: str
    details: str


def is_palm_image(image_bytes: bytes) -> bool:
    """
    Use OpenAI vision to verify that the image contains a human hand/palm.
    Returns True if confident it's a palm image, False otherwise.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # If no key, we can't validate; allow image to pass rather than block everything
        log.warning("OPENAI_API_KEY not set, skipping palm validation")
        return True

    # Fix broken SSL_CERT_FILE on some Windows setups
    ssl_cert = os.environ.get("SSL_CERT_FILE")
    if ssl_cert and not os.path.exists(ssl_cert):
        os.environ.pop("SSL_CERT_FILE", None)

    client = OpenAI(api_key=api_key)

    try:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        prompt = """
You are an image classifier. Determine if the image clearly shows a human hand or palm suitable for palm reading.
Respond ONLY with strict JSON of the form: {"is_palm": true} or {"is_palm": false}.
- Return true only if a single human hand/palm is clearly visible and usable.
- Return false for faces, full bodies, text, objects, scenery, feet, animals, or unclear hands.
"""
        
        def _make_validation_request():
            return client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "system",
                        "content": "You only answer with strict JSON indicating if the image is a palm.",
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{b64}",
                                },
                            },
                        ],
                    },
                ],
                temperature=0.0,
            )

        try:
            response = retry_on_rate_limit(_make_validation_request, max_retries=2, base_delay=1.0)
        except RateLimitError:
            # If all retries fail, don't block the user with "invalid image" –
            # skip palm validation and let the main analysis step handle/report the 429.
            log.warning("OpenAI rate limit hit during palm validation after retries; skipping validation for this request.")
            return True

        content = response.choices[0].message.content or ""
        try:
            start = content.index("{")
            end = content.rindex("}") + 1
            json_str = content[start:end]
        except ValueError:
            json_str = content

        data = json.loads(json_str)
        return bool(data.get("is_palm"))
    except Exception:
        # On validation/API error, allow image to pass so we don't block users due to flakiness
        log.warning("Palm image validation failed (exception), allowing image to pass")
        return True


def _load_palm_prompt_template() -> str:
    """Load the palm reading prompt template from file."""
    from pathlib import Path
    here = Path(__file__).resolve().parent
    template_path = here / "palm_prompt_template.txt"
    if template_path.exists():
        return template_path.read_text(encoding="utf-8")
    # Fallback to inline prompt if file doesn't exist
    return """
You are an expert palm reader and AI vision specialist. 
Analyze the palm image and extract the following information accurately.

Return ONLY valid JSON matching the exact schema specified.
"""


def _run_gpt_palm_model(image_path: str) -> Dict:
    """
    Call GPT (vision) to analyze the palm image and return structured JSON
    matching PalmAnalysisResult.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    # Some Windows environments set SSL_CERT_FILE to a missing path, which breaks httpx/OpenAI.
    ssl_cert = os.environ.get("SSL_CERT_FILE")
    if ssl_cert and not os.path.exists(ssl_cert):
        os.environ.pop("SSL_CERT_FILE", None)

    client = OpenAI(api_key=api_key)

    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    prompt = _load_palm_prompt_template()
    
    # If template loading failed, use the exact specification prompt
    if not prompt or len(prompt.strip()) < 100:
        prompt = """
You are an expert palm reader and AI vision specialist. 
Analyze the palm image and extract the following information accurately:

1. OVERALL SCORE (0–100)
   - One numeric score
   - Short reasoning

2. PALM LINES — For each line:
   - Life Line
   - Head Line
   - Heart Line
   - Fate Line
   For each line provide:
     - Type (Strong, Weak, Curved, Faint, Broken, Clear)
     - Quality Score (0–100)
     - Interpretation (short but meaningful)

3. PERSONALITY TRAITS
   Return EXACT fields:
     - Leadership (score + meaning)
     - Creativity
     - Intuition
     - Communication
     - Determination
   Also include:
     - Dominant Hand (Left/Right)
     - Palm Shape (Square, Round, Earth, Fire, Air, Water)
     - Finger Length (Long, Short, Balanced)
     - Hand Type Summary (2–3 lines)

4. PREDICTIONS — Provide:
   - Career (next 6 months)
   - Relationships (next 3 months)
   - Health (ongoing)
   - Finances (next 1 year)
   For each:
     - Prediction
     - Advice
     - Confidence Score (0–100)

5. SPECIAL MARKS — Detect any:
   - Stars
   - Triangles
   - Crosses
   - Chains
   - Grills
   - Symbols
   For each:
     - Name
     - Meaning
     - Impact Level: High / Medium / Low

6. OUTPUT FORMAT:
   Respond ONLY in JSON with keys:

Return everything in structured JSON exactly in this format:

{
  "palm_lines": {
    "life_line": {
      "strength": "Strong" | "Moderate" | "Weak" | "Broken",
      "quality_score": "XX%",  // Calculated from metrics below
      "interpretation": "string",  // Based on detected features
      "metrics": {
        "clarity": "Deep" | "Moderate" | "Faint" | "Unclear",
        "length": "Full" | "Partial" | "Short",
        "depth": "Deep" | "Moderate" | "Shallow",
        "breaks": "None" | "Minor" | "Major",
        "calculated_score": "XX%"  // Formula: (clarity + length + depth + continuity) ÷ 4
      }
    },
    "heart_line": {
      "strength": "Strong" | "Moderate" | "Weak",
      "quality_score": "XX%",
      "interpretation": "string",
      "metrics": {
        "clarity": "Deep" | "Moderate" | "Faint" | "Unclear",
        "depth": "Deep" | "Moderate" | "Shallow",
        "continuity": "Unbroken" | "Minor breaks" | "Major breaks",
        "calculated_score": "XX%"  // Formula: (clarity + depth + continuity) ÷ 3
      }
    },
    "head_line": {
      "strength": "Strong" | "Moderate" | "Weak",
      "quality_score": "XX%",
      "interpretation": "string",
      "metrics": {
        "clarity": "Deep" | "Moderate" | "Faint" | "Unclear",
        "depth": "Deep" | "Moderate" | "Shallow",
        "continuity": "Unbroken" | "Minor breaks" | "Major breaks",
        "curvature": "Straight" | "Curved" | "Highly Curved",
        "calculated_score": "XX%"  // Formula: (clarity + depth + continuity + curvature) ÷ 4
      }
    },
    "fate_line": {
      "strength": "Present" | "Weak" | "Faint" | "Absent",
      "quality_score": "XX%" | "0%",  // 0% if absent
      "interpretation": "string",
      "metrics": {
        "present": "Yes" | "No",
        "clarity": "Deep" | "Moderate" | "Faint" | "Unclear" | "N/A",
        "depth": "Deep" | "Moderate" | "Shallow" | "N/A",
        "calculated_score": "XX%"  // 0% if absent, otherwise (clarity + depth) ÷ 2
      }
    }
  },
  "personality_traits": {
    "creative": {
      "percentage": "XX%",
      "calculation": "Calculated from head line curvature=X, Moon mount=X, finger flexibility=X"
    },
    "analytical": {
      "percentage": "XX%",
      "calculation": "Calculated from head line clarity=X, palm shape=X, finger length=X"
    },
    "emotional": {
      "percentage": "XX%",
      "calculation": "Calculated from heart line depth=X, Venus mount=X, palm texture=X"
    },
    "leadership": {
      "percentage": "XX%",
      "calculation": "Calculated from Jupiter mount=X, thumb strength=X, palm size=X"
    },
    "practical": {
      "percentage": "XX%",
      "calculation": "Calculated from palm shape=X, line clarity=X, Saturn mount=X"
    },
    "intuitive": {
      "percentage": "XX%",
      "calculation": "Calculated from Moon mount=X, heart line=X, palm sensitivity=X"
    }
  },
  "physical_characteristics": {
    "dominant_hand": "Left" | "Right",
    "palm_shape": "Square" | "Fire" | "Water" | "Air" | "Earth",
    "finger_length": "Short" | "Medium" | "Long",
    "hand_type": "string",  // e.g., "Square hand with medium fingers"
    "mounts": {
      "venus": "High" | "Medium" | "Low",
      "jupiter": "High" | "Medium" | "Low",
      "saturn": "High" | "Medium" | "Low",
      "apollo": "High" | "Medium" | "Low",
      "mercury": "High" | "Medium" | "Low",
      "moon": "High" | "Medium" | "Low"
    }
  },
  "hand_type_analysis": {
    "overall_score": "XX%",  // Calculated: (Line Average × 0.4) + (Trait Average × 0.4) + (Mount Average × 0.2)
    "summary": "string"  // 2-3 sentences explaining overall score and key findings
  },
  "predictions": {
    "career": {
      "period": "Next 1-2 Years",
      "prediction": "string",
      "advice": "string",
      "confidence": "XX%"  // Based on fate line, Saturn mount, Sun mount clarity
    },
    "relationships": {
      "period": "Next 6 Months",
      "prediction": "string",
      "advice": "string",
      "confidence": "XX%"  // Based on heart line clarity
    },
    "health": {
      "period": "Next 12 Months",
      "prediction": "string",
      "advice": "string",
      "confidence": "XX%"  // Based on life line quality
    },
    "finances": {
      "period": "Next 1 Year",
      "prediction": "string",
      "advice": "string",
      "confidence": "XX%"  // Based on fate line, Mercury mount clarity
    }
  },
  "special_marks": [
    {
      "type": "Star" | "Cross" | "Chain" | "Island" | "Fork" | "Triangle" | "Break" | "Grille",
      "location": "string",  // Mount name or line name
      "meaning": "string"
    }
  ]
}

✅ ANALYSIS RULES (MAKE DATA REAL & ACCURATE)

**1. Never create random % values. Calculate them from visible palm features:**

Examples:
- Life line score = (clarity + length + depth + continuity) ÷ 4
- Creativity = (head line curvature + Moon mount + finger flexibility) ÷ 3
- Leadership = (Jupiter mount + thumb strength + palm size) ÷ 3

You MUST compute percentages from the palm image.

**2. All scores must be unique per user. No repetition across different users.**

**3. Interpretations must match the detected line condition.**

Examples:
- Weak heart line → emotional struggles
- Curved head line → creativity
- Missing fate line → flexible career path

**4. Predictions must match the personality + palm line readings.**

Example:
- If heart line weak → low confidence in relationship forecast.
- If fate line missing → uncertain career path.

**5. Special Marks**

Detect marks like:
- Stars
- Crosses
- Chains
- Islands
- Forks
- Triangles
- Breaks
- Grilles

Explain meaning for each.

CRITICAL: Every number, percentage, and interpretation MUST be derived from actual features visible in the image.
Do NOT use placeholder values, repeated patterns, or random numbers.
Analyze the hand systematically: lines first, then mounts, then physical characteristics, then calculate traits and predictions.

MANDATORY OUTPUT REQUIREMENT:
- You MUST return ONLY valid JSON in the exact format specified above
- DO NOT include any explanatory text before or after the JSON
- DO NOT return error messages in plain text (unless image is clearly NOT a palm, then return {"error": "Please upload a clear image of a human palm."})
- If the image is unclear or poor quality, still return complete JSON with lower confidence scores (30-60%)
- If you cannot see certain features clearly, use "Weak" or "Faint" quality ratings and lower scores
- But ALWAYS return valid JSON - never return plain text explanations or error messages
- The JSON must start with { and end with } with no additional text
- All percentage values should be strings like "65%" not numbers
- All calculated_score values in metrics should be strings like "65%"

Return ONLY the JSON object, nothing else.
"""

    def _make_request():
        return client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert palm reader and AI vision specialist. "
                    "Analyze ONLY what is visible in the palm image. "
                    "Be LENIENT with image quality - if you can see any part of a hand/palm, analyze it. "
                    "For unclear images, use lower confidence scores (40-70%) but still provide complete analysis. "
                    "Only reject images that are clearly NOT a hand/palm (faces, objects, landscapes). "
                    "Do NOT hallucinate. Return ONLY valid JSON. "
                    "Response time must be optimized for < 3 seconds - keep descriptions concise but comprehensive. "
                    "All scores must be unique per user. No repetition across different users."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{b64}",
                            },
                        },
                    ],
                },
            ],
            temperature=0.2,  # Slightly higher for uniqueness while maintaining accuracy
            max_tokens=2000,  # Limit tokens for faster response (<3 seconds)
            response_format={"type": "json_object"},  # Force JSON mode for faster parsing
        )

    response = retry_on_rate_limit(_make_request, max_retries=3, base_delay=2.0)

    content = response.choices[0].message.content or ""
    
    if not content or not content.strip():
        raise ValueError("OpenAI returned empty response. Please try again.")
    
    # Log first 500 chars for debugging (without exposing full content)
    log.debug("OpenAI response preview: %s", content[:500])
    
    # Check if the response is a plain text error message (not JSON)
    content_lower = content.lower().strip()
    error_indicators = [
        "i'm unable",
        "i cannot",
        "i can't",
        "unable to analyze",
        "cannot analyze",
        "can't analyze",
        "sorry, i",
        "i apologize",
        "i'm sorry",
        "error:",
        "invalid",
        "not a hand",
        "not a palm",
    ]
    
    # If it looks like an error message and doesn't contain JSON, handle it specially
    if any(indicator in content_lower[:200] for indicator in error_indicators):
        # Check if there's JSON in the response despite the error message
        if "{" not in content and "}" not in content:
            log.warning("AI returned plain text error message without JSON: %s", content[:500])
            raise ValueError(
                "The AI was unable to analyze the palm image. "
                "Please ensure you're uploading a clear, well-lit image of a human hand/palm. "
                "Try again with a different image."
            )
    
    # Try multiple strategies to extract JSON
    json_str = None
    
    # Strategy 1: Look for JSON wrapped in markdown code blocks
    json_block_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
    if json_block_match:
        json_str = json_block_match.group(1)
        log.debug("Extracted JSON from markdown code block")
    
    # Strategy 2: Find JSON object boundaries
    if not json_str:
        try:
            start = content.index("{")
            end = content.rindex("}") + 1
            json_str = content[start:end]
            log.debug("Extracted JSON from text boundaries")
        except ValueError:
            # No braces found - this might be a plain text error
            if any(indicator in content_lower[:200] for indicator in error_indicators):
                log.error("AI returned error message without JSON. Content: %s", content[:1000])
                raise ValueError(
                    "The AI was unable to analyze the palm image. "
                    "Please ensure you're uploading a clear, well-lit image of a human hand/palm. "
                    "Try again with a different image."
                )
            # Try the whole content as a last resort
            json_str = content.strip()
            log.debug("Using entire content as JSON (no braces found)")
    
    # Strategy 3: Try to find JSON array if object not found
    if not json_str or json_str.strip() == "":
        try:
            start = content.index("[")
            end = content.rindex("]") + 1
            json_str = content[start:end]
            log.debug("Extracted JSON array")
        except ValueError:
            pass
    
    if not json_str or not json_str.strip():
        log.error("Failed to extract JSON from OpenAI response. Content preview: %s", content[:1000])
        # Check if it's an error message
        if any(indicator in content_lower[:200] for indicator in error_indicators):
            raise ValueError(
                "The AI was unable to analyze the palm image. "
                "Please ensure you're uploading a clear, well-lit image of a human hand/palm. "
                "Try again with a different image."
            )
        raise ValueError(
            "Failed to parse AI response. The model did not return valid JSON. "
            "Please try uploading the image again."
        )
    
    # Try to parse JSON with better error handling
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        log.error(
            "JSON decode error at position %d. JSON string preview: %s...",
            e.pos,
            json_str[max(0, e.pos - 50):e.pos + 50]
        )
        log.error("Full JSON string length: %d chars", len(json_str))
        # Try to fix common JSON issues
        json_str_fixed = json_str
        # Remove trailing commas before closing braces/brackets
        json_str_fixed = re.sub(r',\s*}', '}', json_str_fixed)
        json_str_fixed = re.sub(r',\s*]', ']', json_str_fixed)
        # Try parsing again
        try:
            data = json.loads(json_str_fixed)
            log.info("Successfully parsed JSON after fixing trailing commas")
        except json.JSONDecodeError:
            # Last resort: try to extract just the first valid JSON object
            try:
                # Find the first complete JSON object
                brace_count = 0
                start_idx = -1
                for i, char in enumerate(json_str):
                    if char == '{':
                        if start_idx == -1:
                            start_idx = i
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0 and start_idx != -1:
                            data = json.loads(json_str[start_idx:i+1])
                            log.info("Extracted first complete JSON object")
                            break
                else:
                    raise ValueError("No complete JSON object found in response")
            except (ValueError, json.JSONDecodeError) as e2:
                log.exception("All JSON parsing strategies failed")
                raise ValueError(
                    f"Failed to parse AI response as JSON. "
                    f"Error: {str(e)}. Please try uploading the image again."
                ) from e2

    # Check if AI returned an error response
    if isinstance(data, dict) and "error" in data:
        error_msg = data.get("error", "Invalid image detected")
        log.warning("AI detected invalid image and returned error JSON: %s", error_msg)
        # Return a user-friendly error message
        raise ValueError(
            "Unable to analyze the uploaded image. "
            "Please ensure you're uploading a clear, well-lit image of a human palm with fingers spread. "
            "The image should show your palm clearly with visible lines."
        )

    # Helper function to parse percentage string to number
    def parse_percentage(val) -> float:
        if isinstance(val, (int, float)):
            return float(val)
        if isinstance(val, str):
            # Remove % and whitespace, then convert
            cleaned = val.replace("%", "").strip()
            try:
                return float(cleaned)
            except ValueError:
                return 0.0
        return 0.0

    # Normalize any 0-1 scores to 0-100
    def norm(v: float) -> float:
        return v * 100 if 0 <= v <= 1 else v

    # Transform new structure to frontend-compatible format
    transformed = {}

    # Check if data uses new structure (palm_lines) or old structure (lines)
    if "palm_lines" in data:
        # NEW STRUCTURE - Transform to frontend format
        palm_lines = data.get("palm_lines", {})
        
        # Transform lines
        transformed["lines"] = {}
        line_mapping = {
            "life_line": "lifeLine",
            "heart_line": "heartLine",
            "head_line": "headLine",
            "fate_line": "fateLine"
        }
        
        def _build_metric_details(
            line_key: str, metrics: Dict[str, str | float | int]
        ) -> str:
            """
            Build a human-readable metrics string without exposing N/A values.
            Only include metrics that have meaningful values.
            """

            def add_metric(parts: list[str], label: str, key: str) -> None:
                raw = metrics.get(key)
                if raw is None:
                    return
                value = str(raw).strip()
                if not value or value.upper() in {"N/A", "NA", "NONE", "UNKNOWN", ""}:
                    return
                # Format the metric nicely
                if "=" in label:
                    parts.append(f"{label} {value}")
                else:
                    parts.append(f"{label}: {value}")

            parts: list[str] = []

            if line_key == "life_line":
                add_metric(parts, "Line clarity", "clarity")
                add_metric(parts, "length", "length")
                add_metric(parts, "depth", "depth")
                add_metric(parts, "breaks", "breaks")
            elif line_key == "heart_line":
                add_metric(parts, "Line clarity", "clarity")
                add_metric(parts, "depth", "depth")
                add_metric(parts, "continuity", "continuity")
            elif line_key == "head_line":
                add_metric(parts, "Line clarity", "clarity")
                add_metric(parts, "depth", "depth")
                add_metric(parts, "continuity", "continuity")
                add_metric(parts, "curvature", "curvature")
            elif line_key == "fate_line":
                add_metric(parts, "Line clarity", "clarity")
                add_metric(parts, "depth", "depth")

            add_metric(parts, "calculated score", "calculated_score")

            if not parts:
                return "Detailed metrics are not available for this line."
            return ", ".join(parts)

        for old_key, new_key in line_mapping.items():
            if old_key in palm_lines:
                line_data = palm_lines[old_key]
                metrics = line_data.get("metrics", {})
                quality_score = parse_percentage(line_data.get("quality_score", "0%"))
                
                # Get strength/type - ensure it's never "Unknown"
                strength = line_data.get("strength") or line_data.get("type") or ""
                strength = strength.strip() if strength else ""
                
                # If still empty or "Unknown", determine from metrics
                if not strength or strength.lower() == "unknown":
                    # Infer from metrics
                    clarity = str(metrics.get("clarity", "")).lower()
                    depth = str(metrics.get("depth", "")).lower()
                    
                    if clarity in ["deep", "clear"] or depth == "deep":
                        strength = "Strong"
                    elif clarity in ["moderate", "medium"] or depth == "moderate":
                        strength = "Moderate"
                    elif clarity in ["faint", "unclear"] or depth == "shallow":
                        strength = "Faint"
                    else:
                        # Default based on quality score
                        if quality_score >= 70:
                            strength = "Strong"
                        elif quality_score >= 50:
                            strength = "Moderate"
                        else:
                            strength = "Weak"

                # Special handling for fate line: if not visible, mark as absent
                if old_key == "fate_line":
                    present_flag = (metrics.get("present") or "").strip().lower()
                    if present_flag == "no" or strength.lower() in ["absent", "none"]:
                        transformed["lines"][new_key] = {
                            "quality": "Absent",
                            "score": 0.0,
                            "meaning": line_data.get(
                                "interpretation",
                                "The fate line is not clearly visible on this palm, "
                                "suggesting a flexible, self-directed life and career path with less influence from external circumstances."
                            ),
                            "details": (
                                "Fate line not detected in this palm scan. "
                                "This indicates a self-directed approach to career and life choices, "
                                "with the ability to adapt and create your own path rather than following predetermined patterns."
                            ),
                        }
                        continue

                    # Fate line is present – use meaningful metrics
                    transformed["lines"][new_key] = {
                        "quality": strength,
                        "score": norm(quality_score),
                        "meaning": line_data.get("interpretation", 
                            f"A {strength.lower()} fate line indicates {'a clear sense of purpose and direction' if strength in ['Strong', 'Present'] else 'developing career focus'} in your life path."),
                        "details": _build_metric_details(old_key, metrics),
                    }
                    continue

                # Get interpretation - ensure it's unique and descriptive
                interpretation = line_data.get("interpretation", "")
                if not interpretation:
                    # Generate interpretation based on detected features
                    line_names = {
                        "life_line": "Life Line",
                        "head_line": "Head Line",
                        "heart_line": "Heart Line"
                    }
                    line_name = line_names.get(old_key, "Line")
                    
                    if strength == "Strong":
                        if old_key == "life_line":
                            interpretation = "A strong, well-defined life line indicates robust vitality, excellent health, and a long life with abundant energy."
                        elif old_key == "head_line":
                            interpretation = "A strong head line suggests sharp intellect, clear thinking, and excellent problem-solving abilities."
                        elif old_key == "heart_line":
                            interpretation = "A strong heart line indicates deep emotional capacity, strong relationships, and expressive love nature."
                    elif strength == "Moderate":
                        if old_key == "life_line":
                            interpretation = "A moderate life line suggests good health and vitality with balanced energy levels throughout life."
                        elif old_key == "head_line":
                            interpretation = "A moderate head line indicates balanced thinking, combining logic with creativity in decision-making."
                        elif old_key == "heart_line":
                            interpretation = "A moderate heart line suggests balanced emotions and healthy relationships with room for emotional growth."
                    else:  # Weak or Faint
                        if old_key == "life_line":
                            interpretation = "A faint life line may indicate developing energy reserves or a need to focus on health and vitality."
                        elif old_key == "head_line":
                            interpretation = "A faint head line suggests developing mental clarity and the potential for enhanced analytical thinking."
                        elif old_key == "heart_line":
                            interpretation = "A faint heart line may indicate reserved emotions or developing emotional awareness and expression."

                # Build details - ensure metrics are always provided
                details = _build_metric_details(old_key, metrics)
                if not details or details == "Detailed metrics are not available for this line.":
                    # Generate details from available data
                    clarity = metrics.get("clarity", "")
                    depth = metrics.get("depth", "")
                    length = metrics.get("length", "")
                    
                    detail_parts = []
                    if clarity:
                        detail_parts.append(f"Line clarity: {clarity}")
                    if depth:
                        detail_parts.append(f"Depth: {depth}")
                    if length:
                        detail_parts.append(f"Length: {length}")
                    if quality_score > 0:
                        detail_parts.append(f"Calculated quality score: {int(norm(quality_score))}%")
                    
                    if detail_parts:
                        details = ", ".join(detail_parts)
                    else:
                        details = f"Quality analysis based on {strength.lower()} line characteristics with {int(norm(quality_score))}% overall quality score."

                # Default handling for life, heart, and head lines
                transformed["lines"][new_key] = {
                    "quality": strength,
                    "score": norm(quality_score),
                    "meaning": interpretation,
                    "details": details,
                }

        # Transform personality traits
        # Handle both old structure (personality.leadership, etc.) and new structure (personality_traits.creative, etc.)
        personality_obj = data.get("personality", {})
        personality_traits_obj = data.get("personality_traits", {})
        traits_list = []
        
        # First, try new structure (personality_traits)
        if personality_traits_obj:
            trait_mapping = {
                "creative": "Creativity",
                "analytical": "Analytical",
                "emotional": "Emotional",
                "leadership": "Leadership",
                "practical": "Practical",
                "intuitive": "Intuition"
            }
            for trait_key, trait_display_name in trait_mapping.items():
                if trait_key in personality_traits_obj:
                    trait_data = personality_traits_obj[trait_key]
                    percentage = parse_percentage(trait_data.get("percentage", "0%"))
                    calculation = trait_data.get("calculation", "")
                    traits_list.append({
                        "name": trait_display_name,
                        "score": norm(percentage),
                        "description": calculation or f"Derived from palm analysis: {trait_key}"
                    })
        
        # If new structure not found, try old structure (personality.leadership, etc.)
        if not traits_list and personality_obj:
            trait_mapping_old = {
                "leadership": "Leadership",
                "creativity": "Creativity",
                "intuition": "Intuition",
                "communication": "Communication",
                "determination": "Determination"
            }
            for trait_key, trait_display_name in trait_mapping_old.items():
                if trait_key in personality_obj:
                    trait_data = personality_obj[trait_key]
                    # Handle both dict format {score, meaning} and direct value
                    if isinstance(trait_data, dict):
                        score = parse_percentage(trait_data.get("score", trait_data.get("percentage", "0%")))
                        meaning = trait_data.get("meaning", "")
                        traits_list.append({
                            "name": trait_display_name,
                            "score": norm(score),
                            "description": meaning or f"Derived from palm analysis based on hand characteristics"
                        })
                    elif isinstance(trait_data, (int, float)):
                        traits_list.append({
                            "name": trait_display_name,
                            "score": norm(trait_data),
                            "description": f"Derived from palm analysis based on hand characteristics"
                        })
        
        # If still no traits found, generate default traits based on palm features
        if not traits_list:
            # Fallback: generate traits from available palm data
            palm_lines = data.get("palm_lines", {})
            physical = data.get("physical_characteristics", {})
            
            # Calculate Leadership from Jupiter mount, thumb, and palm size - more nuanced
            mounts = physical.get("mounts", {})
            jupiter_mount = mounts.get("jupiter", "Medium")
            leadership_score = 50
            leadership_factors = []
            
            if jupiter_mount == "High":
                leadership_score = 85
                leadership_factors.append("prominent Jupiter mount")
            elif jupiter_mount == "Medium":
                leadership_score = 60
                leadership_factors.append("moderate Jupiter mount")
            else:
                leadership_score = 45
                leadership_factors.append("low Jupiter mount")
            
            # Add palm shape factor
            palm_shape = physical.get("palm_shape", "Square")
            if palm_shape in ["Fire", "Square"]:
                leadership_score = min(95, leadership_score + 8)
                leadership_factors.append("strong palm structure")
            elif palm_shape == "Water":
                leadership_score = max(40, leadership_score - 5)
            
            # Add finger length factor
            finger_length = physical.get("finger_length", "Medium")
            if finger_length == "Long":
                leadership_score = min(95, leadership_score + 5)
            elif finger_length == "Short":
                leadership_score = max(45, leadership_score - 3)
            
            # Calculate Creativity from head line and Moon mount - more detailed
            head_line = palm_lines.get("head_line", {})
            moon_mount = mounts.get("moon", "Medium")
            creativity_score = 50
            creativity_factors = []
            
            head_strength = head_line.get("strength", "Moderate")
            if head_strength in ["Curved", "Highly Curved"]:
                creativity_score = 75
                creativity_factors.append("curved head line")
            elif head_strength == "Straight":
                creativity_score = 55
                creativity_factors.append("straight head line")
            else:
                creativity_score = 45
                creativity_factors.append("weak head line")
            
            if moon_mount == "High":
                creativity_score = min(95, creativity_score + 15)
                creativity_factors.append("prominent Moon mount")
            elif moon_mount == "Medium":
                creativity_score = min(90, creativity_score + 8)
            else:
                creativity_score = max(40, creativity_score - 5)
            
            # Add palm shape factor for creativity
            if palm_shape in ["Fire", "Air"]:
                creativity_score = min(95, creativity_score + 5)
            
            # Calculate Intuition from Moon mount and heart line - more nuanced
            intuition_score = 50
            intuition_factors = []
            
            if moon_mount == "High":
                intuition_score = 80
                intuition_factors.append("prominent Moon mount")
            elif moon_mount == "Medium":
                intuition_score = 60
                intuition_factors.append("moderate Moon mount")
            else:
                intuition_score = 45
                intuition_factors.append("low Moon mount")
            
            heart_line = palm_lines.get("heart_line", {})
            heart_strength = heart_line.get("strength", "Moderate")
            if heart_strength == "Curved":
                intuition_score = min(90, intuition_score + 10)
                intuition_factors.append("curved heart line")
            elif heart_strength == "Weak":
                intuition_score = max(40, intuition_score - 10)
                intuition_factors.append("weak heart line")
            
            # Add palm shape factor
            if palm_shape in ["Water", "Round"]:
                intuition_score = min(95, intuition_score + 8)
            
            # Calculate Communication from Mercury mount and heart line - detailed
            mercury_mount = mounts.get("mercury", "Medium")
            communication_score = 50
            communication_factors = []
            
            if mercury_mount == "High":
                communication_score = 75
                communication_factors.append("prominent Mercury mount")
            elif mercury_mount == "Medium":
                communication_score = 60
                communication_factors.append("moderate Mercury mount")
            else:
                communication_score = 45
                communication_factors.append("low Mercury mount")
            
            if heart_strength == "Strong":
                communication_score = min(90, communication_score + 12)
                communication_factors.append("strong heart line")
            elif heart_strength == "Weak":
                communication_score = max(40, communication_score - 8)
                communication_factors.append("weak heart line")
            
            # Add finger length factor
            if finger_length == "Long":
                communication_score = min(95, communication_score + 8)
            elif finger_length == "Short":
                communication_score = max(45, communication_score - 5)
            
            # Add palm shape factor
            if palm_shape == "Air":
                communication_score = min(95, communication_score + 10)
            
            # Calculate Determination from fate line and Saturn mount - detailed
            fate_line = palm_lines.get("fate_line", {})
            saturn_mount = mounts.get("saturn", "Medium")
            determination_score = 50
            determination_factors = []
            
            fate_strength = fate_line.get("strength", "Absent")
            if fate_strength in ["Present", "Strong"]:
                determination_score = 75
                determination_factors.append("present fate line")
            elif fate_strength == "Weak":
                determination_score = 55
                determination_factors.append("weak fate line")
            else:
                determination_score = 40
                determination_factors.append("absent fate line")
            
            if saturn_mount == "High":
                determination_score = min(95, determination_score + 15)
                determination_factors.append("prominent Saturn mount")
            elif saturn_mount == "Medium":
                determination_score = min(90, determination_score + 8)
            else:
                determination_score = max(35, determination_score - 5)
            
            # Add life line factor
            life_line = palm_lines.get("life_line", {})
            life_strength = life_line.get("strength", "Moderate")
            if life_strength == "Strong":
                determination_score = min(95, determination_score + 10)
                determination_factors.append("strong life line")
            elif life_strength == "Weak":
                determination_score = max(35, determination_score - 10)
                determination_factors.append("weak life line")
            
            # Build descriptive messages
            traits_list = [
                {
                    "name": "Leadership",
                    "score": max(35, min(95, leadership_score)),
                    "description": f"{', '.join(leadership_factors[:2])} suggest {'strong' if leadership_score >= 70 else 'moderate' if leadership_score >= 55 else 'developing'} leadership qualities"
                },
                {
                    "name": "Creativity",
                    "score": max(35, min(95, creativity_score)),
                    "description": f"{', '.join(creativity_factors[:2])} indicate {'high' if creativity_score >= 75 else 'moderate' if creativity_score >= 60 else 'developing'} creative potential"
                },
                {
                    "name": "Intuition",
                    "score": max(35, min(95, intuition_score)),
                    "description": f"{', '.join(intuition_factors[:2])} suggest {'strong' if intuition_score >= 70 else 'moderate' if intuition_score >= 55 else 'developing'} intuitive abilities"
                },
                {
                    "name": "Communication",
                    "score": max(35, min(95, communication_score)),
                    "description": f"{', '.join(communication_factors[:2])} indicate {'strong' if communication_score >= 70 else 'moderate' if communication_score >= 55 else 'developing'} communication skills"
                },
                {
                    "name": "Determination",
                    "score": max(35, min(95, determination_score)),
                    "description": f"{', '.join(determination_factors[:2])} suggest {'strong' if determination_score >= 70 else 'moderate' if determination_score >= 55 else 'developing'} determination and focus"
                }
            ]
        
        # Transform physical characteristics
        physical = data.get("physical_characteristics", {})
        mounts_data = physical.get("mounts", {})
        mounts_transformed = {}
        mount_mapping = {
            "venus": "venus",
            "jupiter": "jupiter",
            "saturn": "saturn",
            "apollo": "sun",  # Apollo is Sun mount
            "mercury": "mercury",
            "moon": "moon"
        }
        
        for old_key, new_key in mount_mapping.items():
            if old_key in mounts_data:
                mount_dev = mounts_data[old_key]
                mounts_transformed[new_key] = {
                    "development": mount_dev if isinstance(mount_dev, str) else "Medium",
                    "meaning": ""  # Not in new structure
                }

        # Get hand type description - use AI-provided summary or create detailed one
        hand_type_desc = physical.get("hand_type_summary", physical.get("hand_type_description", ""))
        if not hand_type_desc:
            # Create detailed, unique description from actual palm features
            palm_shape = physical.get("palm_shape", "Square")
            finger_length = physical.get("finger_length", "Medium")
            dominant_hand = physical.get("dominant_hand", "Right")
            
            # Get line characteristics for more specific analysis
            life_line = palm_lines.get("life_line", {})
            head_line = palm_lines.get("head_line", {})
            heart_line = palm_lines.get("heart_line", {})
            fate_line = palm_lines.get("fate_line", {})
            
            # Get mount information for additional insights
            mounts = physical.get("mounts", {})
            
            # Build unique description based on actual features
            shape_descriptions = {
                "Square": "practical and methodical nature, with strong organizational skills",
                "Round": "emotional and intuitive approach, valuing relationships and harmony",
                "Earth": "grounded and stable personality, seeking security and consistency",
                "Fire": "dynamic and energetic character, driven by passion and ambition",
                "Water": "sensitive and empathetic nature, deeply connected to emotions",
                "Air": "intellectual and communicative, valuing ideas and social connections"
            }
            
            finger_descriptions = {
                "Long": "analytical and detail-oriented thinking",
                "Short": "practical and action-oriented approach",
                "Medium": "balanced between analysis and action",
                "Balanced": "harmonious blend of analytical and practical qualities"
            }
            
            base_desc = shape_descriptions.get(palm_shape, "a balanced personality")
            finger_desc = finger_descriptions.get(finger_length, "balanced qualities")
            
            # Add specific line-based insights
            line_insights = []
            life_strength = life_line.get("strength", "Moderate")
            if life_strength == "Strong":
                line_insights.append("strong vitality and robust health")
            elif life_strength == "Weak":
                line_insights.append("developing energy and resilience")
            
            head_strength = head_line.get("strength", "Moderate")
            if head_strength in ["Curved", "Highly Curved"]:
                line_insights.append("creative and flexible thinking")
            elif head_strength == "Straight":
                line_insights.append("logical and structured thought processes")
            
            heart_strength = heart_line.get("strength", "Moderate")
            if heart_strength == "Strong":
                line_insights.append("deep emotional capacity")
            elif heart_strength == "Curved":
                line_insights.append("expressive and romantic nature")
            elif heart_strength == "Weak":
                line_insights.append("developing emotional awareness")
            
            fate_strength = fate_line.get("strength", "Absent")
            if fate_strength in ["Present", "Strong"]:
                line_insights.append("clear sense of purpose and direction")
            elif fate_strength == "Absent":
                line_insights.append("flexible and self-directed life path")
            
            # Add mount insights
            mount_insights = []
            if mounts.get("jupiter") == "High":
                mount_insights.append("natural leadership qualities")
            if mounts.get("moon") == "High":
                mount_insights.append("strong intuitive abilities")
            if mounts.get("mercury") == "High":
                mount_insights.append("excellent communication skills")
            if mounts.get("saturn") == "High":
                mount_insights.append("disciplined and focused approach")
            
            # Build comprehensive description
            line_text = ""
            if line_insights:
                line_text = f", with {', '.join(line_insights[:3])}"
            
            mount_text = ""
            if mount_insights:
                mount_text = f" The prominent mounts indicate {', '.join(mount_insights[:2])}."
            
            hand_type_desc = (
                f"A {palm_shape} palm with {finger_length.lower()} fingers on your {dominant_hand.lower()} hand "
                f"reveals {base_desc} and {finger_desc} tendencies{line_text}.{mount_text} "
                f"This unique combination suggests a distinctive approach to life that balances structure with flexibility, "
                f"making you adaptable yet grounded in your decision-making process."
            )
        
        # Ensure we use AI-detected values, not defaults
        dominant_hand = physical.get("dominant_hand", "")
        palm_shape = physical.get("palm_shape", "")
        finger_length = physical.get("finger_length", "")
        
        # Only use defaults if AI didn't detect (should be rare)
        if not dominant_hand:
            dominant_hand = "Right"  # Most common, but AI should detect this
        if not palm_shape:
            palm_shape = "Square"  # Default, but AI should classify
        if not finger_length:
            finger_length = "Medium"  # Default, but AI should measure
        
        # Build hand type string from detected values
        hand_type_str = f"{palm_shape} hand with {finger_length.lower()} fingers"
        if physical.get("hand_type"):
            hand_type_str = physical.get("hand_type")
        
        transformed["personality"] = {
            "traits": traits_list,
            "dominantHand": dominant_hand,
            "palmShape": palm_shape,
            "fingerLength": finger_length,
            "handType": hand_type_str,
            "mounts": mounts_transformed,
            "handTypeAnalysis": hand_type_desc or data.get("hand_type_analysis", {}).get("summary", "")
        }

        # Transform predictions - ensure they're based on actual palm features
        predictions_obj = data.get("predictions", {})
        predictions_list = []
        prediction_mapping = {
            "career": "Career",
            "relationships": "Relationships",
            "health": "Health",
            "finances": "Finances"
        }
        
        # Get line and mount data for confidence calculation
        fate_line = palm_lines.get("fate_line", {})
        heart_line = palm_lines.get("heart_line", {})
        life_line = palm_lines.get("life_line", {})
        head_line = palm_lines.get("head_line", {})
        mounts = physical.get("mounts", {})
        
        for old_key, new_key in prediction_mapping.items():
            if old_key in predictions_obj:
                pred_data = predictions_obj[old_key]
                confidence = parse_percentage(pred_data.get("confidence", pred_data.get("confidence_score", "0%")))
                
                # If confidence is 0 or very low, calculate from actual palm features
                if confidence == 0 or confidence < 30:
                    if old_key == "career":
                        # Career confidence from fate line, Saturn mount, head line
                        fate_score = parse_percentage(fate_line.get("quality_score", "0%"))
                        saturn_mount = mounts.get("saturn", "Medium")
                        saturn_score = 80 if saturn_mount == "High" else 60 if saturn_mount == "Medium" else 40
                        head_score = parse_percentage(head_line.get("quality_score", "0%"))
                        confidence = (fate_score * 0.4) + (saturn_score * 0.3) + (head_score * 0.3)
                        confidence = max(50, min(90, confidence))  # Ensure reasonable range
                    elif old_key == "relationships":
                        # Relationships confidence from heart line, Venus mount, Moon mount
                        heart_score = parse_percentage(heart_line.get("quality_score", "0%"))
                        venus_mount = mounts.get("venus", "Medium")
                        venus_score = 80 if venus_mount == "High" else 60 if venus_mount == "Medium" else 40
                        moon_mount = mounts.get("moon", "Medium")
                        moon_score = 75 if moon_mount == "High" else 55 if moon_mount == "Medium" else 35
                        confidence = (heart_score * 0.5) + (venus_score * 0.3) + (moon_score * 0.2)
                        confidence = max(50, min(90, confidence))
                    elif old_key == "health":
                        # Health confidence from life line quality
                        life_score = parse_percentage(life_line.get("quality_score", "0%"))
                        overall_vitality = (life_score + parse_percentage(fate_line.get("quality_score", "0%")) + 
                                          parse_percentage(head_line.get("quality_score", "0%"))) / 3
                        confidence = (life_score * 0.6) + (overall_vitality * 0.4)
                        confidence = max(60, min(95, confidence))  # Health usually has higher baseline
                    elif old_key == "finances":
                        # Finances confidence from fate line, Mercury mount, Sun mount
                        fate_score = parse_percentage(fate_line.get("quality_score", "0%"))
                        mercury_mount = mounts.get("mercury", "Medium")
                        mercury_score = 85 if mercury_mount == "High" else 65 if mercury_mount == "Medium" else 45
                        sun_mount = mounts.get("sun", mounts.get("apollo", "Medium"))
                        sun_score = 80 if sun_mount == "High" else 60 if sun_mount == "Medium" else 40
                        confidence = (fate_score * 0.4) + (mercury_score * 0.4) + (sun_score * 0.2)
                        confidence = max(50, min(90, confidence))
                
                # Ensure confidence is never 0% (minimum 50% unless truly uncertain)
                if confidence < 50:
                    confidence = 50
                
                # Get prediction and advice, generate if missing
                prediction = pred_data.get("prediction", "")
                advice = pred_data.get("advice", "")
                
                # Generate prediction if missing, based on actual features
                if not prediction:
                    if old_key == "career":
                        fate_strength = fate_line.get("strength", "Absent")
                        if fate_strength in ["Present", "Strong"]:
                            prediction = "Your clear fate line indicates defined career direction. Professional opportunities may arise that align with your structured approach and leadership qualities."
                        else:
                            prediction = "Your flexible career path suggests adaptability. Focus on setting clear goals to navigate opportunities effectively."
                    elif old_key == "relationships":
                        heart_strength = heart_line.get("strength", "Moderate")
                        if heart_strength == "Strong":
                            prediction = "Your strong heart line indicates deep emotional capacity. Relationships may deepen with open communication and emotional expression."
                        elif heart_strength == "Curved":
                            prediction = "Your curved heart line suggests expressive emotions. Emotional connections may flourish with genuine openness and romantic gestures."
                        else:
                            prediction = "Your heart line suggests developing emotional awareness. Working on expressing feelings more openly will strengthen your relationships."
                    elif old_key == "health":
                        life_strength = life_line.get("strength", "Moderate")
                        if life_strength == "Strong":
                            prediction = "Your strong life line indicates robust vitality and good health. Continue maintaining a balanced lifestyle to preserve your energy."
                        else:
                            prediction = "Your life line suggests moderate health with potential for improvement. Focus on balanced nutrition, exercise, and stress management."
                    elif old_key == "finances":
                        fate_strength = fate_line.get("strength", "Absent")
                        mercury_mount = mounts.get("mercury", "Medium")
                        if fate_strength in ["Present", "Strong"] and mercury_mount == "High":
                            prediction = "Your strong fate line with prominent Mercury mount suggests financial opportunities through communication and negotiation. Stability is likely with careful planning."
                        else:
                            prediction = "Your palm suggests financial flexibility. Create a budget and plan for unexpected expenses while remaining open to opportunities."
                
                # Generate advice if missing
                if not advice:
                    if old_key == "career":
                        advice = "Focus on clear goal-setting and leveraging your natural strengths. Network actively and seek opportunities that align with your values."
                    elif old_key == "relationships":
                        advice = "Practice open communication and emotional expression. Invest time in deepening connections with loved ones through shared experiences."
                    elif old_key == "health":
                        advice = "Maintain a balanced lifestyle with regular exercise, nutritious diet, and adequate rest. Listen to your body's signals and address any concerns promptly."
                    elif old_key == "finances":
                        advice = "Create a comprehensive budget and build an emergency fund. Make informed financial decisions and avoid impulsive spending."
                
                predictions_list.append({
                    "area": new_key,
                    "timeframe": pred_data.get("period", "Next 6 months" if old_key == "career" else 
                                               "Next 3 months" if old_key == "relationships" else
                                               "Ongoing" if old_key == "health" else "Next 1 year"),
                    "prediction": prediction,
                    "confidence": norm(confidence),
                    "advice": advice
                })
        
        transformed["predictions"] = predictions_list

        # Transform special marks - ensure they're based on actual detection
        special_marks = data.get("special_marks", [])
        transformed["specialMarks"] = []
        
        for mark in special_marks:
            # Get mark type - handle both "type" and "name" fields
            mark_type = mark.get("type") or mark.get("name", "")
            if not mark_type:
                continue  # Skip marks without a type
            
            # Get location - ensure it's descriptive
            location = mark.get("location", "")
            if not location:
                # Try to infer from context or use generic
                location = "On palm"
            
            # Get meaning - ensure it's unique and descriptive
            meaning = mark.get("meaning", "")
            if not meaning:
                # Generate meaning based on type and location
                mark_meanings = {
                    "Star": f"A star mark {location.lower()} indicates exceptional potential and significant positive events in this area of life.",
                    "Triangle": f"A triangle {location.lower()} suggests protection and positive energy, enhancing the qualities of this area.",
                    "Cross": f"A cross {location.lower()} may indicate challenges or important decisions that will shape this aspect of life.",
                    "Chain": f"Chain marks {location.lower()} suggest periods of change or transitions in this area.",
                    "Island": f"An island {location.lower()} indicates periods of difficulty or energy drain in this aspect of life.",
                    "Fork": f"A fork {location.lower()} suggests multiple paths or choices available in this area.",
                    "Grille": f"Grille patterns {location.lower()} indicate scattered energy or multiple influences affecting this area.",
                    "Break": f"A break {location.lower()} suggests interruption or change in the flow of energy in this aspect."
                }
                meaning = mark_meanings.get(mark_type, f"This {mark_type.lower()} mark {location.lower()} has significance in palmistry.")
            
            # Get impact level - use provided or calculate from context
            impact_level = mark.get("impact_level") or mark.get("significance", "Medium")
            if isinstance(impact_level, str):
                # Normalize to proper case
                impact_level = impact_level.capitalize()
                if impact_level not in ["High", "Medium", "Low"]:
                    impact_level = "Medium"
            else:
                impact_level = "Medium"
            
            transformed["specialMarks"].append({
                "name": mark_type,
                "location": location,
                "meaning": meaning,
                "significance": impact_level
            })

        # Calculate Overall Score dynamically from all palm features
        hand_analysis = data.get("hand_type_analysis", {})
        ai_provided_score = parse_percentage(hand_analysis.get("overall_score", "0%"))
        
        # If AI provided a valid score (>0), use it; otherwise calculate from features
        if ai_provided_score > 0:
            overall_score = ai_provided_score
        else:
            # Calculate overall score from all detected features
            # Formula: (Line Average × 0.35) + (Trait Average × 0.35) + (Mount Average × 0.15) + (Special Marks Bonus × 0.15)
            
            # 1. Calculate average line score (Life, Head, Heart, Fate)
            line_scores = []
            for line_key in ["lifeLine", "headLine", "heartLine", "fateLine"]:
                if line_key in transformed.get("lines", {}):
                    line_score = transformed["lines"][line_key].get("score", 0)
                    # Only include fate line if it's present (not absent)
                    if line_key == "fateLine" and transformed["lines"][line_key].get("quality", "").lower() == "absent":
                        continue  # Skip absent fate line from average
                    if line_score > 0:
                        line_scores.append(line_score)
            
            line_average = sum(line_scores) / len(line_scores) if line_scores else 50
            
            # 2. Calculate average personality trait score
            trait_scores = []
            if "personality" in transformed and "traits" in transformed["personality"]:
                for trait in transformed["personality"]["traits"]:
                    trait_score = trait.get("score", 0)
                    if trait_score > 0:
                        trait_scores.append(trait_score)
            
            trait_average = sum(trait_scores) / len(trait_scores) if trait_scores else 50
            
            # 3. Calculate average mount development score
            mount_scores = []
            if "personality" in transformed and "mounts" in transformed["personality"]:
                mounts = transformed["personality"]["mounts"]
                mount_value_map = {"High": 85, "Medium": 65, "Low": 45}
                for mount_name, mount_data in mounts.items():
                    if isinstance(mount_data, dict):
                        dev = mount_data.get("development", "Medium")
                        mount_score = mount_value_map.get(dev, 65)
                        mount_scores.append(mount_score)
            
            mount_average = sum(mount_scores) / len(mount_scores) if mount_scores else 65
            
            # 4. Calculate special marks bonus (positive marks add, negative marks subtract)
            special_marks_bonus = 0
            if transformed.get("specialMarks"):
                marks = transformed["specialMarks"]
                for mark in marks:
                    significance = mark.get("significance", "Medium")
                    mark_type = mark.get("name", "").lower()
                    
                    # Positive marks (Stars, Triangles) add to score
                    if mark_type in ["star", "triangle"]:
                        if significance == "High":
                            special_marks_bonus += 8
                        elif significance == "Medium":
                            special_marks_bonus += 5
                        else:
                            special_marks_bonus += 2
                    # Neutral marks (Forks, Chains) have minimal impact
                    elif mark_type in ["fork", "chain"]:
                        if significance == "High":
                            special_marks_bonus += 3
                        else:
                            special_marks_bonus += 1
                    # Negative marks (Islands, Breaks, Crosses) subtract from score
                    elif mark_type in ["island", "break", "cross"]:
                        if significance == "High":
                            special_marks_bonus -= 5
                        elif significance == "Medium":
                            special_marks_bonus -= 3
                        else:
                            special_marks_bonus -= 1
                
                # Cap the bonus between -10 and +15
                special_marks_bonus = max(-10, min(15, special_marks_bonus))
            
            # Calculate final overall score
            overall_score = (
                (line_average * 0.35) +
                (trait_average * 0.35) +
                (mount_average * 0.15) +
                (50 + special_marks_bonus) * 0.15  # Base 50 with marks adjustment
            )
            
            # Ensure score is within reasonable bounds (40-95%)
            overall_score = max(40, min(95, overall_score))
        
        transformed["overallScore"] = norm(overall_score)
        
        # Get hand type summary
        hand_type_summary = hand_analysis.get("summary", "")
        if not hand_type_summary:
            # Generate summary based on overall score
            if overall_score >= 80:
                hand_type_summary = f"Your palm shows exceptional characteristics with an overall score of {int(norm(overall_score))}%. Strong lines, well-developed mounts, and positive traits indicate a balanced and promising life path."
            elif overall_score >= 70:
                hand_type_summary = f"Your palm analysis reveals strong potential with an overall score of {int(norm(overall_score))}%. Good line quality and balanced traits suggest positive life experiences ahead."
            elif overall_score >= 60:
                hand_type_summary = f"Your palm shows moderate characteristics with an overall score of {int(norm(overall_score))}%. There's room for growth and development in various life areas."
            else:
                hand_type_summary = f"Your palm analysis indicates developing potential with an overall score of {int(norm(overall_score))}%. Focus on personal growth and development to enhance your life path."
        
        transformed["summary"] = hand_type_summary
        
        # Also ensure handTypeAnalysis is set in personality
        if "personality" in transformed and not transformed["personality"].get("handTypeAnalysis"):
            transformed["personality"]["handTypeAnalysis"] = hand_type_summary

        # Generate compatibility data based on hand type - make it unique and varied
        palm_shape = physical.get("palm_shape", "Square").lower()
        finger_length = physical.get("finger_length", "Medium").lower()
        
        # More nuanced compatibility matrix with varied scores
        compatibility_matrix = {
            "square": {
                "earth": (88, "High compatibility - both value stability and practicality"),
                "fire": (82, "Good compatibility - complementary energies"),
                "round": (65, "Moderate compatibility - different approaches to life"),
                "water": (58, "Moderate compatibility - contrasting natures"),
                "air": (72, "Fair compatibility - can balance each other")
            },
            "earth": {
                "square": (88, "High compatibility - shared practical values"),
                "water": (85, "Strong compatibility - emotional and practical balance"),
                "fire": (68, "Moderate compatibility - different energy levels"),
                "round": (75, "Good compatibility - complementary stability"),
                "air": (62, "Moderate compatibility - different priorities")
            },
            "fire": {
                "air": (90, "Excellent compatibility - dynamic and creative partnership"),
                "square": (82, "Good compatibility - fire energizes square's structure"),
                "earth": (68, "Moderate compatibility - contrasting energies"),
                "water": (55, "Challenging compatibility - fire and water conflict"),
                "round": (70, "Fair compatibility - can work with balance")
            },
            "water": {
                "earth": (85, "Strong compatibility - emotional depth meets stability"),
                "air": (78, "Good compatibility - intuitive and intellectual blend"),
                "round": (80, "Good compatibility - both value emotional connection"),
                "square": (58, "Moderate compatibility - different emotional needs"),
                "fire": (55, "Challenging compatibility - contrasting natures")
            },
            "air": {
                "fire": (90, "Excellent compatibility - intellectual and creative synergy"),
                "water": (78, "Good compatibility - mental and emotional balance"),
                "round": (72, "Fair compatibility - can complement each other"),
                "square": (65, "Moderate compatibility - different communication styles"),
                "earth": (62, "Moderate compatibility - contrasting approaches")
            },
            "round": {
                "water": (80, "Good compatibility - both value emotional connection"),
                "earth": (75, "Good compatibility - stability and warmth"),
                "air": (72, "Fair compatibility - can balance each other"),
                "fire": (70, "Fair compatibility - different energy expressions"),
                "square": (65, "Moderate compatibility - contrasting natures")
            }
        }
        
        compatibility_list = []
        current_compat = compatibility_matrix.get(palm_shape, {})
        
        # Add variation based on finger length and other factors
        for shape in ["Square", "Round", "Earth", "Fire", "Water", "Air"]:
            if shape.lower() == palm_shape:
                continue  # Skip own type
            
            base_score, base_desc = current_compat.get(shape.lower(), (60, f"Moderate compatibility with {shape} hand type"))
            
            # Add variation: ±5% based on finger length compatibility
            variation = 0
            if finger_length == "long" and shape.lower() in ["air", "water"]:
                variation = 5  # Long fingers enhance air/water compatibility
            elif finger_length == "short" and shape.lower() in ["earth", "square"]:
                variation = 5  # Short fingers enhance earth/square compatibility
            elif finger_length == "medium":
                variation = 2  # Medium fingers are balanced
            
            # Add small random variation (±3%) to make each reading unique
            import random
            random_variation = random.randint(-3, 3)
            
            final_score = max(45, min(95, base_score + variation + random_variation))
            
            compatibility_list.append({
                "type": shape,
                "match": final_score,
                "description": base_desc
            })
        
        # Sort by compatibility score (highest first)
        compatibility_list.sort(key=lambda x: x["match"], reverse=True)
        transformed["compatibility"] = compatibility_list

        # Accuracy - calculate from line detection quality
        line_scores = [transformed["lines"][k]["score"] for k in transformed["lines"]]
        avg_line_score = sum(line_scores) / len(line_scores) if line_scores else 0
        transformed["accuracy"] = {
            "lineDetection": int(avg_line_score),
            "patternAnalysis": int(avg_line_score * 0.9),
            "interpretation": int(avg_line_score * 0.85),
            "overall": int(avg_line_score * 0.92)
        }

        transformed["modelVersion"] = "2.0"
        
        # Log verification data to ensure real-time analysis
        log.info("=== PALM ANALYSIS VERIFICATION ===")
        log.info("Overall Score: %s%%", transformed["overallScore"])
        log.info("Line Scores - Life: %s%%, Heart: %s%%, Head: %s%%, Fate: %s%%",
                 transformed["lines"].get("lifeLine", {}).get("score", 0),
                 transformed["lines"].get("heartLine", {}).get("score", 0),
                 transformed["lines"].get("headLine", {}).get("score", 0),
                 transformed["lines"].get("fateLine", {}).get("score", 0))
        log.info("Personality Traits:")
        for trait in transformed["personality"]["traits"]:
            log.info("  - %s: %s%% (%s)", trait["name"], trait["score"], trait["description"][:50])
        log.info("Hand Type: %s", transformed["personality"].get("handType", "N/A"))
        log.info("Predictions Confidence - Career: %s%%, Relationships: %s%%, Health: %s%%, Finances: %s%%",
                 next((p["confidence"] for p in transformed["predictions"] if p["area"] == "Career"), 0),
                 next((p["confidence"] for p in transformed["predictions"] if p["area"] == "Relationships"), 0),
                 next((p["confidence"] for p in transformed["predictions"] if p["area"] == "Health"), 0),
                 next((p["confidence"] for p in transformed["predictions"] if p["area"] == "Finances"), 0))
        log.info("Special Marks Count: %d", len(transformed["specialMarks"]))
        log.info("=== END VERIFICATION ===")
        
        return transformed
    else:
        # OLD STRUCTURE - Keep existing normalization
        old_overall_score = data.get("overallScore", 0)
        if old_overall_score == 0 or old_overall_score is None:
            # Calculate from available data if score is missing
            line_scores = []
            for key in ["lifeLine", "headLine", "heartLine", "fateLine"]:
                if key in data.get("lines", {}):
                    line_score = data["lines"][key].get("score", 0)
                    if line_score > 0:
                        line_scores.append(norm(line_score))
            
            trait_scores = []
            for trait in data.get("personality", {}).get("traits", []):
                trait_score = trait.get("score", 0)
                if trait_score > 0:
                    trait_scores.append(norm(trait_score))
            
            if line_scores or trait_scores:
                line_avg = sum(line_scores) / len(line_scores) if line_scores else 50
                trait_avg = sum(trait_scores) / len(trait_scores) if trait_scores else 50
                old_overall_score = (line_avg * 0.5) + (trait_avg * 0.5)
                old_overall_score = max(40, min(95, old_overall_score))
        
        data["overallScore"] = norm(old_overall_score)
        for key in ["lifeLine", "headLine", "heartLine", "fateLine"]:
            if key in data.get("lines", {}):
                data["lines"][key]["score"] = norm(data["lines"][key].get("score", 0))

        for trait in data.get("personality", {}).get("traits", []):
            trait["score"] = norm(trait.get("score", 0))

        for pred in data.get("predictions", []):
            pred["confidence"] = norm(pred.get("confidence", 0))

        for comp in data.get("compatibility", []):
            comp["match"] = norm(comp.get("match", 0))

        if "accuracy" in data:
            for key in ["lineDetection", "patternAnalysis", "interpretation", "overall"]:
                data["accuracy"][key] = norm(data["accuracy"].get(key, 0))

        return data


@shared_task
def process_palm_reading(reading_id: str, image_base64: str | None = None) -> None:
    try:
        reading = Reading.objects.get(id=reading_id)
        reading.status = ReadingStatus.PROCESSING
        reading.save(update_fields=["status", "updated_at"])

        if image_base64 and not reading.image:
            # Decode and attach image just for processing, still temporary
            fmt, b64data = image_base64.split(";base64,") if ";base64," in image_base64 else ("", image_base64)
            data = base64.b64decode(b64data)
            reading.image.save(
                f"{reading.id}.png",
                ContentFile(data),
                save=True,
            )

        # Run real AI model (GPT vision). If it fails, mark reading as FAILED.
        if not reading.image:
            raise RuntimeError("Reading has no image attached for analysis")

        try:
            result = _run_gpt_palm_model(reading.image.path)
        except RateLimitError as exc:
            error_msg = str(exc)
            if "insufficient_quota" in error_msg.lower():
                reading.error_message = (
                    "OpenAI API quota exceeded. Please add payment method to your OpenAI account "
                    "at https://platform.openai.com/account/billing"
                )
            else:
                reading.error_message = (
                    f"Rate limit exceeded. Please wait a moment and try again. "
                    f"Details: {error_msg[:200]}"
                )
            reading.status = ReadingStatus.FAILED
            reading.save(update_fields=["status", "error_message", "updated_at"])
            log.error("Rate limit error for palm reading %s: %s", reading_id, error_msg)
            return
        except (json.JSONDecodeError, ValueError) as exc:
            # JSON parsing errors - AI response was malformed
            error_msg = str(exc)
            reading.error_message = (
                "Failed to parse AI analysis response. This may be a temporary issue. "
                "Please try uploading your palm image again."
            )
            reading.status = ReadingStatus.FAILED
            reading.save(update_fields=["status", "error_message", "updated_at"])
            log.error("JSON parsing error for palm reading %s: %s", reading_id, error_msg)
            return
        except Exception as exc:
            log.exception("GPT palm model failed for %s", reading_id)
            reading.error_message = f"Analysis failed: {str(exc)[:200]}"
            reading.status = ReadingStatus.FAILED
            reading.save(update_fields=["status", "error_message", "updated_at"])
            return

        reading.result = result
        reading.status = ReadingStatus.DONE
        reading.model_version = result.get("modelVersion") or result.get("model_version", "unknown")
        # Set image expiry relatively soon after success
        reading.expires_at = timezone.now() + timedelta(
            hours=getattr(settings, "IMAGE_TTL_HOURS", 24)
        )
        reading.save()

        EventLog.objects.create(
            reading=reading,
            user=reading.user,
            event_type="reading.completed",
            metadata={"model_version": reading.model_version},
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Failed to process palm reading %s", reading_id)
        try:
            reading = Reading.objects.get(id=reading_id)
            reading.status = ReadingStatus.FAILED
            # Provide a user-friendly message if the failure is due to OpenAI quota/rate limits
            msg = str(exc)
            if isinstance(exc, RateLimitError) or "insufficient_quota" in msg:
                reading.error_message = (
                    "AI palm analysis is temporarily unavailable because the "
                    "configured OpenAI account has run out of quota. "
                    "Please update your OpenAI billing/plan and try again."
                )
            else:
                reading.error_message = msg[:2000]
            reading.save(update_fields=["status", "error_message", "updated_at"])
            EventLog.objects.create(
                reading=reading,
                user=reading.user,
                event_type="reading.failed",
                metadata={"error": str(exc)},
            )
        except Exception:  # noqa: BLE001
            log.exception("Failed to update reading after processing error")
    finally:
        # Best-effort image deletion after processing
        try:
            reading = Reading.objects.get(id=reading_id)
            if reading.image:
                image_path = reading.image.path
                reading.image.delete(save=False)
                if os.path.exists(image_path):
                    os.remove(image_path)
            reading.storage_key = ""
            reading.save(update_fields=["storage_key", "updated_at"])
        except Exception:  # noqa: BLE001
            log.warning("Could not delete image for reading %s", reading_id)


