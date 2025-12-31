#!/bin/bash

# Mindful Champion - Vercel Deployment Script
# This script helps you deploy to Vercel via CLI

set -e

echo "🚀 Mindful Champion - Vercel Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the nextjs_space directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "🔨 Testing build locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "Now you can deploy to Vercel:"
echo ""
echo "Option 1: Deploy via CLI"
echo "  npx vercel --prod"
echo ""
echo "Option 2: Deploy via Dashboard"
echo "  1. Push your code to GitHub"
echo "  2. Go to https://vercel.com/new"
echo "  3. Import your repository"
echo "  4. Set root directory to: nextjs_space"
echo "  5. Add environment variables from .env.production.example"
echo ""
echo "⚠️  Don't forget to:"
echo "  - Set NEXTAUTH_URL to https://mindfulchampion.com"
echo "  - Add all environment variables in Vercel dashboard"
echo "  - Configure custom domain DNS records"
echo ""
echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
