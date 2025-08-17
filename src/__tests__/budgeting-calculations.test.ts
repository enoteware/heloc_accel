/**
 * Test Suite for Budgeting Calculations
 * Comprehensive tests for the enhanced calculation engine
 */

import {
  calculateDiscretionaryIncome,
  calculateRecommendedPrincipalPayment,
  applyScenarios,
  calculateBudgetingAcceleration,
  calculateLive,
} from "../lib/budgeting/calculations";

import {
  createIncomeScenario,
  createExpenseScenario,
  validateScenario,
  calculateScenarioImpact,
} from "../lib/budgeting/scenarios";

import {
  validateBudgetScenarioRequest,
  validateIncomeScenarioRequest,
  validateExpenseScenarioRequest,
} from "../lib/budgeting/validation";

import type {
  BudgetScenario,
  IncomeScenario,
  ExpenseScenario,
  LiveCalculationRequest,
} from "../types/budgeting";

describe("Budgeting Calculations", () => {
  describe("Basic Calculations", () => {
    test("calculateDiscretionaryIncome should calculate correctly", () => {
      expect(calculateDiscretionaryIncome(6000, 4000)).toBe(2000);
      expect(calculateDiscretionaryIncome(5000, 5000)).toBe(0);
      expect(calculateDiscretionaryIncome(4000, 5000)).toBe(-1000); // Can go negative
    });

    test("calculateRecommendedPrincipalPayment should use multiplier correctly", () => {
      expect(calculateRecommendedPrincipalPayment(2000, 3.0)).toBe(6000);
      expect(calculateRecommendedPrincipalPayment(1500, 2.5)).toBe(3750);
      expect(calculateRecommendedPrincipalPayment(0, 3.0)).toBe(0);
    });
  });

  describe("Scenario Application", () => {
    const baseIncome = 6000;
    const baseExpenses = 4000;

    const incomeScenarios: IncomeScenario[] = [
      {
        id: "income-1",
        budgetScenarioId: "budget-1",
        name: "Annual Raise",
        scenarioType: "raise",
        amount: 500,
        startMonth: 13,
        endMonth: undefined,
        frequency: "monthly",
        isActive: true,
        isRecurring: true,
        taxRate: 0.25,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ];

    const expenseScenarios: ExpenseScenario[] = [
      {
        id: "expense-1",
        budgetScenarioId: "budget-1",
        name: "Emergency Repair",
        category: "emergency",
        amount: 5000,
        startMonth: 6,
        endMonth: 6,
        frequency: "one_time",
        isActive: true,
        isRecurring: false,
        isEssential: true,
        priorityLevel: 10,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ];

    test("should apply income scenarios correctly", () => {
      // Month 1 - before raise
      const month1 = applyScenarios(
        baseIncome,
        baseExpenses,
        1,
        incomeScenarios,
        [],
      );
      expect(month1.adjustedIncome).toBe(6000);
      expect(month1.discretionaryIncome).toBe(2000);

      // Month 13 - after raise (with tax)
      const month13 = applyScenarios(
        baseIncome,
        baseExpenses,
        13,
        incomeScenarios,
        [],
      );
      expect(month13.adjustedIncome).toBe(6375); // 6000 + (500 * 0.75)
      expect(month13.discretionaryIncome).toBe(2375);
    });

    test("should apply expense scenarios correctly", () => {
      // Month 5 - before emergency
      const month5 = applyScenarios(
        baseIncome,
        baseExpenses,
        5,
        [],
        expenseScenarios,
      );
      expect(month5.adjustedExpenses).toBe(4000);
      expect(month5.discretionaryIncome).toBe(2000);

      // Month 6 - emergency expense
      const month6 = applyScenarios(
        baseIncome,
        baseExpenses,
        6,
        [],
        expenseScenarios,
      );
      expect(month6.adjustedExpenses).toBe(9000); // 4000 + 5000
      expect(month6.discretionaryIncome).toBe(-3000);

      // Month 7 - after emergency
      const month7 = applyScenarios(
        baseIncome,
        baseExpenses,
        7,
        [],
        expenseScenarios,
      );
      expect(month7.adjustedExpenses).toBe(4000);
      expect(month7.discretionaryIncome).toBe(2000);
    });

    test("should apply both income and expense scenarios", () => {
      // Month 13 with both raise and no emergency
      const month13 = applyScenarios(
        baseIncome,
        baseExpenses,
        13,
        incomeScenarios,
        expenseScenarios,
      );
      expect(month13.adjustedIncome).toBe(6375);
      expect(month13.adjustedExpenses).toBe(4000);
      expect(month13.discretionaryIncome).toBe(2375);
    });
  });

  describe("Scenario Creation and Validation", () => {
    test("should create income scenario with defaults", () => {
      const scenario = createIncomeScenario("budget-1", "raise", {
        name: "Custom Raise",
        amount: 1000,
      });

      expect(scenario.budgetScenarioId).toBe("budget-1");
      expect(scenario.scenarioType).toBe("raise");
      expect(scenario.name).toBe("Custom Raise");
      expect(scenario.amount).toBe(1000);
      expect(scenario.frequency).toBe("monthly");
      expect(scenario.taxRate).toBe(0.25);
    });

    test("should create expense scenario with defaults", () => {
      const scenario = createExpenseScenario("budget-1", "emergency", {
        name: "Custom Emergency",
        amount: 3000,
      });

      expect(scenario.budgetScenarioId).toBe("budget-1");
      expect(scenario.category).toBe("emergency");
      expect(scenario.name).toBe("Custom Emergency");
      expect(scenario.amount).toBe(3000);
      expect(scenario.frequency).toBe("one_time");
      expect(scenario.isEssential).toBe(true);
    });

    test("should validate scenarios correctly", () => {
      const validScenario = {
        name: "Test Scenario",
        amount: 1000,
        startMonth: 1,
        frequency: "monthly" as const,
      };

      const validation = validateScenario(validScenario);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const invalidScenario = {
        name: "",
        amount: 0,
        startMonth: -1,
        endMonth: 0,
        frequency: "monthly" as const,
      };

      const invalidValidation = validateScenario(invalidScenario);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Request Validation", () => {
    test("should validate budget scenario request", () => {
      const validRequest = {
        scenarioId: "scenario-1",
        name: "Test Budget",
        baseMonthlyGrossIncome: 8000,
        baseMonthlyNetIncome: 6000,
        baseMonthlyExpenses: 4000,
      };

      const validation = validateBudgetScenarioRequest(validRequest);
      expect(validation.isValid).toBe(true);

      const invalidRequest = {
        scenarioId: "",
        name: "",
        baseMonthlyGrossIncome: -1000,
        baseMonthlyNetIncome: 8000, // Greater than gross
        baseMonthlyExpenses: -500,
      };

      const invalidValidation = validateBudgetScenarioRequest(invalidRequest);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors.length).toBeGreaterThan(0);
    });

    test("should validate income scenario request", () => {
      const validRequest = {
        name: "Test Income",
        scenarioType: "raise" as const,
        amount: 500,
        startMonth: 1,
        frequency: "monthly" as const,
      };

      const validation = validateIncomeScenarioRequest(validRequest);
      expect(validation.isValid).toBe(true);

      const invalidRequest = {
        name: "",
        scenarioType: "raise" as const,
        amount: 0,
        startMonth: 0,
        endMonth: -1,
        frequency: "monthly" as const,
      };

      const invalidValidation = validateIncomeScenarioRequest(invalidRequest);
      expect(invalidValidation.isValid).toBe(false);
    });

    test("should validate expense scenario request", () => {
      const validRequest = {
        name: "Test Expense",
        category: "emergency" as const,
        amount: 1000,
        startMonth: 1,
        frequency: "one_time" as const,
      };

      const validation = validateExpenseScenarioRequest(validRequest);
      expect(validation.isValid).toBe(true);

      const invalidRequest = {
        name: "",
        category: "emergency" as const,
        amount: -1000,
        startMonth: 0,
        frequency: "one_time" as const,
      };

      const invalidValidation = validateExpenseScenarioRequest(invalidRequest);
      expect(invalidValidation.isValid).toBe(false);
    });
  });

  describe("Live Calculation", () => {
    test("should perform live calculation correctly", () => {
      const request: LiveCalculationRequest = {
        baseIncome: 6000,
        baseExpenses: 4000,
        mortgageDetails: {
          principal: 300000,
          annualInterestRate: 0.04,
          termInMonths: 360,
          monthlyPayment: 1432.25,
          propertyValue: 400000,
          pmiMonthly: 250,
        },
        helocDetails: {
          helocLimit: 50000,
          helocRate: 0.045,
          helocAvailableCredit: 50000,
        },
        scenarios: [
          {
            type: "income",
            amount: 500,
            startMonth: 13,
            frequency: "monthly",
          },
          {
            type: "expense",
            amount: 5000,
            startMonth: 6,
            frequency: "one_time",
          },
        ],
        monthsToProject: 360,
        principalMultiplier: 3.0,
      };

      const result = calculateLive(request);

      expect(result.discretionaryIncome).toBe(2000);
      expect(result.recommendedPrincipalPayment).toBe(6000);
      expect(result.projectedPayoffMonths).toBeLessThan(360); // Should be faster than traditional
      expect(result.projectedInterestSaved).toBeGreaterThan(0);
      expect(result.monthlyBreakdown).toBeDefined();
      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);
    });
  });

  describe("Full Budgeting Acceleration Calculation", () => {
    const mockBudgetScenario: BudgetScenario = {
      id: "budget-1",
      scenarioId: "scenario-1",
      name: "Test Budget",
      baseMonthlyGrossIncome: 8000,
      baseMonthlyNetIncome: 6000,
      baseMonthlyExpenses: 4000,
      baseDiscretionaryIncome: 2000,
      recommendedPrincipalPayment: 6000,
      principalMultiplier: 3.0,
      autoAdjustPayments: true,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      isActive: true,
    };

    const mockMortgageInput = {
      principal: 300000,
      annualInterestRate: 0.04,
      termInMonths: 360,
      monthlyPayment: 1432.25,
      propertyValue: 400000,
      pmiMonthly: 250,
    };

    test("should calculate budgeting acceleration correctly", () => {
      const result = calculateBudgetingAcceleration(
        mockBudgetScenario,
        mockMortgageInput,
        {
          helocLimit: 50000,
          helocRate: 0.045,
        },
        [],
        [],
        120, // 10 years for faster test
      );

      expect(result.summary).toBeDefined();
      expect(result.summary.budgetingPayoffMonths).toBeLessThan(360);
      expect(result.summary.monthsSaved).toBeGreaterThan(0);
      expect(result.summary.totalInterestSaved).toBeGreaterThan(0);

      expect(result.monthlyResults).toBeDefined();
      expect(result.monthlyResults.length).toBeGreaterThan(0);

      expect(result.traditionalComparison).toBeDefined();
      expect(result.traditionalComparison.payoffMonths).toBe(360);

      // Verify monthly results structure
      const firstMonth = result.monthlyResults[0];
      expect(firstMonth.monthNumber).toBe(1);
      expect(firstMonth.discretionaryIncome).toBe(2000);
      expect(firstMonth.recommendedPrincipalPayment).toBe(6000);
      expect(firstMonth.beginningMortgageBalance).toBe(300000);
      expect(firstMonth.endingMortgageBalance).toBeLessThan(300000);
    });

    test("should handle scenarios in full calculation", () => {
      const incomeScenarios: IncomeScenario[] = [
        {
          id: "income-1",
          budgetScenarioId: "budget-1",
          name: "Raise",
          scenarioType: "raise",
          amount: 500,
          startMonth: 13,
          endMonth: undefined,
          frequency: "monthly",
          isActive: true,
          isRecurring: true,
          taxRate: 0.25,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      const result = calculateBudgetingAcceleration(
        mockBudgetScenario,
        mockMortgageInput,
        { helocLimit: 50000, helocRate: 0.045 },
        incomeScenarios,
        [],
        120,
      );

      // Should have better results with income increase
      expect(result.summary.budgetingPayoffMonths).toBeLessThan(120);
      expect(result.summary.totalInterestSaved).toBeGreaterThan(0);

      // Check that income increase is reflected in later months
      const month13 = result.monthlyResults.find((r) => r.monthNumber === 13);
      if (month13) {
        expect(month13.discretionaryIncome).toBeGreaterThan(2000);
      }
    });
  });
});
