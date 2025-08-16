import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    await page.goto("/");

    // Check if the main heading is visible
    await expect(page.locator("h1")).toContainText("HELOC Accelerator");

    // Check if the description is present
    await expect(
      page.locator("text=Discover how a Home Equity Line of Credit"),
    ).toBeVisible();

    // Check if both comparison cards are present
    await expect(page.locator("text=Traditional Mortgage")).toBeVisible();
    await expect(page.locator("text=HELOC Strategy")).toBeVisible();

    // Check if the "How It Works" section is present
    await expect(page.locator("text=How It Works")).toBeVisible();
  });

  test("should have working Get Started button", async ({ page }) => {
    await page.goto("/");

    // Find and click the Get Started button
    const getStartedButton = page.locator("button", {
      hasText: /Get Started|Try the Calculator|Calculate Your Savings/,
    });
    await expect(getStartedButton).toBeVisible();

    await getStartedButton.click();

    // Should navigate to calculator or auth page
    await page.waitForURL(/\/(calculator|auth\/signin)/);
  });

  test("should display demo mode information when in demo mode", async ({
    page,
  }) => {
    // Set demo mode environment variable
    await page.addInitScript(() => {
      (window as any).process = {
        env: { NEXT_PUBLIC_DEMO_MODE: "true", NODE_ENV: "test" },
      };
    });

    await page.goto("/");

    // Check if demo mode banner is visible
    await expect(page.locator("text=Demo Mode Active")).toBeVisible();
    await expect(page.locator("text=No sign-up required")).toBeVisible();
    await expect(page.locator("text=demo@helocaccel.com")).toBeVisible();
  });

  test("should have responsive design", async ({ page }) => {
    await page.goto("/");

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator("h1")).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("h1")).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have proper meta tags and SEO elements", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/HELOC/);

    // Check if main content is accessible
    await expect(page.locator("main")).toBeVisible();
  });

  test("should have working navigation elements", async ({ page }) => {
    await page.goto("/");

    // Check if the three-step process is visible
    await expect(page.locator("text=Input Your Data")).toBeVisible();
    await expect(page.locator("text=See the Analysis")).toBeVisible();
    await expect(page.locator("text=Make Informed Decisions")).toBeVisible();

    // Check if step numbers are visible
    await expect(page.locator("text=1")).toBeVisible();
    await expect(page.locator("text=2")).toBeVisible();
    await expect(page.locator("text=3")).toBeVisible();
  });
});
