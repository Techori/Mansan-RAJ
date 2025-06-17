#!/bin/bash

# Function to open Chrome with localhost
open_chrome() {
    local port=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a "Google Chrome" "http://localhost:$port"
    else
        # Linux
        google-chrome "http://localhost:$port"
    fi
}

# Check if node_modules exists in frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Start backend server in the background
echo "Starting backend server..."
cd backend
npm start &
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server and capture its output
echo "Starting frontend server..."
npm run dev > vite_output.log 2>&1 &
FRONTEND_PID=$!

# Wait for Vite to start and extract the port
echo "Waiting for frontend server to start..."
while true; do
    if grep -q "Local:" vite_output.log; then
        PORT=$(grep "Local:" vite_output.log | grep -o "http://localhost:[0-9]*" | cut -d':' -f3)
        if [ ! -z "$PORT" ]; then
            break
        fi
    fi
    sleep 1
done

# Open Chrome once frontend is ready
echo "Frontend server is ready on port $PORT! Opening Chrome..."
open_chrome $PORT

# Keep the script running
wait $FRONTEND_PID 