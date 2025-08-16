import { test, expect } from "@playwright/test";

test.describe("Final Login Test with Debug", () => {
  test("Test login with server debug logging", async ({ page }) => {
    console.log("=== Final Login Test ===");

    // Navigate to login
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");

    // Fill form
    console.log("Filling form with: demo@helocaccel.com / DemoUser123!");
    await page.fill('input[name="email"]', "demo@helocaccel.com");
    await page.fill('input[name="password"]', "DemoUser123!");

    // Take screenshot before submit
    await page.screenshot({
      path: "test-results/final-before-submit.png",
      fullPage: true,
    });

    // Submit and monitor the exact response
    console.log("Submitting form...");

    // Wait for the form submission response
    const [response] = await Promise.all([
      page.waitForResponse((response) => {
        return (
          response.url().includes("/login") &&
          response.request().method() === "POST"
        );
      }),
      page.click('button[type="submit"]'),
    ]);

    console.log(`Form submission response: ${response.status()}`);

    // Wait for redirect/error
    await page.waitForTimeout(3000);

    // Take final screenshot
    await page.screenshot({
      path: "test-results/final-after-submit.png",
      fullPage: true,
    });

    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    // Check for error message
    const errorText = await page
      .locator(".text-red-600")
      .textContent()
      .catch(() => null);
    if (errorText) {
      console.log(`Error message: ${errorText}`);
    }

    // Check if successful (redirected to dashboard)
    if (finalUrl.includes("/dashboard")) {
      console.log("✅ SUCCESS: Login worked! Redirected to dashboard");

      // Verify we're logged in by checking for user info
      const userInfo = await page
        .locator('[data-testid="user-menu"], .user-menu, [aria-label*="user"]')
        .textContent()
        .catch(() => "No user info found");
      console.log(`User info: ${userInfo}`);
    } else if (finalUrl.includes("/login")) {
      console.log("❌ FAILED: Still on login page");

      if (finalUrl.includes("error=")) {
        const urlParams = new URL(finalUrl);
        const error = urlParams.searchParams.get("error");
        console.log(`URL error parameter: ${error}`);
      }
    } else {
      console.log(`⚠️ UNEXPECTED: Redirected to ${finalUrl}`);
    }

    // Test the dashboard access directly as well
    console.log("\n=== Testing Dashboard Access ===");
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForTimeout(2000);

    const dashboardUrl = page.url();
    console.log(`Dashboard access result: ${dashboardUrl}`);

    if (dashboardUrl.includes("/dashboard")) {
      console.log("✅ Dashboard accessible - user is authenticated");
    } else {
      console.log(
        "❌ Dashboard redirected to login - user is not authenticated",
      );
    }
  });

  test("Verify demo user credentials are correct", async ({ page }) => {
    console.log("=== Verifying Demo Credentials ===");

    // Check what demo users are available by looking at the login page hints
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");

    // Look for demo account information on the page
    const demoInfo = await page
      .locator('text*="demo@helocaccel.com"')
      .textContent()
      .catch(() => null);
    console.log(`Demo info on page: ${demoInfo}`);

    // Also check placeholder text
    const emailPlaceholder = await page
      .locator('input[name="email"]')
      .getAttribute("placeholder");
    const passwordPlaceholder = await page
      .locator('input[name="password"]')
      .getAttribute("placeholder");

    console.log(`Email placeholder: ${emailPlaceholder}`);
    console.log(`Password placeholder: ${passwordPlaceholder}`);

    // Try alternative demo credentials if they exist
    const altCredentials = [
      { email: "john.smith@example.com", password: "password123" },
      { email: "demo@helocaccel.com", password: "password123" },
    ];

    for (const creds of altCredentials) {
      console.log(`\nTrying: ${creds.email} / ${creds.password}`);

      await page.fill('input[name="email"]', creds.email);
      await page.fill('input[name="password"]', creds.password);

      const [response] = await Promise.all([
        page.waitForResponse((response) => {
          return (
            response.url().includes("/login") &&
            response.request().method() === "POST"
          );
        }),
        page.click('button[type="submit"]'),
      ]);

      await page.waitForTimeout(2000);
      const resultUrl = page.url();

      if (resultUrl.includes("/dashboard")) {
        console.log(`✅ SUCCESS with ${creds.email}`);
        break;
      } else {
        console.log(`❌ Failed with ${creds.email}`);
        // Navigate back to login for next attempt
        await page.goto("http://localhost:3000/login");
        await page.waitForLoadState("networkidle");
      }
    }
  });
});
