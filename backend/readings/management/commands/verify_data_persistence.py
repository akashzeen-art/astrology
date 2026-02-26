"""
Management command to verify data persistence and chronological ordering.
Run: python manage.py verify_data_persistence
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from readings.models import Reading, ReadingStatus, ReadingType
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = "Verify that readings are stored chronologically and persist correctly"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("🔍 Verifying Data Persistence...\n"))

        # Check all users
        users = User.objects.all()
        total_users = users.count()
        self.stdout.write(f"Checking {total_users} users...\n")

        issues_found = []
        total_readings = 0
        users_with_readings = 0

        for user in users:
            readings = Reading.objects.filter(user=user).order_by("-created_at")
            count = readings.count()
            total_readings += count

            if count == 0:
                continue

            users_with_readings += 1

            # Verify chronological ordering (newest first)
            prev_date = None
            for i, reading in enumerate(readings):
                if prev_date is not None and reading.created_at > prev_date:
                    issues_found.append(
                        f"User {user.email}: Reading {reading.id} is out of order "
                        f"(created_at: {reading.created_at} > previous: {prev_date})"
                    )
                prev_date = reading.created_at

            # Verify no duplicate readings (same timestamp and result hash)
            seen_hashes = {}
            for reading in readings:
                if reading.result:
                    import hashlib
                    import json
                    result_hash = hashlib.md5(
                        json.dumps(reading.result, sort_keys=True).encode()
                    ).hexdigest()
                    timestamp = reading.created_at.isoformat()

                    key = f"{timestamp}_{result_hash}"
                    if key in seen_hashes:
                        issues_found.append(
                            f"User {user.email}: Potential duplicate reading detected "
                            f"(ID: {reading.id}, previous ID: {seen_hashes[key]})"
                        )
                    seen_hashes[key] = str(reading.id)

            # Verify palm reference links (if any)
            for reading in readings:
                if reading.palm_reference:
                    if reading.palm_reference.user != user:
                        issues_found.append(
                            f"User {user.email}: Reading {reading.id} references palm reading "
                            f"from different user ({reading.palm_reference.user.email})"
                        )
                    if reading.palm_reference.reading_type != ReadingType.PALM_ANALYSIS:
                        issues_found.append(
                            f"User {user.email}: Reading {reading.id} references non-palm reading "
                            f"({reading.palm_reference.reading_type})"
                        )

        # Summary
        self.stdout.write(self.style.SUCCESS(f"\n✅ Verification Complete\n"))
        self.stdout.write(f"Total Users: {total_users}")
        self.stdout.write(f"Users with Readings: {users_with_readings}")
        self.stdout.write(f"Total Readings: {total_readings}")
        self.stdout.write(f"Issues Found: {len(issues_found)}\n")

        if issues_found:
            self.stdout.write(self.style.WARNING("⚠️ Issues Detected:\n"))
            for issue in issues_found[:10]:  # Show first 10 issues
                self.stdout.write(f"  - {issue}")
            if len(issues_found) > 10:
                self.stdout.write(f"  ... and {len(issues_found) - 10} more issues")
        else:
            self.stdout.write(self.style.SUCCESS("✅ No issues found! All readings are properly stored and ordered."))

        # Check data persistence (readings older than 1 day should still exist)
        day_ago = timezone.now() - timedelta(days=1)
        old_readings = Reading.objects.filter(created_at__lt=day_ago).count()
        self.stdout.write(f"\n📊 Data Persistence Check:")
        self.stdout.write(f"  Readings older than 1 day: {old_readings}")
        if old_readings > 0:
            self.stdout.write(self.style.SUCCESS("  ✅ Data persists correctly"))
        else:
            self.stdout.write(self.style.WARNING("  ⚠️ No old readings found (may be normal for new installations)"))

