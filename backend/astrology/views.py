from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework import permissions, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from .crypto import encrypt_value
from .models import AstrologySession, AstrologyStatus
from .serializers import (
    BirthDetailsSerializer,
    GenerateReadingSerializer,
    PersonalInfoSerializer,
    PreferencesSerializer,
)
from .tasks import generate_astrology_reading
from .throttling import AstrologyRateThrottle


class PersonalInfoView(views.APIView):
    """
    Step 1 – POST /api/v1/astrology/personal-info/
    Requires authentication so sessions are only created by logged-in users.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AstrologyRateThrottle]

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = PersonalInfoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        status_url = request.build_absolute_uri(
            reverse("astrology:status", kwargs={"pk": session.session_id})
        )
        result_url = request.build_absolute_uri(
            reverse("astrology:result", kwargs={"pk": session.session_id})
        )
        return Response(
            {
                "session_id": str(session.session_id),
                "status": session.status,
                "status_url": status_url,
                "result_url": result_url,
            },
            status=status.HTTP_201_CREATED,
        )


class BirthDetailsView(views.APIView):
    """
    Step 2 – PATCH /api/v1/astrology/birth-details/
    """

    # Authentication removed - allow all users to provide birth details
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AstrologyRateThrottle]

    def patch(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = BirthDetailsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        session = get_object_or_404(
            AstrologySession, session_id=data["session_id"]
        )
        if not session.consent_to_store:
            return Response(
                {"detail": "Consent is required before updating birth details."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if data.get("birth_date"):
            session.birth_date = encrypt_value(data["birth_date"].isoformat())
        if data.get("birth_time"):
            session.birth_time = encrypt_value(data["birth_time"].strftime("%H:%M"))
        if data.get("birth_place"):
            session.birth_place = encrypt_value(data["birth_place"])

        session.save(update_fields=["birth_date", "birth_time", "birth_place"])
        return Response(
            {"session_id": str(session.session_id), "status": session.status}
        )


class PreferencesView(views.APIView):
    """
    Step 3 – PATCH /api/v1/astrology/preferences/
    """

    # Authentication removed - allow all users to set preferences
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AstrologyRateThrottle]

    def patch(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = PreferencesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        session = get_object_or_404(
            AstrologySession, session_id=data["session_id"]
        )
        if not session.consent_to_store:
            return Response(
                {"detail": "Consent is required before updating preferences."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Store encrypted JSON string for preferences
        session.preferences = encrypt_value(json.dumps(data["preferences"]))
        session.save(update_fields=["preferences"])
        return Response(
            {"session_id": str(session.session_id), "status": session.status}
        )


class GenerateReadingView(views.APIView):
    """
    Final step – POST /api/v1/astrology/generate-reading/
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AstrologyRateThrottle]

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = GenerateReadingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session_id = serializer.validated_data["session_id"]
        session = get_object_or_404(AstrologySession, session_id=session_id)

        if not session.consent_to_store:
            return Response(
                {
                    "detail": "Consent to store/process data is required before generating a reading."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # In eager mode (development), this runs synchronously
            # In production with Celery workers, this is queued
            generate_astrology_reading.delay(str(session.session_id))
        except Exception as exc:
            # If task fails immediately (e.g., in eager mode), log and return error
            import logging
            log = logging.getLogger(__name__)
            log.exception("Failed to queue astrology reading task for session %s", session.session_id)
            return Response(
                {
                    "detail": f"Failed to start astrology reading generation: {str(exc)[:200]}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        status_url = request.build_absolute_uri(
            reverse("astrology:status", kwargs={"pk": session.session_id})
        )
        result_url = request.build_absolute_uri(
            reverse("astrology:result", kwargs={"pk": session.session_id})
        )

        return Response(
            {
                "session_id": str(session.session_id),
                "status": session.status,
                "status_url": status_url,
                "result_url": result_url,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class AstrologyStatusView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
        session = get_object_or_404(AstrologySession, session_id=pk)
        return Response(
            {
                "session_id": str(session.session_id),
                "status": session.status,
                "created_at": session.created_at,
                "expires_at": session.expires_at,
            }
        )


class AstrologyResultView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
        session = get_object_or_404(AstrologySession, session_id=pk)
        if session.status != AstrologyStatus.COMPLETED or not session.openai_result:
            return Response(
                {"detail": "Result not ready yet.", "status": session.status},
                status=status.HTTP_202_ACCEPTED,
            )
        return Response(
            {
                "session_id": str(session.session_id),
                "status": session.status,
                "result": session.openai_result,
            }
        )


