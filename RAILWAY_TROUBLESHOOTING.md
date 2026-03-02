# Railway 500 Error - Troubleshooting Guide

## Current Status
- ✅ Deployment is active
- ✅ Server is running
- ❌ Getting 500 error

## Step 1: Check Full Error Logs

In Railway:
1. Go to **Deployments** tab
2. Click on the active deployment
3. Click **Deploy Logs** (not Build Logs)
4. Scroll to see the actual Django error

Look for:
- `ModuleNotFoundError` - Missing dependency
- `ImproperlyConfigured` - Missing environment variable
- `OperationalError` - Database issue
- `ImportError` - Python import issue

## Step 2: Verify Environment Variables

Go to **Variables** tab and make sure these are set:

**Required:**
- `OPENAI_API_KEY` ✅
- `DJANGO_SECRET_KEY` ✅
- `DJANGO_DEBUG=false` ✅
- `DJANGO_ALLOWED_HOSTS=*.railway.app` ✅
- `CORS_ALLOWED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live` ✅
- `CSRF_TRUSTED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live` ✅
- `CELERY_TASK_ALWAYS_EAGER=true` ✅
- `ASTROLOGY_ENCRYPTION_KEY` ✅

## Step 3: Run Migrations

The 500 error might be because migrations haven't run. In Railway:

1. Go to **Deployments** tab
2. Click on your service
3. Click the **"..."** menu (three dots)
4. Select **"Open Shell"** or **"Run Command"**
5. Run:
   ```bash
   python manage.py migrate
   ```

Or add a pre-deploy step in Settings → Deploy → Add pre-deploy step:
```bash
python manage.py migrate
```

## Step 4: Check if Gunicorn is Needed

For production, you might need gunicorn. Add it to requirements.txt:

```txt
gunicorn>=21.2.0
```

Then update the start command in `backend/railway.json`:
```json
"startCommand": "gunicorn palmastro_backend.wsgi:application --bind 0.0.0.0:$PORT"
```

## Step 5: Check Database

If using PostgreSQL:
1. Make sure PostgreSQL service is added
2. Check that database variables are set:
   - `DATABASE_URL` (auto-provided by Railway)
   - Or individual: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

## Step 6: Common Fixes

### Fix 1: Add Missing Static Files
Add to `backend/railway.json`:
```json
"build": {
  "builder": "NIXPACKS"
},
"deploy": {
  "startCommand": "python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:$PORT",
  ...
}
```

### Fix 2: Check Python Version
Railway should auto-detect, but you can specify in `runtime.txt`:
```
python-3.9.6
```

### Fix 3: Add Build Command
In Railway Settings → Build:
- Build Command: `pip install -r requirements.txt`

## Quick Checklist

- [ ] Check Deploy Logs for actual error
- [ ] Verify all environment variables are set
- [ ] Run migrations: `python manage.py migrate`
- [ ] Check if database is connected
- [ ] Verify Python dependencies are installed
- [ ] Check ALLOWED_HOSTS includes Railway domain

## Get Your Backend URL

Even with 500 error, you can get your URL:
1. Go to **Settings** → **Networking**
2. Click **Generate Domain** (if not already generated)
3. Your URL: `https://astrology-production-xxxx.up.railway.app`

Test it: `https://your-url.railway.app/api/v1/`

## Next Steps

1. Check the Deploy Logs to see the exact error
2. Fix the issue based on the error
3. Redeploy if needed
4. Once working, use the URL in Vercel
