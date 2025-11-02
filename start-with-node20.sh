#!/bin/bash

# Ensure Node 20 is in PATH
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Increase file descriptor limit for file watching
ulimit -n 65536

# Kill any existing Metro/Expo processes
pkill -f "metro" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true

# Wait a moment for processes to clean up
sleep 2

# Verify Node version
echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"
echo "File descriptor limit: $(ulimit -n)"

# Start the Expo app
npm start
