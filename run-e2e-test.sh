#!/bin/bash

# HELOC Calculator E2E Test Runner
# This script runs the Playwright test for the HELOC calculator application

echo "🧪 HELOC Calculator E2E Test Runner"
echo "=================================="
echo ""

# Check if Playwright is installed
if ! npm list @playwright/test >/dev/null 2>&1; then
    echo "📦 Installing Playwright..."
    npm install -D @playwright/test
    echo "🌐 Installing Playwright browsers..."
    npx playwright install
fi

# Create tests directory if it doesn't exist
mkdir -p tests/e2e/screenshots

# Check if the app is running
echo "🔍 Checking if app is running on http://localhost:3005..."
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 | grep -q "200\|301\|302"; then
    echo "❌ Error: Application is not running on http://localhost:3005"
    echo "💡 Please start the application with: npm run dev"
    echo "   Make sure it's running on port 3005"
    exit 1
fi

echo "✅ Application is running!"
echo ""

# Run the test
echo "🚀 Running E2E test..."
echo "   This will open a browser window and perform automated testing"
echo ""

# Run with headed mode (visible browser) and debug info
npx playwright test tests/e2e/heloc-calculator-test.ts \
    --headed \
    --project=chromium \
    --reporter=list \
    --trace=on \
    --video=on

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tests completed successfully!"
    echo ""
    echo "📊 View results:"
    echo "   - Screenshots: tests/e2e/screenshots/"
    echo "   - Test report: tests/e2e/screenshots/test-report.json"
    echo "   - Trace viewer: npx playwright show-trace"
else
    echo ""
    echo "❌ Tests failed!"
    echo ""
    echo "📊 View debugging info:"
    echo "   - Screenshots: tests/e2e/screenshots/"
    echo "   - Test report: tests/e2e/screenshots/test-report.json"
    echo "   - Trace viewer: npx playwright show-trace"
fi

echo ""
echo "🎥 To view test videos, check: test-results/"
echo "🔍 To view trace, run: npx playwright show-trace"