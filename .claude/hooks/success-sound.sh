#!/bin/bash

# Success sound hook for Claude Code
# Plays a pleasant success sound when builds/tests complete successfully

# Check if afplay is available (macOS)
if command -v afplay >/dev/null 2>&1; then
    # Use system success sound
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
elif command -v paplay >/dev/null 2>&1; then
    # Linux with PulseAudio
    paplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null &
elif command -v aplay >/dev/null 2>&1; then
    # Linux with ALSA
    aplay /usr/share/sounds/alsa/Front_Left.wav 2>/dev/null &
fi

# Optional: Show desktop notification
if command -v osascript >/dev/null 2>&1; then
    # macOS notification
    osascript -e 'display notification "Task completed successfully!" with title "Claude Code"' 2>/dev/null &
elif command -v notify-send >/dev/null 2>&1; then
    # Linux notification
    notify-send "Claude Code" "Task completed successfully!" 2>/dev/null &
fi