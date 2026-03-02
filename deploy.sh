#!/bin/bash
# Deployment script for theastroverse.live

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Push to GitHub
echo "📤 Step 1: Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
else
    echo "❌ GitHub push failed. Please authenticate and try again."
    echo "   You can push manually with: git push origin main"
    exit 1
fi

echo ""
echo "📦 Step 2: Deploying to Vercel..."
echo ""

# Step 2: Deploy to Vercel
cd "/Users/akashsharma/Desktop/Vas Projects/astrology-new"

# Check if logged in to correct Vercel account
echo "Checking Vercel login..."
vercel whoami

echo ""
echo "Deploying to Vercel..."
echo "Note: Make sure you're logged in to the correct Vercel account (akashzeen-1520s-projects)"
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/akashzeen-1520s-projects"
echo "2. Add custom domain: theastroverse.live"
echo "3. Configure DNS records"
echo "4. Update backend CORS with theastroverse.live"
