#!/bin/bash

# Deploy Script - Run After GitHub Push Protection is Unblocked
# This script will push the latest code and deploy to Vercel

set -e  # Exit on error

echo "🚀 Mindful Champion - Deployment Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
cd /home/ubuntu/mindful_champion

echo "📍 Current directory: $(pwd)"
echo ""

# Check git status
echo "🔍 Checking git status..."
git status --short
echo ""

# Prompt user to confirm
echo -e "${YELLOW}⚠️  Before running this script:${NC}"
echo "1. Have you rotated the Twilio SID? (https://console.twilio.com)"
echo "2. Have you clicked 'I have rotated this secret' in GitHub?"
echo "   Link: https://github.com/SilentVector001/mindful-champion/security/secret-scanning/unblock-secret/37e7oZcoz0tULAbPbz8u0OMj5L8"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo "================  STEP 1: Push to GitHub  ================="
echo ""

# Try to push to GitHub
echo "📤 Pushing to GitHub..."
if git push origin master; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo ""
    echo "Possible reasons:"
    echo "1. GitHub push protection still active - rotate Twilio SID"
    echo "2. No changes to commit - code already pushed"
    echo "3. Network issue - check internet connection"
    echo ""
    read -p "Continue with Vercel deployment anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

echo ""
echo "================  STEP 2: Deploy to Vercel  ================="
echo ""

# Change to nextjs_space directory
cd /home/ubuntu/mindful_champion/nextjs_space

echo "📦 Building Next.js app..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check the error messages above and fix any issues."
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npm/npx not found${NC}"
    exit 1
fi

# Deploy to Vercel
echo "Running: npx vercel --prod"
echo ""

if npx vercel --prod; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Run 'npx vercel login' to authenticate"
    echo "2. Check environment variables in Vercel dashboard"
    echo "3. Review build logs in Vercel dashboard"
    exit 1
fi

echo ""
echo "================  STEP 3: Verification  ================="
echo ""

echo "📝 Deployment checklist:"
echo ""
echo "1. Visit: https://mindfulchampion.com/train/coach"
echo "2. Verify Coach Kai loads (no 'Starting up...' error)"
echo "3. Test sending a message to Coach Kai"
echo "4. Test PTT (Push-to-Talk) button"
echo "5. Check action cards appear (drills, calendar, etc.)"
echo "6. Test on mobile devices (iOS/Android)"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "🔍 Monitor deployment:"
echo "   Vercel Dashboard: https://vercel.com/dashboard"
echo "   Function Logs: https://vercel.com/dashboard > Functions tab"
echo ""
echo "📊 Check Coach Kai:"
echo "   Production: https://mindfulchampion.com/train/coach"
echo "   API Health: https://mindfulchampion.com/api/coach-kai/chat"
echo ""
