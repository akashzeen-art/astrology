from django.conf import settings
from django.db import models


class UserProfile(models.Model):
  """
  Extra fields for signup that aren't part of Django's default User model.
  Stores:
  - full_name (as entered on the signup form)
  - accepted_terms (checkbox for Terms of Service / Privacy Policy)
  - subscribe_newsletter (marketing / cosmic insights subscription)
  """

  user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    related_name="profile",
    on_delete=models.CASCADE,
  )
  full_name = models.CharField(max_length=255)
  accepted_terms = models.BooleanField(default=False)
  subscribe_newsletter = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:
    return self.full_name or self.user.get_username()


class MembershipPlan(models.Model):
    """
    Available membership plans for users.
    """
    PLAN_CHOICES = [
        ("stellar_seeker", "Stellar Seeker"),
        ("mystic_master", "Mystic Master"),
        ("cosmic_oracle", "Cosmic Oracle"),
    ]
    
    name = models.CharField(max_length=50, choices=PLAN_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    features = models.JSONField(default=list, help_text="List of features included in this plan")
    max_readings_per_month = models.IntegerField(default=10, help_text="0 = unlimited")
    max_predictions = models.IntegerField(default=3, help_text="Number of predictions available")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["price_monthly"]
    
    def __str__(self) -> str:
        return self.display_name


class UserSubscription(models.Model):
    """
    User subscription/membership tracking.
    Links users to their current membership plan.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="subscription",
        on_delete=models.CASCADE,
    )
    plan = models.ForeignKey(
        MembershipPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subscribers",
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "Active"),
            ("cancelled", "Cancelled"),
            ("expired", "Expired"),
            ("trial", "Trial"),
        ],
        default="trial",
    )
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self) -> str:
        return f"{self.user.get_username()} - {self.plan.display_name if self.plan else 'No Plan'}"
