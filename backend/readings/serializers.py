from rest_framework import serializers
from .models import Reading, EventLog, ReadingStatus, ReadingType


class ReadingUploadSerializer(serializers.Serializer):
    image = serializers.ImageField(required=False, allow_null=True)
    image_base64 = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate(self, data):
        if not data.get("image") and not data.get("image_base64"):
            raise serializers.ValidationError("Either 'image' or 'image_base64' must be provided.")
        return data


class ReadingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = ["id", "status", "error_message", "created_at", "updated_at"]


class ReadingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = ["id", "status", "result", "reading_type", "created_at", "updated_at"]


class UnifiedReadingSaveSerializer(serializers.Serializer):
    """
    Unified serializer for saving readings from all three sources (Palm, Numerology, Astrology).
    """
    reading_type = serializers.ChoiceField(choices=ReadingType.choices, required=True)
    result = serializers.DictField(required=True)
    accuracy = serializers.FloatField(required=False, allow_null=True, min_value=0, max_value=100)
    source_id = serializers.CharField(required=False, allow_null=True, allow_blank=True, help_text="ID from original source (e.g., NumerologyRequest.id, AstrologySession.session_id, or custom string identifier)")
    palm_reference_id = serializers.UUIDField(required=False, allow_null=True, help_text="UUID of the palm reading this reading is based on (for integration)")

    def validate_reading_type(self, value):
        if value not in [choice[0] for choice in ReadingType.choices]:
            raise serializers.ValidationError(f"Invalid reading_type. Must be one of: {[c[0] for c in ReadingType.choices]}")
        return value


class CallbackSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=ReadingStatus.choices)
    result = serializers.DictField(required=False, allow_null=True)


class EventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventLog
        fields = ["id", "event_type", "metadata", "created_at"]
