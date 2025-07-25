import { test, expect } from '@playwright/test';

test.describe('Auth Configuration Debug', () => {
  test('Debug NextAuth configuration issue', async ({ page }) => {
    console.log('=== Debugging NextAuth Configuration ===');

    // Check environment variables impact
    console.log('Testing different auth endpoints...');

    // Test the signin API endpoint on different ports
    const endpoints = [
      'http://localhost:3000/api/auth/signin',
      'http://localhost:3003/api/auth/signin',
      'http://localhost:3000/api/auth/callback/credentials',
      'http://localhost:3003/api/auth/callback/credentials'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint);
        console.log(`✓ ${endpoint} → ${response.status()}`);
      } catch (error) {
        console.log(`✗ ${endpoint} → ERROR: ${error}`);
      }
    }

    // Test the login form with better network monitoring
    console.log('\n=== Testing Login Form ===');
    
    // Navigate to login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Fill form
    await page.fill('input[name="email"]', 'demo@helocaccel.com');
    await page.fill('input[name="password"]', 'DemoUser123!');

    // Monitor the exact form submission URL
    page.on('request', request => {
      if (request.method() === 'POST') {
        console.log(`Form submission URL: ${request.url()}`);
        console.log(`Form data:`, request.postData());
      }
    });

    page.on('response', response => {
      if (response.status() >= 300) {
        console.log(`Redirect response: ${response.status()} → ${response.headers()['location']}`);
      }
    });

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log(`Final URL after submission: ${finalUrl}`);

    // Check for specific error patterns
    if (finalUrl.includes('error=CredentialsSignin')) {
      console.log('❌ CredentialsSignin error detected');
    }
    if (finalUrl.includes('error=MissingCSRF')) {
      console.log('❌ MissingCSRF error detected');
    }
  });

  test('Test with corrected NextAuth URL', async ({ page }) => {
    console.log('=== Testing with Environment Variable Override ===');
    
    // Override the environment in browser context if possible
    await page.addInitScript(() => {
      // Mock the correct NEXTAUTH_URL
      (window as any).__NEXTAUTH = {
        url: 'http://localhost:3000'
      };
    });

    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Check what the client thinks the auth URL should be
    const clientConfig = await page.evaluate(() => {
      return {
        location: window.location.href,
        nextAuthUrl: (window as any).__NEXTAUTH?.url,
        env: process?.env?.NEXTAUTH_URL || 'not available'
      };
    });

    console.log('Client configuration:', JSON.stringify(clientConfig, null, 2));

    // Try login again
    await page.fill('input[name="email"]', 'demo@helocaccel.com');
    await page.fill('input[name="password"]', 'DemoUser123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const result = page.url();
    console.log(`Result with override: ${result}`);
  });
});