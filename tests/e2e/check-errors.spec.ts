import { test, expect } from "@playwright/test";

test("Check for JavaScript errors and test save scenario", async ({ page }) => {
  const errors: string[] = [];

  // Listen for console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.log("Console error:", msg.text());
    }
  });

  // Listen for page errors
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.log("Page error:", error.message);
  });

  // Navigate to the app
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(2000);

  // Check if we need to sign in
  const signInButton = page.locator("text=Sign In").first();
  if (await signInButton.isVisible()) {
    await signInButton.click();
    await page.waitForLoadState("networkidle");
  }

  // Navigate to calculator
  await page.goto("http://localhost:3000/calculator");
  await page.waitForLoadState("networkidle");

  // Fill in the calculator form
  await page.fill('input[name="currentMortgageBalance"]', "350000");
  await page.fill('input[name="currentInterestRate"]', "6.5");
  await page.fill('input[name="remainingTermMonths"]', "360");
  await page.fill('input[name="monthlyPayment"]', "2212");

  // Fill property value
  await page.fill('input[name="propertyValue"]', "500000");

  // Fill income details
  await page.fill('input[name="monthlyGrossIncome"]', "10000");
  await page.fill('input[name="monthlyNetIncome"]', "7500");
  await page.fill('input[name="monthlyExpenses"]', "4500");
  await page.fill('input[name="monthlyDiscretionaryIncome"]', "3000");

  // Fill HELOC details
  await page.fill('input[name="helocLimit"]', "100000");
  await page.fill('input[name="helocInterestRate"]', "8.5");

  // Click calculate
  await page.click('button:has-text("Calculate")');
  await page.waitForTimeout(3000);

  // Check if results are displayed
  const resultsSection = page.locator("text=Interest Saved").first();
  await expect(resultsSection).toBeVisible({ timeout: 10000 });

  // Try to save scenario
  const saveButton = page.locator('button:has-text("Save Scenario")').first();
  if (await saveButton.isVisible()) {
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Check if modal appears
    const modal = page.locator("text=Save Scenario").nth(1);
    if (await modal.isVisible()) {
      // Fill in scenario details
      await page.fill('input[id="scenario-name"]', "Test Scenario");
      await page.fill(
        'textarea[id="scenario-description"]',
        "Testing save functionality",
      );

      // Click save in modal
      const modalSaveButton = page
        .locator('button:has-text("Save Scenario")')
        .last();
      await modalSaveButton.click();
      await page.waitForTimeout(2000);

      // Check for success message
      const successMessage = page.locator("text=Scenario saved successfully");
      if (await successMessage.isVisible()) {
        console.log("✓ Scenario saved successfully");
      } else {
        console.log("✗ No success message shown");
      }
    }
  }

  // Navigate to scenarios page
  await page.goto("http://localhost:3000/scenarios");
  await page.waitForLoadState("networkidle");

  // Check if scenario appears in list
  const scenarioInList = page.locator("text=Test Scenario").first();
  if (await scenarioInList.isVisible()) {
    console.log("✓ Scenario appears in scenarios list");
  } else {
    console.log("✗ Scenario not found in list");
  }

  // Report errors
  if (errors.length > 0) {
    console.log("\n=== JavaScript Errors Found ===");
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    throw new Error(`Found ${errors.length} JavaScript errors`);
  } else {
    console.log("\n✓ No JavaScript errors found");
  }
});
