# Backend 502 Error - Fix Checklist

## Current Status
- ✅ Frontend: Deployed on Vercel and working
- ❌ Backend: 502 error on Railway
- ❌ Frontend can't connect to backend

## Backend URL
`https://astrology-production-39aa.up.railway.app`

## Fix Steps

### Step 1: Check Railway Deploy Logs

1. Go to Railway → Deployments tab
2. Click on the latest deployment
3. Click **"Deploy Logs"** (scroll to bottom)
4. Look for errors:
   - `ImproperlyConfigured` = Missing environment variable
   - `ModuleNotFoundError` = Missing package
   - `gunicorn: command not found` = gunicorn not installed
   - Port binding errors
   - Any red error messages

### Step 2: Verify Environment Variables

Go to Railway → **Variables** tab and check you have ALL 8:

1. ✅ `OPENAI_API_KEY` = (your key)
2. ✅ `DJANGO_SECRET_KEY` = (your key)
3. ✅ `ASTROLOGY_ENCRYPTION_KEY` = (your key)
4. ✅ `DJANGO_DEBUG` = `false`
5. ✅ `DJANGO_ALLOWED_HOSTS` = `*.railway.app`
6. ✅ `CORS_ALLOWED_ORIGINS` = `https://theastroverse.live,https://www.theastroverse.live`
7. ✅ `CSRF_TRUSTED_ORIGINS` = `https://theastroverse.live,https://www.theastroverse.live`
8. ✅ `CELERY_TASK_ALWAYS_EAGER` = `true`

**Count them - should be 8 variables minimum!**

### Step 3: Verify gunicorn Fix Was Deployed

1. Check if latest deployment includes gunicorn fix
2. Look in Build Logs for: `Installing gunicorn`
3. If not, push the requirements.txt change again

### Step 4: Check Server Start Command

In Railway Settings → Deploy:
- Should use: `gunicorn palmastro_backend.wsgi:application --bind 0.0.0.0:$PORT`
- Or from railway.json: `python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT`

### Step 5: Manual Test

In Railway:
1. Go to service → "..." menu
2. Select "Open Shell"
3. Try: `python manage.py runserver 0.0.0.0:8080`
4. See what error appears

## Most Common Issues

### Issue 1: Missing Environment Variables
**Fix:** Add all 8 variables in Railway Variables tab

### Issue 2: gunicorn Not Installed
**Fix:** Make sure requirements.txt with gunicorn was pushed and deployed

### Issue 3: Server Not Starting
**Fix:** Check Deploy Logs for startup errors

### Issue 4: Port Mismatch
**Fix:** Verify Railway is using port 8080 and server binds to $PORT

## Quick Fix Priority

1. **Check Deploy Logs** - See actual error
2. **Count Variables** - Should have 8+
3. **Verify gunicorn** - Check if installed in build
4. **Test manually** - Use Railway shell

## After Backend Works

Once backend responds:
1. Test: `https://astrology-production-39aa.up.railway.app/api/v1/`
2. Update Vercel: Make sure `VITE_API_BASE_URL` is set correctly
3. Test frontend connection

## What Error Do You See?

Check Railway Deploy Logs and share:
- Last error message
- Any `ImproperlyConfigured` errors
- Any `ModuleNotFoundError` errors
- Server startup messages
