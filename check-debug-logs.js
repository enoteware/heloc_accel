const { chromium } = require('playwright');

async function checkDebugLogs() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Going to debug test page...');
    await page.goto('http://localhost:3000/en/debug-test');
    await page.waitForLoadState('networkidle');
    
    console.log('Looking for Debug Log Viewer button...');
    const debugLogsButton = await page.locator('button:has-text("Debug Logs")').first();
    if (await debugLogsButton.isVisible({ timeout: 3000 })) {
      await debugLogsButton.click();
      console.log('Clicked Debug Logs button');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-logs-open.png' });
      
      // Look for any content in the debug logs
      const debugContent = await page.locator('pre, code, textarea, .log-content').first();
      if (await debugContent.isVisible({ timeout: 3000 })) {
        const logs = await debugContent.textContent();
        console.log('Debug logs content:');
        console.log(logs);
      } else {
        console.log('No debug log content found');
      }
    } else {
      console.log('Debug Logs button not found');
    }
    
    console.log('Checking current authentication status...');
    const authStatus = await page.locator('text=Not logged in, text=Logged in').first();
    if (await authStatus.isVisible()) {
      const status = await authStatus.textContent();
      console.log('Auth status:', status);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkDebugLogs().catch(console.error);