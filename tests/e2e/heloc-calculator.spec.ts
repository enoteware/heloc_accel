import { test, expect, Page, ConsoleMessage } from "@playwright/test";
import * as fs from "fs/promises";
import * as path from "path";

// Test configuration
test.use({
  baseURL: "http://localhost:3000",
  viewport: { width: 1280, height: 720 },
  video: "on",
  trace: "on",
});

// Helper function to capture console messages
const consoleMessages: { type: string; text: string; location?: string }[] = [];
const networkErrors: { url: string; error: string }[] = [];

// Helper function to create screenshots directory
async function ensureScreenshotsDir() {
  const screenshotsDir = path.join(__dirname, "screenshots");
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating screenshots directory:", error);
  }
  return screenshotsDir;
}

test.describe("HELOC Calculator E2E Test", () => {
  test("Complete HELOC calculator workflow with error monitoring", async ({
    page,
    context,
  }) => {
    const screenshotsDir = await ensureScreenshotsDir();
    let testResults = {
      consoleErrors: [] as any[],
      networkErrors: [] as any[],
      uiIssues: [] as string[],
      successfulSteps: [] as string[],
      screenshots: [] as string[],
    };

    // Set up console monitoring
    page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();

      consoleMessages.push({
        type,
        text,
        location: location
          ? `${location.url}:${location.lineNumber}:${location.columnNumber}`
          : undefined,
      });

      if (type === "error" || type === "warning") {
        testResults.consoleErrors.push({
          type,
          text,
          location: location
            ? `${location.url}:${location.lineNumber}:${location.columnNumber}`
            : undefined,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Set up network error monitoring
    page.on("requestfailed", (request) => {
      const failure = request.failure();
      networkErrors.push({
        url: request.url(),
        error: failure ? failure.errorText : "Unknown error",
      });
      testResults.networkErrors.push({
        url: request.url(),
        method: request.method(),
        error: failure ? failure.errorText : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    });

    // Monitor page errors
    page.on("pageerror", (error) => {
      testResults.consoleErrors.push({
        type: "pageerror",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });

    try {
      // Step 1: Navigate to homepage
      console.log("Step 1: Navigating to homepage...");
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(2000); // Give time for any delayed JS execution

      // Take homepage screenshot
      const homepageScreenshot = path.join(screenshotsDir, "01-homepage.png");
      await page.screenshot({ path: homepageScreenshot, fullPage: true });
      testResults.screenshots.push(homepageScreenshot);
      testResults.successfulSteps.push("Successfully loaded homepage");

      // Check for homepage elements
      const heroSection = await page.locator("h1").first().textContent();
      console.log("Homepage hero text:", heroSection);

      // Step 2: Navigate to calculator page
      console.log("Step 2: Navigating to calculator page...");

      // Try multiple possible selectors for the calculator link
      const calculatorLinkSelectors = [
        'a[href*="/calculator"]',
        'a:has-text("Calculator")',
        'a:has-text("Get Started")',
        'button:has-text("Calculate")',
        'a:has-text("Start Calculating")',
      ];

      let calculatorLinkFound = false;
      for (const selector of calculatorLinkSelectors) {
        if (
          await page
            .locator(selector)
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await page.locator(selector).first().click();
          calculatorLinkFound = true;
          break;
        }
      }

      if (!calculatorLinkFound) {
        // Try navigating directly
        await page.goto("/calculator", { waitUntil: "networkidle" });
      }

      await page.waitForTimeout(2000);

      // Take calculator page screenshot before filling
      const calculatorEmptyScreenshot = path.join(
        screenshotsDir,
        "02-calculator-empty.png",
      );
      await page.screenshot({
        path: calculatorEmptyScreenshot,
        fullPage: true,
      });
      testResults.screenshots.push(calculatorEmptyScreenshot);
      testResults.successfulSteps.push("Successfully loaded calculator page");

      // Step 3: Fill out the calculator form
      console.log("Step 3: Filling out calculator form...");

      // Define form values
      const formData = {
        homeValue: "400000",
        mortgageBalance: "250000",
        interestRate: "6.5",
        yearsRemaining: "25",
        monthlyPayment: "2100",
        monthlyIncome: "8000",
        monthlyExpenses: "4000",
        helocRate: "8.5",
        helocLimit: "50000",
      };

      // Fill form fields with various possible selectors
      const fieldMappings = [
        {
          value: formData.homeValue,
          selectors: [
            "#homeValue",
            'input[name="homeValue"]',
            'input[placeholder*="home value" i]',
          ],
        },
        {
          value: formData.mortgageBalance,
          selectors: [
            "#mortgageBalance",
            'input[name="mortgageBalance"]',
            'input[placeholder*="mortgage balance" i]',
          ],
        },
        {
          value: formData.interestRate,
          selectors: [
            "#interestRate",
            'input[name="interestRate"]',
            'input[placeholder*="interest rate" i]',
          ],
        },
        {
          value: formData.yearsRemaining,
          selectors: [
            "#yearsRemaining",
            'input[name="yearsRemaining"]',
            'input[placeholder*="years remaining" i]',
          ],
        },
        {
          value: formData.monthlyPayment,
          selectors: [
            "#monthlyPayment",
            'input[name="monthlyPayment"]',
            'input[placeholder*="monthly payment" i]',
          ],
        },
        {
          value: formData.monthlyIncome,
          selectors: [
            "#monthlyIncome",
            'input[name="monthlyIncome"]',
            'input[placeholder*="monthly income" i]',
          ],
        },
        {
          value: formData.monthlyExpenses,
          selectors: [
            "#monthlyExpenses",
            'input[name="monthlyExpenses"]',
            'input[placeholder*="monthly expenses" i]',
          ],
        },
        {
          value: formData.helocRate,
          selectors: [
            "#helocRate",
            'input[name="helocRate"]',
            'input[placeholder*="heloc.*rate" i]',
          ],
        },
        {
          value: formData.helocLimit,
          selectors: [
            "#helocLimit",
            'input[name="helocLimit"]',
            'input[placeholder*="heloc.*limit" i]',
          ],
        },
      ];

      for (const field of fieldMappings) {
        let filled = false;
        for (const selector of field.selectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible().catch(() => false)) {
              await element.clear();
              await element.fill(field.value);
              filled = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        if (!filled) {
          testResults.uiIssues.push(
            `Could not fill field with value: ${field.value}`,
          );
        }
      }

      // Take screenshot after filling form
      const calculatorFilledScreenshot = path.join(
        screenshotsDir,
        "03-calculator-filled.png",
      );
      await page.screenshot({
        path: calculatorFilledScreenshot,
        fullPage: true,
      });
      testResults.screenshots.push(calculatorFilledScreenshot);
      testResults.successfulSteps.push("Successfully filled calculator form");

      // Step 4: Click Calculate button
      console.log("Step 4: Clicking Calculate button...");
      const calculateButtonSelectors = [
        'button:has-text("Calculate")',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Compare")',
      ];

      let calculateClicked = false;
      for (const selector of calculateButtonSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible().catch(() => false)) {
            await button.click();
            calculateClicked = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!calculateClicked) {
        testResults.uiIssues.push("Could not find Calculate button");
      } else {
        testResults.successfulSteps.push(
          "Successfully clicked Calculate button",
        );
      }

      // Wait for results to load
      await page.waitForTimeout(3000);

      // Step 5: Check results display
      console.log("Step 5: Checking results display...");

      // Take screenshot of results
      const resultsScreenshot = path.join(
        screenshotsDir,
        "04-results-display.png",
      );
      await page.screenshot({ path: resultsScreenshot, fullPage: true });
      testResults.screenshots.push(resultsScreenshot);

      // Check for results elements
      const resultsSelectors = [
        ".results-panel",
        '[data-testid="results"]',
        ".calculation-results",
        'div:has-text("Traditional Mortgage")',
        'div:has-text("HELOC Strategy")',
      ];

      let resultsFound = false;
      for (const selector of resultsSelectors) {
        if (
          await page
            .locator(selector)
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          resultsFound = true;
          testResults.successfulSteps.push("Results displayed successfully");
          break;
        }
      }

      if (!resultsFound) {
        testResults.uiIssues.push("Results not displayed after calculation");
      }

      // Step 6: Save scenario
      console.log("Step 6: Attempting to save scenario...");
      const saveButtonSelectors = [
        'button:has-text("Save Scenario")',
        'button:has-text("Save")',
        'button[aria-label*="save" i]',
      ];

      let saveClicked = false;
      for (const selector of saveButtonSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible().catch(() => false)) {
            await button.click();
            saveClicked = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (saveClicked) {
        await page.waitForTimeout(1000);

        // Check for save dialog/modal
        const nameInputSelectors = [
          'input[placeholder*="scenario name" i]',
          'input[name="scenarioName"]',
          'input[type="text"]',
        ];

        for (const selector of nameInputSelectors) {
          try {
            const input = page.locator(selector).first();
            if (await input.isVisible().catch(() => false)) {
              await input.fill("Test Scenario");

              // Look for confirm save button
              const confirmSaveSelectors = [
                'button:has-text("Save"):not(:has-text("Cancel"))',
                'button:has-text("Confirm")',
                'button[type="submit"]',
              ];

              for (const confirmSelector of confirmSaveSelectors) {
                const confirmButton = page.locator(confirmSelector).last();
                if (await confirmButton.isVisible().catch(() => false)) {
                  await confirmButton.click();
                  testResults.successfulSteps.push(
                    "Successfully saved scenario",
                  );
                  break;
                }
              }
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }

        // Take screenshot of save dialog
        const saveDialogScreenshot = path.join(
          screenshotsDir,
          "05-save-dialog.png",
        );
        await page.screenshot({ path: saveDialogScreenshot, fullPage: true });
        testResults.screenshots.push(saveDialogScreenshot);
      } else {
        testResults.uiIssues.push("Could not find Save Scenario button");
      }

      await page.waitForTimeout(2000);

      // Step 7: Navigate to scenarios list
      console.log("Step 7: Navigating to scenarios list...");
      const scenariosLinkSelectors = [
        'a[href*="/scenarios"]',
        'a:has-text("Scenarios")',
        'a:has-text("My Scenarios")',
        'a:has-text("Saved Scenarios")',
      ];

      let scenariosNavigated = false;
      for (const selector of scenariosLinkSelectors) {
        try {
          const link = page.locator(selector).first();
          if (await link.isVisible().catch(() => false)) {
            await link.click();
            scenariosNavigated = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!scenariosNavigated) {
        // Try direct navigation
        await page.goto("/scenarios", { waitUntil: "networkidle" });
      }

      await page.waitForTimeout(2000);

      // Take screenshot of scenarios list
      const scenariosScreenshot = path.join(
        screenshotsDir,
        "06-scenarios-list.png",
      );
      await page.screenshot({ path: scenariosScreenshot, fullPage: true });
      testResults.screenshots.push(scenariosScreenshot);

      // Check if "Test Scenario" appears in the list
      const testScenarioVisible = await page
        .locator('text="Test Scenario"')
        .isVisible()
        .catch(() => false);
      if (testScenarioVisible) {
        testResults.successfulSteps.push(
          "Test Scenario found in scenarios list",
        );
      } else {
        testResults.uiIssues.push("Test Scenario not found in scenarios list");
      }
    } catch (error) {
      testResults.uiIssues.push(`Test execution error: ${error.message}`);
    }

    // Generate test report
    console.log("\n========== TEST RESULTS REPORT ==========\n");
    console.log("SUCCESSFUL STEPS:", testResults.successfulSteps.length);
    testResults.successfulSteps.forEach((step) => console.log("✓", step));

    console.log("\nCONSOLE ERRORS:", testResults.consoleErrors.length);
    testResults.consoleErrors.forEach((error) =>
      console.log("✗", JSON.stringify(error, null, 2)),
    );

    console.log("\nNETWORK ERRORS:", testResults.networkErrors.length);
    testResults.networkErrors.forEach((error) =>
      console.log("✗", JSON.stringify(error, null, 2)),
    );

    console.log("\nUI ISSUES:", testResults.uiIssues.length);
    testResults.uiIssues.forEach((issue) => console.log("✗", issue));

    console.log("\nSCREENSHOTS CAPTURED:");
    testResults.screenshots.forEach((screenshot) =>
      console.log("📸", screenshot),
    );

    // Save detailed report
    const reportPath = path.join(screenshotsDir, "test-report.json");
    await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
    console.log("\nDetailed report saved to:", reportPath);

    // Assert no critical errors
    expect(
      testResults.consoleErrors.filter((e) => e.type === "error").length,
    ).toBe(0);
    expect(testResults.networkErrors.length).toBe(0);
  });
});
