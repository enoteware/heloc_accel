import { test, expect } from "@playwright/test";

test.describe("Stack Auth Login Test", () => {
  test("login with demo@example.com", async ({ page }) => {
    // Navigate to sign-in page
    await page.goto("http://localhost:3001/en/handler/sign-in");
    await page.waitForLoadState("networkidle");

    // Fill in credentials
    await page.fill('input[type="email"]', "demo@example.com");
    await page.fill('input[type="password"]', "demo123");

    // Click sign in
    await page.click('button:has-text("Sign")');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check result
    const url = page.url();
    console.log("After login URL:", url);

    if (url.includes("calculator")) {
      console.log("✅ Login successful!");

      // Verify user menu is visible
      await expect(page.locator('[aria-label="User menu"]')).toBeVisible();

      // Test logout
      await page.click('[aria-label="User menu"]');
      await page.click("text=Sign Out");

      await page.waitForTimeout(2000);
      console.log("After logout URL:", page.url());

      // Should see sign in button
      await expect(page.locator("text=Sign In").first()).toBeVisible();
      console.log("✅ Logout successful!");
    } else {
      // Check for error
      const errorVisible = await page
        .locator("text=/wrong|invalid|incorrect/i")
        .isVisible();
      if (errorVisible) {
        console.log("❌ Login failed - wrong credentials");
      } else {
        console.log("❌ Login failed - unexpected state");
      }

      // Take screenshot
      await page.screenshot({ path: "login-failed.png" });
    }
  });
});
