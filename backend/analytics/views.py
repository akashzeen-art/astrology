from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, views
from rest_framework.response import Response

from readings.models import Reading


class AnalyticsSummaryView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        total_last_24h = Reading.objects.filter(created_at__gte=last_24h).count()
        success_last_24h = Reading.objects.filter(
            created_at__gte=last_24h, status="DONE"
        ).count()
        failed_last_24h = Reading.objects.filter(
            created_at__gte=last_24h, status="FAILED"
        ).count()

        total_last_7d = Reading.objects.filter(created_at__gte=last_7d).count()

        return Response(
            {
                "last_24h": {
                    "total": total_last_24h,
                    "success": success_last_24h,
                    "failed": failed_last_24h,
                },
                "last_7d": {"total": total_last_7d},
            }
        )


