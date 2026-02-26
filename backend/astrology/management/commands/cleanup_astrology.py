from __future__ import annotations

from django.core.management.base import BaseCommand
from django.utils import timezone

from astrology.models import AstrologySession


class Command(BaseCommand):
    help = "Delete expired astrology sessions for privacy."

    def handle(self, *args, **options):
        now = timezone.now()
        qs = AstrologySession.objects.filter(expires_at__lte=now)
        count = qs.count()
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} expired astrology sessions."))


