# Fix 502 Error - Application Failed to Respond

## Current Issue
- ✅ Deployment completed
- ✅ Migrations ran successfully
- ❌ Application crashing (502 error)

## Step 1: Check Deploy Logs

In Railway:
1. Go to **Deployments** tab
2. Click on the latest deployment (65dd88f4 or newer)
3. Click **"Deploy Logs"** (not Build Logs)
4. Scroll to the bottom to see the latest errors
5. Look for:
   - `ImproperlyConfigured` = Missing environment variable
   - `ModuleNotFoundError` = Missing Python package
   - `OperationalError` = Database issue
   - `ImportError` = Python import issue
   - Any red error messages

## Step 2: Common Causes & Fixes

### Fix 1: Missing Environment Variables

**Check if these are set in Railway Variables tab:**

1. `OPENAI_API_KEY` - Required!
2. `DJANGO_SECRET_KEY` - Required!
3. `ASTROLOGY_ENCRYPTION_KEY` - Required!
4. `DJANGO_DEBUG=false`
5. `DJANGO_ALLOWED_HOSTS=*.railway.app`
6. `CORS_ALLOWED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live`
7. `CSRF_TRUSTED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live`
8. `CELERY_TASK_ALWAYS_EAGER=true`

**If any are missing, add them and Railway will auto-redeploy.**

### Fix 2: Port Configuration

The Dockerfile uses `$PORT` but Railway might be using a different port.

**Check Deploy Logs for:**
- What port is Railway assigning?
- Is the server starting on the correct port?

**If needed, update Dockerfile CMD to:**
```dockerfile
CMD ["gunicorn", "palmastro_backend.wsgi:application", "--bind", "0.0.0.0:${PORT:-8080}"]
```

### Fix 3: Server Not Starting

Check if gunicorn is installed. Add to `requirements.txt`:
```
gunicorn>=21.2.0
```

### Fix 4: Database Connection

If using PostgreSQL:
- Make sure PostgreSQL service is added
- Check `DATABASE_URL` is set (Railway auto-provides this)
- Or set individual DB variables

## Step 3: Quick Debug Steps

1. **Check Variables Tab:**
   - Count how many variables you have
   - Should have at least 8 variables

2. **Check Deploy Logs:**
   - Look for the last error message
   - Copy the full error

3. **Try Manual Start:**
   - In Railway, go to service → "..." menu
   - Select "Open Shell"
   - Try: `python manage.py runserver 0.0.0.0:$PORT`
   - See what error appears

## Step 4: Most Likely Fix

**90% of 502 errors are due to missing environment variables.**

1. Go to Railway → **Variables** tab
2. Make sure you have ALL 8 variables listed above
3. Railway will auto-redeploy
4. Check Deploy Logs again
5. Test: `https://astrology-production-39aa.up.railway.app/api/v1/`

## What to Share

When checking logs, look for:
- The last error message before the crash
- Any `ImproperlyConfigured` errors
- Any `ModuleNotFoundError` errors
- Port binding errors

Share the error message and I can help fix it!
