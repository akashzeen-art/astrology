from __future__ import annotations

from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .models import NumerologyRequest, NumerologyStatus
from .utils import compute_numerology, clean_name


class NumerologyCreateSerializer(serializers.Serializer):
  full_name = serializers.CharField(max_length=200)
  birth_date = serializers.DateField()
  consent_to_store = serializers.BooleanField()

  def validate_full_name(self, value: str) -> str:
    cleaned = clean_name(value)
    if len(cleaned) < 2:
      raise serializers.ValidationError(
          "Full name must contain at least two alphabetic characters."
      )
    return value

  def validate_birth_date(self, value: date) -> date:
    today = timezone.now().date()
    if value > today:
      raise serializers.ValidationError("Birth date cannot be in the future.")
    if value.year < 1900:
      raise serializers.ValidationError("Birth date must be later than 1900.")
    return value

  def create(self, validated_data):
    request = self.context.get("request")
    user = request.user if request and request.user.is_authenticated else None
    api_key = getattr(request, "numerology_api_key", None)

    computed = compute_numerology(
        validated_data["full_name"], validated_data["birth_date"]
    )

    instance = NumerologyRequest.objects.create(
        user=user,
        full_name=validated_data["full_name"],
        normalized_name=computed["normalized_name"],
        birth_date=validated_data["birth_date"],
        computed_numbers=computed,
        consent_to_store=validated_data["consent_to_store"],
        api_key=api_key,
        status=NumerologyStatus.PENDING,
    )
    return instance


class NumerologyStatusSerializer(serializers.ModelSerializer):
  class Meta:
    model = NumerologyRequest
    fields = ["id", "status", "created_at", "expires_at", "error_message"]


class NumerologyResultSerializer(serializers.ModelSerializer):
  class Meta:
    model = NumerologyRequest
    fields = ["id", "status", "computed_numbers", "openai_result", "created_at"]


