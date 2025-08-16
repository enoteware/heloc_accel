/**
 * Validation Utilities for Budgeting Tool
 * Comprehensive validation for budget scenarios, income/expense scenarios, and calculations
 */

import type {
  BudgetScenario,
  IncomeScenario,
  ExpenseScenario,
  CreateBudgetScenarioRequest,
  CreateIncomeScenarioRequest,
  CreateExpenseScenarioRequest,
  ValidationResult,
  ValidationError,
  LiveCalculationRequest,
} from "../../types/budgeting";

/**
 * Validation rules and constants
 */
const VALIDATION_RULES = {
  income: {
    min: 0,
    max: 1000000, // $1M monthly max
    required: true,
  },
  expenses: {
    min: 0,
    max: 500000, // $500K monthly max
    required: true,
  },
  amount: {
    min: -100000, // Allow negative for job loss scenarios
    max: 100000,
    required: true,
  },
  month: {
    min: 1,
    max: 600, // 50 years max
    required: true,
  },
  multiplier: {
    min: 0.1,
    max: 10.0,
    required: false,
  },
  taxRate: {
    min: 0,
    max: 0.6, // 60% max tax rate
    required: false,
  },
  priorityLevel: {
    min: 1,
    max: 10,
    required: false,
  },
};

/**
 * Validate budget scenario creation request
 */
