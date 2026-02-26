from __future__ import annotations

import json
import logging
import os
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, TypeVar

from celery import shared_task
from django.conf import settings
from django.utils import timezone
from openai import OpenAI, RateLimitError

from .crypto import decrypt_value
from .models import AstrologySession, AstrologyStatus
from .utils import compute_basic_chart

T = TypeVar("T")

log = logging.getLogger(__name__)


def _load_prompt_template() -> str:
    here = Path(__file__).resolve().parent
    return (here / "prompt_template.txt").read_text(encoding="utf-8")


PROMPT_TEMPLATE = _load_prompt_template()


def _generate_mock_astrology_result(session: AstrologySession) -> Dict[str, Any]:
    """
    Generate a mock astrology reading result for development/testing
    when OpenAI API is not available or quota is exceeded.
    """
    try:
        full_name = decrypt_value(session.full_name) or "User"
        birth_date_str = decrypt_value(session.birth_date or "") or ""
        
        # Try to get sun sign from birth date
        sun_sign = "Aries"
        if birth_date_str:
            try:
                birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
                chart = compute_basic_chart(birth_date, None, None)
                sun_sign = chart.sun_sign
            except Exception:
                pass
        
        # Generate mock data based on the sun sign (matching new prompt structure)
        mock_data = {
            "sun_sign": sun_sign,
            "moon_sign": "Cancer",
            "rising_sign": "Leo",
            "overview": {
                "summary": f"Based on your {sun_sign} sun sign, Cancer moon, and Leo rising, you possess natural leadership qualities and a strong sense of purpose. Your emotional depth and intuitive nature guide you through life's challenges. You have a magnetic personality that draws others to you, combining the {sun_sign}'s determination with Cancer's nurturing instincts and Leo's charismatic presence.",
                "key_themes": ["Leadership", "Emotional Intelligence", "Creative Expression", "Personal Growth", "Authentic Connections"],
                "confidence": 0.85
            },
            "personality": {
                "summary": f"Your {sun_sign} sun sign represents your core identity and ego, while your Cancer moon reveals your emotional nature and instincts. Your Leo rising sign shows how others perceive you - as a confident, warm, and magnetic individual.",
                "traits": ["Ambitious", "Intuitive", "Creative", "Passionate", "Independent", "Nurturing", "Charismatic"],
                "confidence": 0.85
            },
            "planetary_positions": [
                {
                    "planet": "Sun",
                    "sign": sun_sign,
                    "house": "1st House",
                    "aspect": "Your core identity and life force"
                },
                {
                    "planet": "Moon",
                    "sign": "Cancer",
                    "house": "4th House",
                    "aspect": "Your emotional world and instincts"
                },
                {
                    "planet": "Ascendant",
                    "sign": "Leo",
                    "house": "1st House",
                    "aspect": "How you appear to others"
                }
            ],
            "strengths": {
                "items": ["Natural leadership", "Creative problem-solving", "Strong intuition", "Resilience", "Emotional intelligence"],
                "summary": "Your natural strengths help you overcome obstacles and achieve your goals. Your combination of signs gives you a unique ability to lead with both strength and compassion.",
                "confidence": 0.88
            },
            "challenges": {
                "items": ["Impatience", "Perfectionism", "Emotional sensitivity", "Need for recognition"],
                "summary": "These areas offer opportunities for personal growth and development. Learning to balance your drive with patience will serve you well.",
                "confidence": 0.75
            },
            "life_predictions": [
                {
                    "area": "Career & Finance",
                    "timeframe": "Next 12 months",
                    "prediction": f"As a {sun_sign}, you excel in roles that allow you to lead and innovate. Consider careers in entrepreneurship, creative fields, or positions that require strategic thinking. The next 12 months may bring new opportunities for professional growth.",
                    "confidence": 0.85
                },
                {
                    "area": "Love & Relationships",
                    "timeframe": "Next 12 months",
                    "prediction": "Your relationships are deepening with meaningful connections. You value authenticity and emotional depth in your partnerships. This year may bring significant developments in your personal relationships.",
                    "confidence": 0.88
                },
                {
                    "area": "Spiritual Growth",
                    "timeframe": "Ongoing",
                    "prediction": "Your spiritual journey continues to unfold with wisdom and insight. Trust your intuition and allow your inner wisdom to guide you. You are on a path of personal transformation and growth.",
                    "confidence": 0.87
                }
            ],
            "relationship_insights": {
                "text": "Your relationships are deepening with meaningful connections. You value authenticity and emotional depth in your partnerships. Your Cancer moon makes you deeply caring, while your Leo rising adds warmth and charisma to your interactions.",
                "compatibility_factors": ["Emotional depth", "Shared values", "Mutual respect", "Authentic communication"],
                "confidence": 0.88
            },
            "career_path": {
                "text": f"As a {sun_sign}, you excel in roles that allow you to lead and innovate. Consider careers in entrepreneurship, creative fields, or positions that require strategic thinking. Your Cancer moon adds emotional intelligence to your leadership style, while your Leo rising gives you natural charisma.",
                "suitable_fields": ["Entrepreneurship", "Creative Arts", "Leadership Roles", "Strategic Planning", "Human Resources"],
                "confidence": 0.85
            },
            "spiritual_message": {
                "text": "Your spiritual journey continues to unfold with wisdom and insight. Trust your intuition and allow your inner wisdom to guide you. You are on a path of personal transformation and growth, learning to balance your ambitious nature with emotional depth.",
                "confidence": 0.87
            },
            "model_version": "mock-1.0"
        }
        
        log.info("Generated mock astrology result for session %s", session.session_id)
        return mock_data
    except Exception as e:
        log.error("Failed to generate mock astrology result: %s", str(e))
        # Return a basic fallback
        return {
            "sun_sign": "Aries",
            "moon_sign": "Cancer",
            "rising_sign": "Leo",
            "personality": {
                "summary": "This is a mock reading generated for development purposes. Please configure OpenAI API with billing enabled for real readings.",
                "traits": ["Mock", "Development", "Testing"],
                "confidence": 0.5
            },
            "strengths": {
                "items": ["Mock strength"],
                "summary": "Mock data for development",
                "confidence": 0.5
            },
            "challenges": {
                "items": ["Mock challenge"],
                "summary": "Mock data for development",
                "confidence": 0.5
            },
            "career_path": {
                "text": "Mock career prediction for development",
                "confidence": 0.5
            },
            "relationship_insights": {
                "text": "Mock relationship insight for development",
                "confidence": 0.5
            },
            "spiritual_message": {
                "text": "Mock spiritual message for development",
                "confidence": 0.5
            },
            "model_version": "mock-1.0"
        }


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


