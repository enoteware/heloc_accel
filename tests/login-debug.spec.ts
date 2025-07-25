import { test, expect, type Page } from '@playwright/test';

test.describe('Login Authentication Debug', () => {
  let consoleMessages: string[] = [];
  let networkErrors: any[] = [];
  let networkResponses: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset arrays for each test
    consoleMessages = [];
    networkErrors = [];
    networkResponses = [];

    // Listen to console logs
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
      consoleMessages.push(`ERROR: ${error.message}`);
    });

    // Listen to request failures
    page.on('requestfailed', request => {
      const failure = {
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText || 'Unknown error'
      };
      networkErrors.push(failure);
      console.log(`Request failed: ${request.method()} ${request.url()} - ${failure.failure}`);
    });

    // Listen to all responses
    page.on('response', response => {
      if (response.url().includes('/api/') || response.status() >= 400) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          method: response.request().method(),
          headers: Object.fromEntries(response.headers())
        };
        networkResponses.push(responseData);
        console.log(`Response: ${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });
  });

  test('Debug login with demo credentials', async ({ page }) => {
    // Navigate to the app - try both possible paths
    console.log('=== Starting login debug test ===');
    
    // First try the root path
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Take a screenshot of the initial page
    await page.screenshot({ path: 'test-results/01-initial-page.png', fullPage: true });
    
    // Check if we're redirected or need to navigate to /heloc
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/heloc')) {
      console.log('Navigating to /heloc path...');
      await page.goto('http://localhost:3000/heloc', { waitUntil: 'networkidle' });
      await page.screenshot({ path: 'test-results/02-heloc-page.png', fullPage: true });
    }
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/heloc/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/03-login-page.png', fullPage: true });
    
    // Verify we're on the login page
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Check if the login form is present
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('Login form elements found');
    
    // Fill in the demo credentials
    console.log('Filling in demo credentials...');
    await emailInput.fill('demo@helocaccel.com');
    await passwordInput.fill('DemoUser123!');
    
    await page.screenshot({ path: 'test-results/04-credentials-filled.png', fullPage: true });
    
    // Clear previous network monitoring for the login attempt
    networkErrors = [];
    networkResponses = [];
    
    // Submit the form
    console.log('Submitting login form...');
    await submitButton.click();
    
    // Wait a bit for the request to process
    await page.waitForTimeout(2000);
    
    // Take screenshot after submission
    await page.screenshot({ path: 'test-results/05-after-submission.png', fullPage: true });
    
    // Check the current URL
    const urlAfterLogin = page.url();
    console.log(`URL after login: ${urlAfterLogin}`);
    
    // Check for error messages on the page
    const errorMessages = await page.locator('.text-red-600, .bg-red-50, [role="alert"]').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    }
    
    // Wait for any additional network requests
    await page.waitForTimeout(3000);
    
    // Log all the collected data
    console.log('=== NETWORK RESPONSES ===');
    networkResponses.forEach(response => {
      console.log(`${response.status} ${response.method} ${response.url}`);
      if (response.status >= 400) {
        console.log(`  Status Text: ${response.statusText}`);
        console.log(`  Headers:`, JSON.stringify(response.headers, null, 2));
      }
    });
    
    console.log('=== NETWORK ERRORS ===');
    networkErrors.forEach(error => {
      console.log(`${error.method} ${error.url} - ${error.failure}`);
    });
    
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => {
      console.log(msg);
    });
    
    // Try to get response body for auth-related requests
    console.log('=== CHECKING AUTH ENDPOINT RESPONSES ===');
    
    const authRequests = await page.evaluate(() => {
      // This won't work as we can't access previous requests, so let's try a different approach
      return 'Unable to retrieve request bodies from previous requests';
    });
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/06-final-state.png', fullPage: true });
    
    // Check if we successfully logged in (should be redirected to dashboard)
    if (urlAfterLogin.includes('/dashboard')) {
      console.log('✅ Login appears successful - redirected to dashboard');
    } else if (urlAfterLogin.includes('/login')) {
      console.log('❌ Login failed - still on login page');
    } else {
      console.log(`⚠️  Unexpected redirect to: ${urlAfterLogin}`);
    }
  });

  test('Test auth API endpoints directly', async ({ page }) => {
    console.log('=== Testing Auth API Endpoints Directly ===');
    
    // Test the NextAuth signin endpoint
    const response = await page.request.post('http://localhost:3000/heloc/api/auth/signin/credentials', {
      data: {
        email: 'demo@helocaccel.com',
        password: 'DemoUser123!',
        callbackUrl: 'http://localhost:3000/heloc/dashboard'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    console.log(`Auth API Response Status: ${response.status()}`);
    console.log(`Auth API Response Headers:`, Object.fromEntries(response.headers()));
    
    try {
      const responseText = await response.text();
      console.log(`Auth API Response Body:`, responseText);
    } catch (error) {
      console.log(`Could not read response body: ${error}`);
    }
    
    // Test the simple login endpoint if it exists
    try {
      const simpleLoginResponse = await page.request.post('http://localhost:3000/heloc/api/auth/simple-login', {
        data: {
          email: 'demo@helocaccel.com',
          password: 'DemoUser123!'
        }
      });
      
      console.log(`Simple Login API Status: ${simpleLoginResponse.status()}`);
      const simpleLoginText = await simpleLoginResponse.text();
      console.log(`Simple Login API Response:`, simpleLoginText);
    } catch (error) {
      console.log(`Simple login endpoint error: ${error}`);
    }
  });

  test('Test authentication state and session', async ({ page }) => {
    console.log('=== Testing Authentication State ===');
    
    // Go to the app
    await page.goto('http://localhost:3000/heloc', { waitUntil: 'networkidle' });
    
    // Check authentication state before login  
    const preLoginAuthState = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
      };
    });
    
    console.log('Pre-login state:', JSON.stringify(preLoginAuthState, null, 2));
    
    // Navigate to login
    await page.goto('http://localhost:3000/heloc/login', { waitUntil: 'networkidle' });
    
    // Fill and submit form
    await page.fill('input[name="email"]', 'demo@helocaccel.com');
    await page.fill('input[name="password"]', 'DemoUser123!');
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    // Check authentication state after login attempt
    const postLoginAuthState = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie,
        currentUrl: window.location.href
      };
    });
    
    console.log('Post-login state:', JSON.stringify(postLoginAuthState, null, 2));
    
    // Try to access a protected route
    await page.goto('http://localhost:3000/heloc/dashboard', { waitUntil: 'networkidle' });
    
    const dashboardUrl = page.url();
    console.log(`Dashboard access result: ${dashboardUrl}`);
    
    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Successfully accessed protected dashboard');
    } else if (dashboardUrl.includes('/login')) {
      console.log('❌ Redirected back to login - authentication failed');
    } else {
      console.log(`⚠️  Unexpected redirect: ${dashboardUrl}`);
    }
  });
});