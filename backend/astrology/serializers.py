from __future__ import annotations

import json
from datetime import date, time
from typing import Any, Dict

from django.utils import timezone
from rest_framework import serializers

from .crypto import encrypt_value
from .models import AstrologySession, AstrologyStatus


GENDER_CHOICES = [
    "Male",
    "Female",
    "Non-Binary",
    "Prefer not to say",
]


class PersonalInfoSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    gender = serializers.ChoiceField(choices=GENDER_CHOICES)
    consent_to_store = serializers.BooleanField()

    def validate_consent_to_store(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError(
                "Explicit consent is required to start an astrology session."
            )
        return value

    def create(self, validated_data: Dict[str, Any]) -> AstrologySession:
        full_name = validated_data["full_name"]
        if len(full_name.strip()) < 2:
            raise serializers.ValidationError(
                {"full_name": "Name must be at least 2 characters long."}
            )

        session = AstrologySession.objects.create(
            full_name=encrypt_value(full_name.strip()),
            gender=encrypt_value(validated_data["gender"]),
            consent_to_store=validated_data["consent_to_store"],
            status=AstrologyStatus.PENDING,
        )
        return session


class BirthDetailsSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    birth_date = serializers.DateField(required=False, allow_null=True)
    birth_time = serializers.TimeField(required=False, allow_null=True)
    birth_place = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if not any(
            attrs.get(field)
            for field in (
                "birth_date",
                "birth_time",
                "birth_place",
            )
        ):
            raise serializers.ValidationError(
                "At least one of birth_date, birth_time, or birth_place must be provided."
            )
        return attrs


class PreferencesSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    preferences = serializers.JSONField()


class GenerateReadingSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()


