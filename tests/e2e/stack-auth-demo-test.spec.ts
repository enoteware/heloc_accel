import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: "enoteware@gmail.com",
  password: "demo123!!",
};

const TEST_SCENARIO = {
  name: "Test Scenario - " + Date.now(),
  monthlyIncome: "8000",
  monthlyExpenses: "3000",
  mortgageBalance: "250000",
  mortgageRate: "6.5",
  mortgagePayment: "1800",
  helocLimit: "50000",
  helocRate: "8.5",
};

test.describe("Stack Auth Demo Account Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Wait for app to fully load
    await page.waitForLoadState("networkidle");
    // Wait for loading indicator to disappear if present
    const loader = page.locator("text=Loading HELOC Accelerator");
    if (await loader.isVisible()) {
      await loader.waitFor({ state: "hidden", timeout: 30000 });
    }
  });

  test("Complete user account workflow", async ({ page }) => {
    console.log("1. Testing login...");
    // Navigate to sign in
    await page.click('a:has-text("Sign In")');

    // Wait for Stack Auth form to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Submit form - Stack Auth uses a submit button
    await page.click('button[type="submit"]');

    // Wait for redirect to calculator or home
    await page.waitForURL(/\/(calculator|en\/calculator|$)/, {
      timeout: 15000,
    });

    // Verify user is logged in - check for username in the nav
    const userIndicator = await page.locator("text=enoteware").first();
    await expect(userIndicator).toBeVisible({ timeout: 10000 });

    console.log("✅ Login successful");

    // Navigate to calculator if not already there
    if (!page.url().includes("calculator")) {
      await page.click('a:has-text("Calculator")');
      await page.waitForURL(/calculator/);
    }

    console.log("2. Testing scenario creation...");
    // Wait for form to be visible and scroll into view
    const incomeInput = await page.locator('input[name="monthlyIncome"]');
    await incomeInput.waitFor({ state: "visible", timeout: 10000 });
    await incomeInput.scrollIntoViewIfNeeded();

    // Fill in calculator form
    await page.fill('input[name="monthlyIncome"]', TEST_SCENARIO.monthlyIncome);
    await page.fill(
      'input[name="monthlyExpenses"]',
      TEST_SCENARIO.monthlyExpenses,
    );
    await page.fill(
      'input[name="mortgageBalance"]',
      TEST_SCENARIO.mortgageBalance,
    );
    await page.fill('input[name="mortgageRate"]', TEST_SCENARIO.mortgageRate);
    await page.fill(
      'input[name="mortgagePayment"]',
      TEST_SCENARIO.mortgagePayment,
    );
    await page.fill('input[name="helocLimit"]', TEST_SCENARIO.helocLimit);
    await page.fill('input[name="helocRate"]', TEST_SCENARIO.helocRate);

    // Calculate results
    await page.click('button:has-text("Calculate")');

    // Wait for results - look for chart or results section
    await page.waitForSelector(
      '.recharts-wrapper, .chart-container, [data-testid="results"]',
      { timeout: 10000 },
    );

    // Save scenario
    await page.click('button:has-text("Save Scenario")');

    // Wait for modal
    await page.waitForSelector(
      'input[placeholder*="scenario name"], input[name="scenarioName"], input[name="name"]',
    );

    // Fill scenario name
    const nameInput = await page
      .locator(
        'input[placeholder*="scenario name"], input[name="scenarioName"], input[name="name"]',
      )
      .first();
    await nameInput.fill(TEST_SCENARIO.name);

    // Look for description field and fill if present
    const descriptionInput = await page
      .locator(
        'textarea[name="description"], textarea[placeholder*="description"]',
      )
      .first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill("Test scenario created by automated test");
    }

    // Click save in modal - look for various possible button texts
    const saveButton = await page
      .locator(
        'button:has-text("Save"):not(:disabled), button:has-text("Create"):not(:disabled)',
      )
      .last();
    await saveButton.click();

    // Wait for success indication - could be toast, redirect, or message
    await Promise.race([
      page.waitForSelector("text=/saved|created|success/i", { timeout: 10000 }),
      page.waitForURL(/scenarios/, { timeout: 10000 }),
    ]);

    console.log("✅ Scenario saved successfully");

    console.log("3. Testing scenario loading...");
    // Navigate to scenarios page
    await page.goto("http://localhost:3000/en/scenarios");
    await page.waitForLoadState("networkidle");

    // Look for the saved scenario
    const scenarioCard = await page
      .locator(`text=${TEST_SCENARIO.name}`)
      .first();
    await expect(scenarioCard).toBeVisible({ timeout: 10000 });

    console.log("✅ Scenario found in list");

    console.log("4. Testing scenario editing...");
    // Click on the scenario to load it
    await scenarioCard.click();

    // Should redirect to calculator with data loaded
    await page.waitForURL(/calculator/);

    // Verify data is loaded by checking one field
    const incomeValue = await page
      .locator('input[name="monthlyIncome"]')
      .inputValue();
    expect(incomeValue).toBe(TEST_SCENARIO.monthlyIncome);

    // Modify a value
    await page.fill('input[name="monthlyIncome"]', "9000");

    // Recalculate
    await page.click('button:has-text("Calculate")');
    await page.waitForSelector(
      '.recharts-wrapper, .chart-container, [data-testid="results"]',
    );

    // Save updated scenario
    await page.click('button:has-text("Save Scenario")');

    // The name should already be filled
    const existingName = await page
      .locator(
        'input[placeholder*="scenario name"], input[name="scenarioName"], input[name="name"]',
      )
      .first()
      .inputValue();
    expect(existingName).toContain(TEST_SCENARIO.name);

    // Save
    await page
      .locator(
        'button:has-text("Save"):not(:disabled), button:has-text("Update"):not(:disabled)',
      )
      .last()
      .click();

    // Wait for success
    await Promise.race([
      page.waitForSelector("text=/updated|saved|success/i", { timeout: 10000 }),
      page.waitForURL(/scenarios/, { timeout: 10000 }),
    ]);

    console.log("✅ Scenario updated successfully");

    console.log("5. Testing logout...");
    // Click user menu - it's the username button
    const userMenu = await page.locator('button:has-text("enoteware")').first();
    await userMenu.click();

    // Click sign out
    await page.click(
      'button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Logout")',
    );

    // Should redirect to home
    await page.waitForURL(/\/(en\/)?$/);

    // Verify logged out by checking for Sign In button
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible();

    console.log("✅ Logout successful");

    console.log("✅ All tests passed!");
  });
});
