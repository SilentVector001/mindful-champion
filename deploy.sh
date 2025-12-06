#!/bin/bash

echo "==================================="
echo "Mindful Champion - Production Deployment"
echo "Dashboard Layout Fix"
echo "==================================="
echo ""

# 1. Stop existing Next.js processes
echo "Step 1: Stopping existing Next.js processes..."
pkill -f "next start" || echo "No existing processes found"
pkill -f "node.*next" || true
sleep 2

# Verify processes are stopped
if pgrep -f "next start" > /dev/null; then
    echo "❌ Failed to stop existing processes"
    exit 1
else
    echo "✅ All existing Next.js processes stopped"
fi

echo ""

# 2. Verify build exists
echo "Step 2: Verifying production build..."
if [ -d ".next" ]; then
    echo "✅ Production build found (.next directory exists)"
    echo "Build timestamp: $(stat -c %y .next | cut -d'.' -f1)"
else
    echo "❌ No production build found"
    exit 1
fi

echo ""

# 3. Start production server
echo "Step 3: Starting production server on port 8080..."
PORT=8080 nohup npm start > /home/ubuntu/mindful_champion/logs/production.log 2>&1 &
echo $! > /home/ubuntu/mindful_champion/logs/server.pid

sleep 5

echo ""

# 4. Verify server is running
echo "Step 4: Verifying server status..."
if pgrep -f "next start" > /dev/null; then
    PID=$(cat /home/ubuntu/mindful_champion/logs/server.pid 2>/dev/null || echo "unknown")
    echo "✅ Production server is running (PID: $PID)"
else
    echo "❌ Server failed to start"
    exit 1
fi

echo ""

# 5. Test server response
echo "Step 5: Testing server response..."
sleep 3

for i in {1..10}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302\|307"; then
        echo "✅ Server is responding to requests"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
        echo "   HTTP Status: $HTTP_CODE"
        break
    else
        if [ $i -eq 10 ]; then
            echo "❌ Server not responding after 10 attempts"
            exit 1
        fi
        echo "   Waiting for server... (attempt $i/10)"
        sleep 2
    fi
done

echo ""
echo "==================================="
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "==================================="
echo ""
echo "Server Details:"
echo "- Port: 8080"
echo "- PID: $(cat /home/ubuntu/mindful_champion/logs/server.pid 2>/dev/null || echo 'unknown')"
echo "- Log file: /home/ubuntu/mindful_champion/logs/production.log"
echo ""
echo "Dashboard Layout Fix Deployed:"
echo "- Changed dashboard width from w-full to max-w-7xl mx-auto"
echo "- Matches navigation component for consistent layout"
echo ""
echo "Deployment completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

