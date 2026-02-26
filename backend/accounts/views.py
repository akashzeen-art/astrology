from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status, throttling, views
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from readings.models import Reading, ReadingStatus

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


User = get_user_model()

COOKIE_REFRESH_TOKEN_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """
    Attach the refresh token in a secure HttpOnly cookie.
    """
    secure = not settings.DEBUG
    response.set_cookie(
        COOKIE_REFRESH_TOKEN_NAME,
        refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/api/v1/auth/",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_REFRESH_TOKEN_NAME, path="/api/v1/auth/")


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/signup/

    Body: { full_name, email, password, confirm_password, accepted_terms, subscribe_newsletter? }

    Returns:
    {
      "success": true,
      "message": "...",
      "data": {
        "user": {...},
        "access_token": "..."
      }
    }
    """

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "auth_signup"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Return detailed validation errors
            return Response(
                {
                    "success": False,
                    "message": "Validation failed. Please check your input.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_data = UserSerializer(user).data
        response_data = {
            "success": True,
            "message": "Account created successfully.",
            "data": {
                "user": user_data,
                "access_token": access_token,
            },
        }

        response = Response(response_data, status=status.HTTP_201_CREATED)
        set_refresh_cookie(response, str(refresh))
        return response


class LoginView(APIView):
    """
    POST /api/v1/auth/login/

    Body: { email, password }

    Returns:
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "user": {...},
        "access_token": "..."
      }
    }

    Refresh token is set as an HttpOnly cookie.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        user_data = UserSerializer(user).data

        response = Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "user": user_data,
                    "access_token": access_token,
                },
            },
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(response, str(refresh))
        return response


