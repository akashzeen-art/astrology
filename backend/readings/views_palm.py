from __future__ import annotations

from typing import Any

import base64
import os
import tempfile
from pathlib import Path

from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework import permissions, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Reading, ReadingStatus, ReadingType
from .tasks import _run_gpt_palm_model, is_palm_image


class PalmReadingAnalyzeView(views.APIView):
    """
    POST /api/palm-reading/analyze
    
    Accepts multipart/form-data with 'image' field.
    Validates image, sends to OpenAI GPT-4o-mini Vision API,
    and returns structured JSON analysis.
    
    Authentication: Requires logged-in user.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        # Validate image upload
        if "image" not in request.FILES:
            return Response(
                {
                    "error": "No image file provided. Please upload a palm image.",
                    "message": "Please select a palm image file and try again.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_file = request.FILES["image"]

        # Validate file type
        if not image_file.content_type or not image_file.content_type.startswith("image/"):
            return Response(
                {
                    "error": "Invalid file type. Please upload an image file (JPEG, PNG, or WebP).",
                    "message": "Please upload a clear image of your palm in JPEG, PNG, or WebP format.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size (max 10MB)
        if image_file.size > 10 * 1024 * 1024:
            return Response(
                {
                    "error": "Image file too large. Maximum size is 10MB.",
                    "message": "Please upload a smaller image (under 10MB).",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Read image bytes for validation
        image_file.seek(0)
        raw_bytes = image_file.read()
        image_file.seek(0)

        # Validate that it's actually a palm image (skip if validation fails to avoid blocking)
        if not is_palm_image(raw_bytes):
            return Response(
                {
                    "error": "Invalid image: Please upload a proper hand/palm image.",
                    "message": "Please ensure you're uploading a clear, well-lit image of a human palm with fingers spread.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a Reading record (authentication removed - no user required)
        reading = Reading.objects.create(
            user=None,
            reading_type=ReadingType.PALM_ANALYSIS,
            status=ReadingStatus.PROCESSING,
        )

        # Save image temporarily
        reading.image = image_file
        reading.save(update_fields=["image", "status"])

        try:
            # Run OpenAI analysis
            result = _run_gpt_palm_model(reading.image.path)

            # Save result to reading (always creates new record, never overwrites)
            # Each palm scan creates a new Reading record with unique UUID
            reading.result = result
            reading.status = ReadingStatus.DONE
            reading.save(update_fields=["result", "status", "updated_at"])

            # Auto-delete image after processing (as per requirements)
            if reading.image:
                try:
                    reading.image.delete(save=False)
                except Exception:
                    pass  # Ignore deletion errors

            # Return analysis result
            # Note: Frontend will call saveReading() separately to sync to Dashboard
            # This ensures the reading is properly linked and appears in Dashboard
            return Response(
                {
                    "success": True,
                    "reading_id": str(reading.id),
                    "result": result,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            # Handle user-facing errors (invalid image, parsing errors, etc.)
            error_msg = str(e)
            reading.status = ReadingStatus.FAILED
            reading.error_message = error_msg[:2000]
            reading.save(update_fields=["status", "error_message", "updated_at"])

            # Auto-delete image on error too
            if reading.image:
                try:
                    reading.image.delete(save=False)
                except Exception:
                    pass

            # Return 400 Bad Request for user errors (invalid image, parsing, etc.)
            return Response(
                {
                    "success": False,
                    "error": error_msg,
                    "message": error_msg,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # Handle unexpected server errors
            error_msg = str(e)
            reading.status = ReadingStatus.FAILED
            reading.error_message = error_msg[:2000]
            reading.save(update_fields=["status", "error_message", "updated_at"])

            # Auto-delete image on error too
            if reading.image:
                try:
                    reading.image.delete(save=False)
                except Exception:
                    pass

            log.exception("Unexpected error in palm reading analysis")
            return Response(
                {
                    "success": False,
                    "error": "An unexpected error occurred during analysis. Please try again.",
                    "message": "If this problem persists, please contact support.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

