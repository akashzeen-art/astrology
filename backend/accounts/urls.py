from django.urls import path

from .views import DashboardRealtimeView, LoginView, LogoutView, MeView, RefreshView, RegisterView, UpgradePlanView, UserDashboardView

app_name = "accounts"

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),  # User profile endpoint
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("dashboard/", UserDashboardView.as_view(), name="dashboard"),
    path("dashboard/realtime/", DashboardRealtimeView.as_view(), name="dashboard-realtime"),
    path("upgrade-plan/", UpgradePlanView.as_view(), name="upgrade-plan"),
]
