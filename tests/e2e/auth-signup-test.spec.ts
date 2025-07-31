import { test, expect } from '@playwright/test';

test.describe('Stack Auth Sign Up Test', () => {
  test('sign up new user and login', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('http://localhost:3001/en/handler/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Click Sign up link
    await page.click('text=Sign up');
    await page.waitForLoadState('networkidle');
    
    console.log('Current URL after clicking sign up:', page.url());
    
    // Fill in sign up form
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('Creating test user:', testEmail);
    
    // Fill email
    await page.fill('input[type="email"]', testEmail);
    
    // Fill password (there might be two password fields for confirmation)
    const passwordInputs = await page.locator('input[type="password"]').all();
    console.log('Found password inputs:', passwordInputs.length);
    
    for (const input of passwordInputs) {
      await input.fill(testPassword);
    }
    
    // Click sign up button
    await page.click('button:has-text("Sign up")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('After sign up URL:', currentUrl);
    
    if (currentUrl.includes('calculator')) {
      console.log('✅ Sign up successful! Auto-logged in and redirected to calculator');
      
      // Verify user is logged in
      const userMenuVisible = await page.locator('[aria-label="User menu"]').isVisible().catch(() => false);
      console.log('User menu visible:', userMenuVisible);
      
      // Test logout and login again
      if (userMenuVisible) {
        await page.click('[aria-label="User menu"]');
        await page.click('text=Sign Out');
        await page.waitForTimeout(2000);
        
        // Now try to login with the new account
        await page.click('text=Sign In');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button:has-text("Sign")');
        
        await page.waitForTimeout(3000);
        
        if (page.url().includes('calculator')) {
          console.log('✅ Login with new account successful!');
        } else {
          console.log('❌ Login with new account failed');
        }
      }
    } else {
      // Check for errors
      const errorText = await page.locator('text=/error|invalid|already/i').textContent().catch(() => null);
      if (errorText) {
        console.log('Sign up error:', errorText);
      }
      
      // Take screenshot
      await page.screenshot({ path: 'signup-result.png' });
    }
  });
});