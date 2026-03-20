# Deployment Package Guide

## FRONTEND Package

### Build the frontend first:
```bash
cd theastroverse
npm install
npm run build
```

### Share this folder:
```
dist/
```

**That's it for frontend!** The `dist` folder contains all compiled static files.

---

## BACKEND Package

### Share these files/folders:

```
backend/
├── accounts/
├── analytics/
├── astrology/
├── numerology/
├── palmastro_backend/
├── readings/
├── manage.py
├── requirements.txt
├── Procfile
├── runtime.txt
└── env.template (NOT .env - see below)
```

### ⚠️ IMPORTANT - DO NOT SHARE:
- ❌ `backend/.env` (contains secrets)
- ❌ `backend/db.sqlite3` (local database)
- ❌ `backend/media/` (user uploads)
- ❌ `backend/__pycache__/` folders
- ❌ `backend/**/migrations/__pycache__/`

---

## Environment Variables (Share Separately - SECURE)

**Tell your deployment team to set these environment variables on the server:**

### Required Variables:
```bash
# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4o-mini

# Django
DJANGO_SECRET_KEY=change-me-in-production-generate-a-secure-key
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-production-domain.com
DJANGO_SECURE_SSL_REDIRECT=true

# CORS (Update with actual frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com

# Encryption
ASTROLOGY_ENCRYPTION_KEY=your-astrology-encryption-key-here

# Database (They should set their own PostgreSQL credentials)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=palmastro_db
DB_USER=postgres
DB_PASSWORD=their_secure_password
DB_HOST=localhost
DB_PORT=5432

# Redis (If using Celery)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Rate Limiting
DRF_THROTTLE_ANON=20/min
DRF_THROTTLE_USER=100/min
DRF_THROTTLE_NUMEROLOGY=10/hour
DRF_THROTTLE_ASTROLOGY=10/hour

# File Upload
DATA_UPLOAD_MAX_MEMORY_SIZE=10485760
FILE_UPLOAD_MAX_MEMORY_SIZE=10485760

# Data Retention
READING_RETENTION_DAYS=30
IMAGE_TTL_HOURS=24
NUMEROLOGY_TTL_DAYS=30
ASTROLOGY_TTL_HOURS=24
```

---

## Deployment Instructions for Team

### Backend Setup:
```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Set environment variables (from above)

# 3. Run migrations
python manage.py migrate

# 4. Collect static files
python manage.py collectstatic --noinput

# 5. Start server
gunicorn palmastro_backend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Setup:
```bash
# Just serve the dist/ folder with any web server
# Examples:

# Nginx:
# Point root to /path/to/dist/

# Apache:
# Point DocumentRoot to /path/to/dist/

# Or use a CDN/hosting service
```

---

## System Requirements

### Backend Server:
- Python 3.11+
- PostgreSQL 14+
- Redis 6+ (for Celery tasks)
- 2GB RAM minimum
- 10GB storage

### Frontend Server:
- Any static file server (Nginx, Apache, CDN)
- 512MB RAM
- 1GB storage

---

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] CORS is configured (frontend can call backend)
- [ ] Database is connected
- [ ] Redis is running (for background tasks)
- [ ] SSL/HTTPS is enabled
- [ ] Environment variables are set
- [ ] Static files are served
- [ ] Media uploads work
- [ ] Test all features work

---

## Support URLs

After deployment, update these in frontend:
- In `src/lib/config.ts`: Set `API_BASE_URL` to backend URL
- Or set environment variable: `VITE_API_URL=https://api.yourdomain.com`
