#!/bin/bash

# Session start hook for Claude Code
# Plays a gentle welcome sound and shows project info

# Check if afplay is available (macOS)
if command -v afplay >/dev/null 2>&1; then
    # Use a gentle startup sound
    afplay /System/Library/Sounds/Blow.aiff 2>/dev/null &
elif command -v paplay >/dev/null 2>&1; then
    # Linux with PulseAudio
    paplay /usr/share/sounds/alsa/Front_Center.wav 2>/dev/null &
elif command -v aplay >/dev/null 2>&1; then
    # Linux with ALSA
    aplay /usr/share/sounds/alsa/Front_Center.wav 2>/dev/null &
fi

# Get project info
PROJECT_NAME=$(basename "$PWD")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Show desktop notification with project info
if command -v osascript >/dev/null 2>&1; then
    # macOS notification
    osascript -e "display notification \"Working on $PROJECT_NAME (branch: $BRANCH)\" with title \"Claude Code Session Started\"" 2>/dev/null &
elif command -v notify-send >/dev/null 2>&1; then
    # Linux notification
    notify-send "Claude Code Session Started" "Working on $PROJECT_NAME (branch: $BRANCH)" 2>/dev/null &
fi