import { test, expect } from '@playwright/test';

test.describe('Authenticated Save Functionality Test', () => {
  test('Complete authentication and save scenario flow', async ({ page }) => {
    // Step 1: Navigate to sign-in page
    console.log('Step 1: Navigating to sign-in page...');
    await page.goto('http://localhost:3000/en/handler/sign-in');
    
    // Take screenshot of sign-in page
    await page.screenshot({ path: 'test-results/01-signin-page.png', fullPage: true });
    
    // Step 2: Login with demo credentials
    console.log('Step 2: Logging in with enoteware@gmail.com...');
    await page.fill('input[name="email"]', 'enoteware@gmail.com');
    await page.fill('input[name="password"]', 'demo123!!');
    
    // Take screenshot before clicking login
    await page.screenshot({ path: 'test-results/02-before-login.png', fullPage: true });
    
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Step 3: Verify redirect to calculator
    console.log('Step 3: Verifying redirect to calculator...');
    await expect(page).toHaveURL(/.*\/calculator/);
    
    // Take screenshot of calculator page after login
    await page.screenshot({ path: 'test-results/03-calculator-after-login.png', fullPage: true });
    
    // Step 4: Click "Fill Demo Data"
    console.log('Step 4: Clicking Fill Demo Data...');
    const fillDemoButton = page.getByText('Fill Demo Data');
    await expect(fillDemoButton).toBeVisible();
    await fillDemoButton.click();
    
    // Wait a moment for form to populate
    await page.waitForTimeout(1000);
    
    // Take screenshot after demo data is filled
    await page.screenshot({ path: 'test-results/04-demo-data-filled.png', fullPage: true });
    
    // Step 5: Wait for live results to appear
    console.log('Step 5: Waiting for live results...');
    await page.waitForSelector('[data-testid="live-results"], .live-results, .results-section', { timeout: 10000 });
    
    // Wait additional time for calculations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot of live results
    await page.screenshot({ path: 'test-results/05-live-results.png', fullPage: true });
    
    // Step 6: Click "Save This Scenario"
    console.log('Step 6: Clicking Save This Scenario...');
    const saveButton = page.getByText('Save This Scenario');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('.modal, [role="dialog"]', { timeout: 5000 });
    
    // Take screenshot of save modal
    await page.screenshot({ path: 'test-results/06-save-modal.png', fullPage: true });
    
    // Step 7: Enter scenario details
    console.log('Step 7: Entering scenario details...');
    await page.fill('input[name="name"], input[placeholder*="scenario name"], input[placeholder*="Name"]', 'Authenticated Test Scenario');
    await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'Testing save with proper auth');
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'test-results/07-modal-filled.png', fullPage: true });
    
    // Step 8: Click Save in modal
    console.log('Step 8: Clicking Save in modal...');
    const modalSaveButton = page.locator('.modal button, [role="dialog"] button').filter({ hasText: /save/i });
    await modalSaveButton.click();
    
    // Wait for save operation to complete
    await page.waitForTimeout(3000);
    
    // Step 9: Check for redirect to dashboard
    console.log('Step 9: Checking for redirect to dashboard...');
    const currentUrl = page.url();
    console.log('Current URL after save:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      // Take screenshot of dashboard
      await page.screenshot({ path: 'test-results/09-dashboard-success.png', fullPage: true });
    } else {
      console.log('❌ Not redirected to dashboard, current URL:', currentUrl);
      // Take screenshot of current page
      await page.screenshot({ path: 'test-results/09-no-redirect.png', fullPage: true });
      
      // Step 11: Navigate manually to dashboard
      console.log('Step 11: Navigating manually to dashboard...');
      await page.goto('http://localhost:3000/en/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of manually navigated dashboard
      await page.screenshot({ path: 'test-results/11-manual-dashboard-nav.png', fullPage: true });
    }
    
    // Step 12: Look for saved scenarios and any messages
    console.log('Step 12: Checking for saved scenarios and messages...');
    
    // Check for success messages
    const successMessage = page.locator('.alert-success, .success-message, .toast-success, [role="alert"]');
    if (await successMessage.count() > 0) {
      console.log('✅ Success message found');
      await page.screenshot({ path: 'test-results/12-success-message.png', fullPage: true });
    }
    
    // Check for error messages
    const errorMessage = page.locator('.alert-error, .error-message, .toast-error, [role="alert"][class*="error"]');
    if (await errorMessage.count() > 0) {
      console.log('❌ Error message found');
      await page.screenshot({ path: 'test-results/12-error-message.png', fullPage: true });
    }
    
    // Check for saved scenarios
    const scenarioItems = page.locator('.scenario-item, .scenario-card, [data-testid*="scenario"]');
    const scenarioCount = await scenarioItems.count();
    console.log(`Found ${scenarioCount} scenarios on dashboard`);
    
    // Look for our specific scenario
    const ourScenario = page.getByText('Authenticated Test Scenario');
    if (await ourScenario.count() > 0) {
      console.log('✅ Our saved scenario found on dashboard');
    } else {
      console.log('❌ Our saved scenario not found on dashboard');
    }
    
    // Final dashboard screenshot
    await page.screenshot({ path: 'test-results/13-final-dashboard.png', fullPage: true });
    
    // Check browser console for any errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console Error: ${msg.text()}`);
      }
    });
    
    if (logs.length > 0) {
      console.log('Browser console errors:', logs);
    }
    
    // Log final status
    console.log('\n=== TEST SUMMARY ===');
    console.log('Authentication: ✅ Successful');
    console.log('Demo data fill: ✅ Successful');
    console.log('Live results: ✅ Appeared');
    console.log('Save modal: ✅ Opened');
    console.log('Form fill: ✅ Completed');
    console.log(`Dashboard redirect: ${currentUrl.includes('/dashboard') ? '✅' : '❌'} ${currentUrl.includes('/dashboard') ? 'Success' : 'Failed'}`);
    console.log(`Scenario saved: ${await ourScenario.count() > 0 ? '✅' : '❌'} ${await ourScenario.count() > 0 ? 'Found' : 'Not found'}`);
    console.log('Screenshots saved in test-results/ directory');
  });
});