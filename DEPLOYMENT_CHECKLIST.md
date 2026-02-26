# Vercel Deployment Checklist

## ✅ Pre-Deployment

- [x] Build test passed (`npm run build`)
- [x] `vercel.json` configured
- [x] `.vercelignore` created
- [x] Environment variables documented

## 📋 Deployment Steps

### 1. Deploy Backend First (Required)

Your Django backend must be deployed before the frontend can work. Choose one:

- [ ] **Railway** (Recommended - Easy setup)
  - Go to https://railway.app
  - New Project → Deploy from GitHub
  - Select your repository → `backend` folder
  - Add environment variables from `backend/.env`
  - Deploy

- [ ] **Render** (Free tier available)
  - Go to https://render.com
  - New Web Service
  - Connect GitHub repo
  - Set root directory to `backend`
  - Add environment variables
  - Deploy

- [ ] **Other platform** (Heroku, DigitalOcean, etc.)

### 2. Get Backend URL

After backend deployment, note your backend URL:
- Example: `https://your-app.railway.app` or `https://api.yourdomain.com`

### 3. Update Backend CORS

In your Django `settings.py`, add your Vercel domain:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-app.vercel.app",
    "https://your-custom-domain.com",
]
```

### 4. Deploy Frontend to Vercel

#### Option A: Via Dashboard (Easiest)

1. [ ] Go to https://vercel.com/new
2. [ ] Import your GitHub repository
3. [ ] Configure:
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. [ ] Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-url/api/v1`
   - `VITE_USE_MOCK_API` = `false`
5. [ ] Click "Deploy"

#### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted, or set them in dashboard

# Production deploy
vercel --prod
```

### 5. Set Environment Variables in Vercel

Go to Project Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_BASE_URL` | `https://your-backend-url/api/v1` | ✅ Yes |
| `VITE_USE_MOCK_API` | `false` | ✅ Yes |
| `VITE_ENABLE_ANALYTICS` | `true` or `false` | ❌ No |
| `VITE_ENABLE_PAYMENTS` | `true` or `false` | ❌ No |

### 6. Test Deployment

- [ ] Visit your Vercel URL
- [ ] Test login/signup
- [ ] Test API calls
- [ ] Check browser console for errors
- [ ] Verify CORS is working

### 7. Custom Domain (Optional)

- [ ] Add custom domain in Vercel settings
- [ ] Update DNS records
- [ ] Update backend CORS with new domain
- [ ] Test with custom domain

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (Vercel uses 18+)
- Verify all dependencies in `package.json`
- Check build logs

### API Calls Fail
- Verify `VITE_API_BASE_URL` is correct
- Check backend CORS settings
- Ensure backend is accessible
- Check browser console for errors

### 404 on Routes
- Verify `vercel.json` rewrites are correct
- Check that SPA routing is working

## 📝 Notes

- Backend must be deployed first
- CORS must be configured on backend
- Environment variables must be set in Vercel
- Test thoroughly before going live

## 🚀 Quick Deploy Command

Once backend is ready:

```bash
# Set environment variable
export VITE_API_BASE_URL=https://your-backend-url/api/v1

# Deploy to Vercel
vercel --prod
```
