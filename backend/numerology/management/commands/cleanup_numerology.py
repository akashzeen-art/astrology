from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from numerology.models import NumerologyRequest


class Command(BaseCommand):
  help = "Delete expired numerology requests and any associated data, for privacy."

  def handle(self, *args, **options):
    now = timezone.now()
    qs = NumerologyRequest.objects.filter(expires_at__lte=now)
    count = qs.count()
    qs.delete()
    self.stdout.write(self.style.SUCCESS(f"Deleted {count} expired numerology requests."))


