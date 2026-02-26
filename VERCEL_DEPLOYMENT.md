# Vercel Deployment Guide

This guide will help you deploy the PalmAstro frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your Django backend hosted somewhere (Railway, Render, Heroku, etc.)
3. GitHub repository with your code

## Step 1: Prepare Your Backend

Before deploying the frontend, make sure your Django backend is deployed and accessible. You'll need:

- Backend API URL (e.g., `https://your-backend.railway.app` or `https://api.yourdomain.com`)
- CORS configured on your backend to allow your Vercel domain

### Backend CORS Configuration

In your Django `settings.py`, make sure you have:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
]
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of the project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api/v1`)
   - `VITE_USE_MOCK_API`: `false` (to use real backend)
   - `VITE_ENABLE_ANALYTICS`: `true` or `false` (optional)
   - `VITE_ENABLE_PAYMENTS`: `true` or `false` (optional)

5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked.

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Environment Variables

Set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Your Django backend API URL | `https://your-backend.railway.app/api/v1` |
| `VITE_USE_MOCK_API` | Use mock API (set to `false` for production) | `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics features | `true` |
| `VITE_ENABLE_PAYMENTS` | Enable payment features | `true` |

## Step 4: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update your backend CORS settings to include the new domain

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### API Calls Fail

- Verify `VITE_API_BASE_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from the internet
- Check browser console for CORS errors

### 404 Errors on Routes

- The `vercel.json` includes rewrites to handle SPA routing
- If issues persist, check that the rewrite rule is correct

## Backend Hosting Options

Since Vercel is for frontend, you need to host your Django backend separately:

### Recommended Options:

1. **Railway** (https://railway.app)
   - Easy setup
   - Free tier available
   - Automatic deployments from GitHub

2. **Render** (https://render.com)
   - Free tier available
   - Easy PostgreSQL setup
   - Good for Django apps

3. **Heroku** (https://heroku.com)
   - Paid service
   - Well-documented for Django

4. **DigitalOcean App Platform**
   - Good performance
   - Reasonable pricing

## Next Steps

1. Deploy your Django backend to one of the platforms above
2. Update `VITE_API_BASE_URL` in Vercel with your backend URL
3. Update backend CORS settings
4. Test your deployed application

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure backend is running and accessible
