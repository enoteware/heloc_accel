import { test, expect } from '@playwright/test';

test.describe('Stack Auth with Working Account', () => {
  test('login with enoteware@gmail.com', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('http://localhost:3001/en/handler/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Fill in working credentials
    await page.fill('input[type="email"]', 'enoteware@gmail.com');
    await page.fill('input[type="password"]', 'demo123!!');
    
    // Click sign in
    await page.click('button:has-text("Sign")');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Check result
    const url = page.url();
    console.log('After login URL:', url);
    
    if (url.includes('calculator')) {
      console.log('✅ Login successful!');
      
      // Verify user menu is visible
      await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
      
      // Test navigation
      console.log('Testing navigation...');
      await page.click('text=Dashboard');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('dashboard');
      
      await page.click('text=Scenarios');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('scenarios');
      
      // Test logout
      console.log('Testing logout...');
      await page.click('[aria-label="User menu"]');
      await page.click('text=Sign Out');
      await page.waitForTimeout(2000);
      
      // Should redirect and show sign in button
      await expect(page.locator('text=Sign In').first()).toBeVisible();
      console.log('✅ Full auth flow working perfectly!');
      
      // Test result
      expect(true).toBe(true);
    } else {
      throw new Error('Login failed');
    }
  });
});