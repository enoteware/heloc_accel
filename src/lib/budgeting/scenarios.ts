/**
 * Scenario Management Utilities
 * Functions for creating, validating, and managing income/expense scenarios
 */

import type {
  IncomeScenario,
  ExpenseScenario,
  BudgetScenario,
  BudgetScenarioTemplate,
  IncomeScenarioType,
  ExpenseCategory,
  ScenarioFrequency,
  ScenarioImpactAnalysis,
} from "../../types/budgeting";

/**
 * Scenario templates for common situations
 */
export const INCOME_SCENARIO_TEMPLATES: Record<
  IncomeScenarioType,
  {
    name: string;
    description: string;
    defaultAmount: number;
    defaultFrequency: ScenarioFrequency;
    defaultTaxRate: number;
  }
> = {
  raise: {
    name: "Annual Salary Raise",
    description: "Regular salary increase, typically applied annually",
    defaultAmount: 2000,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.25,
  },
  bonus: {
    name: "Annual Bonus",
    description: "One-time or recurring bonus payment",
    defaultAmount: 5000,
    defaultFrequency: "annually",
    defaultTaxRate: 0.3,
  },
  job_loss: {
    name: "Job Loss",
    description: "Temporary or permanent loss of income",
    defaultAmount: -3000,
    defaultFrequency: "monthly",
    defaultTaxRate: 0,
  },
  side_income: {
    name: "Side Income",
    description: "Additional income from freelancing or part-time work",
    defaultAmount: 1000,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.25,
  },
  investment_income: {
    name: "Investment Income",
    description: "Dividends, interest, or capital gains",
    defaultAmount: 500,
    defaultFrequency: "quarterly",
    defaultTaxRate: 0.15,
  },
  overtime: {
    name: "Overtime Pay",
    description: "Additional compensation for extra hours worked",
    defaultAmount: 800,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.28,
  },
  commission: {
    name: "Sales Commission",
    description: "Variable compensation based on sales performance",
    defaultAmount: 1500,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.25,
  },
  rental_income: {
    name: "Rental Income",
    description: "Income from rental properties",
    defaultAmount: 1200,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.22,
  },
  other: {
    name: "Other Income",
    description: "Miscellaneous income source",
    defaultAmount: 500,
    defaultFrequency: "monthly",
    defaultTaxRate: 0.25,
  },
};

export const EXPENSE_SCENARIO_TEMPLATES: Record<
  ExpenseCategory,
  {
    name: string;
    description: string;
    defaultAmount: number;
    defaultFrequency: ScenarioFrequency;
    isEssential: boolean;
    priorityLevel: number;
  }
> = {
  housing: {
    name: "Housing Expense",
    description: "Rent, mortgage, or housing-related costs",
    defaultAmount: 500,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 9,
  },
  utilities: {
    name: "Utility Bill",
    description: "Electricity, gas, water, internet, phone",
    defaultAmount: 150,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 8,
  },
  food: {
    name: "Food Expense",
    description: "Groceries and dining expenses",
    defaultAmount: 200,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 9,
  },
  transportation: {
    name: "Transportation Cost",
    description: "Car payment, gas, maintenance, public transit",
    defaultAmount: 300,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 7,
  },
  insurance: {
    name: "Insurance Premium",
    description: "Health, auto, life, or other insurance",
    defaultAmount: 250,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 8,
  },
  debt: {
    name: "Debt Payment",
    description: "Credit card, student loan, or other debt payments",
    defaultAmount: 400,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 9,
  },
  discretionary: {
    name: "Discretionary Spending",
    description: "Entertainment, hobbies, non-essential purchases",
    defaultAmount: 300,
    defaultFrequency: "monthly",
    isEssential: false,
    priorityLevel: 3,
  },
  emergency: {
    name: "Emergency Expense",
    description: "Unexpected one-time expense",
    defaultAmount: 2000,
    defaultFrequency: "one_time",
    isEssential: true,
    priorityLevel: 10,
  },
  healthcare: {
    name: "Healthcare Expense",
    description: "Medical bills, prescriptions, healthcare costs",
    defaultAmount: 200,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 9,
  },
  education: {
    name: "Education Expense",
    description: "Tuition, books, educational materials",
    defaultAmount: 500,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 7,
  },
  childcare: {
    name: "Childcare Expense",
    description: "Daycare, babysitting, child-related costs",
    defaultAmount: 800,
    defaultFrequency: "monthly",
    isEssential: true,
    priorityLevel: 9,
  },
  entertainment: {
    name: "Entertainment Expense",
    description: "Movies, concerts, recreational activities",
    defaultAmount: 150,
    defaultFrequency: "monthly",
    isEssential: false,
    priorityLevel: 2,
  },
  other: {
    name: "Other Expense",
    description: "Miscellaneous expense",
    defaultAmount: 200,
    defaultFrequency: "monthly",
    isEssential: false,
    priorityLevel: 5,
  },
};

