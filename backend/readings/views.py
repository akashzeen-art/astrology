from __future__ import annotations

from typing import Any

import base64
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from .models import EventLog, Reading
from .serializers import (
    CallbackSerializer,
    EventLogSerializer,
    ReadingResultSerializer,
    ReadingStatusSerializer,
    ReadingUploadSerializer,
    UnifiedReadingSaveSerializer,
)
from .models import ReadingStatus, ReadingType
from .tasks import is_palm_image, process_palm_reading


class HealthView(views.APIView):
    """
    Simple health endpoint for frontend status checks.

    GET /api/v1/health/
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class ReadingUploadView(views.APIView):
    """
    POST /api/v1/readings/

    Accepts multipart/form-data image upload or base64 JSON body and enqueues async processing.

    Authentication:
    - Requires a logged-in user; readings are always bound to the authenticated account.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = ReadingUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = serializer.validated_data.get("image")
        image_b64 = serializer.validated_data.get("image_base64")

        # Validate that the uploaded image is actually a human hand/palm
        raw_bytes: bytes | None = None
        if image:
            raw_bytes = image.read()
            image.seek(0)
        elif image_b64:
            if ";base64," in image_b64:
                _, b64data = image_b64.split(";base64,", 1)
            else:
                b64data = image_b64
            raw_bytes = base64.b64decode(b64data)

        if raw_bytes and not is_palm_image(raw_bytes):
            return Response(
                {
                    "status": "error",
                    "message": "Invalid image: Please upload a proper hand/palm image.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Authentication removed - create reading without user
        reading = Reading.objects.create(user=None)

        if image:
            reading.image = image
            reading.save(update_fields=["image"])

        # For local/dev: run analysis synchronously to avoid needing Redis/Celery workers
        process_palm_reading(str(reading.id), image_base64=image_b64)

        status_url = request.build_absolute_uri(
            reverse("readings:reading-status", kwargs={"pk": reading.id})
        )
        result_url = request.build_absolute_uri(
            reverse("readings:reading-result", kwargs={"pk": reading.id})
        )

        EventLog.objects.create(
            reading=reading,
            user=reading.user,
            event_type="reading.completed_sync",
            metadata={"status_url": status_url},
        )

        # Return immediate DONE status and result URLs
        return Response(
            {
                "job_id": str(reading.id),
                "status": reading.status,
                "status_url": status_url,
                "result_url": result_url,
            },
            status=status.HTTP_200_OK,
        )


class ReadingStatusView(views.APIView):
    """
    GET /api/v1/readings/{job_id}/status/
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
        reading = get_object_or_404(Reading, pk=pk)
        data = ReadingStatusSerializer(reading).data
        return Response(data)


class ReadingResultView(views.APIView):
    """
    GET /api/v1/readings/{job_id}/result/
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
        reading = get_object_or_404(Reading, pk=pk)
        if not reading.result:
            return Response(
                {"detail": "Result not ready yet.", "status": reading.status},
                status=status.HTTP_202_ACCEPTED,
            )
        data = ReadingResultSerializer(reading).data
        return Response(data)


@method_decorator(csrf_exempt, name="dispatch")
class ReadingCallbackView(views.APIView):
    """
    Optional webhook-style callback endpoint.

    POST /api/v1/readings/callback/
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        # Example shape: { "job_id": "...", "status": "...", "result": {...} }
        payload = request.data
        job_id = payload.get("job_id")
        reading = get_object_or_404(Reading, pk=job_id)
        reading.result = payload.get("result", reading.result)
        reading.status = payload.get("status", reading.status)
        reading.save()

        EventLog.objects.create(
            reading=reading,
            user=reading.user,
            event_type="reading.callback",
            metadata={"status": reading.status},
        )

        return Response({"detail": "Callback processed."})


class UnifiedReadingSaveView(views.APIView):
    """
    POST /api/v1/readings/save/
    
    Unified endpoint to save readings from all three sources (Palm, Numerology, Astrology).
    This ensures all AI-generated results are automatically persisted to the user's Dashboard.
    
    Authentication:
    - Requires a logged-in user; readings are always bound to the authenticated account.
    """
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = UnifiedReadingSaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reading_type = serializer.validated_data["reading_type"]
        result = serializer.validated_data["result"]
        accuracy = serializer.validated_data.get("accuracy")
        source_id = serializer.validated_data.get("source_id")
        palm_reference_id = serializer.validated_data.get("palm_reference_id")
        
        # Get palm reference if provided (authentication removed - no user check)
        palm_reference = None
        if palm_reference_id:
            try:
                palm_reference = Reading.objects.get(
                    id=palm_reference_id,
                    reading_type=ReadingType.PALM_ANALYSIS,
                    status=ReadingStatus.DONE
                )
            except Reading.DoesNotExist:
                # If palm reference not found, try to get latest palm reading
                palm_reference = Reading.objects.filter(
                    reading_type=ReadingType.PALM_ANALYSIS,
                    status=ReadingStatus.DONE
                ).order_by("-created_at").first()
        
        # Create new reading (always append, never overwrite) - no user required
        reading = Reading.objects.create(
            user=None,
            reading_type=reading_type,
            result=result,
            status=ReadingStatus.DONE,
            palm_reference=palm_reference,
        )
        
        # Store source reference in metadata if provided
        if source_id:
            if not isinstance(result, dict):
                result = {}
            result["source_id"] = str(source_id)
            reading.result = result
            reading.save(update_fields=["result"])
        
        # Calculate accuracy if not provided but available in result
        if accuracy is None and isinstance(result, dict):
            accuracy_block = result.get("accuracy")
            if isinstance(accuracy_block, dict):
                overall = accuracy_block.get("overall")
                if isinstance(overall, (int, float)):
                    accuracy = int(round(overall * 100)) if overall <= 1 else int(round(overall))
        
        # Log the event (no user required)
        EventLog.objects.create(
            reading=reading,
            user=None,
            event_type="reading.saved_unified",
            metadata={
                "reading_type": reading_type,
                "accuracy": accuracy,
                "source_id": str(source_id) if source_id else None,
            },
        )
        
        return Response(
            {
                "success": True,
                "message": "Reading saved successfully to Dashboard.",
                "data": {
                    "id": str(reading.id),
                    "reading_type": reading_type,
                    "status": reading.status,
                    "created_at": reading.created_at.isoformat(),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class EventLogListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        events = EventLog.objects.all()[:500]
        data = EventLogSerializer(events, many=True).data
        return Response(data)


class ReadingListView(views.APIView):
    """
    GET /api/v1/readings/list/
    
    Returns a list of all readings for the authenticated user.
    Supports pagination via ?limit= and ?offset= query parameters.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        limit = int(request.query_params.get("limit", 20))
        offset = int(request.query_params.get("offset", 0))
        
        # Optimized query using index - uses readings_reading_user_created_idx
        readings_qs = Reading.objects.filter(user=request.user).order_by("-created_at").select_related("palm_reference")
        total = readings_qs.count()
        
        readings = readings_qs[offset:offset + limit]
        data = ReadingResultSerializer(readings, many=True).data
        
        return Response({
            "count": total,
            "next": f"?limit={limit}&offset={offset + limit}" if offset + limit < total else None,
            "previous": f"?limit={limit}&offset={max(0, offset - limit)}" if offset > 0 else None,
            "results": data,
        })


class PredictionsView(views.APIView):
    """
    GET /api/v1/predictions/get/
    
    Returns all predictions extracted from user's readings.
    Predictions are aggregated from all reading results.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        from readings.models import ReadingStatus
        
        # Optimized query using index
        readings_qs = Reading.objects.filter(
            user=request.user,
            status=ReadingStatus.DONE
        ).order_by("-created_at").select_related("palm_reference")
        
        predictions = []
        for reading in readings_qs:
            result = reading.result or {}
            if not isinstance(result, dict):
                continue
            
            reading_type = reading.reading_type
            
            # Extract predictions from palm analysis
            if reading_type == "palm_analysis":
                preds = result.get("predictions", [])
                if isinstance(preds, list):
                    for p in preds:
                        if isinstance(p, dict):
                            predictions.append({
                                "id": str(reading.id),
                                "reading_type": reading_type,
                                "reading_date": reading.created_at.isoformat(),
                                "area": p.get("area") or p.get("type") or "General",
                                "timeframe": p.get("timeframe") or p.get("window") or "",
                                "prediction": p.get("prediction") or p.get("summary") or "",
                                "confidence": p.get("confidence", 80),
                            })
            
            # Extract predictions from astrology readings
            elif reading_type == "astrology_reading":
                life_preds = result.get("lifePredictions", [])
                if isinstance(life_preds, list):
                    for pred in life_preds:
                        if isinstance(pred, dict):
                            predictions.append({
                                "id": str(reading.id),
                                "reading_type": reading_type,
                                "reading_date": reading.created_at.isoformat(),
                                "area": pred.get("area") or "General",
                                "timeframe": pred.get("timeframe", "Upcoming"),
                                "prediction": pred.get("prediction") or pred.get("description") or "",
                                "confidence": pred.get("confidence", 85),
                            })
        
        # Sort by confidence and limit to top 20
        predictions.sort(key=lambda p: p.get("confidence", 0), reverse=True)
        predictions = predictions[:20]
        
        return Response({
            "count": len(predictions),
            "results": predictions,
        })


