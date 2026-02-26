import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class ReadingStatus(models.TextChoices):
    QUEUED = "QUEUED", "Queued"
    PROCESSING = "PROCESSING", "Processing"
    DONE = "DONE", "Done"
    FAILED = "FAILED", "Failed"


class ReadingType(models.TextChoices):
    PALM_ANALYSIS = "palm_analysis", "Palm Analysis"
    NUMEROLOGY = "numerology", "Numerology"
    ASTROLOGY_READING = "astrology_reading", "Astrology Reading"


def palm_image_upload_path(instance: "Reading", filename: str) -> str:
    return f"palm_uploads/{instance.id}/{filename}"


def default_expires_at() -> "datetime":
    """Default expiry for temporary palm images/readings."""
    return timezone.now() + timedelta(hours=getattr(settings, "IMAGE_TTL_HOURS", 24))


class Reading(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    image = models.ImageField(
        upload_to=palm_image_upload_path,
        null=True,
        blank=True,
        help_text="Temporary stored palm image; auto-deleted after processing/TTL.",
    )
    storage_key = models.CharField(
        max_length=255,
        blank=True,
        help_text="External storage key (e.g. S3 key) if not stored locally.",
    )
    result = models.JSONField(null=True, blank=True)
    reading_type = models.CharField(
        max_length=32,
        choices=ReadingType.choices,
        default=ReadingType.PALM_ANALYSIS,
        help_text="Type of reading: palm_analysis, numerology, or astrology_reading",
    )
    status = models.CharField(
        max_length=16, choices=ReadingStatus.choices, default=ReadingStatus.QUEUED
    )
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(
        default=default_expires_at,
        help_text="When temporary image storage should be removed.",
    )
    model_version = models.CharField(max_length=64, default="v1")
    palm_reference = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="derived_readings",
        help_text="Reference to the palm reading that this reading is based on (for numerology/astrology integration)",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"], name="readings_user_created_idx"),
            models.Index(fields=["user", "reading_type", "-created_at"], name="readings_user_type_created_idx"),
            models.Index(fields=["status", "-created_at"], name="readings_status_created_idx"),
        ]

    def __str__(self) -> str:
        return f"Reading {self.id} ({self.status})"

    @property
    def has_image(self) -> bool:
        return bool(self.image or self.storage_key)


class EventLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reading = models.ForeignKey(
        Reading, null=True, blank=True, on_delete=models.SET_NULL, related_name="events"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    event_type = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.event_type} at {self.created_at.isoformat()}"


