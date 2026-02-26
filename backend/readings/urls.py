from django.urls import path

from .views import (
    EventLogListView,
    HealthView,
    PredictionsView,
    ReadingCallbackView,
    ReadingListView,
    ReadingResultView,
    ReadingStatusView,
    ReadingUploadView,
    UnifiedReadingSaveView,
)
from .views_palm import PalmReadingAnalyzeView

app_name = "readings"

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("readings/", ReadingUploadView.as_view(), name="reading-upload"),  # POST for create
    path("readings/list/", ReadingListView.as_view(), name="reading-list"),  # GET for list
    path("readings/save/", UnifiedReadingSaveView.as_view(), name="reading-save-unified"),
    path("readings/<uuid:pk>/status/", ReadingStatusView.as_view(), name="reading-status"),
    path("readings/<uuid:pk>/result/", ReadingResultView.as_view(), name="reading-result"),
    path("readings/callback/", ReadingCallbackView.as_view(), name="reading-callback"),
    path("events/", EventLogListView.as_view(), name="event-list"),
    path("predictions/get/", PredictionsView.as_view(), name="predictions-get"),
    # New palm reading endpoint
    path("palm-reading/analyze/", PalmReadingAnalyzeView.as_view(), name="palm-reading-analyze"),
]


