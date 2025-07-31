import { test, expect } from '@playwright/test';

test.describe('Comprehensive Auth Testing', () => {
  test('complete authentication flow with debug testing', async ({ page }) => {
    console.log('Starting comprehensive auth test...');

    // Step 1: Navigate to sign-in page
    console.log('Step 1: Navigate to sign-in page');
    await page.goto('http://localhost:3001/en/handler/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of sign-in page
    await page.screenshot({ path: 'sign-in-page.png', fullPage: true });
    console.log('Screenshot taken: sign-in-page.png');

    // Step 2: Login with enoteware@gmail.com / demo123!!
    console.log('Step 2: Attempting login with enoteware@gmail.com');
    
    // Wait for the email input to be visible and interactable
    await page.waitForSelector('input[name="email"], input[type="email"]', { state: 'visible' });
    await page.fill('input[name="email"], input[type="email"]', 'enoteware@gmail.com');
    
    // Wait for password input and fill it
    await page.waitForSelector('input[name="password"], input[type="password"]', { state: 'visible' });
    await page.fill('input[name="password"], input[type="password"]', 'demo123!!');
    
    // Find and click the sign-in button
    const signInButton = page.locator('button:has-text("Sign in"), button[type="submit"], input[type="submit"]').first();
    await signInButton.click();
    
    // Wait for potential redirect or page change
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`After login URL: ${currentUrl}`);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login-attempt.png', fullPage: true });
    console.log('Screenshot taken: after-login-attempt.png');

    // Step 3: Navigate to debug-test page
    console.log('Step 3: Navigate to debug-test page');
    await page.goto('http://localhost:3001/en/debug-test');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of debug test page
    await page.screenshot({ path: 'debug-test-page.png', fullPage: true });
    console.log('Screenshot taken: debug-test-page.png');

    // Step 4: Check user information
    console.log('Step 4: Check user information display');
    
    // Look for user info display
    const userInfoSection = page.locator('[data-testid="user-info"], .user-info, h2:has-text("User Information")').first();
    if (await userInfoSection.isVisible()) {
      const userInfoText = await userInfoSection.textContent();
      console.log(`User info found: ${userInfoText}`);
    } else {
      console.log('User info section not found');
    }

    // Step 5: Test Auth Debug button
    console.log('Step 5: Click Test Auth Debug button');
    
    const authDebugButton = page.locator('button:has-text("Test Auth Debug")').first();
    if (await authDebugButton.isVisible()) {
      await authDebugButton.click();
      await page.waitForTimeout(2000);
      
      // Look for auth status display
      const authStatus = page.locator('[data-testid="auth-status"], .auth-status').first();
      if (await authStatus.isVisible()) {
        const statusText = await authStatus.textContent();
        console.log(`Auth debug status: ${statusText}`);
      }
    } else {
      console.log('Test Auth Debug button not found');
    }

    // Step 6: Test Stack Auth button
    console.log('Step 6: Click Test Stack Auth button');
    
    const stackAuthButton = page.locator('button:has-text("Test Stack Auth")').first();
    if (await stackAuthButton.isVisible()) {
      await stackAuthButton.click();
      await page.waitForTimeout(2000);
      
      // Look for stack auth status
      const stackAuthStatus = page.locator('[data-testid="stack-auth-status"], .stack-auth-status').first();
      if (await stackAuthStatus.isVisible()) {
        const stackStatusText = await stackAuthStatus.textContent();
        console.log(`Stack auth status: ${stackStatusText}`);
      }
    } else {
      console.log('Test Stack Auth button not found');
    }

    // Take screenshot after debug tests
    await page.screenshot({ path: 'after-debug-tests.png', fullPage: true });
    console.log('Screenshot taken: after-debug-tests.png');

    // Step 7: Navigate to dashboard
    console.log('Step 7: Navigate to dashboard');
    await page.goto('http://localhost:3001/en/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'dashboard-page.png', fullPage: true });
    console.log('Screenshot taken: dashboard-page.png');

    // Step 8: Check for scenarios
    console.log('Step 8: Check for scenarios on dashboard');
    
    // Look for scenario elements
    const scenarioElements = page.locator('[data-testid="scenario"], .scenario-card, .scenario-item');
    const scenarioCount = await scenarioElements.count();
    console.log(`Found ${scenarioCount} scenarios on dashboard`);
    
    if (scenarioCount > 0) {
      for (let i = 0; i < Math.min(scenarioCount, 3); i++) {
        const scenarioText = await scenarioElements.nth(i).textContent();
        console.log(`Scenario ${i + 1}: ${scenarioText?.substring(0, 100)}...`);
      }
    } else {
      console.log('No scenarios found on dashboard');
      
      // Check for any error messages
      const errorMessages = page.locator('.error, [data-testid="error"], .alert-error');
      const errorCount = await errorMessages.count();
      if (errorCount > 0) {
        const errorText = await errorMessages.first().textContent();
        console.log(`Error message found: ${errorText}`);
      }
    }

    // Step 9: Go back to debug test and check Debug Log Viewer
    console.log('Step 9: Return to debug test page for log viewer');
    await page.goto('http://localhost:3001/en/debug-test');
    await page.waitForLoadState('networkidle');

    // Look for Debug Log Viewer
    const debugLogButton = page.locator('button:has-text("Debug Log Viewer"), button:has-text("Show Debug Log"), button:has-text("View Logs")').first();
    if (await debugLogButton.isVisible()) {
      console.log('Found Debug Log Viewer button');
      await debugLogButton.click();
      await page.waitForTimeout(2000);
      
      // Look for log content
      const logContent = page.locator('[data-testid="debug-log"], .debug-log, .log-content').first();
      if (await logContent.isVisible()) {
        const logText = await logContent.textContent();
        console.log(`Debug log content (first 500 chars): ${logText?.substring(0, 500)}...`);
      }
    } else {
      console.log('Debug Log Viewer button not found');
    }

    // Final screenshot
    await page.screenshot({ path: 'final-debug-log.png', fullPage: true });
    console.log('Screenshot taken: final-debug-log.png');

    // Step 10: Summary
    console.log('\n=== COMPREHENSIVE TEST SUMMARY ===');
    console.log(`Final URL: ${page.url()}`);
    
    // Check if we're authenticated by looking for auth indicators
    const authIndicators = page.locator('[data-testid="authenticated"], .authenticated, .user-menu, .logout-button');
    const hasAuthIndicators = await authIndicators.count() > 0;
    console.log(`Authentication indicators found: ${hasAuthIndicators}`);
    
    console.log('Test completed successfully!');
  });
});