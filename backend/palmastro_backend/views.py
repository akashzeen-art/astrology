from django.http import JsonResponse
from django.utils.timezone import now


def api_root(request):
    """
    Simple health/status endpoint for the PalmAstro backend.
    GET / will return a small JSON payload so you can verify the server.
    """
    return JsonResponse(
        {
            "service": "PalmAstro API",
            "status": "ok",
            "timestamp": now().isoformat(),
            "endpoints": {
                "admin": "/admin/",
                "auth": "/api/v1/auth/",
                "readings": "/api/v1/",
                "astrology": "/api/v1/astrology/",
                "numerology": "/api/v1/numerology/",
                "docs": "/api/docs/",
            },
        }
    )


