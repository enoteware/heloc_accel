#!/bin/bash

# Edit completion sound hook for Claude Code
# Plays a subtle sound when files are written or edited

# Check if afplay is available (macOS)
if command -v afplay >/dev/null 2>&1; then
    # Use a softer system sound for edits
    afplay /System/Library/Sounds/Tink.aiff 2>/dev/null &
elif command -v paplay >/dev/null 2>&1; then
    # Linux with PulseAudio
    paplay /usr/share/sounds/alsa/Side_Left.wav 2>/dev/null &
elif command -v aplay >/dev/null 2>&1; then
    # Linux with ALSA
    aplay /usr/share/sounds/alsa/Side_Left.wav 2>/dev/null &
fi