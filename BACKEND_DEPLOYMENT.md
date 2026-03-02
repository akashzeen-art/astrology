# Deploy Django Backend to Get Your Backend URL

## Quick Deploy on Railway (Easiest - Recommended)

### Step 1: Sign Up/Login to Railway
1. Go to https://railway.app
2. Sign up with GitHub (free tier available)
3. Click "New Project"

### Step 2: Deploy from GitHub
1. Select "Deploy from GitHub repo"
2. Choose repository: `akashzeen-art/astrology`
3. Railway will detect it's a Python project

### Step 3: Configure the Service
1. **Set Root Directory**: Click on the service → Settings → Root Directory → Set to `backend`
2. **Add Start Command**: 
   - Go to Settings → Deploy
   - Add start command: `python manage.py runserver 0.0.0.0:$PORT`
   - Or use: `gunicorn palmastro_backend.wsgi:application --bind 0.0.0.0:$PORT`

### Step 4: Add Environment Variables
Go to Variables tab and add all variables from your `backend/.env`:

**Required Variables:**
```
OPENAI_API_KEY=your-openai-key-here
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-app.railway.app,*.railway.app
CORS_ALLOWED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live
CSRF_TRUSTED_ORIGINS=https://theastroverse.live,https://www.theastroverse.live
CELERY_TASK_ALWAYS_EAGER=true
ASTROLOGY_ENCRYPTION_KEY=your-encryption-key
```

**Database (Optional - Railway provides PostgreSQL):**
- Railway will auto-create a PostgreSQL database
- Add these variables:
```
DB_NAME=(auto-provided by Railway)
DB_USER=(auto-provided by Railway)
DB_PASSWORD=(auto-provided by Railway)
DB_HOST=(auto-provided by Railway)
DB_PORT=(auto-provided by Railway)
```

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete
3. Click on the service → Settings → Networking
4. Generate a domain (or use the default)
5. **Your backend URL will be**: `https://your-app-name.railway.app`

### Step 6: Run Migrations
1. Go to your service → Deployments
2. Click on the latest deployment → View Logs
3. Or use Railway CLI to run:
   ```bash
   railway run python manage.py migrate
   ```

### Step 7: Get Your Backend URL
After deployment, your backend URL will be:
- **Format**: `https://your-app-name.railway.app`
- **API Base URL for Vercel**: `https://your-app-name.railway.app/api/v1`

## Alternative: Deploy on Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub: `akashzeen-art/astrology`
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn palmastro_backend.wsgi:application`
5. Add environment variables
6. Deploy
7. Your URL: `https://your-app.onrender.com`

## After Getting Backend URL

Once you have your backend URL (e.g., `https://astrology-backend.railway.app`):

1. **Update Vercel Environment Variable**:
   ```
   VITE_API_BASE_URL = https://astrology-backend.railway.app/api/v1
   VITE_USE_MOCK_API = false
   ```

2. **Update Backend CORS** (in Railway/Render environment variables):
   ```
   CORS_ALLOWED_ORIGINS = https://theastroverse.live,https://www.theastroverse.live,https://astrology.vercel.app
   ```

## Quick Reference

- **Railway**: https://railway.app (Free tier, easy setup)
- **Render**: https://render.com (Free tier available)
- **Backend URL Format**: `https://your-app-name.railway.app`
- **API Base URL**: `https://your-app-name.railway.app/api/v1`
