#!/bin/bash

# Tournament Data Updater Runner Script
# This script loads environment variables and executes the Python updater

# Set script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
# Try multiple .env file locations
ENV_FILES=(
    "$PROJECT_DIR/nextjs_space/.env.local"
    "$PROJECT_DIR/nextjs_space/.env"
    "$PROJECT_DIR/.env"
)

ENV_LOADED=false
for ENV_FILE in "${ENV_FILES[@]}"; do
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
        echo "Loaded environment variables from $ENV_FILE"
        ENV_LOADED=true
        break
    fi
done

if [ "$ENV_LOADED" = false ]; then
    echo "Warning: No .env file found in expected locations"
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
