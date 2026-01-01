#!/bin/bash

# Script to verify Coach Kai is working properly
# Usage: ./scripts/verify-coach-kai.sh

set -e

echo "🔍 Coach Kai Connection Verification"
echo "===================================="
echo ""

# Test the API endpoint locally if running dev server
if curl -s http://localhost:3000 &> /dev/null; then
    echo "✅ Local dev server is running"
    echo "📡 Testing local Coach Kai API endpoint..."
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/coach-kai/chat \
        -H "Content-Type: application/json" \
        -d '{"messages": [{"role": "user", "content": "Hi"}]}' \
        --max-time 10 || echo "ERROR")
    
    if [[ "$RESPONSE" == *"error"* ]] || [[ "$RESPONSE" == "ERROR" ]]; then
        echo "❌ Local API test failed"
        echo "Response: $RESPONSE"
    else
        echo "✅ Local API test successful"
    fi
    echo ""
else
    echo "⚠️  Local dev server is not running"
    echo "   To test locally: cd /home/ubuntu/mindful_champion && npm run dev"
    echo ""
fi

# Check environment variable
echo "🔑 Checking ABACUSAI_API_KEY..."
if [ -f .env.local ] && grep -q "ABACUSAI_API_KEY" .env.local; then
    echo "✅ ABACUSAI_API_KEY found in .env.local"
    KEY_LENGTH=$(grep "ABACUSAI_API_KEY" .env.local | cut -d'=' -f2 | tr -d '"' | wc -c)
    echo "   Key length: $((KEY_LENGTH-1)) characters"
else
    echo "❌ ABACUSAI_API_KEY not found in .env.local"
fi
echo ""

# Check Vercel environment variables
echo "☁️  Checking Vercel environment variables..."
if command -v npx &> /dev/null && npx vercel whoami &> /dev/null; then
    echo "✅ Logged into Vercel as: $(npx vercel whoami 2>&1)"
    
    echo "📋 Listing environment variables..."
    npx vercel env ls || echo "❌ Could not list environment variables"
else
    echo "⚠️  Not logged into Vercel CLI"
    echo "   To check via dashboard: https://vercel.com/dashboard/mindful-champion/settings/environment-variables"
fi
echo ""

# Check production site
echo "🌐 Testing production site..."
PROD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://mindfulchampion.com/train/coach || echo "ERROR")

if [ "$PROD_RESPONSE" == "200" ]; then
    echo "✅ Production site is accessible (HTTP 200)"
else
    echo "❌ Production site returned: $PROD_RESPONSE"
fi
echo ""

echo "📝 Summary:"
echo "==========="
echo "1. Visit: https://mindfulchampion.com/train/coach"
echo "2. Send a test message: 'Hi Coach Kai, can you hear me?'"
echo "3. Expected: Proper coaching response"
echo "4. Error: 'I'm having trouble connecting' means API key is missing in Vercel"
echo ""
echo "🔧 To fix, add ABACUSAI_API_KEY to Vercel:"
echo "   https://vercel.com/dashboard"
echo "   → Settings → Environment Variables"
echo "   → Add: ABACUSAI_API_KEY = 19050ea030924f3dbc432d96ecbd0a89"
echo ""
