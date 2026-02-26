# Backend CORS Configuration for theastroverse.live

## Update Required

After deploying to Vercel with custom domain `theastroverse.live`, update your Django backend CORS settings.

## File to Update

`backend/palmastro_backend/settings.py`

## CORS Configuration

Find the `CORS_ALLOWED_ORIGINS` section and update it to:

```python
CORS_ALLOWED_ORIGINS = [
    "https://theastroverse.live",
    "https://www.theastroverse.live",
    "https://astrology-new.vercel.app",  # Vercel default domain (replace with your actual Vercel domain)
]

CSRF_TRUSTED_ORIGINS = [
    "https://theastroverse.live",
    "https://www.theastroverse.live",
    "https://astrology-new.vercel.app",  # Vercel default domain
]
```

## When to Update

1. After deploying frontend to Vercel
2. After adding custom domain `theastroverse.live`
3. Before testing the production site

## Important Notes

- Replace `astrology-new.vercel.app` with your actual Vercel project domain
- Make sure to include both `theastroverse.live` and `www.theastroverse.live`
- Commit and push these changes after updating
- Restart your backend server after making changes
