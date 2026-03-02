# Fix CORS Error - Quick Guide

## Current Status
- ✅ Backend is responding (getting CORS error, not 502)
- ❌ CORS blocking requests from `https://www.theastroverse.live`

## Fix: Update Railway Environment Variables

### Step 1: Go to Railway Variables Tab
1. In Railway, click on your service "astrology"
2. Click **"Variables"** tab at the top
3. You should see a list of environment variables

### Step 2: Update CORS_ALLOWED_ORIGINS

1. Find `CORS_ALLOWED_ORIGINS` variable
2. Click to edit it
3. Set the value to:
   ```
   https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
   ```
4. Save

### Step 3: Update CSRF_TRUSTED_ORIGINS

1. Find `CSRF_TRUSTED_ORIGINS` variable
2. Click to edit it
3. Set the value to:
   ```
   https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
   ```
4. Save

### Step 4: Wait for Redeploy

After saving, Railway will automatically redeploy. Wait 2-3 minutes.

### Step 5: Test

1. Test backend: `https://astrology-production-39aa.up.railway.app/api/v1/`
2. Test frontend: `https://www.theastroverse.live`
3. Try uploading a palm image - should work now!

## Exact Values to Set

**CORS_ALLOWED_ORIGINS:**
```
https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
```

**CSRF_TRUSTED_ORIGINS:**
```
https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
```

## If Variables Don't Exist

If you don't see these variables:
1. Click **"+ New Variable"**
2. Add `CORS_ALLOWED_ORIGINS` with the value above
3. Add `CSRF_TRUSTED_ORIGINS` with the value above

## After Fix

Once CORS is updated and Railway redeploys:
- ✅ Frontend can connect to backend
- ✅ Palm reading uploads will work
- ✅ All API calls will work
