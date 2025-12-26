#!/bin/bash

# Tournament Data Updater Runner Script
# This script loads environment variables and executes the Python updater

# Set script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
ENV_FILE="$PROJECT_DIR/nextjs_space/.env.local"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    echo "Loaded environment variables from .env.local"
else
    echo "Warning: .env.local file not found at $ENV_FILE"
fi

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/logs"

# Run the Python updater
echo "Starting tournament data updater..."
python3 "$SCRIPT_DIR/tournament_data_updater.py"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "Tournament data updater completed successfully"
else
    echo "Tournament data updater failed with exit code $exit_code"
fi

exit $exit_code
