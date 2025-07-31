import { test, expect } from '@playwright/test';

test.describe('Stack Auth Login/Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3001');
  });

  test('should navigate to sign-in page and display Stack Auth form', async ({ page }) => {
    // Click the Sign In button in the navigation
    await page.click('text=Sign In');
    
    // Wait for navigation to complete
    await page.waitForURL('**/handler/sign-in**');
    
    // Verify we're on the Stack Auth sign-in page
    expect(page.url()).toContain('/handler/sign-in');
    
    // Check for Stack Auth components
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
    
    // Check for email and password fields (Stack Auth uses specific selectors)
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for sign-in button
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    
    // Check for sign-up link
    await expect(page.locator('a:has-text("Sign up")')).toBeVisible();
  });

  test('should login with demo account and navigate to calculator', async ({ page }) => {
    // Navigate to sign-in
    await page.click('text=Sign In');
    await page.waitForURL('**/handler/sign-in**');
    
    // Fill in demo credentials
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo123');
    
    // Click sign in button
    await page.click('button:has-text("Sign in")');
    
    // Wait for navigation to calculator page
    await page.waitForURL('**/calculator**', { timeout: 10000 });
    
    // Verify we're logged in by checking for user menu or logout option
    await expect(page.locator('[aria-label="User menu"]')).toBeVisible({ timeout: 5000 });
    
    // Verify we're on the calculator page
    expect(page.url()).toContain('/calculator');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to sign-in
    await page.click('text=Sign In');
    await page.waitForURL('**/handler/sign-in**');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Click sign in button
    await page.click('button:has-text("Sign in")');
    
    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Sign In');
    await page.waitForURL('**/handler/sign-in**');
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/calculator**');
    
    // Click user menu
    await page.click('[aria-label="User menu"]');
    
    // Click Sign Out
    await page.click('text=Sign Out');
    
    // Wait for sign-out to complete
    await page.waitForURL('**/sign-out**');
    
    // Should redirect to homepage or show sign-in button again
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain session across page navigation', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.waitForURL('**/handler/sign-in**');
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/calculator**');
    
    // Navigate to different pages
    await page.click('text=Dashboard');
    await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
    
    await page.click('text=Scenarios');
    await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
    
    // Verify user is still logged in
    expect(await page.locator('text=Sign In').count()).toBe(0);
  });
});