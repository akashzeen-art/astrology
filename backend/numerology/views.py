from __future__ import annotations

from typing import Any

from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework import permissions, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from .models import ApiKey, NumerologyRequest
from .serializers import (
  NumerologyCreateSerializer,
  NumerologyResultSerializer,
  NumerologyStatusSerializer,
)
from .tasks import process_numerology_request
from .throttling import NumerologyRateThrottle


def attach_api_key(request: Request) -> None:
  """
  Helper to resolve X-API-Key header into an ApiKey instance on the request.
  """
  key = request.headers.get("X-API-Key")
  if not key:
    return
  try:
    apikey = ApiKey.objects.get(key=key, is_active=True)
  except ApiKey.DoesNotExist:
    return
  setattr(request, "numerology_api_key", apikey)


class NumerologyCreateView(views.APIView):
  """
  POST /api/v1/numerology/
  """

  # Only authenticated users can create numerology requests
  permission_classes = [permissions.AllowAny]
  throttle_classes = [NumerologyRateThrottle]

  def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
    attach_api_key(request)
    serializer = NumerologyCreateSerializer(
        data=request.data,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    nreq = serializer.save()

    process_numerology_request.delay(str(nreq.id))

    status_url = request.build_absolute_uri(
        reverse("numerology:status", kwargs={"pk": nreq.id})
    )
    result_url = request.build_absolute_uri(
        reverse("numerology:result", kwargs={"pk": nreq.id})
    )

    return Response(
        {
            "job_id": str(nreq.id),
            "status": nreq.status,
            "status_url": status_url,
            "result_url": result_url,
        },
        status=status.HTTP_202_ACCEPTED,
    )


class NumerologyStatusView(views.APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
    nreq = get_object_or_404(NumerologyRequest, pk=pk)
    # Authentication removed - no ownership check
    data = NumerologyStatusSerializer(nreq).data
    return Response(data)


class NumerologyResultView(views.APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request: Request, pk: str, *args: Any, **kwargs: Any) -> Response:
    nreq = get_object_or_404(NumerologyRequest, pk=pk)
    # Authentication removed - no ownership check

    if nreq.status != "COMPLETED" or not nreq.openai_result:
      return Response(
          {"detail": "Result not ready yet.", "status": nreq.status},
          status=status.HTTP_202_ACCEPTED,
      )

    data = NumerologyResultSerializer(nreq).data
    return Response(data)


