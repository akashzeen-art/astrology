#!/bin/bash

# Deployment Package Creator
# Run this script to create deployment packages

echo "🚀 Creating Deployment Packages..."

# Create deployment directory
mkdir -p deployment_package
cd deployment_package

echo "📦 Step 1: Building Frontend..."
cd ..
npm install
npm run build

echo "📦 Step 2: Copying Frontend (dist folder)..."
cp -r dist deployment_package/frontend_dist

echo "📦 Step 3: Copying Backend files..."
mkdir -p deployment_package/backend

# Copy backend folders
cp -r backend/accounts deployment_package/backend/
cp -r backend/analytics deployment_package/backend/
cp -r backend/astrology deployment_package/backend/
cp -r backend/numerology deployment_package/backend/
cp -r backend/palmastro_backend deployment_package/backend/
cp -r backend/readings deployment_package/backend/

# Copy backend files
cp backend/manage.py deployment_package/backend/
cp backend/requirements.txt deployment_package/backend/
cp backend/Procfile deployment_package/backend/
cp backend/runtime.txt deployment_package/backend/
cp backend/env.template deployment_package/backend/

# Copy documentation
cp DEPLOYMENT_PACKAGE.md deployment_package/
cp DEPLOYMENT_GUIDE.md deployment_package/

echo "📦 Step 4: Cleaning up unnecessary files..."
find deployment_package/backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
find deployment_package/backend -name "*.pyc" -delete 2>/dev/null
find deployment_package/backend -name ".DS_Store" -delete 2>/dev/null

echo "📦 Step 5: Creating environment variables file..."
cat > deployment_package/ENVIRONMENT_VARIABLES.txt << 'EOF'
⚠️  IMPORTANT: Set these environment variables on your production server

Copy the values from backend/.env file and update:
- DJANGO_DEBUG=false
- DJANGO_ALLOWED_HOSTS=your-production-domain.com
- CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
- CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com
- DJANGO_SECURE_SSL_REDIRECT=true
- Database credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)

See DEPLOYMENT_PACKAGE.md for complete list.
EOF

echo "✅ Done! Deployment package created in: deployment_package/"
echo ""
echo "📁 Package Contents:"
echo "   - frontend_dist/          (Serve this with Nginx/Apache/CDN)"
echo "   - backend/                (Deploy this with Python/Django)"
echo "   - DEPLOYMENT_PACKAGE.md   (Instructions for deployment team)"
echo "   - DEPLOYMENT_GUIDE.md     (Detailed deployment guide)"
echo "   - ENVIRONMENT_VARIABLES.txt (Environment variables to set)"
echo ""
echo "🎯 Next Steps:"
echo "   1. Zip the deployment_package folder"
echo "   2. Share with deployment team"
echo "   3. Share environment variables separately (SECURE)"
echo ""
echo "💡 To create a zip file:"
echo "   zip -r deployment_package.zip deployment_package/"
