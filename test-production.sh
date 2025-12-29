#!/bin/bash

echo "========================================"
echo "Production Deployment Verification Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "Test 1: Checking if server is running..."
if pgrep -f "next start" > /dev/null; then
    PID=$(pgrep -f "next start")
    echo -e "${GREEN}✓${NC} Server is running (PID: $PID)"
else
    echo -e "${RED}✗${NC} Server is NOT running"
    exit 1
fi
echo ""

# Test 2: Check server response
echo "Test 2: Testing server response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✓${NC} Server responding with HTTP $HTTP_CODE"
else
    echo -e "${RED}✗${NC} Server responding with HTTP $HTTP_CODE (expected 200/307/302)"
    exit 1
fi
echo ""

# Test 3: Check API endpoints
echo "Test 3: Testing video upload API endpoint..."
API_RESPONSE=$(curl -s -X POST http://localhost:8080/api/video-analysis/pre-signed-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.mp4", "fileType": "video/mp4", "fileSize": 1000000}')

if echo "$API_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${GREEN}✓${NC} API endpoint responding correctly (requires auth)"
elif echo "$API_RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}⚠${NC} API endpoint responding with error:"
    echo "$API_RESPONSE" | jq '.' 2>/dev/null || echo "$API_RESPONSE"
else
    echo -e "${RED}✗${NC} Unexpected API response:"
    echo "$API_RESPONSE"
fi
echo ""

# Test 4: Check AWS environment variables
echo "Test 4: Checking AWS configuration..."
AWS_VARS=$(grep -E "^AWS_" .env 2>/dev/null | wc -l)
if [ "$AWS_VARS" -ge 5 ]; then
    echo -e "${GREEN}✓${NC} AWS environment variables configured ($AWS_VARS variables)"
else
    echo -e "${RED}✗${NC} Missing AWS environment variables (found $AWS_VARS, expected 5)"
fi
echo ""

# Test 5: Check build directory
echo "Test 5: Checking build directory..."
if [ -d ".next" ] || [ -L ".next" ]; then
    BUILD_TIME=$(stat -c %y .next 2>/dev/null | cut -d'.' -f1)
    echo -e "${GREEN}✓${NC} Build directory exists (.next)"
    echo "   Build timestamp: $BUILD_TIME"
else
    echo -e "${RED}✗${NC} Build directory missing"
fi
echo ""

# Test 6: Check log file
echo "Test 6: Checking production logs..."
if [ -f "/home/ubuntu/mindful_champion/logs/production.log" ]; then
    LOG_SIZE=$(du -h /home/ubuntu/mindful_champion/logs/production.log | cut -f1)
    echo -e "${GREEN}✓${NC} Production log file exists (size: $LOG_SIZE)"
    echo ""
    echo "Recent log entries:"
    echo "-------------------"
    tail -n 5 /home/ubuntu/mindful_champion/logs/production.log
else
    echo -e "${YELLOW}⚠${NC} Production log file not found"
fi
echo ""

# Test 7: Check critical video upload files
echo "Test 7: Checking video upload fix files..."
FILES_TO_CHECK=(
    "app/api/video-analysis/pre-signed-url/route.ts"
    "lib/aws-config.ts"
)

for FILE in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✓${NC} $FILE exists"
    else
        echo -e "${RED}✗${NC} $FILE missing"
    fi
done
echo ""

# Summary
echo "========================================"
echo "Verification Complete"
echo "========================================"
echo ""
echo "Server Status: http://localhost:8080"
echo "Process ID: $(pgrep -f 'next start' || echo 'Not running')"
echo "HTTP Response: $HTTP_CODE"
echo ""
echo "Next steps:"
echo "1. Test video upload on production site (mindfulchampion.com)"
echo "2. Monitor logs: tail -f /home/ubuntu/mindful_champion/logs/production.log"
echo "3. If issues occur, check browser console for errors"
echo ""
