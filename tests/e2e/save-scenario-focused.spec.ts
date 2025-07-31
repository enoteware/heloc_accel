import { test, expect } from '@playwright/test';

test.describe('Save Scenario Focused Test', () => {
  test('Test save scenario with results already showing', async ({ page }) => {
    // Navigate directly to calculator after login
    console.log('Step 1: Navigating to calculator...');
    await page.goto('http://localhost:3000/en/handler/sign-in');
    
    // Login
    await page.fill('input[name="email"]', 'enoteware@gmail.com');
    await page.fill('input[name="password"]', 'demo123!!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to calculator
    await page.waitForURL(/.*\/calculator/, { timeout: 10000 });
    console.log('✅ Successfully redirected to calculator');
    
    // Fill demo data
    await page.getByText('Fill Demo Data').click();
    await page.waitForTimeout(2000);
    console.log('✅ Demo data filled');
    
    // Wait for any results to show up - be more flexible about selectors
    await page.waitForTimeout(3000); // Give time for calculations
    
    // Take screenshot showing current state
    await page.screenshot({ path: 'test-results/save-test-ready-state.png', fullPage: true });
    
    // Look for "Save This Scenario" button with various possible selectors
    console.log('Step 2: Looking for Save This Scenario button...');
    
    const saveButtonSelectors = [
      'text="Save This Scenario"',
      'button:has-text("Save This Scenario")',
      '[data-testid="save-scenario"]',
      'button:has-text("Save")',
      '.save-scenario-btn',
      'button[class*="save"]'
    ];
    
    let saveButton = null;
    for (const selector of saveButtonSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          saveButton = element.first();
          console.log(`✅ Found save button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!saveButton) {
      console.log('❌ Save button not found. Let me check what buttons are available...');
      
      // Look for all buttons on the page
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on page`);
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i}: "${buttonText}"`);
      }
      
      await page.screenshot({ path: 'test-results/save-test-no-save-button.png', fullPage: true });
      throw new Error('Save This Scenario button not found');
    }
    
    // Click the save button
    console.log('Step 3: Clicking Save This Scenario button...');
    await saveButton.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/save-test-after-click.png', fullPage: true });
    
    // Look for modal or form to enter scenario details
    const modalSelectors = [
      '.modal',
      '[role="dialog"]',
      '.save-scenario-modal',
      '[data-testid="save-modal"]',
      '.popup',
      '.overlay'
    ];
    
    let modal = null;
    for (const selector of modalSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          modal = element.first();
          console.log(`✅ Found modal with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (modal) {
      console.log('Step 4: Modal appeared, filling scenario details...');
      
      // Try different input selectors for name
      const nameInputSelectors = [
        'input[name="name"]',
        'input[placeholder*="name"]',
        'input[placeholder*="Name"]',
        'input[type="text"]:first-of-type'
      ];
      
      let nameInput = null;
      for (const selector of nameInputSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            nameInput = element.first();
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (nameInput) {
        await nameInput.fill('Authenticated Test Scenario');
        console.log('✅ Filled scenario name');
      }
      
      // Try different textarea selectors for description
      const descriptionSelectors = [
        'textarea[name="description"]',
        'textarea[placeholder*="description"]',
        'textarea'
      ];
      
      let descriptionInput = null;
      for (const selector of descriptionSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            descriptionInput = element.first();
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (descriptionInput) {
        await descriptionInput.fill('Testing save with proper auth');
        console.log('✅ Filled scenario description');
      }
      
      await page.screenshot({ path: 'test-results/save-test-modal-filled.png', fullPage: true });
      
      // Look for save button in modal
      const modalSaveSelectors = [
        'button:has-text("Save")',
        'button[type="submit"]',
        '.modal button:has-text("Save")',
        '[role="dialog"] button:has-text("Save")'
      ];
      
      let modalSaveButton = null;
      for (const selector of modalSaveSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            modalSaveButton = element.first();
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (modalSaveButton) {
        console.log('Step 5: Clicking Save in modal...');
        await modalSaveButton.click();
        
        // Wait for save operation
        await page.waitForTimeout(3000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log('Current URL after save:', currentUrl);
        
        await page.screenshot({ path: 'test-results/save-test-after-save.png', fullPage: true });
        
        if (currentUrl.includes('/dashboard')) {
          console.log('✅ Redirected to dashboard');
          
          // Look for our scenario
          const scenarioText = page.getByText('Authenticated Test Scenario');
          if (await scenarioText.count() > 0) {
            console.log('✅ Scenario found on dashboard');
          } else {
            console.log('❌ Scenario not found on dashboard');
          }
          
        } else {
          console.log('❌ Not redirected to dashboard');
          // Try navigating manually
          await page.goto('http://localhost:3000/en/dashboard');
          await page.waitForLoadState('networkidle');
          
          await page.screenshot({ path: 'test-results/save-test-manual-dashboard.png', fullPage: true });
          
          const scenarioText = page.getByText('Authenticated Test Scenario');
          if (await scenarioText.count() > 0) {
            console.log('✅ Scenario found on manually navigated dashboard');
          } else {
            console.log('❌ Scenario not found on manually navigated dashboard');
          }
        }
      } else {
        console.log('❌ Modal save button not found');
        await page.screenshot({ path: 'test-results/save-test-no-modal-save-btn.png', fullPage: true });
      }
      
    } else {
      console.log('❌ Modal did not appear');
      await page.screenshot({ path: 'test-results/save-test-no-modal.png', fullPage: true });
    }
    
    console.log('\n=== SAVE TEST COMPLETE ===');
  });
});