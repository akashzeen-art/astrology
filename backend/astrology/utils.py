from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, date, time
from typing import Dict, Any

from astral import LocationInfo
from astral.sun import sun


@dataclass
class BasicChart:
    sun_sign: str
    moon_sign: str
    rising_sign: str
    metadata: Dict[str, Any]


ZODIAC_SIGNS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]


def approximate_sun_sign(birth_date: date) -> str:
    """
    Very simplified sun sign calculation based on Western tropical zodiac.
    This is good enough for demo purposes; production should use a full ephemeris.
    """
    month = birth_date.month
    day = birth_date.day
    # Approximate date ranges
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    if (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    if (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    if (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    if (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    if (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    if (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    if (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    if (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    if (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    if (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius"
    return "Pisces"


def approximate_moon_and_rising(
    birth_date: date,
    birth_time: time | None,
    birth_place: str | None,
) -> Dict[str, str]:
    """
    Placeholder function that uses time-of-day and a simple rotation to
    approximate moon and rising signs. For real astrology, an ephemeris like
    Swiss Ephemeris should be used.
    """
    # Use time-of-day and simple mapping to generate deterministic but simple outputs.
    hour = (birth_time.hour if birth_time else 12) % 24
    moon_index = (hour // 2) % 12
    rising_index = (hour // 2 + 3) % 12
    return {
        "moon_sign": ZODIAC_SIGNS[moon_index],
        "rising_sign": ZODIAC_SIGNS[rising_index],
    }


def compute_basic_chart(
    birth_date: date,
    birth_time: time | None,
    birth_place: str | None,
) -> BasicChart:
    sun_sign = approximate_sun_sign(birth_date)
    others = approximate_moon_and_rising(birth_date, birth_time, birth_place)
    return BasicChart(
        sun_sign=sun_sign,
        moon_sign=others["moon_sign"],
        rising_sign=others["rising_sign"],
        metadata={
            "note": "Approximate chart based on simplified rules; not a full ephemeris.",
        },
    )


