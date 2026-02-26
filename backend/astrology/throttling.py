from __future__ import annotations

from rest_framework.throttling import AnonRateThrottle


class AstrologyRateThrottle(AnonRateThrottle):
    scope = "astrology"


