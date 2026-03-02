# Vercel Configuration - Ready to Deploy!

## Your Backend URL
**Backend API:** `https://astrology-production-39aa.up.railway.app`

## Vercel Environment Variables

When deploying to Vercel, add these environment variables:

### Required Variables:

1. **VITE_API_BASE_URL**
   - Value: `https://astrology-production-39aa.up.railway.app/api/v1`
   - Environment: Production, Preview, Development

2. **VITE_USE_MOCK_API**
   - Value: `false`
   - Environment: Production, Preview, Development

3. **VITE_ENABLE_ANALYTICS** (Optional)
   - Value: `true`
   - Environment: Production, Preview, Development

4. **VITE_ENABLE_PAYMENTS** (Optional)
   - Value: `true`
   - Environment: Production, Preview, Development

## Deploy to Vercel

1. Go to: https://vercel.com/akashzeen-1520s-projects
2. Click "Add New..." → "Project"
3. Import: `akashzeen-art/astrology`
4. Configure:
   - Framework: Vite (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variables** (see above)
6. Click "Deploy"
7. After deployment, add custom domain: `theastroverse.live`

## Update Backend CORS

After getting your Vercel domain, update Railway Variables:

**Add to Railway Variables:**
- `CORS_ALLOWED_ORIGINS` = `https://theastroverse.live,https://www.theastroverse.live,https://astrology.vercel.app`
- `CSRF_TRUSTED_ORIGINS` = `https://theastroverse.live,https://www.theastroverse.live,https://astrology.vercel.app`

(Replace `astrology.vercel.app` with your actual Vercel domain)

## Test Your Setup

1. **Backend:** https://astrology-production-39aa.up.railway.app/api/v1/
2. **Frontend:** https://your-vercel-app.vercel.app (after deployment)
3. **Custom Domain:** https://theastroverse.live (after adding domain)

## Quick Checklist

- [x] Backend deployed: `astrology-production-39aa.up.railway.app`
- [ ] Backend environment variables set
- [ ] Deploy frontend to Vercel
- [ ] Add Vercel environment variables
- [ ] Add custom domain `theastroverse.live`
- [ ] Update backend CORS with Vercel domain
- [ ] Test full stack
