# Railway Environment Variables to Add

Go to Railway → Variables tab → Click "+ New Variable" for each:

## Required Variables:

1. **OPENAI_API_KEY**
   - Value: (Copy from your `backend/.env` file)
   - Get it: `cat backend/.env | grep OPENAI_API_KEY`

2. **DJANGO_SECRET_KEY**
   - Value: (Copy from your `backend/.env` file)
   - Get it: `cat backend/.env | grep DJANGO_SECRET_KEY`

3. **ASTROLOGY_ENCRYPTION_KEY**
   - Value: (Copy from your `backend/.env` file)
   - Get it: `cat backend/.env | grep ASTROLOGY_ENCRYPTION_KEY`

4. **DJANGO_DEBUG**
   - Value: `false`

5. **DJANGO_ALLOWED_HOSTS**
   - Value: `*.railway.app`

6. **CORS_ALLOWED_ORIGINS**
   - Value: `https://theastroverse.live,https://www.theastroverse.live`

7. **CSRF_TRUSTED_ORIGINS**
   - Value: `https://theastroverse.live,https://www.theastroverse.live`

8. **CELERY_TASK_ALWAYS_EAGER**
   - Value: `true`

## Quick Copy Commands:

To get your values, run:
```bash
cd "/Users/akashsharma/Desktop/Vas Projects/astrology-new/backend"
cat .env
```

Then copy each value to Railway.
