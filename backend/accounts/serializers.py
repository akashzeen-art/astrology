from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import UserProfile


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer matching the frontend signup form.

    Fields expected from UI:
    - full_name
    - email
    - password
    - confirm_password
    - accepted_terms (checkbox: I agree to Terms & Privacy)
    - subscribe_newsletter (checkbox: Subscribe to cosmic insights)
    """

    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    accepted_terms = serializers.BooleanField(write_only=True)
    subscribe_newsletter = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "email",
            "password",
            "confirm_password",
            "accepted_terms",
            "subscribe_newsletter",
        )
        read_only_fields = ("id",)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        if not attrs.get("accepted_terms"):
            raise serializers.ValidationError(
                {"accepted_terms": "You must accept the Terms of Service and Privacy Policy to create an account."}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)
        accepted_terms = validated_data.pop("accepted_terms", False)
        subscribe_newsletter = validated_data.pop("subscribe_newsletter", False)
        full_name = validated_data.pop("full_name", "").strip()

        # Derive username and first_name/last_name from full_name + email
        email = validated_data["email"]
        username = email.split("@")[0]
        first_name = full_name

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
        )
        user.set_password(password)
        user.save()

        # Store extra signup details in UserProfile
        UserProfile.objects.create(
            user=user,
            full_name=full_name or username,
            accepted_terms=accepted_terms,
            subscribe_newsletter=subscribe_newsletter,
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Login with email + password.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email__iexact=email)
            username = user.username
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "date_joined",
            "last_login",
        )


