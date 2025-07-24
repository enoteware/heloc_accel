#!/bin/bash
# HELOC Accelerator Startup Script

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "Warning: .env.local not found. Please configure your environment variables."
    if [ -f ".env.example" ]; then
        echo "You can copy .env.example to .env.local and update the values."
    fi
fi

# Start the server
echo "Starting HELOC Accelerator on port ${PORT:-3000}..."
node server.js
