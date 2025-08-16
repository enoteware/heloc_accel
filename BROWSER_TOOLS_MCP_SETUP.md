# Browser Tools MCP Setup Guide

## Installation Steps

### 1. Install the MCP Server

```bash
# Install globally
npm install -g @agentdeskai/browser-tools-mcp

# Or install locally in your project
npm install --save-dev @agentdeskai/browser-tools-mcp
```

### 2. Configure Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp"]
    }
  }
}
```

### 3. Restart Claude Desktop

After adding the configuration, restart Claude Desktop for the changes to take effect.

## Usage

Once configured, you'll have access to these tools:

- **browser_console**: Execute JavaScript in the browser console
- **browser_screenshot**: Take screenshots of web pages
- **browser_navigate**: Navigate to URLs
- **browser_click**: Click elements on the page
- **browser_type**: Type text into input fields
- **browser_get_console_logs**: Retrieve browser console logs

## Example Usage for HELOC Accelerator

```javascript
// Get console logs from your app
browser_get_console_logs({
  url: "http://localhost:3000",
  filter: "error", // Get only errors
});

// Execute JavaScript to check for errors
browser_console({
  url: "http://localhost:3000",
  code: "window.onerror = function(msg, url, line) { console.error('Error:', msg, 'at', url + ':' + line); }",
});

// Take a screenshot when errors occur
browser_screenshot({
  url: "http://localhost:3000/calculator",
  path: "error-screenshot.png",
});
```

## Alternative: Using Playwright for Browser Automation

If browser-tools-mcp isn't available, you can use Playwright directly:

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Create a test file
```

Create `tests/console-monitor.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("monitor console errors", async ({ page }) => {
  // Collect all console messages
  const consoleLogs: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  // Collect page errors
  page.on("pageerror", (error) => {
    consoleLogs.push(`Page error: ${error.message}`);
  });

  // Navigate to your app
  await page.goto("http://localhost:3000");

  // Perform actions that might cause errors
  await page.click('button:has-text("Calculate")');

  // Check for console errors
  if (consoleLogs.length > 0) {
    console.log("Console errors found:", consoleLogs);
    // Take screenshot
    await page.screenshot({ path: "error-screenshot.png" });
  }

  expect(consoleLogs).toHaveLength(0);
});
```

Run with: `npx playwright test tests/console-monitor.spec.ts`