def _build_prompt(session: AstrologySession) -> str:
    try:
        full_name = decrypt_value(session.full_name) or ""
        gender = decrypt_value(session.gender) or ""
        birth_date_str = decrypt_value(session.birth_date or "") or ""
        birth_time_str = decrypt_value(session.birth_time or "") or ""
        birth_place = decrypt_value(session.birth_place or "") or ""
        preferences_json = decrypt_value(session.preferences or "") or "[]"
    except Exception as e:
        log.error("Failed to decrypt session data for %s: %s", session.session_id, str(e))
        raise RuntimeError(f"Failed to decrypt session data: {str(e)}") from e

    birth_date = None
    birth_time = None
    
    if birth_date_str:
        try:
            birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
        except ValueError as e:
            log.warning("Invalid birth_date format '%s' for session %s: %s", birth_date_str, session.session_id, str(e))
    
    if birth_time_str:
        try:
            birth_time = datetime.strptime(birth_time_str, "%H:%M").time()
        except ValueError as e:
            log.warning("Invalid birth_time format '%s' for session %s: %s", birth_time_str, session.session_id, str(e))

    chart = None
    if birth_date:
        try:
            chart = compute_basic_chart(birth_date, birth_time, birth_place)
        except Exception as e:
            log.warning("Failed to compute chart for session %s: %s", session.session_id, str(e))
            # Continue without chart if computation fails

    # Parse preferences safely
    try:
        preferences = json.loads(preferences_json or "[]")
    except json.JSONDecodeError as e:
        log.warning("Invalid preferences JSON for session %s: %s", session.session_id, str(e))
        preferences = []

    context: Dict[str, Any] = {
        "session_id": str(session.session_id),
        "full_name": full_name,
        "gender": gender,
        "birth_date": birth_date_str,
        "birth_time": birth_time_str,
        "birth_place": birth_place,
        "preferences": preferences,
        "sun_sign": chart.sun_sign if chart else None,
        "moon_sign": chart.moon_sign if chart else None,
        "rising_sign": chart.rising_sign if chart else None,
        "chart_metadata": chart.metadata if chart else {},
    }

    try:
        prompt = PROMPT_TEMPLATE
        for key, value in context.items():
            placeholder = "{{" + key + "}}"
            if isinstance(value, (dict, list)):
                rep = json.dumps(value)
            else:
                rep = "" if value is None else str(value)
            prompt = prompt.replace(placeholder, rep)
        return prompt
    except Exception as e:
        log.error("Failed to build prompt for session %s: %s", session.session_id, str(e))
        raise RuntimeError(f"Failed to build prompt: {str(e)}") from e


