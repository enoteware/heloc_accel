const { chromium } = require('playwright');

(async () => {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting final site check...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Track network requests
    const requests = [];
    page.on('response', response => {
      requests.push({
        url: response.url(),
        status: response.status(),
        ok: response.ok()
      });
    });
    
    console.log('🔍 Navigating to https://heloc.noteware.dev...');
    await page.goto('https://heloc.noteware.dev', { 
      timeout: 20000,
      waitUntil: 'networkidle'
    });
    
    console.log(`🌐 Final URL: ${page.url()}`);
    console.log(`📝 Title: "${await page.title()}"`);
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check for key elements
    const h1Text = await page.textContent('h1').catch(() => 'Not found');
    console.log(`📋 Main heading: "${h1Text}"`);
    
    const buttonText = await page.textContent('button').catch(() => 'Not found');
    console.log(`🔘 Button text: "${buttonText}"`);
    
    // Check for specific content
    const pageContent = await page.textContent('body');
    const hasContent = {
      heloc: pageContent.includes('HELOC'),
      calculator: pageContent.includes('Calculator'),
      mortgage: pageContent.includes('mortgage'),
      getStarted: pageContent.includes('Get Started')
    };
    
    console.log('📄 Content check:');
    Object.entries(hasContent).forEach(([key, found]) => {
      console.log(`   ${found ? '✅' : '❌'} ${key}: ${found ? 'Found' : 'Missing'}`);
    });
    
    // Check failed requests
    const failedRequests = requests.filter(req => !req.ok);
    console.log(`\n🌐 Network requests: ${requests.length} total`);
    
    if (failedRequests.length > 0) {
      console.log(`❌ Failed requests (${failedRequests.length}):`);
      failedRequests.slice(0, 5).forEach(req => {
        console.log(`   ${req.status} - ${req.url}`);
      });
    } else {
      console.log('✅ All network requests successful');
    }
    
    // Check for JavaScript errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log(`❌ JavaScript errors (${consoleErrors.length}):`);
      consoleErrors.slice(0, 3).forEach(err => console.log(`   ${err}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // Try clicking the button
    try {
      await page.click('button');
      console.log('✅ Button is clickable');
    } catch (e) {
      console.log('❌ Button not clickable:', e.message);
    }
    
    console.log('\n🎯 Overall assessment:');
    if (hasContent.heloc && hasContent.calculator && failedRequests.length === 0) {
      console.log('✅ SITE IS WORKING CORRECTLY!');
    } else {
      console.log('⚠️  Site has some issues but is loading');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
})();