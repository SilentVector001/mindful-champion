#!/bin/bash

# Video Analysis AI Enhancement - Deployment Script
# This script deploys the enhanced video analysis features

set -e  # Exit on error

echo "🎯 Starting Video Analysis AI Enhancement Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
echo "📂 Checking working directory..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the nextjs_space directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Working directory confirmed${NC}"
echo ""

# Step 2: Check for required dependencies
echo "📦 Checking dependencies..."
if ! grep -q "@tensorflow/tfjs-node" package.json; then
    echo -e "${RED}Error: TensorFlow.js not found in package.json${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies confirmed${NC}"
echo ""

# Step 3: Update database schema
echo "🗄️  Updating database schema..."
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

echo -e "${YELLOW}⚠️  Database schema update required. Run manually:${NC}"
echo "   npx prisma db push"
echo ""

# Step 4: Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed. Please check errors above.${NC}"
    exit 1
fi
echo ""

# Step 5: Check if PM2 is available
echo "🔍 Checking for PM2..."
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 found${NC}"
    
    # Ask if user wants to restart PM2
    read -p "Do you want to restart the server with PM2? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Restarting server..."
        pm2 restart all || pm2 start npm --name "nextjs-app" -- start
        echo -e "${GREEN}✓ Server restarted${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not found. You'll need to restart the server manually.${NC}"
    echo "   Run: npm start"
fi
echo ""

# Step 6: Final checks
echo "✅ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma db push (to update database)"
echo "2. Test video upload at /train/video"
echo "3. Monitor logs: pm2 logs nextjs-app"
echo "4. Check documentation: docs/VIDEO_ANALYSIS_AI_ENHANCEMENT.md"
echo ""
echo -e "${GREEN}🎉 Video Analysis AI Enhancement is ready!${NC}"