/**
 * Create a new income scenario with defaults
 */
export function createIncomeScenario(
  budgetScenarioId: string,
  type: IncomeScenarioType,
  customValues: Partial<IncomeScenario> = {},
): Omit<IncomeScenario, "id" | "createdAt" | "updatedAt"> {
  const template = INCOME_SCENARIO_TEMPLATES[type];

  return {
    budgetScenarioId,
    name: customValues.name || template.name,
    description: customValues.description || template.description,
    scenarioType: type,
    amount: customValues.amount ?? template.defaultAmount,
    startMonth: customValues.startMonth || 1,
    endMonth: customValues.endMonth,
    frequency: customValues.frequency || template.defaultFrequency,
    isActive: customValues.isActive ?? true,
    isRecurring: customValues.isRecurring ?? true,
    taxRate: customValues.taxRate ?? template.defaultTaxRate,
    ...customValues,
  };
}

/**
 * Create a new expense scenario with defaults
 */
export function createExpenseScenario(
  budgetScenarioId: string,
  category: ExpenseCategory,
  customValues: Partial<ExpenseScenario> = {},
): Omit<ExpenseScenario, "id" | "createdAt" | "updatedAt"> {
  const template = EXPENSE_SCENARIO_TEMPLATES[category];

  return {
    budgetScenarioId,
    name: customValues.name || template.name,
    description: customValues.description || template.description,
    category,
    subcategory: customValues.subcategory,
    amount: customValues.amount ?? template.defaultAmount,
    startMonth: customValues.startMonth || 1,
    endMonth: customValues.endMonth,
    frequency: customValues.frequency || template.defaultFrequency,
    isActive: customValues.isActive ?? true,
    isRecurring: customValues.isRecurring ?? true,
    isEssential: customValues.isEssential ?? template.isEssential,
    priorityLevel: customValues.priorityLevel ?? template.priorityLevel,
    ...customValues,
  };
}

/**
 * Validate scenario timing and logical consistency
 */
