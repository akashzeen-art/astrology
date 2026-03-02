import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")  # backend-specific .env

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-in-production")

DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"

ALLOWED_HOSTS: list[str] = [
    h.strip()
    for h in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,.up.railway.app,.railway.app",
    ).split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    # Local apps
    "accounts",
    "readings",
    "analytics",
    "numerology",
    "astrology",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "palmastro_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "palmastro_backend.wsgi.application"


# Database configuration
# - For local development, SQLite is used by default (no external DB required).
# - For deployment/production, set DB_NAME (and other DB_* vars) in .env to
#   automatically switch to PostgreSQL.
if os.getenv("DB_NAME"):
    # Production / external database (PostgreSQL recommended)
    DATABASES = {
        "default": {
            "ENGINE": os.getenv("DB_ENGINE", "django.db.backends.postgresql"),
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }
else:
    # Local development (SQLite)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        },
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.getenv("DRF_THROTTLE_ANON", "20/min"),
        "user": os.getenv("DRF_THROTTLE_USER", "100/min"),
        # Auth-specific scopes (brute-force protection)
        "auth_login": os.getenv("DRF_THROTTLE_AUTH_LOGIN", "5/min"),
        "auth_signup": os.getenv("DRF_THROTTLE_AUTH_SIGNUP", "10/min"),
        # numerology-specific (per IP / per API key via custom throttle)
        "numerology": os.getenv("DRF_THROTTLE_NUMEROLOGY", "10/hour"),
        # astrology multi-step wizard
        "astrology": os.getenv("DRF_THROTTLE_ASTROLOGY", "10/hour"),
    },
}

# JWT configuration (SimpleJWT)
JWT_SIGNING_KEY = os.getenv("JWT_SIGNING_KEY", SECRET_KEY)
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "15"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": JWT_SIGNING_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "UPDATE_LAST_LOGIN": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "PalmAstro Palm Reading API",
    "DESCRIPTION": (
        "Privacy-first palm reading API. Images are processed securely and "
        "automatically deleted after analysis. Only minimal JSON results are stored."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# CORS / CSRF
# We need explicit origins when using credentials (HttpOnly cookies) – "*" is not allowed.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# Production domain: https://www.theastroverse.live
_default_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://theastroverse.live",
    "https://www.theastroverse.live",
]

# Merge env CORS_ALLOWED_ORIGINS with defaults (no duplicates)
_env_cors = os.getenv("CORS_ALLOWED_ORIGINS", "")
_env_origins = [o.strip() for o in _env_cors.split(",") if o.strip()]
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(_default_cors_origins + _env_origins))

# Also allow localhost / 127.0.0.1 and theastroverse.live via regex
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^https://(www\.)?theastroverse\.live$",
]

# CSRF trusted origins (same as CORS for theastroverse.live)
_default_csrf_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://theastroverse.live",
    "https://www.theastroverse.live",
]
_env_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "")
_env_csrf_list = [o.strip() for o in _env_csrf.split(",") if o.strip()]
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(_default_csrf_origins + _env_csrf_list))

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.getenv("DJANGO_SECURE_SSL_REDIRECT", "false").lower() == "true"

DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("DATA_UPLOAD_MAX_MEMORY_SIZE", 10 * 1024 * 1024))
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("FILE_UPLOAD_MAX_MEMORY_SIZE", 10 * 1024 * 1024))

# Celery
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
# Enable eager mode in DEBUG (development) or when explicitly set
# This runs tasks synchronously without requiring Redis
# Force eager mode to True in development to avoid Redis dependency
CELERY_TASK_ALWAYS_EAGER = True  # Always use eager mode in development
CELERY_TASK_EAGER_PROPAGATES = True  # Propagate exceptions in eager mode

# Reading retention
READING_RETENTION_DAYS = int(os.getenv("READING_RETENTION_DAYS", "30"))
IMAGE_TTL_HOURS = int(os.getenv("IMAGE_TTL_HOURS", "24"))

# Numerology retention
NUMEROLOGY_TTL_DAYS = int(os.getenv("NUMEROLOGY_TTL_DAYS", "30"))
NUMEROLOGY_NO_CONSENT_TTL_DAYS = int(
    os.getenv("NUMEROLOGY_NO_CONSENT_TTL_DAYS", "0")
)

# Astrology session retention
ASTROLOGY_TTL_HOURS = int(os.getenv("ASTROLOGY_TTL_HOURS", "24"))
ASTROLOGY_NO_CONSENT_TTL_HOURS = int(
    os.getenv("ASTROLOGY_NO_CONSENT_TTL_HOURS", "0")
)

