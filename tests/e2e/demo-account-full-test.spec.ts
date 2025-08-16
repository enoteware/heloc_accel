import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: "enoteware@gmail.com",
  password: "demo123!!",
};

const TEST_SCENARIO = {
  name: "Test Scenario - " + new Date().toISOString(),
  monthlyIncome: "8000",
  monthlyExpenses: "3000",
  mortgageBalance: "250000",
  mortgageRate: "6.5",
  mortgagePayment: "1800",
  helocLimit: "50000",
  helocRate: "8.5",
};

test.describe("Demo Account Full Feature Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("1. Login with demo account", async ({ page }) => {
    // Click login button
    await page.click("text=Sign In");

    // Fill in credentials
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to calculator
    await page.waitForURL("**/calculator");

    // Verify user is logged in
    await expect(page.locator("text=" + TEST_USER.email)).toBeVisible();

    console.log("✅ Login successful");
  });

  test("2. Create and save new scenario", async ({ page }) => {
    // Login first
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

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

    // Wait for results
    await page.waitForSelector(".chart-container");

    // Save scenario
    await page.click('button:has-text("Save Scenario")');

    // Fill scenario name in modal
    await page.fill('input[name="scenarioName"]', TEST_SCENARIO.name);

    // Click save in modal
    await page.click('button:has-text("Save"):not(:disabled)');

    // Verify success message or redirect
    await expect(page.locator("text=Scenario saved successfully")).toBeVisible({
      timeout: 10000,
    });

    console.log("✅ Scenario saved successfully");
  });

  test("3. Load saved scenarios", async ({ page }) => {
    // Login first
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

    // Navigate to saved scenarios
    await page.click("text=My Scenarios");
    await page.waitForURL("**/scenarios");

    // Verify at least one scenario exists
    const scenarios = await page
      .locator('.scenario-card, [data-testid="scenario-item"]')
      .count();
    expect(scenarios).toBeGreaterThan(0);

    console.log(`✅ Found ${scenarios} saved scenarios`);
  });

  test("4. Edit existing scenario", async ({ page }) => {
    // Login and navigate to scenarios
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

    await page.click("text=My Scenarios");
    await page.waitForURL("**/scenarios");

    // Click on first scenario to load it
    await page
      .locator('.scenario-card, [data-testid="scenario-item"]')
      .first()
      .click();

    // Wait for calculator to load with scenario data
    await page.waitForURL("**/calculator");

    // Modify a value
    const incomeInput = await page.locator('input[name="monthlyIncome"]');
    await incomeInput.clear();
    await incomeInput.fill("9000");

    // Recalculate
    await page.click('button:has-text("Calculate")');
    await page.waitForSelector(".chart-container");

    // Save with same name (update)
    await page.click('button:has-text("Save Scenario")');

    // Should show existing name
    const nameInput = await page.locator('input[name="scenarioName"]');
    const existingName = await nameInput.inputValue();
    expect(existingName).toBeTruthy();

    // Save update
    await page.click('button:has-text("Save"):not(:disabled)');

    // Verify success
    await expect(
      page.locator(
        "text=Scenario updated successfully, text=Scenario saved successfully",
      ),
    ).toBeVisible({ timeout: 10000 });

    console.log("✅ Scenario edited successfully");
  });

  test("5. Delete scenario", async ({ page }) => {
    // Login and navigate to scenarios
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

    await page.click("text=My Scenarios");
    await page.waitForURL("**/scenarios");

    // Count scenarios before delete
    const beforeCount = await page
      .locator('.scenario-card, [data-testid="scenario-item"]')
      .count();

    // Delete first scenario
    await page.locator('button:has-text("Delete")').first().click();

    // Confirm deletion if modal appears
    const confirmButton = await page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Count scenarios after delete
    const afterCount = await page
      .locator('.scenario-card, [data-testid="scenario-item"]')
      .count();

    // Verify one less scenario
    expect(afterCount).toBe(beforeCount - 1);

    console.log("✅ Scenario deleted successfully");
  });

  test("6. Test logout and session persistence", async ({ page }) => {
    // Login first
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

    // Verify logged in
    await expect(page.locator("text=" + TEST_USER.email)).toBeVisible();

    // Logout
    await page.click('button:has-text("Sign Out"), button:has-text("Logout")');

    // Should redirect to home or login
    await expect(page).toHaveURL(/\/(login|$)/);

    // Verify logged out
    await expect(page.locator("text=Sign In")).toBeVisible();

    console.log("✅ Logout successful");

    // Test session persistence by refreshing
    await page.reload();

    // Should still be logged out
    await expect(page.locator("text=Sign In")).toBeVisible();

    console.log("✅ Session properly cleared after logout");
  });

  test("7. Test calculator with real HELOC calculations", async ({ page }) => {
    // Login first
    await page.click("text=Sign In");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/calculator");

    // Fill in realistic values
    await page.fill('input[name="monthlyIncome"]', "10000");
    await page.fill('input[name="monthlyExpenses"]', "4000");
    await page.fill('input[name="mortgageBalance"]', "300000");
    await page.fill('input[name="mortgageRate"]', "7");
    await page.fill('input[name="mortgagePayment"]', "2200");
    await page.fill('input[name="helocLimit"]', "60000");
    await page.fill('input[name="helocRate"]', "9");

    // Calculate
    await page.click('button:has-text("Calculate")');

    // Wait for results
    await page.waitForSelector(".chart-container");

    // Verify key results are displayed
    await expect(
      page.locator("text=/Traditional.*months|HELOC.*months/i"),
    ).toBeVisible();
    await expect(page.locator("text=/savings|saved/i")).toBeVisible();

    // Verify chart is rendered
    await expect(page.locator(".recharts-wrapper")).toBeVisible();

    console.log("✅ Calculator working with real calculations");
  });
});
