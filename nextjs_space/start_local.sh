#!/bin/bash

# Load environment variables from .env.local
export $(cat .env.local | grep -v '^#' | xargs)

# Port defaults to 3000 (Next.js default)
# export PORT=3000

# Start the server
npm start