export function validateScenario(
  scenario: Partial<IncomeScenario | ExpenseScenario>,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!scenario.name || scenario.name.trim().length === 0) {
    errors.push("Scenario name is required");
  }

  if (!scenario.amount || scenario.amount === 0) {
    errors.push("Scenario amount must be non-zero");
  }

  if (!scenario.startMonth || scenario.startMonth < 1) {
    errors.push("Start month must be 1 or greater");
  }

  // Validate timing logic
  if (
    scenario.endMonth &&
    scenario.startMonth &&
    scenario.endMonth < scenario.startMonth
  ) {
    errors.push("End month cannot be before start month");
  }

  // Validate frequency logic
  if (
    scenario.frequency === "one_time" &&
    scenario.endMonth &&
    scenario.endMonth !== scenario.startMonth
  ) {
    errors.push(
      "One-time scenarios cannot have different start and end months",
    );
  }

  // Validate income-specific fields
  if ("scenarioType" in scenario && "taxRate" in scenario) {
    if (
      scenario.taxRate !== undefined &&
      (scenario.taxRate < 0 || scenario.taxRate > 1)
    ) {
      errors.push("Tax rate must be between 0 and 1");
    }
  }

  // Validate expense-specific fields
  if ("category" in scenario && "priorityLevel" in scenario) {
    if (
      scenario.priorityLevel !== undefined &&
      (scenario.priorityLevel < 1 || scenario.priorityLevel > 10)
    ) {
      errors.push("Priority level must be between 1 and 10");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate the impact of a scenario on discretionary income and mortgage payoff
 */
export function calculateScenarioImpact(
  scenario: IncomeScenario | ExpenseScenario,
  baseBudgetScenario: BudgetScenario,
  monthsToAnalyze: number = 60,
): ScenarioImpactAnalysis {
  let totalImpact = 0;
  let monthlyImpact = 0;

  // Calculate average monthly impact over the analysis period
  for (let month = 1; month <= monthsToAnalyze; month++) {
    const isInRange =
      month >= scenario.startMonth &&
      (scenario.endMonth === undefined || month <= scenario.endMonth);

    if (isInRange) {
      const monthlyAmount = calculateMonthlyAmount(
        scenario.amount,
        scenario.frequency,
        month,
        scenario.startMonth,
      );

      if ("scenarioType" in scenario) {
        // Income scenario - apply tax rate
        const afterTaxAmount = monthlyAmount * (1 - scenario.taxRate);
        totalImpact += afterTaxAmount;
        monthlyImpact = afterTaxAmount; // For recurring scenarios
      } else {
        // Expense scenario
        totalImpact -= monthlyAmount;
        monthlyImpact = -monthlyAmount; // For recurring scenarios
      }
    }
  }

  // Estimate impact on payoff timeline (simplified calculation)
  const principalMultiplier = baseBudgetScenario.principalMultiplier;
  const additionalPrincipalPerMonth = monthlyImpact * principalMultiplier;

  // Rough estimate: each $1000 of additional principal saves about 1-2 months
  const payoffImpact = Math.round((additionalPrincipalPerMonth / 1000) * 1.5);

  // Rough estimate: each month saved is about $1000-2000 in interest
  const interestImpact = payoffImpact * 1500;

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    type: "scenarioType" in scenario ? "income" : "expense",
    monthlyImpact,
    totalImpact,
    payoffImpact,
    interestImpact,
  };
}

/**
 * Helper function to calculate monthly amount (same as in calculations.ts)
 */
function calculateMonthlyAmount(
  amount: number,
  frequency: ScenarioFrequency,
  currentMonth: number,
  startMonth: number,
): number {
  switch (frequency) {
    case "monthly":
      return amount;
    case "quarterly":
      const monthsFromStart = currentMonth - startMonth;
      return monthsFromStart % 3 === 0 ? amount : 0;
    case "annually":
      const yearlyMonthsFromStart = currentMonth - startMonth;
      return yearlyMonthsFromStart % 12 === 0 ? amount : 0;
    case "one_time":
      return currentMonth === startMonth ? amount : 0;
    default:
      return 0;
  }
}

/**
 * Generate scenario suggestions based on user profile
 */
export function generateScenarioSuggestions(budgetScenario: BudgetScenario): {
  incomeScenarios: Array<{ type: IncomeScenarioType; reason: string }>;
  expenseScenarios: Array<{ category: ExpenseCategory; reason: string }>;
} {
  const suggestions = {
    incomeScenarios: [] as Array<{ type: IncomeScenarioType; reason: string }>,
    expenseScenarios: [] as Array<{
      category: ExpenseCategory;
      reason: string;
    }>,
  };

  // Income suggestions based on discretionary income level
  if (budgetScenario.baseDiscretionaryIncome > 1000) {
    suggestions.incomeScenarios.push({
      type: "raise",
      reason:
        "Model a potential salary increase to accelerate payoff even further",
    });
    suggestions.incomeScenarios.push({
      type: "side_income",
      reason: "Consider additional income sources to maximize acceleration",
    });
  }

  if (budgetScenario.baseDiscretionaryIncome < 500) {
    suggestions.incomeScenarios.push({
      type: "side_income",
      reason:
        "Additional income could significantly improve your payoff timeline",
    });
  }

  // Expense suggestions for risk planning
  suggestions.expenseScenarios.push({
    category: "emergency",
    reason: "Plan for unexpected expenses that could impact your strategy",
  });

  if (budgetScenario.baseDiscretionaryIncome > 2000) {
    suggestions.expenseScenarios.push({
      category: "discretionary",
      reason: "Model lifestyle inflation to ensure sustainable acceleration",
    });
  }

  return suggestions;
}

/**
 * Optimize scenario timing for maximum impact
 */
export function optimizeScenarioTiming(
  scenarios: (IncomeScenario | ExpenseScenario)[],
  budgetScenario: BudgetScenario,
): Array<{ scenarioId: string; suggestedStartMonth: number; reason: string }> {
  const optimizations: Array<{
    scenarioId: string;
    suggestedStartMonth: number;
    reason: string;
  }> = [];

  scenarios.forEach((scenario) => {
    // For income scenarios, earlier is generally better
    if ("scenarioType" in scenario && scenario.scenarioType === "raise") {
      if (scenario.startMonth > 12) {
        optimizations.push({
          scenarioId: scenario.id,
          suggestedStartMonth: 1,
          reason:
            "Starting salary increases earlier maximizes compound benefits",
        });
      }
    }

    // For emergency expenses, timing in middle years might be more realistic
    if ("category" in scenario && scenario.category === "emergency") {
      if (scenario.startMonth < 12) {
        optimizations.push({
          scenarioId: scenario.id,
          suggestedStartMonth: 24,
          reason:
            "Emergency expenses are more likely after initial acceleration period",
        });
      }
    }
  });

  return optimizations;
}
