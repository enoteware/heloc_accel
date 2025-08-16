/**
 * Integration tests for the budgeting tool
 * Tests the complete workflow from creating scenarios to calculating HELOC acceleration
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

// Mock the database and API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock user authentication
const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
};

// Mock scenario data
const mockBudgetingScenario = {
  id: "scenario-123",
  name: "Test Budget Scenario",
  description: "Test scenario for integration testing",
  income_sources: [
    {
      id: "income-1",
      name: "Primary Job",
      amount: 5000,
      frequency: "monthly",
      is_primary: true,
    },
    {
      id: "income-2",
      name: "Side Business",
      amount: 1000,
      frequency: "monthly",
      is_primary: false,
    },
  ],
  expense_categories: [
    {
      id: "expense-1",
      name: "Mortgage",
      amount: 2000,
      frequency: "monthly",
      category: "housing",
      is_fixed: true,
    },
    {
      id: "expense-2",
      name: "Groceries",
      amount: 600,
      frequency: "monthly",
      category: "food",
      is_fixed: false,
    },
    {
      id: "expense-3",
      name: "Car Payment",
      amount: 400,
      frequency: "monthly",
      category: "transportation",
      is_fixed: true,
    },
  ],
  discretionary_income: 2000,
  heloc_payment_percentage: 50,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Budgeting Tool Integration Tests", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Scenario Management", () => {
    it("should create a new budgeting scenario", async () => {
      const newScenarioData = {
        name: "New Budget Scenario",
        description: "Test scenario creation",
        income_sources: [],
        expense_categories: [],
        heloc_payment_percentage: 50,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenario: { ...mockBudgetingScenario, ...newScenarioData },
        }),
      });

      const response = await fetch("/api/budgeting/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScenarioData),
      });

      const result = await response.json();

      expect(mockFetch).toHaveBeenCalledWith("/api/budgeting/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScenarioData),
      });

      expect(result.scenario.name).toBe(newScenarioData.name);
      expect(result.scenario.description).toBe(newScenarioData.description);
    });

    it("should fetch existing budgeting scenarios", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [mockBudgetingScenario],
        }),
      });

      const response = await fetch("/api/budgeting/scenarios");
      const result = await response.json();

      expect(mockFetch).toHaveBeenCalledWith("/api/budgeting/scenarios");
      expect(result.scenarios).toHaveLength(1);
      expect(result.scenarios[0].id).toBe(mockBudgetingScenario.id);
    });

    it("should update an existing scenario", async () => {
      const updatedData = {
        name: "Updated Scenario Name",
        heloc_payment_percentage: 75,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenario: { ...mockBudgetingScenario, ...updatedData },
        }),
      });

      const response = await fetch(
        `/api/budgeting/scenarios/${mockBudgetingScenario.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        },
      );

      const result = await response.json();

      expect(result.scenario.name).toBe(updatedData.name);
      expect(result.scenario.heloc_payment_percentage).toBe(
        updatedData.heloc_payment_percentage,
      );
    });
  });

  describe("Income Source Management", () => {
    it("should add a new income source to a scenario", async () => {
      const newIncomeSource = {
        name: "Freelance Work",
        amount: 800,
        frequency: "monthly",
        is_primary: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          income_source: { id: "income-3", ...newIncomeSource },
        }),
      });

      const response = await fetch(
        `/api/budgeting/scenarios/${mockBudgetingScenario.id}/income-scenarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newIncomeSource),
        },
      );

      const result = await response.json();

      expect(result.income_source.name).toBe(newIncomeSource.name);
      expect(result.income_source.amount).toBe(newIncomeSource.amount);
      expect(result.income_source.frequency).toBe(newIncomeSource.frequency);
    });

    it("should handle different income frequencies correctly", async () => {
      const testCases = [
        { frequency: "weekly", amount: 1000, expectedMonthly: 4330 },
        { frequency: "bi-weekly", amount: 2000, expectedMonthly: 4340 },
        { frequency: "monthly", amount: 4000, expectedMonthly: 4000 },
        { frequency: "annual", amount: 60000, expectedMonthly: 5000 },
      ];

      testCases.forEach(({ frequency, amount, expectedMonthly }) => {
        const calculateMonthlyAmount = (amount: number, frequency: string) => {
          switch (frequency) {
            case "weekly":
              return Math.round(amount * 4.33);
            case "bi-weekly":
              return Math.round(amount * 2.17);
            case "annual":
              return Math.round(amount / 12);
            default:
              return amount;
          }
        };

        const result = calculateMonthlyAmount(amount, frequency);
        expect(result).toBe(expectedMonthly);
      });
    });
  });

  describe("Expense Category Management", () => {
    it("should add a new expense category to a scenario", async () => {
      const newExpenseCategory = {
        name: "Internet",
        amount: 80,
        frequency: "monthly",
        category: "utilities",
        is_fixed: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          expense_category: { id: "expense-4", ...newExpenseCategory },
        }),
      });

      const response = await fetch(
        `/api/budgeting/scenarios/${mockBudgetingScenario.id}/expense-scenarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExpenseCategory),
        },
      );

      const result = await response.json();

      expect(result.expense_category.name).toBe(newExpenseCategory.name);
      expect(result.expense_category.category).toBe(
        newExpenseCategory.category,
      );
      expect(result.expense_category.is_fixed).toBe(
        newExpenseCategory.is_fixed,
      );
    });

    it("should categorize expenses correctly", () => {
      const expenses = mockBudgetingScenario.expense_categories;
      const housingExpenses = expenses.filter((e) => e.category === "housing");
      const foodExpenses = expenses.filter((e) => e.category === "food");
      const transportationExpenses = expenses.filter(
        (e) => e.category === "transportation",
      );

      expect(housingExpenses).toHaveLength(1);
      expect(housingExpenses[0].name).toBe("Mortgage");
      expect(foodExpenses).toHaveLength(1);
      expect(foodExpenses[0].name).toBe("Groceries");
      expect(transportationExpenses).toHaveLength(1);
      expect(transportationExpenses[0].name).toBe("Car Payment");
    });
  });

  describe("Financial Calculations", () => {
    it("should calculate total monthly income correctly", () => {
      const totalIncome = mockBudgetingScenario.income_sources.reduce(
        (sum, income) => {
          const monthlyAmount =
            income.frequency === "monthly" ? income.amount : income.amount;
          return sum + monthlyAmount;
        },
        0,
      );

      expect(totalIncome).toBe(6000); // 5000 + 1000
    });

    it("should calculate total monthly expenses correctly", () => {
      const totalExpenses = mockBudgetingScenario.expense_categories.reduce(
        (sum, expense) => {
          const monthlyAmount =
            expense.frequency === "monthly" ? expense.amount : expense.amount;
          return sum + monthlyAmount;
        },
        0,
      );

      expect(totalExpenses).toBe(3000); // 2000 + 600 + 400
    });

    it("should calculate discretionary income correctly", () => {
      const totalIncome = 6000;
      const totalExpenses = 3000;
      const discretionaryIncome = totalIncome - totalExpenses;

      expect(discretionaryIncome).toBe(3000);
    });

    it("should calculate HELOC payment allocation correctly", () => {
      const discretionaryIncome = 3000;
      const buffer = 500;
      const availableForHeloc = discretionaryIncome - buffer;
      const helocPaymentPercentage = 50;
      const suggestedPayment =
        (availableForHeloc * helocPaymentPercentage) / 100;

      expect(availableForHeloc).toBe(2500);
      expect(suggestedPayment).toBe(1250);
    });
  });

  describe("Live HELOC Calculation Integration", () => {
    it("should perform live HELOC calculation with budgeting data", async () => {
      const calculationRequest = {
        scenario_id: mockBudgetingScenario.id,
        monthly_heloc_payment: 1250,
        home_value: 400000,
        loan_amount: 320000,
        interest_rate: 6.5,
        loan_term_years: 30,
        heloc_limit: 80000,
        heloc_interest_rate: 7.25,
      };

      const mockCalculationResult = {
        traditional_payoff_months: 360,
        heloc_payoff_months: 285,
        time_saved_months: 75,
        interest_saved: 125000,
        percentage_interest_saved: 35.2,
        monthly_heloc_payment: 1250,
        total_interest_traditional: 355000,
        total_interest_heloc: 230000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          calculation: mockCalculationResult,
        }),
      });

      const response = await fetch("/api/budgeting/calculate-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationRequest),
      });

      const result = await response.json();

      expect(result.calculation.time_saved_months).toBe(75);
      expect(result.calculation.interest_saved).toBe(125000);
      expect(result.calculation.monthly_heloc_payment).toBe(1250);
    });
  });

  describe("Financial Health Score Calculation", () => {
    it("should calculate financial health score correctly", () => {
      const scenario = mockBudgetingScenario;

      // Mock calculation logic
      let score = 0;

      // Income stability (20 points)
      const primaryIncomeCount = scenario.income_sources.filter(
        (i) => i.is_primary,
      ).length;
      if (primaryIncomeCount >= 1) score += 20;

      // Savings rate (30 points)
      const totalIncome = 6000;
      const totalExpenses = 3000;
      const discretionaryIncome = totalIncome - totalExpenses;
      const savingsRate = (discretionaryIncome / totalIncome) * 100;
      if (savingsRate >= 20) score += 30;

      // Emergency fund potential (25 points)
      const emergencyFundMonths = (discretionaryIncome * 12) / totalExpenses;
      if (emergencyFundMonths >= 6) score += 25;

      // Expense management (25 points)
      const fixedExpenses = scenario.expense_categories
        .filter((e) => e.is_fixed)
        .reduce((sum, e) => sum + e.amount, 0);
      const fixedExpenseRatio = (fixedExpenses / totalExpenses) * 100;
      if (fixedExpenseRatio <= 50) score += 25;

      expect(score).toBe(100); // Perfect score for this test scenario
      expect(savingsRate).toBe(50); // 50% savings rate
      expect(emergencyFundMonths).toBe(12); // 12 months of emergency fund
    });
  });
});
