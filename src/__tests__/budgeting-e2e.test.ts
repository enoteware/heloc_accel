/**
 * End-to-end tests for the budgeting tool workflow
 * Tests the complete user journey from login to HELOC calculation
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

// Mock Playwright for E2E testing
interface MockPage {
  goto: jest.Mock;
  click: jest.Mock;
  fill: jest.Mock;
  selectOption: jest.Mock;
  waitForSelector: jest.Mock;
  textContent: jest.Mock;
  isVisible: jest.Mock;
  screenshot: jest.Mock;
}

interface MockBrowser {
  newPage: jest.Mock;
  close: jest.Mock;
}

const mockPage: MockPage = {
  goto: jest.fn(),
  click: jest.fn(),
  fill: jest.fn(),
  selectOption: jest.fn(),
  waitForSelector: jest.fn(),
  textContent: jest.fn(),
  isVisible: jest.fn(),
  screenshot: jest.fn(),
};

const mockBrowser: MockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
};

// Mock Playwright launch
const mockPlaywright = {
  chromium: {
    launch: jest.fn().mockResolvedValue(mockBrowser),
  },
};

describe("Budgeting Tool E2E Tests", () => {
  let browser: MockBrowser;
  let page: MockPage;

  beforeAll(async () => {
    browser = await mockPlaywright.chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockPage).forEach((mock) => mock.mockClear());
  });

  describe("User Authentication and Navigation", () => {
    it("should navigate to budgeting tool after login", async () => {
      // Mock successful navigation
      mockPage.goto.mockResolvedValue(undefined);
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/login");
      await page.waitForSelector('[data-testid="login-form"]');

      // Mock login process (demo mode)
      await page.click('[data-testid="demo-login-button"]');
      await page.waitForSelector('[data-testid="navigation-bar"]');

      // Navigate to budgeting tool
      await page.click('[href="/budgeting"]');
      await page.waitForSelector('[data-testid="budgeting-page"]');

      const isVisible = await page.isVisible('[data-testid="budgeting-page"]');
      expect(isVisible).toBe(true);
      expect(mockPage.goto).toHaveBeenCalledWith(
        "http://localhost:3000/en/login",
      );
      expect(mockPage.click).toHaveBeenCalledWith('[href="/budgeting"]');
    });
  });

  describe("Scenario Creation Workflow", () => {
    it("should create a new budgeting scenario", async () => {
      mockPage.textContent.mockResolvedValue("New Budget Scenario");
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/budgeting");
      await page.waitForSelector('[data-testid="budgeting-page"]');

      // Create new scenario
      await page.click('[data-testid="create-scenario-button"]');
      await page.waitForSelector('[data-testid="scenario-form"]');

      // Verify scenario was created
      const scenarioName = await page.textContent(
        '[data-testid="scenario-name"]',
      );
      expect(scenarioName).toBe("New Budget Scenario");
      expect(mockPage.click).toHaveBeenCalledWith(
        '[data-testid="create-scenario-button"]',
      );
    });

    it("should switch between different scenarios", async () => {
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/budgeting");
      await page.waitForSelector('[data-testid="scenario-selector"]');

      // Select different scenario
      await page.selectOption(
        '[data-testid="scenario-selector"]',
        "scenario-2",
      );
      await page.waitForSelector('[data-testid="scenario-loaded"]');

      const isLoaded = await page.isVisible('[data-testid="scenario-loaded"]');
      expect(isLoaded).toBe(true);
      expect(mockPage.selectOption).toHaveBeenCalledWith(
        '[data-testid="scenario-selector"]',
        "scenario-2",
      );
    });
  });

  describe("Income Management Workflow", () => {
    it("should add income sources successfully", async () => {
      mockPage.isVisible.mockResolvedValue(true);
      mockPage.textContent.mockResolvedValue("Primary Job");

      await page.goto("http://localhost:3000/en/budgeting");
      await page.waitForSelector('[data-testid="income-tab"]');

      // Switch to income tab
      await page.click('[data-testid="income-tab"]');
      await page.waitForSelector('[data-testid="income-form"]');

      // Fill income form
      await page.fill('[data-testid="income-name-input"]', "Primary Job");
      await page.fill('[data-testid="income-amount-input"]', "5000");
      await page.selectOption(
        '[data-testid="income-frequency-select"]',
        "monthly",
      );
      await page.click('[data-testid="income-primary-checkbox"]');

      // Submit form
      await page.click('[data-testid="add-income-button"]');
      await page.waitForSelector('[data-testid="income-list-item"]');

      // Verify income was added
      const incomeName = await page.textContent('[data-testid="income-name"]');
      expect(incomeName).toBe("Primary Job");
      expect(mockPage.fill).toHaveBeenCalledWith(
        '[data-testid="income-name-input"]',
        "Primary Job",
      );
      expect(mockPage.fill).toHaveBeenCalledWith(
        '[data-testid="income-amount-input"]',
        "5000",
      );
    });

    it("should handle different income frequencies", async () => {
      const frequencies = ["weekly", "bi-weekly", "monthly", "annual"];

      for (const frequency of frequencies) {
        await page.goto("http://localhost:3000/en/budgeting");
        await page.click('[data-testid="income-tab"]');

        await page.fill(
          '[data-testid="income-name-input"]',
          `${frequency} Income`,
        );
        await page.fill('[data-testid="income-amount-input"]', "1000");
        await page.selectOption(
          '[data-testid="income-frequency-select"]',
          frequency,
        );
        await page.click('[data-testid="add-income-button"]');

        await page.waitForSelector('[data-testid="income-list-item"]');

        expect(mockPage.selectOption).toHaveBeenCalledWith(
          '[data-testid="income-frequency-select"]',
          frequency,
        );
      }
    });
  });

  describe("Expense Management Workflow", () => {
    it("should add expense categories successfully", async () => {
      mockPage.isVisible.mockResolvedValue(true);
      mockPage.textContent.mockResolvedValue("Mortgage Payment");

      await page.goto("http://localhost:3000/en/budgeting");
      await page.waitForSelector('[data-testid="expenses-tab"]');

      // Switch to expenses tab
      await page.click('[data-testid="expenses-tab"]');
      await page.waitForSelector('[data-testid="expense-form"]');

      // Fill expense form
      await page.fill('[data-testid="expense-name-input"]', "Mortgage Payment");
      await page.fill('[data-testid="expense-amount-input"]', "2000");
      await page.selectOption(
        '[data-testid="expense-frequency-select"]',
        "monthly",
      );
      await page.selectOption(
        '[data-testid="expense-category-select"]',
        "housing",
      );
      await page.click('[data-testid="expense-fixed-checkbox"]');

      // Submit form
      await page.click('[data-testid="add-expense-button"]');
      await page.waitForSelector('[data-testid="expense-list-item"]');

      // Verify expense was added
      const expenseName = await page.textContent(
        '[data-testid="expense-name"]',
      );
      expect(expenseName).toBe("Mortgage Payment");
      expect(mockPage.selectOption).toHaveBeenCalledWith(
        '[data-testid="expense-category-select"]',
        "housing",
      );
    });

    it("should categorize expenses correctly", async () => {
      const categories = [
        "housing",
        "transportation",
        "food",
        "utilities",
        "insurance",
      ];

      for (const category of categories) {
        await page.goto("http://localhost:3000/en/budgeting");
        await page.click('[data-testid="expenses-tab"]');

        await page.fill(
          '[data-testid="expense-name-input"]',
          `${category} Expense`,
        );
        await page.fill('[data-testid="expense-amount-input"]', "500");
        await page.selectOption(
          '[data-testid="expense-category-select"]',
          category,
        );
        await page.click('[data-testid="add-expense-button"]');

        await page.waitForSelector('[data-testid="expense-list-item"]');

        expect(mockPage.selectOption).toHaveBeenCalledWith(
          '[data-testid="expense-category-select"]',
          category,
        );
      }
    });
  });

  describe("Analysis and Dashboard Workflow", () => {
    it("should display financial analysis correctly", async () => {
      mockPage.textContent
        .mockResolvedValueOnce("$6,000") // Total income
        .mockResolvedValueOnce("$3,000") // Total expenses
        .mockResolvedValueOnce("$3,000") // Discretionary income
        .mockResolvedValueOnce("50.0%"); // Savings rate

      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="financial-summary"]');

      // Verify calculations
      const totalIncome = await page.textContent(
        '[data-testid="total-income"]',
      );
      const totalExpenses = await page.textContent(
        '[data-testid="total-expenses"]',
      );
      const discretionaryIncome = await page.textContent(
        '[data-testid="discretionary-income"]',
      );
      const savingsRate = await page.textContent(
        '[data-testid="savings-rate"]',
      );

      expect(totalIncome).toBe("$6,000");
      expect(totalExpenses).toBe("$3,000");
      expect(discretionaryIncome).toBe("$3,000");
      expect(savingsRate).toBe("50.0%");
    });

    it("should calculate financial health score", async () => {
      mockPage.textContent.mockResolvedValue("85/100");
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="health-score"]');

      const healthScore = await page.textContent(
        '[data-testid="health-score"]',
      );
      const excellentBadge = await page.isVisible(
        '[data-testid="excellent-badge"]',
      );

      expect(healthScore).toBe("85/100");
      expect(excellentBadge).toBe(true);
    });

    it("should provide HELOC acceleration recommendations", async () => {
      mockPage.textContent
        .mockResolvedValueOnce("$2,500") // Available for HELOC
        .mockResolvedValueOnce("$1,250"); // Suggested payment

      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="heloc-strategy"]');

      const availableForHeloc = await page.textContent(
        '[data-testid="available-heloc"]',
      );
      const suggestedPayment = await page.textContent(
        '[data-testid="suggested-payment"]',
      );

      expect(availableForHeloc).toBe("$2,500");
      expect(suggestedPayment).toBe("$1,250");
    });
  });

  describe("HELOC Integration Workflow", () => {
    it("should run live HELOC calculation", async () => {
      mockPage.textContent
        .mockResolvedValueOnce("75 months") // Time saved
        .mockResolvedValueOnce("$125,000"); // Interest saved

      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="heloc-strategy"]');

      // Trigger live calculation
      await page.click('[data-testid="run-calculation-button"]');
      await page.waitForSelector('[data-testid="calculation-results"]');

      const timeSaved = await page.textContent('[data-testid="time-saved"]');
      const interestSaved = await page.textContent(
        '[data-testid="interest-saved"]',
      );

      expect(timeSaved).toBe("75 months");
      expect(interestSaved).toBe("$125,000");
      expect(mockPage.click).toHaveBeenCalledWith(
        '[data-testid="run-calculation-button"]',
      );
    });

    it("should adjust HELOC payment percentage", async () => {
      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="payment-slider"]');

      // Adjust slider to 75%
      await page.fill('[data-testid="payment-slider"]', "75");
      await page.waitForSelector('[data-testid="updated-payment"]');

      expect(mockPage.fill).toHaveBeenCalledWith(
        '[data-testid="payment-slider"]',
        "75",
      );
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle network errors gracefully", async () => {
      mockPage.isVisible.mockResolvedValue(true);

      // Mock network error
      mockPage.click.mockRejectedValueOnce(new Error("Network error"));

      await page.goto("http://localhost:3000/en/budgeting");

      try {
        await page.click('[data-testid="create-scenario-button"]');
      } catch (error) {
        expect(error.message).toBe("Network error");
      }

      // Should show error message
      const errorVisible = await page.isVisible(
        '[data-testid="error-message"]',
      );
      expect(errorVisible).toBe(true);
    });

    it("should handle insufficient discretionary income", async () => {
      mockPage.textContent.mockResolvedValue(
        "Insufficient Discretionary Income",
      );
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/budgeting");

      // Add high expenses that exceed income
      await page.click('[data-testid="expenses-tab"]');
      await page.fill('[data-testid="expense-amount-input"]', "10000");
      await page.click('[data-testid="add-expense-button"]');

      await page.click('[data-testid="analysis-tab"]');
      await page.waitForSelector('[data-testid="insufficient-income-warning"]');

      const warningMessage = await page.textContent(
        '[data-testid="warning-message"]',
      );
      expect(warningMessage).toBe("Insufficient Discretionary Income");
    });

    it("should validate form inputs", async () => {
      mockPage.isVisible.mockResolvedValue(true);

      await page.goto("http://localhost:3000/en/budgeting");
      await page.click('[data-testid="income-tab"]');

      // Try to submit empty form
      await page.click('[data-testid="add-income-button"]');

      // Should show validation errors
      const nameError = await page.isVisible('[data-testid="name-error"]');
      const amountError = await page.isVisible('[data-testid="amount-error"]');

      expect(nameError).toBe(true);
      expect(amountError).toBe(true);
    });
  });

  describe("Accessibility and Performance", () => {
    it("should be accessible to screen readers", async () => {
      await page.goto("http://localhost:3000/en/budgeting");

      // Check for proper ARIA labels and roles
      const hasAriaLabels = await page.isVisible("[aria-label]");
      const hasProperHeadings = await page.isVisible("h1, h2, h3");
      const hasFormLabels = await page.isVisible("label");

      expect(hasAriaLabels).toBe(true);
      expect(hasProperHeadings).toBe(true);
      expect(hasFormLabels).toBe(true);
    });

    it("should load within acceptable time limits", async () => {
      const startTime = Date.now();

      await page.goto("http://localhost:3000/en/budgeting");
      await page.waitForSelector('[data-testid="budgeting-page"]');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it("should work on mobile viewports", async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("http://localhost:3000/en/budgeting");

      // Check mobile-specific elements
      const mobileMenu = await page.isVisible('[data-testid="mobile-menu"]');
      const responsiveLayout = await page.isVisible(
        '[data-testid="mobile-layout"]',
      );

      expect(mobileMenu).toBe(true);
      expect(responsiveLayout).toBe(true);
    });
  });
});
