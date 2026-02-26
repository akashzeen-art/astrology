from django.contrib import admin

from .models import EventLog, Reading


@admin.register(Reading)
class ReadingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "created_at", "model_version")
    list_filter = ("status", "model_version", "created_at")
    search_fields = ("id", "user__email")
    readonly_fields = ("created_at", "updated_at", "expires_at", "result")


@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "reading", "created_at")
    list_filter = ("event_type", "created_at")
    search_fields = ("id", "event_type", "reading__id")


