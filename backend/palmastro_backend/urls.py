from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .views import api_root

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls", namespace="accounts")),
    path("api/v1/", include("readings.urls", namespace="readings")),
    path("api/v1/analytics/", include("analytics.urls", namespace="analytics")),
    path("api/v1/astrology/", include("astrology.urls", namespace="astrology")),
    path("api/v1/numerology/", include("numerology.urls", namespace="numerology")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

