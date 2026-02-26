from __future__ import annotations

import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class AstrologyStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    IN_PROGRESS = "IN_PROGRESS", "In progress"
    COMPLETED = "COMPLETED", "Completed"
    FAILED = "FAILED", "Failed"


def default_expires_at() -> timezone.datetime:
    hours = int(getattr(settings, "ASTROLOGY_TTL_HOURS", 24))
    return timezone.now() + timedelta(hours=hours)


class AstrologySession(models.Model):
    """
    Multi-step astrology reading wizard session.

    All user-entered fields are stored encrypted using Fernet; the fields
    contain ciphertext at rest, not plaintext.
    """

    session_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    full_name = models.TextField()
    gender = models.TextField()  # Changed from CharField(max_length=32) to TextField to accommodate encrypted values
    birth_date = models.TextField(null=True, blank=True)
    birth_time = models.TextField(null=True, blank=True)
    birth_place = models.TextField(null=True, blank=True)
    preferences = models.TextField(null=True, blank=True)
    openai_result = models.JSONField(null=True, blank=True)
    status = models.CharField(
        max_length=16, choices=AstrologyStatus.choices, default=AstrologyStatus.PENDING
    )
    consent_to_store = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expires_at)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"AstrologySession {self.session_id}"


