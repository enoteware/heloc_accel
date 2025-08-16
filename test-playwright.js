const { chromium } = require("playwright");

async function testCalculator() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console logs
  page.on("console", (msg) => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  try {
    console.log("Navigating to calculator page...");
    await page.goto("http://localhost:3000/en/calculator");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    console.log("Page title:", await page.title());

    // Take a screenshot
    await page.screenshot({
      path: "/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator/calculator-screenshot.png",
    });
    console.log("Screenshot saved as calculator-screenshot.png");

    // Try to find calculator form elements
    const formElements = await page.$$eval("input", (inputs) =>
      inputs.map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        value: input.value,
      })),
    );

    console.log("Found form inputs:", JSON.stringify(formElements, null, 2));

    // Try to find buttons
    const buttons = await page.$$eval("button", (buttons) =>
      buttons.map((btn) => ({
        text: btn.textContent?.trim(),
        type: btn.type,
        className: btn.className,
      })),
    );

    console.log("Found buttons:", JSON.stringify(buttons, null, 2));

    // Try to interact with a home value input if it exists
    const homeValueInput = await page.$(
      'input[name="homeValue"], input[id*="home"], input[placeholder*="home" i]',
    );
    if (homeValueInput) {
      console.log("Found home value input, testing interaction...");
      await homeValueInput.fill("500000");
      const value = await homeValueInput.inputValue();
      console.log("Home value input now contains:", value);
    }

    // Wait a bit to see any console logs
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await browser.close();
  }
}

testCalculator();
