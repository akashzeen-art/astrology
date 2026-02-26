from __future__ import annotations

from django.urls import path

from .views import (
    AstrologyResultView,
    AstrologyStatusView,
    BirthDetailsView,
    GenerateReadingView,
    PersonalInfoView,
    PreferencesView,
)

app_name = "astrology"

urlpatterns = [
    path("personal-info/", PersonalInfoView.as_view(), name="personal-info"),
    path("birth-details/", BirthDetailsView.as_view(), name="birth-details"),
    path("preferences/", PreferencesView.as_view(), name="preferences"),
    path("generate-reading/", GenerateReadingView.as_view(), name="generate-reading"),
    path("<uuid:pk>/status/", AstrologyStatusView.as_view(), name="status"),
    path("<uuid:pk>/result/", AstrologyResultView.as_view(), name="result"),
]


