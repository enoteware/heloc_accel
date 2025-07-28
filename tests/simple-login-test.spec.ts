import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('Test login form submission and network activity', async ({ page }) => {
    // Track network requests and responses
    const networkRequests: any[] = [];
    const networkErrors: any[] = [];
    const consoleMessages: string[] = [];

    // Listen to console messages
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Listen to all network requests
    page.on('request', request => {
      if (request.url().includes('/api/') || request.method() !== 'GET') {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
        console.log(`Request: ${request.method()} ${request.url()}`);
      }
    });

    // Listen to responses
    page.on('response', response => {
      if (response.url().includes('/api/') || response.status() >= 400) {
        console.log(`Response: ${response.status()} ${response.request().method()} ${response.url()}`);
      }
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

    console.log('=== Starting Simple Login Test ===');

    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });

    // Verify we're on the login page
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    await expect(page.locator('text=demo@helocaccel.com')).toBeVisible();

    // Fill in the form
    console.log('Filling login form with demo credentials...');
    await page.fill('input[name="email"]', 'demo@helocaccel.com');
    await page.fill('input[name="password"]', 'DemoUser123!');

    // Take screenshot before submission
    await page.screenshot({ path: 'test-results/form-filled.png', fullPage: true });

    // Click submit and wait for network activity
    console.log('Submitting form...');
    const [response] = await Promise.all([
      page.waitForResponse(response => {
        console.log(`Waiting for response: ${response.status()} ${response.url()}`);
        return response.url().includes('/api/auth/') || response.status() >= 300;
      }, { timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    console.log(`Got response: ${response.status()} ${response.url()}`);

    // Wait for potential redirect or error message
    await page.waitForTimeout(3000);

    // Take screenshot after submission
    await page.screenshot({ path: 'test-results/after-submit.png', fullPage: true });

    // Check final URL
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    // Check for error messages
    const errorMessage = await page.locator('.text-red-600').textContent().catch(() => null);
    if (errorMessage) {
      console.log(`Error message: ${errorMessage}`);
    }

    // Log network activity
    console.log('=== Network Requests ===');
    networkRequests.forEach(req => {
      console.log(`${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`  Body: ${req.postData}`);
      }
    });

    console.log('=== Network Errors ===');
    networkErrors.forEach(error => {
      console.log(`${error.method} ${error.url} - ${error.failure}`);
    });

    console.log('=== Console Messages ===');
    consoleMessages.forEach(msg => {
      console.log(msg);
    });

    // Determine if login was successful
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
    } else if (finalUrl.includes('/login')) {
      console.log('❌ Login failed - remained on login page');
      if (errorMessage) {
        console.log(`Error: ${errorMessage}`);
      }
    } else {
      console.log(`⚠️ Unexpected redirect to: ${finalUrl}`);
    }
  });

  test('Test auth API endpoint directly', async ({ request }) => {
    console.log('=== Testing Auth API Directly ===');

    // Test the credentials login endpoint
    try {
      const response = await request.post('http://localhost:3000/api/auth/callback/credentials', {
        form: {
          email: 'demo@helocaccel.com',
          password: 'DemoUser123!'
        }
      });
      
      console.log(`Auth API Response: ${response.status()}`);
      console.log(`Response Headers:`, JSON.stringify(Object.fromEntries(Object.entries(response.headers())), null, 2));
      
      const responseText = await response.text();
      console.log(`Response Body: ${responseText}`);
      
    } catch (error) {
      console.log(`Auth API Error: ${error}`);
    }

    // Test NextAuth signin endpoint
    try {
      const signinResponse = await request.get('http://localhost:3000/api/auth/signin');
      console.log(`Signin page status: ${signinResponse.status()}`);
      
    } catch (error) {
      console.log(`Signin endpoint error: ${error}`);
    }
  });
});