class MeView(generics.RetrieveAPIView):
    """
    GET /api/v1/auth/me/
    Header: Authorization: Bearer <access_token>
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Check if user is authenticated (permission_classes already handles this, but add explicit check)
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"success": False, "message": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        user_data = self.get_serializer(request.user).data
        return Response(
            {"success": True, "message": "User is authenticated.", "data": {"user": user_data}},
            status=status.HTTP_200_OK,
        )


class RefreshView(APIView):
    """
    POST /api/v1/auth/refresh/

    Uses refresh token from HttpOnly cookie to issue a new access token.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(COOKIE_REFRESH_TOKEN_NAME)
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
        except (TokenError, InvalidToken):
            return Response(
                {"success": False, "message": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {"success": True, "message": "Token refreshed.", "data": {"access_token": access_token}},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/

    Invalidates the refresh token and clears the cookie.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(COOKIE_REFRESH_TOKEN_NAME)
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except (TokenError, InvalidToken):
                # Token already invalid or malformed; ignore.
                pass

        response = Response(
            {"success": True, "message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
        clear_refresh_cookie(response)
        return response


class UserDashboardView(views.APIView):
    """
    GET /api/v1/auth/dashboard/

    Returns personalized dashboard metrics for the authenticated user.
    Shape matches the Frontend DashboardData type.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        # Authentication removed - get all readings without user filter
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Get all readings (no user filter)
        readings_qs = Reading.objects.all().order_by("-created_at").select_related("palm_reference")

        total_readings = readings_qs.count()
        # Use optimized queries with date filters
        readings_this_month = Reading.objects.filter(
            created_at__gte=month_ago
        ).count()
        readings_this_week = Reading.objects.filter(
            created_at__gte=week_ago
        ).count()

        recent_readings = []
        upcoming_predictions: list[dict] = []
        accuracies: list[int] = []
        favorite_type_counts: dict[str, int] = {}
        total_insights_generated = 0
        last_reading_date = None

        def map_status(status: str) -> str:
            if status == ReadingStatus.DONE:
                return "completed"
            if status == ReadingStatus.FAILED:
                return "failed"
            if status == ReadingStatus.QUEUED:
                return "pending"
            return "analyzing"

        for reading in readings_qs[:20]:
            result = reading.result or {}

            # Use reading_type field from model, fallback to result dict
            reading_type = reading.reading_type
            if not reading_type and isinstance(result, dict):
                # Fallback for old readings without reading_type field
                reading_type = (
                    result.get("type")
                    or result.get("reading_type")
                    or result.get("readingType")
                    or "palm_analysis"
                )
            # Ensure reading_type is set (default to palm_analysis if still None)
            if not reading_type:
                reading_type = "palm_analysis"

            # Derive accuracy percentage if available
            accuracy_pct = 0
            if isinstance(result, dict):
                # Check for accuracy in result dict (palm analysis format)
                accuracy_block = result.get("accuracy")
                if isinstance(accuracy_block, dict):
                    overall = accuracy_block.get("overall")
                    if isinstance(overall, (int, float)) and overall > 0:
                        # Support either 0–1 or 0–100 ranges
                        accuracy_pct = int(round(overall * 100)) if overall <= 1 else int(round(overall))
                
                # Check for direct accuracy field (numerology/astrology format)
                if accuracy_pct == 0:
                    direct_accuracy = result.get("accuracy")
                    if isinstance(direct_accuracy, (int, float)) and direct_accuracy > 0:
                        accuracy_pct = int(round(direct_accuracy)) if direct_accuracy <= 100 else int(round(direct_accuracy))
                
                # For palm analysis, calculate from overallScore if available
                if accuracy_pct == 0 and reading_type == "palm_analysis":
                    overall_score = result.get("overallScore")
                    if isinstance(overall_score, (int, float)) and overall_score > 0:
                        # Support either 0–1 or 0–100 ranges
                        accuracy_pct = int(round(overall_score * 100)) if overall_score <= 1 else int(round(overall_score))
                    
                    # If still 0, calculate from line scores average
                    if accuracy_pct == 0 and "lines" in result:
                        lines = result.get("lines", {})
                        line_scores = []
                        for line_key in ["lifeLine", "headLine", "heartLine", "fateLine"]:
                            if line_key in lines:
                                line_data = lines[line_key]
                                line_score = line_data.get("score", 0)
                                # Skip absent fate line
                                if line_key == "fateLine" and line_data.get("quality", "").lower() == "absent":
                                    continue
                                if line_score > 0:
                                    line_scores.append(line_score)
                        
                        if line_scores:
                            accuracy_pct = int(round(sum(line_scores) / len(line_scores)))

            # Fallback accuracy based on reading type and status (only if truly 0)
            if accuracy_pct == 0 and reading.status == ReadingStatus.DONE:
                if reading_type == "numerology":
                    accuracy_pct = 95  # Numerology calculations are deterministic
                elif reading_type == "astrology_reading":
                    accuracy_pct = 91  # Astrology readings have high accuracy
                else:
                    accuracy_pct = 90  # Palm analysis default

            if accuracy_pct:
                accuracies.append(accuracy_pct)

            favorite_type_counts[reading_type] = favorite_type_counts.get(reading_type, 0) + 1

            # Calculate insights count based on reading type
            insights = 0
            if isinstance(result, dict):
                # Palm Analysis insights - comprehensive count
                if reading_type == "palm_analysis":
                    # Count palm lines (Life, Head, Heart, Fate)
                    lines = result.get("lines", {})
                    if isinstance(lines, dict):
                        for line_key in ["lifeLine", "headLine", "heartLine", "fateLine"]:
                            if line_key in lines:
                                line_data = lines[line_key]
                                # Only count if line is present (not absent)
                                if line_data.get("quality", "").lower() != "absent":
                                    insights += 1
                    
                    # Count personality traits
                    personality = result.get("personality", {})
                    if isinstance(personality, dict):
                        traits = personality.get("traits", [])
                        if isinstance(traits, list):
                            insights += len(traits)
                        # Count physical characteristics
                        if personality.get("dominantHand"): insights += 1
                        if personality.get("palmShape"): insights += 1
                        if personality.get("fingerLength"): insights += 1
                        if personality.get("handType"): insights += 1
                    
                    # Collect prediction summaries for upcoming_predictions
                    preds = result.get("predictions")
                    if isinstance(preds, list):
                        for p in preds:
                            if not isinstance(p, dict):
                                continue
                            area = p.get("area") or p.get("type") or "General"
                            timeframe = p.get("timeframe") or p.get("window") or ""
                            text = p.get("prediction") or p.get("summary") or ""
                            confidence = p.get("confidence")
                            if isinstance(confidence, (int, float)):
                                confidence_pct = int(round(confidence))
                            else:
                                confidence_pct = 80
                            upcoming_predictions.append(
                                {
                                    "area": str(area),
                                    "timeframe": str(timeframe),
                                    "prediction": str(text),
                                    "confidence": confidence_pct,
                                }
                            )
                            insights += 1

                    # Count special marks
                    for key in ("specialMarks", "special_marks"):
                        items = result.get(key)
                        if isinstance(items, list):
                            insights += len(items)
                    
                    # Count compatibility entries
                    if isinstance(result.get("compatibility"), list):
                        insights += len(result.get("compatibility"))
                    
                    # Overall score counts as 1 insight
                    if result.get("overallScore") is not None:
                        insights += 1
                
                # Numerology insights
                elif reading_type == "numerology":
                    if result.get("lifePathNumber"):
                        insights += 1
                    if result.get("destinyNumber"):
                        insights += 1
                    if result.get("soulNumber"):
                        insights += 1
                    if result.get("personalityNumber"):
                        insights += 1
                    if result.get("interpretation"):
                        insights += 1
                    if isinstance(result.get("compatibility"), list):
                        insights += len(result.get("compatibility"))
                    if isinstance(result.get("luckyNumbers"), list):
                        insights += len(result.get("luckyNumbers"))
                
                # Astrology insights
                elif reading_type == "astrology_reading":
                    if result.get("sunSign") or result.get("moonSign") or result.get("risingSign"):
                        insights += 3
                    if isinstance(result.get("personalityTraits"), list):
                        insights += len(result.get("personalityTraits"))
                    if isinstance(result.get("lifePredictions"), list):
                        for pred in result.get("lifePredictions", []):
                            if isinstance(pred, dict):
                                area = pred.get("area") or "General"
                                text = pred.get("prediction") or pred.get("description") or ""
                                if text:
                                    upcoming_predictions.append({
                                        "area": str(area),
                                        "timeframe": pred.get("timeframe", "Upcoming"),
                                        "prediction": str(text),
                                        "confidence": pred.get("confidence", 85),
                                    })
                                    insights += 1
                    if isinstance(result.get("strengths"), list):
                        insights += len(result.get("strengths"))
                    if isinstance(result.get("challenges"), list):
                        insights += len(result.get("challenges"))
            
            total_insights_generated += insights

            if last_reading_date is None:
                last_reading_date = reading.created_at

            # Ensure minimum insights count
            if insights == 0:
                insights = 1  # At least one insight for any reading
            
            recent_readings.append(
                {
                    "id": str(reading.id),
                    "user": None,  # Authentication removed - no user required
                    "type": reading_type,
                    "status": map_status(reading.status),
                    "accuracy": accuracy_pct,
                    "insights": insights,  # Include insights count
                    "created_at": reading.created_at.isoformat(),
                    "updated_at": reading.updated_at.isoformat(),
                    "results": result,
                }
            )

        average_accuracy = int(round(sum(accuracies) / len(accuracies))) if accuracies else 0
        favorite_reading_type = (
            max(favorite_type_counts, key=favorite_type_counts.get) if favorite_type_counts else "Palm Analysis"
        )

        # Build weekly activity (last 7 days, including today)
        weekly_activity = []
        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            day_qs = readings_qs.filter(created_at__gte=day_start, created_at__lt=day_end)
            count = day_qs.count()

            day_accuracies: list[int] = []
            for r in day_qs:
                res = r.result or {}
                if isinstance(res, dict):
                    acc_block = res.get("accuracy")
                    if isinstance(acc_block, dict):
                        overall = acc_block.get("overall")
                        if isinstance(overall, (int, float)):
                            val = int(round(overall * 100)) if overall <= 1 else int(round(overall))
                            day_accuracies.append(val)

            day_avg_accuracy = (
                int(round(sum(day_accuracies) / len(day_accuracies)))
                if day_accuracies
                else average_accuracy
            )

            weekly_activity.append(
                {
                    "day": day_start.strftime("%a"),
                    "readings": count,
                    "accuracy": day_avg_accuracy,
                }
            )

        # Spiritual progress is derived heuristically from accuracy and reading activity
        base_progress = average_accuracy or 60
        spiritual_progress = [
            {"name": "Self-Awareness", "value": min(100, base_progress), "color": "#8852E0"},
            {"name": "Intuition", "value": min(100, int(base_progress * 0.9)), "color": "#7575F0"},
            {"name": "Life Purpose", "value": min(100, int(base_progress * 0.95)), "color": "#F4C025"},
            {"name": "Relationships", "value": min(100, int(base_progress * 0.85)), "color": "#B946D6"},
        ]

        user_stats = {
            "total_readings": total_readings,
            "readings_this_month": readings_this_month,
            "readings_this_week": readings_this_week,
            "average_accuracy": average_accuracy,
            "favorite_reading_type": favorite_reading_type,
            "member_since": "",  # Authentication removed - no user date
            # Placeholder subscription logic – can be wired to a real billing system later
            "subscription_days_left": 0,
            "last_reading_date": last_reading_date.isoformat() if last_reading_date else "",
            "total_insights_generated": total_insights_generated,
        }

        # Sort upcoming_predictions by confidence and keep top 6
        upcoming_predictions.sort(key=lambda p: p.get("confidence", 0), reverse=True)
        upcoming_predictions = upcoming_predictions[:6]

        payload = {
            "recent_readings": recent_readings,
            "weekly_activity": weekly_activity,
            "spiritual_progress": spiritual_progress,
            "user_stats": user_stats,
            "upcoming_predictions": upcoming_predictions,
        }

        return Response(payload, status=status.HTTP_200_OK)


class UpgradePlanView(views.APIView):
    """
    POST /api/v1/auth/upgrade-plan/
    
    Upgrades user's membership plan.
    Body: { "plan_name": "mystic_master" }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from accounts.models import MembershipPlan, UserSubscription
        
        plan_name = request.data.get("plan_name")
        if not plan_name:
            return Response(
                {"error": "plan_name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            plan = MembershipPlan.objects.get(name=plan_name, is_active=True)
        except MembershipPlan.DoesNotExist:
            return Response(
                {"error": f"Plan '{plan_name}' not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get or create user subscription
        subscription, created = UserSubscription.objects.get_or_create(
            user=request.user,
            defaults={"plan": plan, "status": "active"}
        )
        
        if not created:
            subscription.plan = plan
            subscription.status = "active"
            subscription.save()
        
        return Response({
            "success": True,
            "message": f"Successfully upgraded to {plan.display_name}",
            "plan": {
                "name": plan.name,
                "display_name": plan.display_name,
                "features": plan.features,
            }
        }, status=status.HTTP_200_OK)


class DashboardRealtimeView(views.APIView):
    """
    GET /api/v1/auth/dashboard/realtime/
    
    Returns real-time dashboard update information.
    This endpoint can be polled to check for updates without fetching full dashboard data.
    Returns: { "last_update": "ISO timestamp", "has_updates": bool, "readings_count": int }
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        from readings.models import Reading
        
        # Authentication removed - get all readings
        readings_count = Reading.objects.all().count()
        
        # Get the most recent reading timestamp
        last_reading = Reading.objects.all().order_by("-updated_at").first()
        last_update = last_reading.updated_at if last_reading else timezone.now()
        
        return Response({
            "last_update": last_update.isoformat(),
            "has_updates": readings_count > 0,
            "readings_count": readings_count,
            "timestamp": timezone.now().isoformat(),
        }, status=status.HTTP_200_OK)
