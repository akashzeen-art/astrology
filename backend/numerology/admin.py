from __future__ import annotations

from django.contrib import admin

from .models import ApiKey, NumerologyRequest, NumerologyStatus


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
  list_display = ("name", "key", "user", "is_active", "created_at")
  list_filter = ("is_active", "created_at")
  search_fields = ("name", "key", "user__username", "user__email")


@admin.register(NumerologyRequest)
class NumerologyRequestAdmin(admin.ModelAdmin):
  list_display = (
      "id",
      "masked_full_name",
      "birth_date",
      "status",
      "consent_to_store",
      "created_at",
      "expires_at",
  )
  list_filter = ("status", "consent_to_store", "created_at")
  search_fields = ("full_name", "normalized_name", "id")
  readonly_fields = ("computed_numbers", "openai_result", "error_message")

  def masked_full_name(self, obj: NumerologyRequest) -> str:  # type: ignore[override]
    if self.has_view_or_change_permission(self.request):  # type: ignore[attr-defined]
      return obj.full_name
    if not obj.full_name:
      return ""
    parts = obj.full_name.split()
    masked_parts = [p[0] + "*" * (len(p) - 1) for p in parts]
    return " ".join(masked_parts)

  masked_full_name.short_description = "Full name"


