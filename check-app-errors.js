const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log('⚠️  WARNING:', text);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ PAGE ERROR:', error.message);
  });
  
  // Listen for request failures
  page.on('requestfailed', request => {
    console.log('❌ REQUEST FAILED:', request.url(), '-', request.failure().errorText);
  });

  console.log('🔍 Checking http://localhost:3000...\n');
  
  try {
    // Go to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded');
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(3000);
    
    // Try to go to calculator
    console.log('\n🔍 Navigating to calculator...');
    await page.goto('http://localhost:3000/calculator', { waitUntil: 'networkidle' });
    console.log('✅ Calculator page loaded');
    
    await page.waitForTimeout(3000);
    
    // Check for Save Scenario button
    const saveButton = await page.$('button:has-text("Save Scenario")');
    if (saveButton) {
      console.log('✅ Save Scenario button found');
    } else {
      console.log('⚠️  Save Scenario button not found (need to calculate first)');
    }
    
    // Try scenarios page
    console.log('\n🔍 Navigating to scenarios...');
    await page.goto('http://localhost:3000/scenarios', { waitUntil: 'networkidle' });
    console.log('✅ Scenarios page loaded');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.log('❌ Navigation error:', error.message);
  }
  
  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ No JavaScript errors found!');
  }
  
  console.log('\nPress Ctrl+C to close the browser...');
  
  // Keep browser open
  await new Promise(() => {});
})();