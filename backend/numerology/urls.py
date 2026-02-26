from __future__ import annotations

from django.urls import path

from .views import NumerologyCreateView, NumerologyResultView, NumerologyStatusView

app_name = "numerology"

urlpatterns = [
  path("", NumerologyCreateView.as_view(), name="create"),
  path("<uuid:pk>/status/", NumerologyStatusView.as_view(), name="status"),
  path("<uuid:pk>/result/", NumerologyResultView.as_view(), name="result"),
]


