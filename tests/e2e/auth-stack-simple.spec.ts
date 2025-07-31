import { test, expect } from '@playwright/test';

test.describe('Stack Auth Basic Test', () => {
  test('should navigate to sign-in page when clicking Sign In', async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3001/en');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Debug: log current URL
    console.log('Current URL:', page.url());
    
    // Find and click the Sign In link
    const signInLink = page.locator('a:has-text("Sign In")').first();
    await expect(signInLink).toBeVisible();
    
    // Get the href attribute
    const href = await signInLink.getAttribute('href');
    console.log('Sign In link href:', href);
    
    // Click the link
    await signInLink.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Log final URL
    console.log('After click URL:', page.url());
    
    // Check if we're on the sign-in page
    expect(page.url()).toContain('handler/sign-in');
  });

  test('manual navigation to sign-in page', async ({ page }) => {
    // Navigate directly to the sign-in page
    await page.goto('http://localhost:3001/en/handler/sign-in');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if Stack Auth components are present
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Wait for inputs to be visible
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    
    // Try to login with demo account
    await emailInput.fill('demo@example.com');
    await passwordInput.fill('demo123');
    
    // Find and click the sign-in button
    const signInButton = page.locator('button').filter({ hasText: /sign in/i }).first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Wait for navigation or error
    await page.waitForLoadState('networkidle');
    
    // Log where we ended up
    console.log('After login URL:', page.url());
    
    // Check if we navigated to calculator or got an error
    const currentUrl = page.url();
    const hasError = await page.locator('text=/Invalid|Error|Failed/i').isVisible().catch(() => false);
    
    if (hasError) {
      console.log('Login failed with error');
    } else if (currentUrl.includes('calculator')) {
      console.log('Login successful, redirected to calculator');
    } else {
      console.log('Unexpected state after login');
    }
  });
});