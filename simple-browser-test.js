const { chromium } = require("playwright");

async function testApp() {
  console.log("Starting browser test...\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down actions to see what's happening
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];

  // Capture console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const errorText = msg.text();
      errors.push(errorText);
      console.log("❌ Console Error:", errorText);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.log("❌ Page Error:", error.message);
  });

  try {
    // Test 1: Navigate to homepage
    console.log("1. Testing homepage...");
    await page.goto("http://localhost:3001", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("✅ Homepage loaded\n");

    // Test 2: Navigate to calculator
    console.log("2. Testing calculator page...");
    await page.goto("http://localhost:3001/calculator", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("✅ Calculator page loaded\n");

    // Test 3: Fill in a simple calculation
    console.log("3. Testing calculation form...");
    await page.fill('input[name="currentMortgageBalance"]', "350000");
    await page.fill('input[name="currentInterestRate"]', "6.5");
    await page.fill('input[name="remainingTermMonths"]', "360");
    await page.fill('input[name="monthlyPayment"]', "2212");
    console.log("✅ Basic mortgage info filled\n");

    // Test 4: Navigate to scenarios
    console.log("4. Testing scenarios page...");
    await page.goto("http://localhost:3001/scenarios", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("✅ Scenarios page loaded\n");
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }

  // Results
  console.log("\n========== TEST RESULTS ==========");
  if (errors.length === 0) {
    console.log("✅ NO JAVASCRIPT ERRORS FOUND!");
  } else {
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }

  console.log("\nBrowser will remain open. Press Ctrl+C to exit.");

  // Keep browser open
  await new Promise(() => {});
}

testApp().catch(console.error);
