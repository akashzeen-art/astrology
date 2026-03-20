# Deployment Guide - TheAstroVerse

## Quick Deploy (Recommended: Vercel + Railway)

### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com
- Railway account (free trial): https://railway.app

---

## Step 1: Push to GitHub

```bash
cd "/Users/akashsharma/Desktop/Numero Vas Product/theastroverse"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## Step 2: Deploy Backend (Railway)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Django
5. Add environment variables:
   - Click on your service → "Variables" tab
   - Add all variables from `backend/.env`:
     ```
     OPENAI_API_KEY=your_key
     DJANGO_SECRET_KEY=your_key
     DJANGO_DEBUG=false
     DJANGO_ALLOWED_HOSTS=your-app.railway.app
     CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
     CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
     ASTROLOGY_ENCRYPTION_KEY=your_key
     ```
6. Add PostgreSQL:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-connects it
7. Set root directory:
   - Settings → "Root Directory" → `backend`
8. Deploy!
9. Note your backend URL: `https://your-app.railway.app`

---

## Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./` (leave as root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-app.railway.app`
6. Deploy!

---

## Step 4: Update Frontend API URL

Update your frontend to use the production backend URL:

In `src/lib/config.ts`, ensure it reads from environment:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Then in Vercel:
- Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend.railway.app`
- Redeploy

---

## Step 5: Update Backend CORS

In Railway, update these environment variables with your Vercel URL:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
DJANGO_ALLOWED_HOSTS=your-backend.railway.app
```

---

## Alternative: AWS Deployment

### Frontend (S3 + CloudFront)
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Backend (Elastic Beanstalk)
```bash
cd backend
eb init -p python-3.11 palmastro-backend
eb create palmastro-env
eb deploy
```

---

## Alternative: Single VPS (DigitalOcean/Linode)

### 1. Create Droplet (Ubuntu 22.04)

### 2. SSH and Setup
```bash
ssh root@your_server_ip

# Install dependencies
apt update && apt upgrade -y
apt install python3-pip python3-venv nginx postgresql redis-server -y

# Setup PostgreSQL
sudo -u postgres createdb palmastro_db
sudo -u postgres createuser palmastro_user

# Clone repo
git clone YOUR_REPO_URL /var/www/theastroverse
cd /var/www/theastroverse

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic

# Frontend build
cd ..
npm install
npm run build

# Setup Nginx
nano /etc/nginx/sites-available/theastroverse
```

### 3. Nginx Config
```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        root /var/www/theastroverse/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Start Services
```bash
# Gunicorn
gunicorn palmastro_backend.wsgi:application --bind 127.0.0.1:8000 --daemon

# Nginx
systemctl restart nginx
```

---

## Cost Comparison

| Option | Monthly Cost | Ease | Scalability |
|--------|-------------|------|-------------|
| Vercel + Railway | $5-10 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| AWS | $20-50 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| VPS | $6-12 | ⭐⭐ | ⭐⭐⭐ |

---

## Post-Deployment Checklist

- [ ] Backend is accessible at your Railway URL
- [ ] Frontend is accessible at your Vercel URL
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Database migrations ran successfully
- [ ] Static files are served
- [ ] SSL/HTTPS is enabled (automatic on Vercel/Railway)
- [ ] Test all features (palm reading, numerology, astrology)

---

## Troubleshooting

**CORS errors**: Update `CORS_ALLOWED_ORIGINS` in backend env vars

**500 errors**: Check Railway logs: `railway logs`

**Build fails**: Check build logs in Vercel/Railway dashboard

**Database connection**: Ensure PostgreSQL is connected in Railway

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/
