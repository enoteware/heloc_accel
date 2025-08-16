import { test, expect } from "@playwright/test";

test.describe("Complete Auth Debug Testing", () => {
  test("full authentication flow with interactive debug testing", async ({
    page,
  }) => {
    console.log("=== STARTING COMPLETE AUTH DEBUG TEST ===");

    // Step 1: Navigate to sign-in page
    console.log("\n1. Navigating to sign-in page...");
    await page.goto("http://localhost:3001/en/handler/sign-in");
    await page.waitForLoadState("networkidle");

    // Take screenshot of sign-in page
    await page.screenshot({ path: "test-1-signin-page.png", fullPage: true });

    // Step 2: Login with credentials
    console.log("\n2. Logging in with enoteware@gmail.com...");

    // Fill email
    const emailInput = page
      .locator('input[name="email"], input[type="email"]')
      .first();
    await emailInput.waitFor({ state: "visible" });
    await emailInput.fill("enoteware@gmail.com");

    // Fill password
    const passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    await passwordInput.waitFor({ state: "visible" });
    await passwordInput.fill("demo123!!");

    // Click sign-in button
    const signInButton = page
      .locator('button:has-text("Sign in"), button[type="submit"]')
      .first();
    await signInButton.click();

    // Wait for login redirect
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");

    const postLoginUrl = page.url();
    console.log(`   After login URL: ${postLoginUrl}`);

    // Take screenshot after login
    await page.screenshot({ path: "test-2-after-login.png", fullPage: true });

    // Step 3: Navigate to debug-test page
    console.log("\n3. Navigating to debug-test page...");
    await page.goto("http://localhost:3001/en/debug-test");
    await page.waitForLoadState("networkidle");

    // Take screenshot of debug test page
    await page.screenshot({ path: "test-3-debug-page.png", fullPage: true });

    // Step 4: Check user information display
    console.log("\n4. Checking user information...");

    // Look for user info section
    const userInfoSection = page
      .locator('h2:has-text("Current User"), h2:has-text("User Information")')
      .first();
    const userExists = await userInfoSection.isVisible();
    console.log(`   User info section visible: ${userExists}`);

    if (userExists) {
      // Get user details
      const userId = await page
        .locator("text=/ID:.*enoteware/", "text=/id:.*enoteware/")
        .first()
        .textContent();
      const userEmail = await page
        .locator("text=/Email:.*enoteware/", "text=/email:.*enoteware/")
        .first()
        .textContent();
      console.log(`   User ID: ${userId || "Not found"}`);
      console.log(`   User Email: ${userEmail || "Not found"}`);
    }

    // Step 5: Click Test Auth Debug button
    console.log("\n5. Clicking Test Auth Debug button...");

    const authDebugButton = page
      .locator('button:has-text("Test Auth Debug")')
      .first();
    const authButtonExists = await authDebugButton.isVisible();
    console.log(`   Auth Debug button visible: ${authButtonExists}`);

    if (authButtonExists) {
      await authDebugButton.click();
      await page.waitForTimeout(3000); // Wait for API call

      // Look for auth debug results
      const authResultsExpander = page
        .locator(
          'summary:has-text("Auth Debug Results"), details:has-text("Auth Debug")',
        )
        .first();
      const authResultsVisible = await authResultsExpander.isVisible();
      console.log(`   Auth debug results visible: ${authResultsVisible}`);

      if (authResultsVisible) {
        await authResultsExpander.click();
        await page.waitForTimeout(1000);
        const resultsContent = await page.locator("pre").first().textContent();
        console.log(
          `   Auth debug results: ${resultsContent?.substring(0, 200)}...`,
        );
      }
    }

    // Step 6: Click Test Stack Auth button
    console.log("\n6. Clicking Test Stack Auth button...");

    const stackAuthButton = page
      .locator('button:has-text("Test Stack Auth")')
      .first();
    const stackButtonExists = await stackAuthButton.isVisible();
    console.log(`   Stack Auth button visible: ${stackButtonExists}`);

    if (stackButtonExists) {
      await stackAuthButton.click();
      await page.waitForTimeout(3000); // Wait for API call

      // Look for stack auth results
      const stackResultsExpander = page
        .locator(
          'summary:has-text("Stack Auth Test Results"), details:has-text("Stack Auth")',
        )
        .first();
      const stackResultsVisible = await stackResultsExpander.isVisible();
      console.log(`   Stack auth results visible: ${stackResultsVisible}`);

      if (stackResultsVisible) {
        await stackResultsExpander.click();
        await page.waitForTimeout(1000);
        const stackContent = await page.locator("pre").nth(1).textContent();
        console.log(
          `   Stack auth results: ${stackContent?.substring(0, 200)}...`,
        );
      }
    }

    // Take screenshot after debug tests
    await page.screenshot({
      path: "test-4-after-debug-tests.png",
      fullPage: true,
    });

    // Step 7: Check Debug Panel
    console.log("\n7. Testing Debug Panel...");

    const debugPanelButton = page
      .locator('button:has-text("Show"), button:has-text("Hide")')
      .first();
    const debugPanelButtonExists = await debugPanelButton.isVisible();
    console.log(`   Debug panel button visible: ${debugPanelButtonExists}`);

    if (debugPanelButtonExists) {
      await debugPanelButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "test-5-debug-panel.png", fullPage: true });
    }

    // Step 8: Check Debug Log Viewer
    console.log("\n8. Testing Debug Log Viewer...");

    const debugLogButton = page
      .locator('button:has-text("Debug Logs")')
      .first();
    const debugLogButtonExists = await debugLogButton.isVisible();
    console.log(`   Debug log button visible: ${debugLogButtonExists}`);

    if (debugLogButtonExists) {
      await debugLogButton.click();
      await page.waitForTimeout(2000);

      // Check if log viewer opened
      const logViewer = page
        .locator('[data-testid="debug-log"], .debug-log')
        .first();
      const logViewerVisible = await logViewer.isVisible();
      console.log(`   Debug log viewer visible: ${logViewerVisible}`);

      await page.screenshot({
        path: "test-6-debug-log-viewer.png",
        fullPage: true,
      });
    }

    // Step 9: Navigate to dashboard
    console.log("\n9. Testing dashboard navigation...");
    await page.goto("http://localhost:3001/en/dashboard");
    await page.waitForLoadState("networkidle");

    // Check welcome message
    const welcomeMessage = page
      .locator("text=/Welcome.*enoteware/", 'h1:has-text("Welcome")')
      .first();
    const welcomeVisible = await welcomeMessage.isVisible();
    console.log(`   Welcome message visible: ${welcomeVisible}`);

    if (welcomeVisible) {
      const welcomeText = await welcomeMessage.textContent();
      console.log(`   Welcome text: ${welcomeText}`);
    }

    // Check scenario count
    const scenarioCountText = page
      .locator("text=/Total Scenarios/", "text=/0 scenarios/")
      .first();
    const scenarioCountVisible = await scenarioCountText.isVisible();
    console.log(`   Scenario count visible: ${scenarioCountVisible}`);

    if (scenarioCountVisible) {
      const countText = await scenarioCountText.textContent();
      console.log(`   Scenario count: ${countText}`);
    }

    // Take screenshot of dashboard
    await page.screenshot({ path: "test-7-dashboard.png", fullPage: true });

    // Step 10: Test scenario creation
    console.log("\n10. Testing scenario creation flow...");

    const createScenarioButton = page
      .locator('button:has-text("Create"), a:has-text("Create")')
      .first();
    const createButtonExists = await createScenarioButton.isVisible();
    console.log(`   Create scenario button visible: ${createButtonExists}`);

    if (createButtonExists) {
      await createScenarioButton.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState("networkidle");

      const finalUrl = page.url();
      console.log(`   After create click URL: ${finalUrl}`);

      await page.screenshot({
        path: "test-8-create-scenario.png",
        fullPage: true,
      });
    }

    // Final summary
    console.log("\n=== TEST SUMMARY ===");
    console.log(`Final URL: ${page.url()}`);

    // Check authentication indicators
    const userMenuButton = page
      .locator('button:has-text("enoteware"), [data-testid="user-menu"]')
      .first();
    const userMenuExists = await userMenuButton.isVisible();
    console.log(`User menu visible: ${userMenuExists}`);

    // Check if user is shown in navigation
    const navUserIndicator = page
      .locator("text=/enoteware/", "text=/EN.*enoteware/")
      .first();
    const navUserVisible = await navUserIndicator.isVisible();
    console.log(`Navigation user indicator visible: ${navUserVisible}`);

    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
  });
});
