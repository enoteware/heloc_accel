import { test, expect } from '@playwright/test';

test.describe('Stack Auth Debug', () => {
  test('debug navigation and auth', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Start from homepage
    await page.goto('http://localhost:3001/en');
    await page.waitForLoadState('networkidle');
    
    // Check if we're authenticated already
    const userMenuExists = await page.locator('[aria-label="User menu"]').isVisible().catch(() => false);
    console.log('User menu visible (already logged in):', userMenuExists);
    
    if (userMenuExists) {
      // Log out first
      await page.click('[aria-label="User menu"]');
      await page.click('text=Sign Out');
      await page.waitForLoadState('networkidle');
      console.log('Logged out, current URL:', page.url());
    }
    
    // Now try to navigate to sign-in
    console.log('\n--- Testing Sign In Navigation ---');
    
    // Method 1: Direct navigation
    console.log('Method 1: Direct navigation to /en/handler/sign-in');
    await page.goto('http://localhost:3001/en/handler/sign-in');
    await page.waitForLoadState('networkidle');
    console.log('Direct navigation URL:', page.url());
    
    // Check if Stack Auth form is present
    const hasEmailInput = await page.locator('input[type="email"]').isVisible().catch(() => false);
    const hasPasswordInput = await page.locator('input[type="password"]').isVisible().catch(() => false);
    console.log('Stack Auth form present:', hasEmailInput && hasPasswordInput);
    
    if (hasEmailInput && hasPasswordInput) {
      // Try to login
      console.log('\n--- Testing Login ---');
      await page.fill('input[type="email"]', 'demo@example.com');
      await page.fill('input[type="password"]', 'demo123');
      
      // Find the sign-in button
      const signInButton = page.locator('button').filter({ hasText: /sign in/i }).first();
      await signInButton.click();
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      console.log('After login URL:', page.url());
      
      // Check for errors
      const errorText = await page.locator('text=/Invalid|incorrect|failed|error/i').textContent().catch(() => null);
      if (errorText) {
        console.log('Login error:', errorText);
      }
      
      // Check if we're logged in
      const loggedIn = await page.locator('[aria-label="User menu"]').isVisible().catch(() => false);
      console.log('Logged in successfully:', loggedIn);
    }
    
    // Go back to homepage to test link click
    await page.goto('http://localhost:3001/en');
    await page.waitForLoadState('networkidle');
    
    // Method 2: Click Sign In link
    console.log('\n--- Testing Sign In Link Click ---');
    const signInLink = page.locator('a:has-text("Sign In")').first();
    const href = await signInLink.getAttribute('href');
    console.log('Sign In link href:', href);
    
    // Try clicking with force
    await signInLink.click({ force: true });
    await page.waitForTimeout(2000); // Wait 2 seconds
    console.log('After link click URL:', page.url());
    
    // If still on homepage, try JavaScript navigation
    if (page.url().endsWith('/en')) {
      console.log('\n--- Trying JavaScript navigation ---');
      await page.evaluate(() => {
        window.location.href = '/en/handler/sign-in';
      });
      await page.waitForLoadState('networkidle');
      console.log('After JS navigation URL:', page.url());
    }
  });
});