export function validateBudgetScenarioRequest(
  request: CreateBudgetScenarioRequest,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }> = [];

  // Validate required fields
  if (!request.name || request.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Budget scenario name is required",
      severity: "error",
    });
  } else if (request.name.length > 255) {
    errors.push({
      field: "name",
      message: "Budget scenario name must be 255 characters or less",
      severity: "error",
    });
  }

  if (!request.scenarioId) {
    errors.push({
      field: "scenarioId",
      message: "Parent scenario ID is required",
      severity: "error",
    });
  }

  // Validate income values
  if (
    request.baseMonthlyGrossIncome < VALIDATION_RULES.income.min ||
    request.baseMonthlyGrossIncome > VALIDATION_RULES.income.max
  ) {
    errors.push({
      field: "baseMonthlyGrossIncome",
      message: `Gross income must be between $${VALIDATION_RULES.income.min} and $${VALIDATION_RULES.income.max}`,
      severity: "error",
    });
  }

  if (
    request.baseMonthlyNetIncome < VALIDATION_RULES.income.min ||
    request.baseMonthlyNetIncome > VALIDATION_RULES.income.max
  ) {
    errors.push({
      field: "baseMonthlyNetIncome",
      message: `Net income must be between $${VALIDATION_RULES.income.min} and $${VALIDATION_RULES.income.max}`,
      severity: "error",
    });
  }

  // Validate expense values
  if (
    request.baseMonthlyExpenses < VALIDATION_RULES.expenses.min ||
    request.baseMonthlyExpenses > VALIDATION_RULES.expenses.max
  ) {
    errors.push({
      field: "baseMonthlyExpenses",
      message: `Monthly expenses must be between $${VALIDATION_RULES.expenses.min} and $${VALIDATION_RULES.expenses.max}`,
      severity: "error",
    });
  }

  // Validate logical relationships
  if (request.baseMonthlyNetIncome > request.baseMonthlyGrossIncome) {
    errors.push({
      field: "baseMonthlyNetIncome",
      message: "Net income cannot be greater than gross income",
      severity: "error",
    });
  }

  const discretionaryIncome =
    request.baseMonthlyNetIncome - request.baseMonthlyExpenses;
  if (discretionaryIncome < 0) {
    warnings.push({
      field: "baseMonthlyExpenses",
      message:
        "Expenses exceed income, resulting in negative discretionary income",
      severity: "warning",
    });
  }

  // Validate optional fields
  if (request.customPrincipalPayment !== undefined) {
    if (request.customPrincipalPayment < 0) {
      errors.push({
        field: "customPrincipalPayment",
        message: "Custom principal payment cannot be negative",
        severity: "error",
      });
    }

    if (request.customPrincipalPayment > discretionaryIncome * 5) {
      warnings.push({
        field: "customPrincipalPayment",
        message:
          "Custom principal payment is very high relative to discretionary income",
        severity: "warning",
      });
    }
  }

  if (request.principalMultiplier !== undefined) {
    if (
      request.principalMultiplier < VALIDATION_RULES.multiplier.min ||
      request.principalMultiplier > VALIDATION_RULES.multiplier.max
    ) {
      errors.push({
        field: "principalMultiplier",
        message: `Principal multiplier must be between ${VALIDATION_RULES.multiplier.min} and ${VALIDATION_RULES.multiplier.max}`,
        severity: "error",
      });
    }
  }

  // Generate suggestions
  if (discretionaryIncome > 0) {
    const recommendedPayment = discretionaryIncome * 3;
    if (
      !request.customPrincipalPayment ||
      Math.abs(request.customPrincipalPayment - recommendedPayment) > 500
    ) {
      suggestions.push({
        field: "customPrincipalPayment",
        message: `Consider using the recommended principal payment of $${recommendedPayment.toFixed(2)}`,
        suggestedValue: recommendedPayment,
      });
    }
  }

  if (request.baseMonthlyExpenses > request.baseMonthlyNetIncome * 0.8) {
    suggestions.push({
      field: "baseMonthlyExpenses",
      message:
        "Consider reducing expenses to increase discretionary income for faster payoff",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate income scenario creation request
 */
export function validateIncomeScenarioRequest(
  request: CreateIncomeScenarioRequest,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }> = [];

  // Validate required fields
  if (!request.name || request.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Income scenario name is required",
      severity: "error",
    });
  }

  if (request.amount === undefined || request.amount === 0) {
    errors.push({
      field: "amount",
      message: "Income amount is required and cannot be zero",
      severity: "error",
    });
  } else if (
    request.amount < VALIDATION_RULES.amount.min ||
    request.amount > VALIDATION_RULES.amount.max
  ) {
    errors.push({
      field: "amount",
      message: `Income amount must be between $${VALIDATION_RULES.amount.min} and $${VALIDATION_RULES.amount.max}`,
      severity: "error",
    });
  }

  if (
    !request.startMonth ||
    request.startMonth < VALIDATION_RULES.month.min ||
    request.startMonth > VALIDATION_RULES.month.max
  ) {
    errors.push({
      field: "startMonth",
      message: `Start month must be between ${VALIDATION_RULES.month.min} and ${VALIDATION_RULES.month.max}`,
      severity: "error",
    });
  }

  // Validate timing logic
  if (request.endMonth !== undefined) {
    if (request.endMonth < request.startMonth) {
      errors.push({
        field: "endMonth",
        message: "End month cannot be before start month",
        severity: "error",
      });
    }

    if (
      request.frequency === "one_time" &&
      request.endMonth !== request.startMonth
    ) {
      errors.push({
        field: "endMonth",
        message:
          "One-time scenarios cannot have different start and end months",
        severity: "error",
      });
    }
  }

  // Validate tax rate
  if (request.taxRate !== undefined) {
    if (
      request.taxRate < VALIDATION_RULES.taxRate.min ||
      request.taxRate > VALIDATION_RULES.taxRate.max
    ) {
      errors.push({
        field: "taxRate",
        message: `Tax rate must be between ${VALIDATION_RULES.taxRate.min * 100}% and ${VALIDATION_RULES.taxRate.max * 100}%`,
        severity: "error",
      });
    }
  }

  // Generate warnings and suggestions
  if (request.amount < 0 && request.scenarioType !== "job_loss") {
    warnings.push({
      field: "amount",
      message:
        'Negative income amount - consider using "job_loss" scenario type',
      severity: "warning",
    });
  }

  if (request.scenarioType === "bonus" && request.frequency === "monthly") {
    suggestions.push({
      field: "frequency",
      message: "Bonuses are typically annual or quarterly",
      suggestedValue: "annually",
    });
  }

  if (request.scenarioType === "raise" && request.startMonth === 1) {
    suggestions.push({
      field: "startMonth",
      message: "Salary raises often occur mid-year (month 6-12)",
      suggestedValue: 12,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate expense scenario creation request
 */
export function validateExpenseScenarioRequest(
  request: CreateExpenseScenarioRequest,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }> = [];

  // Validate required fields
  if (!request.name || request.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Expense scenario name is required",
      severity: "error",
    });
  }

  if (request.amount === undefined || request.amount <= 0) {
    errors.push({
      field: "amount",
      message: "Expense amount is required and must be positive",
      severity: "error",
    });
  } else if (request.amount > VALIDATION_RULES.amount.max) {
    errors.push({
      field: "amount",
      message: `Expense amount must be less than $${VALIDATION_RULES.amount.max}`,
      severity: "error",
    });
  }

  if (
    !request.startMonth ||
    request.startMonth < VALIDATION_RULES.month.min ||
    request.startMonth > VALIDATION_RULES.month.max
  ) {
    errors.push({
      field: "startMonth",
      message: `Start month must be between ${VALIDATION_RULES.month.min} and ${VALIDATION_RULES.month.max}`,
      severity: "error",
    });
  }

  // Validate timing logic
  if (request.endMonth !== undefined) {
    if (request.endMonth < request.startMonth) {
      errors.push({
        field: "endMonth",
        message: "End month cannot be before start month",
        severity: "error",
      });
    }

    if (
      request.frequency === "one_time" &&
      request.endMonth !== request.startMonth
    ) {
      errors.push({
        field: "endMonth",
        message:
          "One-time scenarios cannot have different start and end months",
        severity: "error",
      });
    }
  }

  // Validate priority level
  if (request.priorityLevel !== undefined) {
    if (
      request.priorityLevel < VALIDATION_RULES.priorityLevel.min ||
      request.priorityLevel > VALIDATION_RULES.priorityLevel.max
    ) {
      errors.push({
        field: "priorityLevel",
        message: `Priority level must be between ${VALIDATION_RULES.priorityLevel.min} and ${VALIDATION_RULES.priorityLevel.max}`,
        severity: "error",
      });
    }
  }

  // Generate warnings and suggestions
  if (request.category === "emergency" && request.frequency !== "one_time") {
    warnings.push({
      field: "frequency",
      message: "Emergency expenses are typically one-time events",
      severity: "warning",
    });
  }

  if (request.category === "discretionary" && request.isEssential === true) {
    warnings.push({
      field: "isEssential",
      message: "Discretionary expenses are typically not essential",
      severity: "warning",
    });
  }

  if (request.amount > 10000 && request.frequency === "monthly") {
    warnings.push({
      field: "amount",
      message: "Very high monthly expense - verify this amount is correct",
      severity: "warning",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate live calculation request
 */
export function validateLiveCalculationRequest(
  request: LiveCalculationRequest,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }> = [];

  // Validate base income and expenses
  if (request.baseIncome <= 0) {
    errors.push({
      field: "baseIncome",
      message: "Base income must be positive",
      severity: "error",
    });
  }

  if (request.baseExpenses < 0) {
    errors.push({
      field: "baseExpenses",
      message: "Base expenses cannot be negative",
      severity: "error",
    });
  }

  if (request.baseExpenses >= request.baseIncome) {
    warnings.push({
      field: "baseExpenses",
      message:
        "Expenses equal or exceed income - no discretionary income available",
      severity: "warning",
    });
  }

  // Validate mortgage details
  if (!request.mortgageDetails) {
    errors.push({
      field: "mortgageDetails",
      message: "Mortgage details are required for HELOC calculations",
      severity: "error",
    });
  } else {
    if (
      !request.mortgageDetails.principal ||
      request.mortgageDetails.principal <= 0
    ) {
      errors.push({
        field: "mortgageDetails.principal",
        message: "Mortgage principal must be positive",
        severity: "error",
      });
    }

    if (
      request.mortgageDetails.annualInterestRate < 0 ||
      request.mortgageDetails.annualInterestRate > 0.2
    ) {
      errors.push({
        field: "mortgageDetails.annualInterestRate",
        message: "Interest rate must be between 0% and 20%",
        severity: "error",
      });
    }

    if (
      request.mortgageDetails.termInMonths < 12 ||
      request.mortgageDetails.termInMonths > 600
    ) {
      errors.push({
        field: "mortgageDetails.termInMonths",
        message: "Mortgage term must be between 1 and 50 years",
        severity: "error",
      });
    }
  }

  // Validate HELOC details if provided
  if (request.helocDetails) {
    if (request.helocDetails.helocLimit < 0) {
      errors.push({
        field: "helocDetails.helocLimit",
        message: "HELOC limit cannot be negative",
        severity: "error",
      });
    }

    if (
      request.helocDetails.helocRate < 0 ||
      request.helocDetails.helocRate > 0.3
    ) {
      errors.push({
        field: "helocDetails.helocRate",
        message: "HELOC rate must be between 0% and 30%",
        severity: "error",
      });
    }
  }

  // Validate scenarios
  if (request.scenarios && Array.isArray(request.scenarios)) {
    request.scenarios.forEach((scenario, index) => {
      if (scenario.amount === 0) {
        errors.push({
          field: `scenarios[${index}].amount`,
          message: "Scenario amount cannot be zero",
          severity: "error",
        });
      }

      if (scenario.startMonth < 1) {
        errors.push({
          field: `scenarios[${index}].startMonth`,
          message: "Start month must be 1 or greater",
          severity: "error",
        });
      }

      if (scenario.endMonth && scenario.endMonth < scenario.startMonth) {
        errors.push({
          field: `scenarios[${index}].endMonth`,
          message: "End month cannot be before start month",
          severity: "error",
        });
      }
    });
  }

  // Validate projection period
  if (
    request.monthsToProject &&
    (request.monthsToProject < 12 || request.monthsToProject > 600)
  ) {
    errors.push({
      field: "monthsToProject",
      message: "Projection period must be between 1 and 50 years",
      severity: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate that a budget scenario is financially sound
 */
export function validateFinancialSoundness(
  budgetScenario: BudgetScenario,
  incomeScenarios: IncomeScenario[] = [],
  expenseScenarios: ExpenseScenario[] = [],
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }> = [];

  // Check for extreme scenarios that could cause problems
  let worstCaseDiscretionary = budgetScenario.baseDiscretionaryIncome;
  let bestCaseDiscretionary = budgetScenario.baseDiscretionaryIncome;

  // Simulate worst and best case scenarios
  for (let month = 1; month <= 60; month++) {
    // Check first 5 years
    let monthlyIncome = budgetScenario.baseMonthlyNetIncome;
    let monthlyExpenses = budgetScenario.baseMonthlyExpenses;

    // Apply all scenarios for this month
    incomeScenarios.forEach((scenario) => {
      if (
        scenario.isActive &&
        month >= scenario.startMonth &&
        (scenario.endMonth === undefined || month <= scenario.endMonth)
      ) {
        const afterTax = scenario.amount * (1 - scenario.taxRate);
        monthlyIncome += afterTax;
      }
    });

    expenseScenarios.forEach((scenario) => {
      if (
        scenario.isActive &&
        month >= scenario.startMonth &&
        (scenario.endMonth === undefined || month <= scenario.endMonth)
      ) {
        monthlyExpenses += scenario.amount;
      }
    });

    const discretionary = monthlyIncome - monthlyExpenses;
    worstCaseDiscretionary = Math.min(worstCaseDiscretionary, discretionary);
    bestCaseDiscretionary = Math.max(bestCaseDiscretionary, discretionary);
  }

  // Generate warnings for extreme cases
  if (worstCaseDiscretionary < 0) {
    warnings.push({
      field: "scenarios",
      message: `Scenarios result in negative discretionary income (worst case: $${worstCaseDiscretionary.toFixed(2)})`,
      severity: "warning",
    });
  }

  if (worstCaseDiscretionary < budgetScenario.baseDiscretionaryIncome * 0.5) {
    warnings.push({
      field: "scenarios",
      message:
        "Scenarios significantly reduce discretionary income - consider emergency planning",
      severity: "warning",
    });
  }

  // Check for unrealistic payment amounts
  const recommendedPayment =
    budgetScenario.baseDiscretionaryIncome * budgetScenario.principalMultiplier;
  if (recommendedPayment > budgetScenario.baseMonthlyNetIncome * 0.5) {
    warnings.push({
      field: "principalMultiplier",
      message:
        "Recommended payment exceeds 50% of net income - may not be sustainable",
      severity: "warning",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}
