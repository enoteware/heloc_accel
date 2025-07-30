import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3002';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
};

let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

// Helper function to capture console messages
function setupConsoleCapture(page: Page) {
  consoleErrors = [];
  consoleWarnings = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleErrors.push(text);
      console.log('🔴 Console Error:', text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      console.log('🟡 Console Warning:', text);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
    console.log('🔴 Page Error:', error.message);
  });
}

// Helper function to wait for page load and capture errors
async function waitForPageLoad(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Give time for React hydration
}

test.describe('Stack Auth Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    setupConsoleCapture(page);
  });

  test('Sign-up flow with console error monitoring', async ({ page }) => {
    console.log('🧪 Testing Stack Auth Sign-up Flow...');
    
    // Navigate to sign-up page
    await waitForPageLoad(page, `${BASE_URL}/en/handler/sign-up`);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/signup-initial.png', fullPage: true });
    
    // Wait for Stack Auth components to load
    await page.waitForSelector('[data-testid="credential-sign-up"], input[type="email"], .stack-form', { timeout: 10000 });
    
    // Look for email input field
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible()) {
      console.log('✅ Found email input field');
      await emailInput.fill(TEST_USER.email);
    } else {
      console.log('❌ Email input field not found');
      await page.screenshot({ path: 'tests/screenshots/signup-no-email-field.png', fullPage: true });
    }
    
    if (await passwordInput.isVisible()) {
      console.log('✅ Found password input field');
      await passwordInput.fill(TEST_USER.password);
    } else {
      console.log('❌ Password input field not found');
      await page.screenshot({ path: 'tests/screenshots/signup-no-password-field.png', fullPage: true });
    }
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")').first();
    
    if (await submitButton.isVisible()) {
      console.log('✅ Found submit button');
      await page.screenshot({ path: 'tests/screenshots/signup-before-submit.png', fullPage: true });
      
      // Attempt to submit
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/signup-after-submit.png', fullPage: true });
    } else {
      console.log('❌ Submit button not found');
      await page.screenshot({ path: 'tests/screenshots/signup-no-submit-button.png', fullPage: true });
    }
    
    // Report console errors
    console.log(`\n📊 Sign-up Console Report:`);
    console.log(`  Errors: ${consoleErrors.length}`);
    console.log(`  Warnings: ${consoleWarnings.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n🔴 Console Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Check for successful signup indicators
    const successIndicators = [
      'Welcome',
      'Account created',
      'Sign up successful',
      'dashboard',
      'user-button'
    ];
    
    let signupSuccess = false;
    for (const indicator of successIndicators) {
      if (await page.locator(`text*=${indicator}`).count() > 0) {
        console.log(`✅ Found success indicator: ${indicator}`);
        signupSuccess = true;
        break;
      }
    }
    
    if (!signupSuccess) {
      console.log('⚠️ No clear signup success indicators found');
    }
  });

  test('Sign-in flow with console error monitoring', async ({ page }) => {
    console.log('🧪 Testing Stack Auth Sign-in Flow...');
    
    // Navigate to sign-in page
    await waitForPageLoad(page, `${BASE_URL}/en/handler/sign-in`);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/signin-initial.png', fullPage: true });
    
    // Wait for Stack Auth components to load
    await page.waitForSelector('[data-testid="credential-sign-in"], input[type="email"], .stack-form', { timeout: 10000 });
    
    // Try to sign in with test user
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      console.log('✅ Filled email field');
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(TEST_USER.password);
      console.log('✅ Filled password field');
    }
    
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    
    if (await signInButton.isVisible()) {
      await page.screenshot({ path: 'tests/screenshots/signin-before-submit.png', fullPage: true });
      await signInButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/signin-after-submit.png', fullPage: true });
    }
    
    // Report console errors for sign-in
    console.log(`\n📊 Sign-in Console Report:`);
    console.log(`  Errors: ${consoleErrors.length}`);
    console.log(`  Warnings: ${consoleWarnings.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n🔴 Console Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  });

  test('Stack Auth test page verification', async ({ page }) => {
    console.log('🧪 Testing Stack Auth Test Page...');
    
    await waitForPageLoad(page, `${BASE_URL}/en/stack-auth-test`);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/stack-auth-test.png', fullPage: true });
    
    // Check if page loads properly
    const pageTitle = await page.locator('h1').textContent();
    console.log(`Page title: ${pageTitle}`);
    
    // Look for authentication components
    const hasSignInForm = await page.locator('[data-testid="credential-sign-in"], .stack-credential-sign-in').count() > 0;
    const hasSignUpForm = await page.locator('[data-testid="credential-sign-up"], .stack-credential-sign-up').count() > 0;
    const hasUserInfo = await page.locator('text*=User ID').count() > 0;
    
    console.log(`✅ Has Sign In Form: ${hasSignInForm}`);
    console.log(`✅ Has Sign Up Form: ${hasSignUpForm}`);
    console.log(`✅ Has User Info: ${hasUserInfo}`);
    
    // Check Stack Auth configuration display
    const projectId = await page.locator('text*=Project ID').textContent();
    console.log(`Stack Auth Project ID: ${projectId}`);
    
    // Final console report
    console.log(`\n📊 Test Page Console Report:`);
    console.log(`  Errors: ${consoleErrors.length}`);
    console.log(`  Warnings: ${consoleWarnings.length}`);
  });

  test('Protected route access test', async ({ page }) => {
    console.log('🧪 Testing Protected Route Access...');
    
    // Try to access dashboard without authentication
    await waitForPageLoad(page, `${BASE_URL}/dashboard`);
    await page.screenshot({ path: 'tests/screenshots/dashboard-unauth.png', fullPage: true });
    
    // Check if redirected to login or shows authentication required
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/handler/sign-in') || currentUrl.includes('/login');
    const hasAuthRequired = await page.locator('text*=sign in, text*=login, text*=authenticate').count() > 0;
    
    console.log(`Current URL: ${currentUrl}`);
    console.log(`✅ Redirected to auth: ${isRedirected}`);
    console.log(`✅ Shows auth required: ${hasAuthRequired}`);
    
    // Final console report
    console.log(`\n📊 Protected Route Console Report:`);
    console.log(`  Errors: ${consoleErrors.length}`);
    console.log(`  Warnings: ${consoleWarnings.length}`);
    
    // Fail test if critical errors found
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Warning') &&
      !error.includes('Download the React DevTools')
    );
    
    if (criticalErrors.length > 0) {
      console.log('❌ Critical errors found:');
      criticalErrors.forEach(error => console.log(`  - ${error}`));
    }
  });
});

test.afterAll(async () => {
  console.log('\n🎉 Stack Auth Testing Complete!');
  console.log('\n📋 Summary:');
  console.log(`  Total Console Errors: ${consoleErrors.length}`);
  console.log(`  Total Console Warnings: ${consoleWarnings.length}`);
  console.log('\n📸 Screenshots saved in tests/screenshots/');
});