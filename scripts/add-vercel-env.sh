#!/bin/bash

# Script to add ABACUSAI_API_KEY to Vercel environment variables
# Usage: ./scripts/add-vercel-env.sh

set -e

echo "🔧 Coach Kai Environment Variable Setup"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Vercel CLI Version:"
npx vercel --version
echo ""

# Check if logged in
if ! npx vercel whoami &> /dev/null; then
    echo "🔐 You need to login to Vercel first:"
    echo "    npx vercel login"
    echo ""
    echo "Or use a token:"
    echo "    export VERCEL_TOKEN=your_token_here"
    echo ""
    exit 1
fi

echo "👤 Logged in as:"
npx vercel whoami
echo ""

# Add environment variable
echo "➕ Adding ABACUSAI_API_KEY to production environment..."
echo "19050ea030924f3dbc432d96ecbd0a89" | npx vercel env add ABACUSAI_API_KEY production

echo ""
echo "➕ Adding ABACUSAI_API_KEY to preview environment..."
echo "19050ea030924f3dbc432d96ecbd0a89" | npx vercel env add ABACUSAI_API_KEY preview

echo ""
echo "➕ Adding ABACUSAI_API_KEY to development environment..."
echo "19050ea030924f3dbc432d96ecbd0a89" | npx vercel env add ABACUSAI_API_KEY development

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "📦 Triggering production deployment..."
npx vercel --prod

echo ""
echo "✅ Deployment triggered! Wait for it to complete."
echo ""
echo "🔍 To verify:"
echo "1. Visit https://mindfulchampion.com/train/coach"
echo "2. Send a test message to Coach Kai"
echo "3. Verify you get a proper response (not an error)"
echo ""
