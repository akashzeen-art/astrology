from __future__ import annotations

from rest_framework.throttling import AnonRateThrottle


class NumerologyRateThrottle(AnonRateThrottle):
  """
  Simple IP-based throttle with optional API-key awareness.
  If request.numerology_api_key is set, throttle by that key instead of IP.
  """

  scope = "numerology"

  def get_ident(self, request):
    api_key = getattr(request, "numerology_api_key", None)
    if api_key:
      return f"apikey-{api_key.key}"
    return super().get_ident(request)


