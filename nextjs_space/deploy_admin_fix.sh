#!/bin/bash
set -e

echo "=== Deploying Admin Dashboard Fix ==="
echo "Timestamp: $(date)"

# Navigate to project directory
cd /home/ubuntu/mindful_champion/nextjs_space

# Stop existing production server
echo "Stopping existing production server..."
pkill -f "node /tmp/app/.build/standalone/app/server.js" || true
sleep 2

# Copy built files to deployment location
echo "Copying built files..."
rm -rf /tmp/app
mkdir -p /tmp/app
cp -r .build/* /tmp/app/

# Start production server
echo "Starting production server..."
cd /tmp/app
nohup node /tmp/app/.build/standalone/app/server.js > /tmp/app/server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "Deployment completed at $(date)"
else
    echo "❌ Server failed to start!"
    cat /tmp/app/server.log
    exit 1
fi
