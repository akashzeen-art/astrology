from datetime import timedelta

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.utils import timezone

from readings.models import Reading


class Command(BaseCommand):
    help = (
        "Delete expired images and readings older than retention period. "
        "Images are deleted as soon as possible; JSON results are kept for a "
        "limited retention window (default 30 days)."
    )

    def handle(self, *args, **options):
        now = timezone.now()
        image_ttl_hours = getattr(settings, "IMAGE_TTL_HOURS", 24)
        reading_retention_days = getattr(settings, "READING_RETENTION_DAYS", 30)

        # Delete expired images
        expired_images = Reading.objects.filter(
            expires_at__lte=now,
        ).exclude(image="")

        for reading in expired_images:
            if reading.image and default_storage.exists(reading.image.name):
                default_storage.delete(reading.image.name)
            reading.image = None
            reading.storage_key = ""
            reading.save(update_fields=["image", "storage_key"])

        # Delete very old readings (result JSON)
        cutoff = now - timedelta(days=reading_retention_days)
        old_readings = Reading.objects.filter(created_at__lte=cutoff)
        count = old_readings.count()
        old_readings.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Cleanup complete. Deleted images for {expired_images.count()} readings and "
                f"{count} old readings."
            )
        )


