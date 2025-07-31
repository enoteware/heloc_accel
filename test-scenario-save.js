const { chromium } = require('playwright');

async function testScenarioSave() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. First checking login status...');
    await page.goto('http://localhost:3000/en/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step0-login-page.png' });
    
    // Try to login with demo account
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 })) {
      await emailInput.fill('demo@example.com');
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('demo123');
        const loginButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
        if (await loginButton.isVisible()) {
          await loginButton.click();
          await page.waitForTimeout(2000);
          console.log('   ✓ Login attempted');
        }
      }
    }
    
    console.log('2. Navigating to calculator page...');
    await page.goto('http://localhost:3000/en/calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for page to fully load
    await page.screenshot({ path: 'step1-calculator-page.png' });
    
    console.log('3. Looking for Fill Demo Data button...');
    const fillDemoButton = await page.locator('button:has-text("Fill Demo Data"), button:has-text("fill demo data")').first();
    if (await fillDemoButton.isVisible({ timeout: 2000 })) {
      await fillDemoButton.click();
      console.log('   ✓ Demo data filled');
      await page.waitForTimeout(1000);
    } else {
      console.log('   ⚠ Fill Demo Data button not found - continuing with manual form fill');
      // Try to fill basic required fields manually
      const homeValueInput = await page.locator('input[name="homeValue"], input[placeholder*="home value"]').first();
      if (await homeValueInput.isVisible({ timeout: 2000 })) {
        await homeValueInput.fill('400000');
        const mortgageBalanceInput = await page.locator('input[name="mortgageBalance"], input[placeholder*="mortgage balance"]').first();
        if (await mortgageBalanceInput.isVisible()) {
          await mortgageBalanceInput.fill('300000');
        }
      }
    }
    
    console.log('4. Checking if results are already showing (live calculation)...');
    await page.screenshot({ path: 'step2-before-calculate.png' });
    
    // Check if results are already showing (live calculation mode)
    const resultsVisible = await page.locator('[data-testid="calculation-results"], .results').first().isVisible({ timeout: 2000 }) || 
      await page.locator('text=Potential Savings').first().isVisible({ timeout: 2000 });
    if (resultsVisible) {
      console.log('   ✓ Results are already visible (live calculation mode)');
    } else {
      console.log('   ⚠ No results visible, looking for calculate button...');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      const calculateButton = await page.locator('button:has-text("Calculate"), button[type="submit"], button:has-text("calculate")').first();
      if (await calculateButton.isVisible({ timeout: 3000 })) {
        await calculateButton.click();
        console.log('   ✓ Calculate button clicked');
        await page.waitForSelector('[data-testid="calculation-results"], .results', { timeout: 10000 });
      } else {
        console.log('   ⚠ No calculate button found either');
      }
    }
    
    console.log('5. Looking for Save This Scenario button...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: 'step3-looking-for-save.png' });
    
    // Try multiple selectors for the save button
    const saveButton = await page.locator('button:has-text("Save This Scenario"), button:has-text("Save Scenario"), button:has-text("save")').first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      console.log('   ✓ Save button clicked');
      
      console.log('6. Modal opened, filling form...');
      await page.waitForTimeout(2000); // Wait for modal to appear
      await page.screenshot({ path: 'step4-after-save-click.png' });
      
      // Clear and fill the scenario name field
      const nameInput = await page.locator('input[placeholder*="Current Home"], input[placeholder*="HELOC Strategy"]').first();
      if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.clear();
        await nameInput.fill('Test Scenario from Debug');
        console.log('   ✓ Name field filled');
      } else {
        console.log('   ⚠ Name input not found, trying alternative selector');
        const altNameInput = await page.locator('input').first();
        if (await altNameInput.isVisible()) {
          await altNameInput.clear();
          await altNameInput.fill('Test Scenario from Debug');
          console.log('   ✓ Name field filled (alternative)');
        }
      }
      
      // Fill the description field
      const descInput = await page.locator('textarea[placeholder*="Add notes about this scenario"]').first();
      if (await descInput.isVisible({ timeout: 2000 })) {
        await descInput.fill('Testing scenario save functionality');
        console.log('   ✓ Description field filled');
      } else {
        console.log('   ⚠ Description input not found, trying alternative');
        const altDescInput = await page.locator('textarea').first();
        if (await altDescInput.isVisible()) {
          await altDescInput.fill('Testing scenario save functionality');
          console.log('   ✓ Description field filled (alternative)');
        }
      }
      
      console.log('7. Clicking Save Scenario button...');
      const modalSaveButton = await page.locator('button:has-text("Save Scenario")').first();
      if (await modalSaveButton.isVisible({ timeout: 3000 })) {
        await modalSaveButton.click();
        console.log('   ✓ Save Scenario button clicked');
      } else {
        console.log('   ⚠ Save Scenario button not found, trying alternative');
        const altSaveButton = await page.locator('button:has-text("Save")').last();
        if (await altSaveButton.isVisible()) {
          await altSaveButton.click();
          console.log('   ✓ Save button clicked (alternative)');
        }
      }
      
      console.log('8. Waiting for save response...');
      await page.waitForTimeout(3000);
      
      // Check for any error messages
      const errorElement = await page.locator('.error, [data-testid="error"], .text-red-500').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('   ⚠ Error found:', errorText);
        await page.screenshot({ path: 'save-error.png' });
      } else {
        console.log('   ✓ No visible errors');
      }
      
    } else {
      console.log('   ⚠ Save This Scenario button not found');
      await page.screenshot({ path: 'no-save-button.png' });
    }
    
    console.log('9. First checking debug logs...');
    await page.goto('http://localhost:3000/en/debug-test');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'debug-page.png' });
    
    const debugSection = await page.locator('pre, code, .debug-log, textarea').first();
    if (await debugSection.isVisible({ timeout: 3000 })) {
      const debugText = await debugSection.textContent();
      console.log('   Debug logs found:');
      console.log(debugText.slice(-1000)); // Show last 1000 chars
    } else {
      console.log('   ⚠ No debug logs visible');
    }
    
    console.log('10. Navigating to dashboard...');
    await page.goto('http://localhost:3000/en/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'dashboard-attempt.png' });
    
    // Check if we got a 404, try demo dashboard link
    const demoButton = await page.locator('button:has-text("View Demo Dashboard"), a:has-text("View Demo Dashboard")').first();
    if (await demoButton.isVisible({ timeout: 2000 })) {
      console.log('   Found demo dashboard button, clicking...');
      await demoButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'demo-dashboard.png' });
    }
    
    console.log('11. Checking for saved scenario...');
    const scenarioText = await page.getByText('Test Scenario from Debug');
    if (await scenarioText.isVisible({ timeout: 3000 })) {
      console.log('   ✓ Scenario found on dashboard');
    } else {
      console.log('   ⚠ Scenario not found on dashboard');
      // Check for any scenarios at all
      const anyScenario = await page.locator('[data-testid="scenario-card"], .scenario-item, .card').first();
      if (await anyScenario.isVisible()) {
        console.log('   Found other scenarios on dashboard');
      } else {
        console.log('   No scenarios found at all');
      }
    }
    
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
}

testScenarioSave().catch(console.error);