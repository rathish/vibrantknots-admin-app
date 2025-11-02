#!/bin/bash

# Ensure Node 20 is in PATH
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=4096"
export EXPO_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"

# Increase file descriptor limit
ulimit -n 65536

echo "=== Vibrant Knots App Startup ==="
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "File descriptor limit: $(ulimit -n)"
echo "API Base URL: $EXPO_PUBLIC_API_BASE_URL"
echo "=================================="

# Clean up any existing processes
pkill -f "metro" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
sleep 2

# Start the app
echo "Starting Expo development server..."
npm start --web --no-dev

echo "App startup complete!"
