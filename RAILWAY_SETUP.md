# Railway Setup Guide - proud-emotion Project

## Current Status
You have a Railway project: **proud-emotion** (Production)

## Next Steps to Deploy Your Backend

### Step 1: Connect Your GitHub Repository
1. In Railway dashboard, click on your service (or "New" if no service exists)
2. Click "Deploy from GitHub repo"
3. Select: `akashzeen-art/astrology`
4. Railway will start deploying

### Step 2: Configure Root Directory
1. Click on your service
2. Go to **Settings** tab
3. Scroll to **Root Directory**
4. Set it to: `backend`
5. Save changes

### Step 3: Configure Start Command
1. Still in **Settings** tab
2. Scroll to **Deploy** section
3. Add **Start Command**:
   ```
   python manage.py runserver 0.0.0.0:$PORT
   ```
   Or for production (better):
   ```
   gunicorn palmastro_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

### Step 4: Add Environment Variables
1. Go to **Variables** tab
2. Click **+ New Variable**
3. Add these variables one by one:

**Required Variables:**
```
OPENAI_API_KEY=your-openai-key-from-backend/.env
DJANGO_SECRET_KEY=your-secret-key-from-backend/.env
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=*.railway.app,your-service-name.railway.app
CORS_ALLOWED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live
CSRF_TRUSTED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live
CELERY_TASK_ALWAYS_EAGER=true
ASTROLOGY_ENCRYPTION_KEY=your-encryption-key-from-backend/.env
```

**To get these values:**
- Open your local `backend/.env` file
- Copy each value and paste into Railway

### Step 5: Add PostgreSQL Database (Optional but Recommended)
1. In Railway dashboard, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway will auto-create database
4. Go back to your service → **Variables** tab
5. You'll see database variables auto-added:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### Step 6: Get Your Backend URL
1. Go to **Settings** tab
2. Scroll to **Networking** section
3. Click **Generate Domain** (if not already generated)
4. Your backend URL will be: `https://your-service-name.railway.app`
5. **Copy this URL** - you'll need it for Vercel!

### Step 7: Run Migrations
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Or use Railway CLI:
   ```bash
   railway run python manage.py migrate
   ```

### Step 8: Test Your Backend
Visit: `https://your-service-name.railway.app/api/v1/`
You should see the API root response.

## For Vercel Deployment

Once you have your Railway backend URL (e.g., `https://proud-emotion-production.railway.app`):

**Add to Vercel Environment Variables:**
```
VITE_API_BASE_URL = https://proud-emotion-production.railway.app/api/v1
VITE_USE_MOCK_API = false
```

## Troubleshooting

### Service Not Deploying?
- Check **Logs** tab for errors
- Verify root directory is set to `backend`
- Check start command is correct

### Database Issues?
- Make sure PostgreSQL service is added
- Check database variables are in your service variables
- Run migrations: `railway run python manage.py migrate`

### CORS Errors?
- Make sure `CORS_ALLOWED_ORIGINS` includes your Vercel domain
- Format: `https://theastroverse.live,https://www.theastroverse.live`

## Quick Checklist

- [ ] Service deployed from GitHub
- [ ] Root directory set to `backend`
- [ ] Start command configured
- [ ] Environment variables added
- [ ] Database added (optional)
- [ ] Domain generated
- [ ] Migrations run
- [ ] Backend URL copied for Vercel
