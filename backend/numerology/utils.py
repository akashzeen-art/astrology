from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List


LETTER_MAP = {
    "A": 1,
    "J": 1,
    "S": 1,
    "B": 2,
    "K": 2,
    "T": 2,
    "C": 3,
    "L": 3,
    "U": 3,
    "D": 4,
    "M": 4,
    "V": 4,
    "E": 5,
    "N": 5,
    "W": 5,
    "F": 6,
    "O": 6,
    "X": 6,
    "G": 7,
    "P": 7,
    "Y": 7,
    "H": 8,
    "Q": 8,
    "Z": 8,
    "I": 9,
    "R": 9,
}

VOWELS = set("AEIOUY")

MASTER_NUMBERS = {11, 22, 33}


def reduce_number(n: int) -> int:
  """
  Reduce a number using Pythagorean digit reduction,
  preserving master numbers (11, 22, 33).
  """
  if n in MASTER_NUMBERS:
    return n
  while n > 9:
    digits = [int(d) for d in str(n)]
    n = sum(digits)
    if n in MASTER_NUMBERS:
      break
  return n


def clean_name(full_name: str) -> str:
  return re.sub(r"[^A-Za-z]", "", full_name).upper()


def numerology_from_name(full_name: str) -> Dict[str, int]:
  """
  Compute Destiny/Expression, Soul/Heart and Personality numbers from the full name.
  """
  normalized = clean_name(full_name)
  name_numbers = [LETTER_MAP.get(ch, 0) for ch in normalized]

  # Destiny / Expression: all letters
  destiny_raw = sum(name_numbers)
  destiny = reduce_number(destiny_raw)

  # Soul / Heart's desire: vowels only
  vowel_numbers = [LETTER_MAP.get(ch, 0) for ch in normalized if ch in VOWELS]
  soul_raw = sum(vowel_numbers) if vowel_numbers else 0
  soul = reduce_number(soul_raw) if soul_raw else 0

  # Personality: consonants only
  consonant_numbers = [
      LETTER_MAP.get(ch, 0) for ch in normalized if ch not in VOWELS
  ]
  personality_raw = sum(consonant_numbers) if consonant_numbers else 0
  personality = reduce_number(personality_raw) if personality_raw else 0

  return {
      "normalized_name": normalized,
      "destiny_raw": destiny_raw,
      "destiny": destiny,
      "soul_raw": soul_raw,
      "soul": soul,
      "personality_raw": personality_raw,
      "personality": personality,
  }


def numerology_from_birthdate(birth_date: "date") -> Dict[str, int]:
  """
  Compute life path number from birth date using Pythagorean reduction
  with master number handling.
  """
  digits = [int(d) for d in birth_date.strftime("%Y%m%d")]
  total = sum(digits)
  life_path = reduce_number(total)
  return {
      "life_path_raw": total,
      "life_path": life_path,
  }


def compute_karmic_lessons(full_name: str) -> List[int]:
  """
  Optional: karmic lesson numbers are the digits (1-9) not appearing in the name.
  """
  normalized = clean_name(full_name)
  present_numbers = {LETTER_MAP.get(ch, 0) for ch in normalized}
  return sorted([n for n in range(1, 10) if n not in present_numbers])


def compute_numerology(full_name: str, birth_date: "date") -> Dict:
  """
  High-level helper used by the API and Celery task.
  """
  name_data = numerology_from_name(full_name)
  birth_data = numerology_from_birthdate(birth_date)
  karmic_lessons = compute_karmic_lessons(full_name)

  result: Dict = {
      "life_path": birth_data["life_path"],
      "life_path_raw": birth_data["life_path_raw"],
      "destiny": name_data["destiny"],
      "destiny_raw": name_data["destiny_raw"],
      "soul": name_data["soul"],
      "soul_raw": name_data["soul_raw"],
      "personality": name_data["personality"],
      "personality_raw": name_data["personality_raw"],
      "normalized_name": name_data["normalized_name"],
      "karmic_lessons": karmic_lessons,
      "method": "Pythagorean reduction with master numbers 11/22/33 preserved",
  }
  return result


