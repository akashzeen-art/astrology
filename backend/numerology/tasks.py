from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict

from celery import shared_task
from django.conf import settings
from django.utils import timezone
from openai import OpenAI, RateLimitError

from .models import NumerologyRequest, NumerologyStatus

log = logging.getLogger(__name__)


def _load_prompt_template() -> str:
  here = Path(__file__).resolve().parent
  template_path = here / "prompt_template.txt"
  return template_path.read_text(encoding="utf-8")


PROMPT_TEMPLATE = _load_prompt_template()


def _build_prompt(nreq: NumerologyRequest) -> str:
  data = nreq.computed_numbers or {}
  context = {
      "request_id": str(nreq.id),
      "method": data.get("method", ""),
      "life_path": data.get("life_path"),
      "life_path_raw": data.get("life_path_raw"),
      "destiny": data.get("destiny"),
      "destiny_raw": data.get("destiny_raw"),
      "soul": data.get("soul"),
      "soul_raw": data.get("soul_raw"),
      "personality": data.get("personality"),
      "personality_raw": data.get("personality_raw"),
      "karmic_lessons": data.get("karmic_lessons", []),
      "normalized_name": data.get("normalized_name"),
  }
  prompt = PROMPT_TEMPLATE
  for key, value in context.items():
    placeholder = "{{" + key + "}}"
    prompt = prompt.replace(placeholder, json.dumps(value) if not isinstance(value, str) else str(value))
  return prompt


def _call_openai(prompt: str) -> Dict[str, Any]:
  api_key = os.getenv("OPENAI_API_KEY")
  if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set")

  client = OpenAI(api_key=api_key)

  response = client.chat.completions.create(
      model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
      messages=[
          {
              "role": "system",
              "content": "You are a master numerologist. Return ONLY valid JSON. No explanations, no markdown, just pure JSON starting with { and ending with }.",
          },
          {
              "role": "user",
              "content": prompt,
          },
      ],
      temperature=0.3,  # Slightly higher for uniqueness while maintaining accuracy
      max_tokens=2000,  # Limit tokens for faster response (<3 seconds)
      response_format={"type": "json_object"},  # Force JSON mode for faster parsing
  )

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
def process_numerology_request(request_id: str) -> None:
  try:
    nreq = NumerologyRequest.objects.get(id=request_id)
    if nreq.status != NumerologyStatus.PENDING:
      return

    prompt = _build_prompt(nreq)
    try:
      result = _call_openai(prompt)
    except Exception as exc:  # noqa: BLE001
      log.exception("OpenAI numerology call failed for %s", request_id)
      raise

    nreq.openai_result = result
    nreq.status = NumerologyStatus.COMPLETED

    # Respect consent_to_store: if false, shorten TTL and avoid storing PII long-term.
    if not nreq.consent_to_store:
      ttl_days = getattr(settings, "NUMEROLOGY_NO_CONSENT_TTL_DAYS", 0)
      hours = max(ttl_days * 24, 0)
      nreq.expires_at = timezone.now() + timezone.timedelta(hours=hours or 1)

    nreq.save(update_fields=["openai_result", "status", "expires_at"])
  except Exception as exc:  # noqa: BLE001
    log.exception("Failed to process numerology request %s", request_id)
    try:
      nreq = NumerologyRequest.objects.get(id=request_id)
      nreq.status = NumerologyStatus.FAILED
      nreq.error_message = str(exc)[:2000]
      nreq.save(update_fields=["status", "error_message"])
    except Exception:  # noqa: BLE001
      log.exception("Failed to update numerology request after error")


