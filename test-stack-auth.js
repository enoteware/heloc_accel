const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class StackAuthTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      summary: {
        totalPages: 3,
        pagesWorking: 0,
        pagesWithIssues: 0,
        criticalErrors: 0
      },
      pages: {}
    };
    this.screenshotDir = './stack-auth-test-screenshots';
  }

  async initialize() {
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000 // Slow down for better observation
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    // Setup console monitoring
    this.setupConsoleMonitoring();
  }

  setupConsoleMonitoring() {
    this.consoleMessages = [];
    
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      this.consoleMessages.push({
        type,
        text,
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('pageerror', error => {
      this.consoleMessages.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  async testPage(url, pageName) {
    console.log(`\n🔍 Testing ${pageName}: ${url}`);
    
    const pageResult = {
      url,
      name: pageName,
      status: 'unknown',
      loadTime: 0,
      screenshot: null,
      consoleMessages: [],
      elements: {
        forms: [],
        inputs: [],
        buttons: [],
        stackAuthElements: []
      },
      errors: [],
      warnings: [],
      interactions: {}
    };

    try {
      // Clear previous console messages
      this.consoleMessages = [];
      
      const startTime = Date.now();
      
      // Navigate to page with extended timeout
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      pageResult.loadTime = Date.now() - startTime;
      
      // Wait a bit for dynamic content to load
      await this.page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotPath = path.join(this.screenshotDir, `${pageName.replace(/[^a-zA-Z0-9]/g, '-')}.png`);
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      pageResult.screenshot = screenshotPath;
      
      // Capture console messages
      pageResult.consoleMessages = [...this.consoleMessages];
      
      // Check page title and basic loading
      const title = await this.page.title();
      console.log(`  ✅ Page loaded successfully (${pageResult.loadTime}ms)`);
      console.log(`  📄 Title: ${title}`);
      
      // Analyze forms
      await this.analyzeForms(pageResult);
      
      // Analyze Stack Auth specific elements
      await this.analyzeStackAuthElements(pageResult);
      
      // Test interactions
      await this.testInteractions(pageResult);
      
      // Categorize console messages
      this.categorizeConsoleMessages(pageResult);
      
      // Determine overall page status
      pageResult.status = this.determinePageStatus(pageResult);
      
      if (pageResult.status === 'working') {
        this.results.summary.pagesWorking++;
      } else {
        this.results.summary.pagesWithIssues++;
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to load page: ${error.message}`);
      pageResult.status = 'failed';
      pageResult.errors.push({
        type: 'navigation',
        message: error.message,
        stack: error.stack
      });
      this.results.summary.criticalErrors++;
    }
    
    this.results.pages[pageName] = pageResult;
    this.printPageSummary(pageResult);
  }

  async analyzeForms(pageResult) {
    try {
      // Find all forms
      const forms = await this.page.$$('form');
      console.log(`  📝 Found ${forms.length} form(s)`);
      
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const formData = {
          index: i,
          action: await form.getAttribute('action') || 'not specified',
          method: await form.getAttribute('method') || 'not specified',
          inputs: [],
          buttons: []
        };
        
        // Find inputs in this form
        const inputs = await form.$$('input, textarea, select');
        for (const input of inputs) {
          const inputData = {
            type: await input.getAttribute('type') || 'text',
            name: await input.getAttribute('name') || 'unnamed',
            id: await input.getAttribute('id') || 'no-id',
            placeholder: await input.getAttribute('placeholder') || '',
            required: await input.getAttribute('required') !== null
          };
          formData.inputs.push(inputData);
        }
        
        // Find buttons in this form
        const buttons = await form.$$('button, input[type="submit"], input[type="button"]');
        for (const button of buttons) {
          const buttonData = {
            type: await button.getAttribute('type') || 'button',
            text: await button.textContent() || await button.getAttribute('value') || 'no text',
            disabled: await button.getAttribute('disabled') !== null
          };
          formData.buttons.push(buttonData);
        }
        
        pageResult.elements.forms.push(formData);
      }
    } catch (error) {
      pageResult.errors.push({
        type: 'form-analysis',
        message: error.message
      });
    }
  }

  async analyzeStackAuthElements(pageResult) {
    try {
      // Look for Stack Auth specific selectors and attributes
      const stackAuthSelectors = [
        '[data-stack-auth]',
        '[class*="stack-auth"]',
        '[id*="stack-auth"]',
        'stack-auth-component',
        '.stack-auth-form',
        '.stack-auth-button',
        '[data-testid*="stack-auth"]'
      ];
      
      for (const selector of stackAuthSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            console.log(`  🔗 Found ${elements.length} Stack Auth element(s) with selector: ${selector}`);
            pageResult.elements.stackAuthElements.push({
              selector,
              count: elements.length
            });
          }
        } catch (e) {
          // Selector might not be valid, skip
        }
      }
      
      // Check for Stack Auth in page source
      const pageContent = await this.page.content();
      const stackAuthMentions = [
        'stack-auth',
        'stackauth',
        'Stack Auth',
        'data-stack'
      ];
      
      for (const mention of stackAuthMentions) {
        if (pageContent.toLowerCase().includes(mention.toLowerCase())) {
          console.log(`  📄 Found "${mention}" in page content`);
          pageResult.elements.stackAuthElements.push({
            type: 'content-mention',
            mention
          });
        }
      }
      
    } catch (error) {
      pageResult.errors.push({
        type: 'stack-auth-analysis',
        message: error.message
      });
    }
  }

  async testInteractions(pageResult) {
    try {
      // Test input fields (focus and type without submitting)
      const inputs = await this.page.$$('input[type="text"], input[type="email"], input[type="password"], textarea');
      
      for (let i = 0; i < Math.min(inputs.length, 3); i++) { // Limit to first 3 inputs
        const input = inputs[i];
        try {
          const name = await input.getAttribute('name') || `input-${i}`;
          
          // Test focus
          await input.focus();
          await this.page.waitForTimeout(500);
          
          // Test typing
          await input.fill('test-input');
          await this.page.waitForTimeout(500);
          
          // Clear the input
          await input.fill('');
          
          pageResult.interactions[name] = {
            canFocus: true,
            canType: true,
            status: 'working'
          };
          
          console.log(`  ⌨️ Input "${name}" is interactive`);
          
        } catch (error) {
          const name = await input.getAttribute('name') || `input-${i}`;
          pageResult.interactions[name] = {
            canFocus: false,
            canType: false,
            status: 'error',
            error: error.message
          };
        }
      }
      
      // Test buttons (hover without clicking)
      const buttons = await this.page.$$('button, input[type="submit"], input[type="button"]');
      
      for (let i = 0; i < Math.min(buttons.length, 3); i++) { // Limit to first 3 buttons
        const button = buttons[i];
        try {
          const text = await button.textContent() || await button.getAttribute('value') || `button-${i}`;
          
          // Test hover
          await button.hover();
          await this.page.waitForTimeout(500);
          
          pageResult.interactions[`button-${text}`] = {
            canHover: true,
            status: 'working'
          };
          
          console.log(`  🖱️ Button "${text}" is hoverable`);
          
        } catch (error) {
          const text = await button.textContent() || `button-${i}`;
          pageResult.interactions[`button-${text}`] = {
            canHover: false,
            status: 'error',
            error: error.message
          };
        }
      }
      
    } catch (error) {
      pageResult.errors.push({
        type: 'interaction-testing',
        message: error.message
      });
    }
  }

  categorizeConsoleMessages(pageResult) {
    pageResult.consoleMessages.forEach(msg => {
      if (msg.type === 'error' || msg.type === 'pageerror') {
        pageResult.errors.push({
          type: 'console-error',
          message: msg.text,
          stack: msg.stack,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'warning') {
        pageResult.warnings.push({
          type: 'console-warning',
          message: msg.text,
          timestamp: msg.timestamp
        });
      }
    });
  }

  determinePageStatus(pageResult) {
    if (pageResult.errors.some(e => e.type === 'navigation')) {
      return 'failed';
    }
    if (pageResult.errors.length > 0) {
      return 'issues';
    }
    if (pageResult.elements.forms.length === 0 && pageResult.url.includes('sign')) {
      return 'missing-forms';
    }
    return 'working';
  }

  printPageSummary(pageResult) {
    console.log(`  📊 Status: ${pageResult.status.toUpperCase()}`);
    console.log(`  📝 Forms: ${pageResult.elements.forms.length}`);
    console.log(`  🔗 Stack Auth elements: ${pageResult.elements.stackAuthElements.length}`);
    console.log(`  ❌ Errors: ${pageResult.errors.length}`);
    console.log(`  ⚠️ Warnings: ${pageResult.warnings.length}`);
    console.log(`  📸 Screenshot: ${pageResult.screenshot}`);
  }

  async generateReport() {
    const reportPath = './stack-auth-test-report.json';
    const report = {
      testDate: new Date().toISOString(),
      summary: this.results.summary,
      pages: this.results.pages,
      recommendations: this.generateRecommendations()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 FINAL REPORT');
    console.log('================');
    console.log(`Pages tested: ${this.results.summary.totalPages}`);
    console.log(`Pages working: ${this.results.summary.pagesWorking}`);
    console.log(`Pages with issues: ${this.results.summary.pagesWithIssues}`);
    console.log(`Critical errors: ${this.results.summary.criticalErrors}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    console.log(`Screenshots saved to: ${this.screenshotDir}`);
    
    // Print key findings
    console.log('\n🔍 KEY FINDINGS:');
    Object.entries(this.results.pages).forEach(([name, page]) => {
      console.log(`\n${name}:`);
      console.log(`  Status: ${page.status}`);
      console.log(`  Forms found: ${page.elements.forms.length}`);
      console.log(`  Stack Auth elements: ${page.elements.stackAuthElements.length}`);
      if (page.errors.length > 0) {
        console.log(`  Errors: ${page.errors.length} (see report for details)`);
      }
    });
    
    // Print recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.values(this.results.pages).forEach(page => {
      if (page.status === 'failed') {
        recommendations.push(`${page.name}: Page failed to load - check server status and URL routing`);
      }
      
      if (page.url.includes('sign') && page.elements.forms.length === 0) {
        recommendations.push(`${page.name}: No forms found on authentication page - verify Stack Auth integration`);
      }
      
      if (page.elements.stackAuthElements.length === 0) {
        recommendations.push(`${page.name}: No Stack Auth elements detected - verify component integration`);
      }
      
      if (page.errors.some(e => e.type === 'console-error')) {
        recommendations.push(`${page.name}: Console errors detected - check browser console for details`);
      }
    });
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runStackAuthTests() {
  const tester = new StackAuthTester();
  
  try {
    await tester.initialize();
    
    // Test pages
    const pages = [
      { url: 'http://localhost:3002/en/handler/sign-up', name: 'Sign Up Page' },
      { url: 'http://localhost:3002/en/handler/sign-in', name: 'Sign In Page' },
      { url: 'http://localhost:3002/en/stack-auth-test', name: 'Stack Auth Test Page' }
    ];
    
    for (const page of pages) {
      await tester.testPage(page.url, page.name);
      // Small delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await tester.generateReport();
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run the tests
runStackAuthTests().catch(console.error);