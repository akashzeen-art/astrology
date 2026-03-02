# CORS Configuration for Railway

## Required Environment Variables

Add these in Railway → Variables tab to allow requests from **https://www.theastroverse.live**:

### 1. CORS_ALLOWED_ORIGINS

**Variable Name:** `CORS_ALLOWED_ORIGINS`

**Value (copy exactly):**
```
https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
```

**Important:** Include both `theastroverse.live` (without www) and `www.theastroverse.live` (with www)

### 2. CSRF_TRUSTED_ORIGINS

**Variable Name:** `CSRF_TRUSTED_ORIGINS`

**Value (copy exactly):**
```
https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app
```

**Important:** Must match `CORS_ALLOWED_ORIGINS` exactly

## How to Add in Railway

1. Go to Railway → Your Service → **Variables** tab
2. Click **"+ New Variable"**
3. Add each variable:
   - **Name:** `CORS_ALLOWED_ORIGINS`
   - **Value:** `https://theastroverse.live,https://www.theastroverse.live,https://astrology-swart-pi.vercel.app`
   - Click **"Add"**
4. Repeat for `CSRF_TRUSTED_ORIGINS`

## After Adding

1. Railway will automatically redeploy
2. Wait 2-3 minutes
3. Test your frontend: `https://www.theastroverse.live`
4. CORS errors should be resolved

## Verify CORS is Working

### Test with curl:
```bash
curl -H "Origin: https://www.theastroverse.live" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://astrology-production-39aa.up.railway.app/api/v1/palm-reading/analyze/ \
     -v
```

**Expected Response:**
- Status: `200 OK` or `204 No Content`
- Header: `Access-Control-Allow-Origin: https://www.theastroverse.live`
- Header: `Access-Control-Allow-Methods: GET, POST, OPTIONS, ...`

### Test in Browser Console:
1. Open https://www.theastroverse.live
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run:
```javascript
fetch('https://astrology-production-39aa.up.railway.app/api/v1/', {
  method: 'GET',
  headers: { 'Origin': 'https://www.theastroverse.live' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**If CORS is working:** You'll see the API response  
**If CORS is broken:** You'll see "CORS policy" error

## All Required Variables Checklist

Make sure you have ALL 8 variables in Railway:

- [ ] `OPENAI_API_KEY`
- [ ] `DJANGO_SECRET_KEY`
- [ ] `ASTROLOGY_ENCRYPTION_KEY`
- [ ] `DJANGO_DEBUG=false`
- [ ] `DJANGO_ALLOWED_HOSTS=*.railway.app`
- [ ] `CORS_ALLOWED_ORIGINS` ← **Add this**
- [ ] `CSRF_TRUSTED_ORIGINS` ← **Add this**
- [ ] `CELERY_TASK_ALWAYS_EAGER=true`
