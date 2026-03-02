# Quick Deploy Instructions

## Step 1: Push to GitHub

You need to authenticate first. Choose one method:

### Option A: Use GitHub Desktop
1. Open GitHub Desktop
2. You should see the commits ready to push
3. Click "Push origin"

### Option B: Use Terminal with Personal Access Token
```bash
cd "/Users/akashsharma/Desktop/Vas Projects/astrology-new"
git push origin main
# When prompted:
# Username: akashzeen-art
# Password: [paste your GitHub Personal Access Token with 'repo' scope]
```

### Option C: Use SSH (if configured)
```bash
git remote set-url origin git@github.com:akashzeen-art/astrology.git
git push origin main
```

## Step 2: Deploy to Vercel

After pushing to GitHub, deploy via Vercel Dashboard:

1. Go to: https://vercel.com/akashzeen-1520s-projects
2. Click "Add New..." → "Project"
3. Import: `akashzeen-art/astrology`
4. Configure:
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-url/api/v1`
   - `VITE_USE_MOCK_API` = `false`
6. Click "Deploy"
7. After deployment, go to Settings → Domains
8. Add domain: `theastroverse.live`
9. Configure DNS at your domain registrar

## Or Deploy via CLI

If you want to use CLI (make sure you're logged into correct account):

```bash
cd "/Users/akashsharma/Desktop/Vas Projects/astrology-new"

# Login to correct Vercel account
vercel login

# Deploy
vercel --prod
```

