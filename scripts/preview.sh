#!/bin/bash
# ==============================================================================
# Ocean Journey - Local Preview Launcher for Galaxy S25 & Android Chrome
# ==============================================================================

PORT=8080
PROJECT_URL="http://localhost:$PORT/projects/ocean-journey/"

# Ensure local HTTP server is running
if ! pgrep -f "http.server $PORT" > /dev/null 2>&1; then
    echo "[Ocean Journey] Starting local HTTP server on port $PORT..."
    python3 -m http.server $PORT > /dev/null 2>&1 &
    sleep 1
else
    echo "[Ocean Journey] Local HTTP server already active on port $PORT."
fi

echo "[Ocean Journey] Launching Chrome preview..."
# Launch on Android Chrome via Termux AM
am start --user 0 -a android.intent.action.VIEW -d "$PROJECT_URL" 2>/dev/null || \
/data/data/com.termux/files/usr/bin/termux-open-url "$PROJECT_URL" 2>/dev/null || \
xdg-open "$PROJECT_URL" 2>/dev/null

echo "[Ocean Journey] Preview URL: $PROJECT_URL"
