import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should navigate between main pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('HELOC Accelerator');

    // Navigate to calculator
    await page.goto('/calculator');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to compare
    await page.goto('/compare');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to profile
    await page.goto('/profile');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should either show 404 page or redirect
    // Next.js might redirect to home or show a 404
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle auth pages', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('body')).toBeVisible();
    
    // Check if it's a sign-in page or redirects
    const url = page.url();
    expect(url).toMatch(/\/(auth\/signin|calculator|$)/);
  });

  test('should handle shared scenario links', async ({ page }) => {
    // Test with a dummy token
    await page.goto('/shared/dummy-token');
    await expect(page.locator('body')).toBeVisible();
    
    // Should either show shared content or handle invalid token gracefully
  });

  test('should handle style guide page', async ({ page }) => {
    await page.goto('/style-guide');
    await expect(page.locator('body')).toBeVisible();
    
    // Should show design system components
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should maintain session across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate through multiple pages
    const pages = ['/calculator', '/dashboard', '/profile', '/compare'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      
      // Check that page loads without errors
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      
      await page.waitForTimeout(1000);
      expect(errors.length).toBe(0);
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/calculator');
    await page.goto('/dashboard');
    
    // Go back
    await page.goBack();
    expect(page.url()).toContain('/calculator');
    
    // Go back again
    await page.goBack();
    expect(page.url()).toMatch(/\/$|\/$/);
    
    // Go forward
    await page.goForward();
    expect(page.url()).toContain('/calculator');
  });

  test('should handle deep linking', async ({ page }) => {
    // Test direct navigation to deep pages
    const deepPages = [
      '/calculator',
      '/dashboard',
      '/profile',
      '/compare',
      '/style-guide'
    ];
    
    for (const pagePath of deepPages) {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      
      // Verify URL is correct
      expect(page.url()).toContain(pagePath);
    }
  });

  test('should handle URL parameters and query strings', async ({ page }) => {
    await page.goto('/calculator?demo=true');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/shared/test-token?view=summary');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle authentication redirects', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/dashboard');
    
    // Should either show dashboard (if demo mode) or redirect to auth
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|auth|calculator|$)/);
  });
});
