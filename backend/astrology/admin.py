from __future__ import annotations

from django.contrib import admin

from .models import AstrologySession


@admin.register(AstrologySession)
class AstrologySessionAdmin(admin.ModelAdmin):
    list_display = ("session_id", "status", "consent_to_store", "created_at", "expires_at")
    list_filter = ("status", "consent_to_store", "created_at")
    search_fields = ("session_id",)
    readonly_fields = ("openai_result",)


