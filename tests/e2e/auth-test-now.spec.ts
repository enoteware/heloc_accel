import { test, expect } from "@playwright/test";

test.describe("Stack Auth Login - Final Test", () => {
  test("login with demo@example.com should work now", async ({ page }) => {
    // Navigate to sign-in page
    await page.goto("http://localhost:3001/en/handler/sign-in");
    await page.waitForLoadState("networkidle");

    // Take screenshot before login
    await page.screenshot({ path: "before-login.png" });

    // Fill in credentials
    await page.fill('input[type="email"]', "demo@example.com");
    await page.fill('input[type="password"]', "demo123");

    // Click sign in button
    await page.click('button:has-text("Sign")');

    // Wait for navigation
    await page.waitForTimeout(5000);

    // Check where we are
    const url = page.url();
    console.log("After login URL:", url);

    // Take screenshot after login
    await page.screenshot({ path: "after-login.png" });

    if (url.includes("calculator")) {
      console.log("✅ SUCCESS! Logged in and redirected to calculator");

      // Verify user is logged in
      const userMenuVisible = await page
        .locator('[aria-label="User menu"]')
        .isVisible()
        .catch(() => false);
      console.log("User menu visible:", userMenuVisible);

      // Test navigation
      await page.click("text=Dashboard");
      await page.waitForLoadState("networkidle");
      console.log("Navigated to:", page.url());

      // Test logout
      await page.click('[aria-label="User menu"]');
      await page.click("text=Sign Out");
      await page.waitForTimeout(2000);

      console.log("After logout URL:", page.url());
      const signInVisible = await page.locator("text=Sign In").isVisible();
      console.log("Sign In button visible after logout:", signInVisible);

      expect(url).toContain("calculator");
    } else {
      // Check for errors
      const errorText = await page
        .locator("text=/wrong|invalid|error/i")
        .textContent()
        .catch(() => null);
      if (errorText) {
        console.log("❌ Login failed with error:", errorText);
      } else {
        console.log("❌ Login failed - unexpected state");
      }

      // Print page content for debugging
      const bodyText = await page.locator("body").innerText();
      console.log("Page content preview:", bodyText.substring(0, 500));

      throw new Error("Login failed - not redirected to calculator");
    }
  });
});
