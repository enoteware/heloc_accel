const { chromium } = require("playwright");

async function testSaveScenario() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Testing Save Scenario functionality...\n");

  try {
    // Go directly to calculator
    console.log("1. Navigating to calculator...");
    await page.goto("http://localhost:3000/calculator");
    await page.waitForTimeout(2000);

    // Fill in minimal required fields
    console.log("2. Filling form...");
    await page.fill('input[name="currentMortgageBalance"]', "350000");
    await page.fill('input[name="currentInterestRate"]', "6.5");
    await page.fill('input[name="remainingTermMonths"]', "360");
    await page.fill('input[name="monthlyPayment"]', "2212");
    await page.fill('input[name="propertyValue"]', "500000");
    await page.fill('input[name="monthlyGrossIncome"]', "10000");
    await page.fill('input[name="monthlyNetIncome"]', "7500");
    await page.fill('input[name="monthlyExpenses"]', "4500");
    await page.fill('input[name="monthlyDiscretionaryIncome"]', "3000");
    await page.fill('input[name="helocLimit"]', "100000");
    await page.fill('input[name="helocInterestRate"]', "8.5");

    // Click calculate
    console.log("3. Calculating...");
    await page.click('button:has-text("Calculate")');
    await page.waitForTimeout(3000);

    // Look for Save Scenario button
    console.log("4. Looking for Save Scenario button...");
    const saveButton = await page.$('button:has-text("Save Scenario")');

    if (saveButton) {
      console.log("✅ Save Scenario button found!");

      // Click it
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Check if modal opened
      const modal = await page.$("text=Save your calculation results");
      if (modal) {
        console.log("✅ Save modal opened!");

        // Check input field colors
        const inputElement = await page.$('input[id="scenario-name"]');
        if (inputElement) {
          const styles = await inputElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              borderColor: computed.borderColor,
            };
          });
          console.log("\nInput field styles:");
          console.log("- Text color:", styles.color);
          console.log("- Background:", styles.backgroundColor);
          console.log("- Border:", styles.borderColor);
        }
      } else {
        console.log("❌ Save modal did not open");
      }
    } else {
      console.log("❌ Save Scenario button not found");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("\nTest complete. Browser will remain open.");
  await new Promise(() => {});
}

testSaveScenario().catch(console.error);
