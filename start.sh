#!/bin/bash
set -e

echo "Starting myBand application..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

cd next-frontend

# Check if build exists
if [ ! -d ".next" ]; then
    echo "Error: .next directory not found. Build may have failed."
    exit 1
fi

echo "Starting Next.js application on port $PORT..."
exec npx next start -p $PORT