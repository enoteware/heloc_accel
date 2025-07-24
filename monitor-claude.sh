#!/bin/bash

# Claude Code Usage Monitor Helper Script
# This script provides easy access to the Claude Code Usage Monitor

# Default settings
PLAN="pro"
VIEW="realtime"
THEME="auto"
REFRESH_RATE="5"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --plan)
      PLAN="$2"
      shift 2
      ;;
    --view)
      VIEW="$2"
      shift 2
      ;;
    --theme)
      THEME="$2"
      shift 2
      ;;
    --refresh-rate)
      REFRESH_RATE="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./monitor-claude.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --plan PLAN           Set plan type (pro, max5, max20, custom)"
      echo "  --view VIEW           Set view mode (realtime, daily, monthly, session)"
      echo "  --theme THEME         Set theme (light, dark, classic, auto)"
      echo "  --refresh-rate RATE   Set refresh rate in seconds"
      echo "  --help                Show this help message"
      echo ""
      echo "Available commands:"
      echo "  claude-monitor        Main monitor command"
      echo "  ccm                   Short alias"
      echo "  cmonitor              Alternative alias"
      echo ""
      echo "Examples:"
      echo "  ./monitor-claude.sh                           # Use defaults"
      echo "  ./monitor-claude.sh --plan max20 --view daily # Max20 plan, daily view"
      echo "  ./monitor-claude.sh --theme dark              # Dark theme"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "Starting Claude Code Usage Monitor..."
echo "Plan: $PLAN | View: $VIEW | Theme: $THEME | Refresh: ${REFRESH_RATE}s"
echo "Press Ctrl+C to exit"
echo ""

# Run the monitor with the specified settings
claude-monitor --plan "$PLAN" --view "$VIEW" --theme "$THEME" --refresh-rate "$REFRESH_RATE"