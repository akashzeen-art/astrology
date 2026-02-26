from __future__ import annotations

import uuid
from datetime import timedelta, date
from typing import Any, Dict

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class NumerologyStatus(models.TextChoices):
  PENDING = "PENDING", "Pending"
  COMPLETED = "COMPLETED", "Completed"
  FAILED = "FAILED", "Failed"


def default_numerology_expires_at() -> timezone.datetime:
  days = getattr(settings, "NUMEROLOGY_TTL_DAYS", 30)
  return timezone.now() + timedelta(days=days)


class ApiKey(models.Model):
  """
  Simple API key model used for per-key rate limiting and ownership.
  """

  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  name = models.CharField(max_length=100)
  key = models.CharField(max_length=64, unique=True)
  user = models.ForeignKey(
      User,
      null=True,
      blank=True,
      on_delete=models.SET_NULL,
      related_name="numerology_api_keys",
  )
  is_active = models.BooleanField(default=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = "API Key"
    verbose_name_plural = "API Keys"

  def __str__(self) -> str:
    return f"{self.name} ({'active' if self.is_active else 'inactive'})"


class NumerologyRequest(models.Model):
  """
  Stores a numerology analysis request and its computed / AI-enhanced result.
  """

  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  user = models.ForeignKey(
      User,
      null=True,
      blank=True,
      on_delete=models.SET_NULL,
      related_name="numerology_requests",
  )
  full_name = models.CharField(max_length=200)
  normalized_name = models.CharField(max_length=200)
  birth_date = models.DateField()
  status = models.CharField(
      max_length=16,
      choices=NumerologyStatus.choices,
      default=NumerologyStatus.PENDING,
  )
  computed_numbers = models.JSONField(default=dict)
  openai_result = models.JSONField(null=True, blank=True)
  error_message = models.TextField(null=True, blank=True)
  consent_to_store = models.BooleanField(default=False)
  api_key = models.ForeignKey(
      ApiKey,
      null=True,
      blank=True,
      on_delete=models.SET_NULL,
      related_name="numerology_requests",
  )
  created_at = models.DateTimeField(auto_now_add=True)
  expires_at = models.DateTimeField(default=default_numerology_expires_at)

  class Meta:
    ordering = ("-created_at",)

  def __str__(self) -> str:
    return f"NumerologyRequest {self.id}"

  @property
  def is_expired(self) -> bool:
    return timezone.now() >= self.expires_at


