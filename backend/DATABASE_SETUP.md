# Database Configuration Guide

## Current Database Setup

### Development (Current)
**Database:** SQLite3
**Location:** `backend/db.sqlite3`
**Cost:** ₹0 (Free, included with Python)

**Pros:**
- ✅ No setup required
- ✅ Perfect for local development
- ✅ Zero cost
- ✅ File-based, easy to backup

**Cons:**
- ❌ Not suitable for production
- ❌ Limited concurrent connections
- ❌ No advanced features
- ❌ Single file can get corrupted

---

## Production Database Options

### Option 1: PostgreSQL (Recommended) ⭐

**Why PostgreSQL?**
- ✅ Most popular for Django production
- ✅ Excellent performance
- ✅ Advanced features (JSON fields, full-text search)
- ✅ Free open-source
- ✅ Great for your JSON data (readings, numerology, astrology results)

**Hosting Options:**

#### A. DigitalOcean Managed PostgreSQL
- **Cost:** ₹1,200/month (1GB RAM, 10GB storage)
- **Setup:** Easy, managed service
- **Scaling:** Easy to upgrade
- **Backup:** Automatic daily backups

#### B. AWS RDS PostgreSQL
- **Cost:** ₹1,500/month (db.t3.micro)
- **Setup:** More complex
- **Features:** More advanced options
- **Backup:** Automated backups

#### C. Railway PostgreSQL
- **Cost:** ₹800/month (starter plan)
- **Setup:** Very easy
- **Scaling:** Automatic
- **Backup:** Included

#### D. Supabase (PostgreSQL + Extras)
- **Cost:** ₹0/month (free tier) or ₹1,500/month (pro)
- **Setup:** Very easy
- **Extras:** Built-in auth, real-time, storage
- **Best for:** Startups and MVPs

**Recommended:** DigitalOcean or Supabase (free tier to start)

---

### Option 2: MySQL/MariaDB

**Why MySQL?**
- ✅ Good performance
- ✅ Widely used
- ✅ Free open-source

**Hosting:**
- DigitalOcean: ₹1,200/month
- AWS RDS: ₹1,500/month

**Note:** PostgreSQL is generally better for Django projects with JSON data.

---

### Option 3: SQLite (NOT for Production)

**Only use for:**
- Local development ✅
- Testing ✅
- Very small personal projects ✅

**Don't use for:**
- Production websites ❌
- Multiple users ❌
- High traffic ❌

---

## Migration Guide: SQLite → PostgreSQL

### Step 1: Install PostgreSQL Locally (Optional, for testing)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Or use Docker:**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
```

### Step 2: Update settings.py

Replace the DATABASES section in `backend/palmastro_backend/settings.py`:

```python
# For Production (PostgreSQL)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "palmastro_db"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# For Development (SQLite) - Keep this for local
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }
```

### Step 3: Update .env file

Add to `backend/.env`:
```env
# Database Configuration
DB_NAME=palmastro_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost  # or your database host
DB_PORT=5432
```

### Step 4: Install PostgreSQL adapter

```bash
pip install psycopg2-binary
```

Add to `requirements.txt`:
```
psycopg2-binary>=2.9.0
```

### Step 5: Migrate data

```bash
# Create new database
python manage.py migrate

# If you have existing SQLite data, export and import:
python manage.py dumpdata > data.json
# Then import to PostgreSQL:
python manage.py loaddata data.json
```

---

## Recommended Setup by Stage

### Development (Current)
- **Database:** SQLite3
- **Cost:** ₹0
- **File:** `backend/db.sqlite3`

### MVP/Testing
- **Database:** Supabase (Free tier)
- **Cost:** ₹0/month
- **Storage:** 500MB (enough for testing)
- **Setup:** 5 minutes

### Production (Small Scale)
- **Database:** DigitalOcean Managed PostgreSQL
- **Cost:** ₹1,200/month
- **Storage:** 10GB
- **Backup:** Automatic daily

### Production (Large Scale)
- **Database:** AWS RDS PostgreSQL
- **Cost:** ₹2,500-5,000/month
- **Storage:** 100GB+
- **Features:** Multi-AZ, read replicas

---

## Database Size Estimates

### Current Data Models:
- **Reading:** ~5-10KB per reading (with JSON result)
- **NumerologyRequest:** ~2-5KB per request
- **AstrologySession:** ~3-7KB per session
- **EventLog:** ~1KB per event

### Storage Calculation:
- 1,000 palm readings: ~5-10MB
- 1,000 numerology requests: ~2-5MB
- 1,000 astrology sessions: ~3-7MB
- **Total for 1,000 users:** ~10-22MB

### Projected Growth:
- **10,000 users/month:** ~100-220MB
- **100,000 users/month:** ~1-2.2GB
- **1,000,000 users/month:** ~10-22GB

**Recommendation:** Start with 10GB storage (₹1,200/month), scale up as needed.

---

## Quick Setup: Supabase (Free Tier)

### Step 1: Create Account
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project

### Step 2: Get Connection String
Supabase will provide:
- Database URL
- Password
- Host, Port, Database name

### Step 3: Update settings.py
```python
import os
from urllib.parse import urlparse

# Supabase PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Parse Supabase connection string
    url = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": url.path[1:],  # Remove leading /
            "USER": url.username,
            "PASSWORD": url.password,
            "HOST": url.hostname,
            "PORT": url.port or 5432,
        }
    }
else:
    # Fallback to SQLite for local dev
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
```

### Step 4: Update .env
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Step 5: Install and Migrate
```bash
pip install psycopg2-binary
python manage.py migrate
```

**Cost:** ₹0/month (free tier)
**Storage:** 500MB (enough for ~25,000 readings)
**Upgrade:** ₹1,500/month for 8GB storage

---

## Current Status

✅ **Currently Using:** SQLite3 (Development)
📝 **File Location:** `backend/db.sqlite3`
💰 **Cost:** ₹0
⚠️ **Action Needed:** Switch to PostgreSQL for production

---

## Recommendation

**For Now (Development):**
- Keep SQLite3 ✅
- No changes needed

**For Production:**
1. **Start with Supabase Free Tier** (₹0/month)
   - Easy setup
   - 500MB storage (enough for MVP)
   - Upgrade when needed

2. **Scale to DigitalOcean** (₹1,200/month)
   - When you need more storage
   - Better performance
   - More control

**Migration Timeline:**
- Week 1-2: Keep SQLite, develop features
- Week 3: Setup Supabase (free tier)
- Week 4: Test migration
- Launch: Use Supabase or DigitalOcean

---

*Last Updated: November 2024*

