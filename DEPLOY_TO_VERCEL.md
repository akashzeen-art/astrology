# Deploy to Vercel - theastroverse.live

## Your Deployment Details

- **Vercel Account**: akashzeen-1520s-projects
- **Custom Domain**: theastroverse.live
- **Repository**: https://github.com/akashzeen-art/astrology

## Step-by-Step Deployment

### Step 1: Deploy Backend First (Required)

Your Django backend must be deployed before the frontend. Recommended platforms:

#### Option A: Railway (Recommended)
1. Go to https://railway.app
2. Sign up/login
3. New Project → Deploy from GitHub
4. Select repository: `akashzeen-art/astrology`
5. Set root directory to: `backend`
6. Add environment variables from `backend/.env`
7. Deploy and note your backend URL (e.g., `https://your-app.railway.app`)

#### Option B: Render
1. Go to https://render.com
2. New Web Service
3. Connect GitHub: `akashzeen-art/astrology`
4. Root Directory: `backend`
5. Add environment variables
6. Deploy

### Step 2: Update Backend CORS

Once you have your backend URL, update `backend/palmastro_backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://theastroverse.live",
    "https://www.theastroverse.live",
    "https://astrology-new.vercel.app",  # Vercel default domain
]

CSRF_TRUSTED_ORIGINS = [
    "https://theastroverse.live",
    "https://www.theastroverse.live",
    "https://astrology-new.vercel.app",
]
```

Then commit and push the changes to GitHub.

### Step 3: Deploy Frontend to Vercel

#### Via Vercel Dashboard:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/akashzeen-1520s-projects
   - Or: https://vercel.com/new

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository
   - Select: `akashzeen-art/astrology`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_BASE_URL` | `https://your-backend-url/api/v1` | Production, Preview, Development |
   | `VITE_USE_MOCK_API` | `false` | Production, Preview, Development |
   | `VITE_ENABLE_ANALYTICS` | `true` | Production, Preview, Development |
   | `VITE_ENABLE_PAYMENTS` | `true` | Production, Preview, Development |

   **Important**: Replace `your-backend-url` with your actual backend URL from Step 1.

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at: `https://astrology-new.vercel.app` (or similar)

### Step 4: Add Custom Domain

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"

2. **Add Domain**
   - Enter: `theastroverse.live`
   - Click "Add"
   - Also add: `www.theastroverse.live` (optional but recommended)

3. **Configure DNS**
   Vercel will show you DNS records to add. You need to add these to your domain registrar:

   **For theastroverse.live:**
   - Type: `A` or `CNAME`
   - Name: `@` or leave blank
   - Value: Vercel will provide (usually `76.76.21.21` for A record, or CNAME to `cname.vercel-dns.com`)

   **For www.theastroverse.live:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. **Wait for DNS Propagation**
   - DNS changes can take 24-48 hours, but usually work within minutes
   - Vercel will show "Valid Configuration" when DNS is correct

5. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Your site will be available at `https://theastroverse.live`

### Step 5: Update Backend CORS (Again)

After adding the custom domain, make sure your backend CORS includes it:

```python
CORS_ALLOWED_ORIGINS = [
    "https://theastroverse.live",
    "https://www.theastroverse.live",
    "https://astrology-new.vercel.app",  # Vercel default
]
```

### Step 6: Test Your Deployment

1. Visit: https://theastroverse.live
2. Test login/signup
3. Test API calls
4. Check browser console for errors
5. Verify all features work

## Environment Variables Summary

Make sure these are set in Vercel:

```bash
VITE_API_BASE_URL=https://your-backend-url/api/v1
VITE_USE_MOCK_API=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENTS=true
```

## Troubleshooting

### Domain Not Working
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Verify domain is added in Vercel dashboard
- Check SSL certificate status in Vercel

### API Calls Fail
- Verify `VITE_API_BASE_URL` is correct
- Check backend CORS includes `https://theastroverse.live`
- Ensure backend is running and accessible
- Check browser console for CORS errors

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible

## Quick Reference

- **Frontend URL**: https://theastroverse.live
- **Vercel Dashboard**: https://vercel.com/akashzeen-1520s-projects
- **GitHub Repo**: https://github.com/akashzeen-art/astrology
- **Backend URL**: (Set after deploying backend)

## Next Steps After Deployment

1. ✅ Deploy backend to Railway/Render
2. ✅ Update backend CORS with your domain
3. ✅ Deploy frontend to Vercel
4. ✅ Add custom domain `theastroverse.live`
5. ✅ Test all features
6. ✅ Monitor for any errors

Your site will be live at **https://theastroverse.live**! 🚀