def _call_openai(prompt: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    # Fix Windows issue: httpx/OpenAI sometimes fail when SSL_CERT_FILE is set
    # to an invalid path. For this app we simply ignore any user-provided
    # SSL_CERT_FILE and let the default cert store be used.
    os.environ.pop("SSL_CERT_FILE", None)

    client = OpenAI(api_key=api_key)

    def _make_request():
        return client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": "You are a master astrologer. Return ONLY valid JSON. No explanations, no markdown, just pure JSON starting with { and ending with }.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,  # Slightly higher for uniqueness while maintaining accuracy
            max_tokens=2000,  # Limit tokens for faster response (<3 seconds)
            response_format={"type": "json_object"},  # Force JSON mode for faster parsing
        )

    try:
        response = retry_on_rate_limit(_make_request, max_retries=3, base_delay=2.0)
    except Exception as e:
        error_msg = str(e).lower()
        # Check for quota/billing errors and re-raise with a specific exception type
        if any(keyword in error_msg for keyword in ["insufficient_quota", "billing", "quota", "payment", "subscription"]):
            raise RuntimeError(f"OpenAI API quota/billing issue: {str(e)}") from e
        raise
    
    content = response.choices[0].message.content or ""
    
    # With response_format={"type": "json_object"}, OpenAI should return pure JSON
    # But we still handle cases where there might be extra text
    try:
        # Try parsing directly first (for JSON mode)
        return json.loads(content)
    except json.JSONDecodeError:
        # If that fails, try to extract JSON from the content
        try:
            start = content.index("{")
            end = content.rindex("}") + 1
            json_str = content[start:end]
            return json.loads(json_str)
        except (ValueError, json.JSONDecodeError) as e:
            log.error("Failed to parse OpenAI JSON response: %s", str(e))
            log.error("Response content: %s", content[:500])
            raise RuntimeError(f"Invalid JSON response from OpenAI: {str(e)}") from e


@shared_task
def generate_astrology_reading(session_id: str) -> None:
    try:
        session = AstrologySession.objects.get(session_id=session_id)
        if session.status not in {AstrologyStatus.PENDING, AstrologyStatus.IN_PROGRESS}:
            return

        session.status = AstrologyStatus.IN_PROGRESS
        session.save(update_fields=["status"])

        # Check if we should use mock data (for development/testing)
        use_mock_data = os.getenv("USE_MOCK_ASTROLOGY", "false").lower() == "true"
        
        if use_mock_data:
            log.info("Using mock astrology data for session %s (USE_MOCK_ASTROLOGY=true)", session_id)
            result = _generate_mock_astrology_result(session)
        else:
            prompt = _build_prompt(session)
            try:
                result = _call_openai(prompt)
            except (RateLimitError, RuntimeError) as exc:
                error_msg = str(exc).lower()
                # Check for quota/billing/subscription errors
                if any(keyword in error_msg for keyword in ["insufficient_quota", "billing", "quota", "payment", "subscription"]):
                    # Use mock data if no subscription/quota available
                    log.warning("OpenAI quota/billing issue for session %s, using mock data: %s", session_id, str(exc))
                    result = _generate_mock_astrology_result(session)
                elif isinstance(exc, RateLimitError):
                    # Regular rate limit (not quota) - return error
                    session.openai_result = {
                        "error": f"Rate limit exceeded. Please wait a moment and try again. Details: {str(exc)[:200]}"
                    }
                    session.status = AstrologyStatus.FAILED
                    session.save(update_fields=["openai_result", "status"])
                    log.error("Rate limit error for astrology session %s: %s", session_id, str(exc))
                    return
                else:
                    # Other RuntimeError - might be quota related, try mock
                    log.warning("OpenAI API error for session %s, attempting mock data: %s", session_id, str(exc))
                    result = _generate_mock_astrology_result(session)
            except Exception as exc:
                error_msg = str(exc).lower()
                # If it's a quota/billing error, use mock data
                if any(keyword in error_msg for keyword in ["insufficient_quota", "billing", "quota", "payment", "subscription"]):
                    log.warning("OpenAI quota/billing issue for session %s, using mock data: %s", session_id, str(exc))
                    result = _generate_mock_astrology_result(session)
                else:
                    # Re-raise other exceptions
                    raise

        session.openai_result = result
        session.status = AstrologyStatus.COMPLETED

        # Respect consent_to_store: if false, shorten TTL and purge PII quickly.
        if not session.consent_to_store:
            hours = int(getattr(settings, "ASTROLOGY_NO_CONSENT_TTL_HOURS", 0))
            session.expires_at = timezone.now() + timezone.timedelta(
                hours=hours or 1
            )

        session.save(update_fields=["openai_result", "status", "expires_at"])
    except Exception as exc:  # noqa: BLE001
        log.exception("Failed to generate astrology reading for %s", session_id)
        try:
            session = AstrologySession.objects.get(session_id=session_id)
            session.status = AstrologyStatus.FAILED
            session.openai_result = {
                "error": f"Failed to generate reading: {str(exc)[:200]}"
            }
            session.save(update_fields=["status", "openai_result"])
        except Exception:  # noqa: BLE001
            log.exception("Failed to update astrology session after error")


