#!/bin/bash
echo "=== DEPLOYMENT STARTED AT $(date) ==="
echo ""

# Log deployment
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="/home/ubuntu/mindful_champion/deploy-${TIMESTAMP}.log"

echo "Deploying Mindful Champion to production..." | tee -a "$LOG_FILE"
echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Kill any existing processes
echo "Stopping existing processes..." | tee -a "$LOG_FILE"
pkill -f "next start" || true
sleep 2

# Start production server
echo "Starting production server..." | tee -a "$LOG_FILE"
cd /home/ubuntu/mindful_champion/nextjs_space
nohup npm start > /home/ubuntu/mindful_champion/production.log 2>&1 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID" | tee -a "$LOG_FILE"
sleep 5

# Verify server is running
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server is running successfully!" | tee -a "$LOG_FILE"
else
    echo "❌ Server failed to start!" | tee -a "$LOG_FILE"
    exit 1
fi

# Check if port 3000 is listening
if netstat -tuln | grep -q ":3000 "; then
    echo "✅ Port 3000 is listening" | tee -a "$LOG_FILE"
else
    echo "⚠️ Port 3000 not yet listening (may need more time)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "=== DEPLOYMENT COMPLETED AT $(date) ===" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
