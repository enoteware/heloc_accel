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

# Enhanced project status (automated /status command)
echo "📊 HELOC Accelerator Project Status"
echo "=================================="
echo "Branch: $BRANCH"
echo "Last commit: $(git log -1 --format='%h - %s (%cr)' 2>/dev/null || echo 'No commits')"
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "Uncommitted files: $UNCOMMITTED"

# Check for critical issues
if [ -f "BUILD_LOG.md" ]; then
    echo "📋 Recent build activity detected - check BUILD_LOG.md"
fi

# Quick health indicators
if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo "✅ Environment configuration present"
else
    echo "⚠️ No environment configuration found"
fi

# Show desktop notification with project info
if command -v osascript >/dev/null 2>&1; then
    # macOS notification
    osascript -e "display notification \"Working on $PROJECT_NAME (branch: $BRANCH)\" with title \"Claude Code Session Started\"" 2>/dev/null &
elif command -v notify-send >/dev/null 2>&1; then
    # Linux notification
    notify-send "Claude Code Session Started" "Working on $PROJECT_NAME (branch: $BRANCH)" 2>/dev/null &
fi