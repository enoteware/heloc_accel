const { chromium } = require('playwright');

(async () => {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    console.log('📄 Created new page');
    
    console.log('🔍 Navigating to https://heloc.noteware.dev...');
    const response = await page.goto('https://heloc.noteware.dev', { 
      timeout: 15000,
      waitUntil: 'domcontentloaded'
    });
    
    console.log(`✅ Response status: ${response.status()}`);
    console.log(`🌐 Final URL: ${page.url()}`);
    
    // Get basic page info
    const title = await page.title();
    console.log(`📝 Title: "${title}"`);
    
    // Get page content
    const content = await page.content();
    console.log(`📄 HTML length: ${content.length} chars`);
    
    // Check for specific content
    if (content.includes('HELOC')) {
      console.log('✅ HELOC content found');
    } else {
      console.log('❌ HELOC content NOT found');
    }
    
    if (content.includes('404')) {
      console.log('❌ 404 error detected');
    } else {
      console.log('✅ No 404 error');
    }
    
    // Show first 500 chars of body content
    try {
      const bodyText = await page.textContent('body');
      console.log(`📄 Body text (first 500 chars): "${bodyText.substring(0, 500)}..."`);
    } catch (e) {
      console.log('❌ Could not get body text');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    console.log('🔚 Browser closed');
  }
})();