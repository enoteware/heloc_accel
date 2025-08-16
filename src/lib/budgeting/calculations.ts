/**
 * Enhanced Calculation Engine for Budgeting Tool
 * Extends existing HELOC calculations with discretionary income engine and scenario modeling
 */

import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateHELOCAcceleration,
  type MortgageInput,
  type HELOCInput,
  type HELOCCalculationResult,
  type HELOCMonthlyPayment,
} from "../calculations";

import type {
  BudgetScenario,
  IncomeScenario,
  ExpenseScenario,
  BudgetCalculationResult,
  CalculationSummary,
  LiveCalculationRequest,
  LiveCalculationResponse,
  ScenarioFrequency,
} from "../../types/budgeting";

/**
 * Calculate discretionary income from income and expenses
 */
export function calculateDiscretionaryIncome(
  monthlyNetIncome: number,
  monthlyExpenses: number,
): number {
  return monthlyNetIncome - monthlyExpenses;
}

/**
 * Calculate recommended principal payment based on discretionary income
 */
export function calculateRecommendedPrincipalPayment(
  discretionaryIncome: number,
  multiplier: number = 3.0,
): number {
  return Math.max(0, discretionaryIncome * multiplier);
}

/**
 * Apply income/expense scenarios to calculate adjusted values for a specific month
 */
export function applyScenarios(
  baseIncome: number,
  baseExpenses: number,
  month: number,
  incomeScenarios: IncomeScenario[],
  expenseScenarios: ExpenseScenario[],
): {
  adjustedIncome: number;
  adjustedExpenses: number;
  discretionaryIncome: number;
  scenariosApplied: string[];
} {
  let adjustedIncome = baseIncome;
  let adjustedExpenses = baseExpenses;
  const scenariosApplied: string[] = [];

  // Apply income scenarios
  incomeScenarios.forEach((scenario) => {
    if (!scenario.isActive) return;

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
      if (monthlyAmount > 0) {
        // Apply tax rate to income
        const afterTaxAmount = monthlyAmount * (1 - scenario.taxRate);
        adjustedIncome += afterTaxAmount;
        scenariosApplied.push(
          `+${scenario.name}: $${afterTaxAmount.toFixed(2)}`,
        );
      }
    }
  });

  // Apply expense scenarios
  expenseScenarios.forEach((scenario) => {
    if (!scenario.isActive) return;

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
      if (monthlyAmount > 0) {
        adjustedExpenses += monthlyAmount;
        scenariosApplied.push(
          `-${scenario.name}: $${monthlyAmount.toFixed(2)}`,
        );
      }
    }
  });

  const discretionaryIncome = calculateDiscretionaryIncome(
    adjustedIncome,
    adjustedExpenses,
  );

  return {
    adjustedIncome,
    adjustedExpenses,
    discretionaryIncome,
    scenariosApplied,
  };
}

/**
 * Calculate monthly amount based on frequency and timing
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
      // Apply every 3 months starting from start month
      const monthsFromStart = currentMonth - startMonth;
      return monthsFromStart % 3 === 0 ? amount : 0;
    case "annually":
      // Apply every 12 months starting from start month
      const yearlyMonthsFromStart = currentMonth - startMonth;
      return yearlyMonthsFromStart % 12 === 0 ? amount : 0;
    case "one_time":
      // Apply only in the start month
      return currentMonth === startMonth ? amount : 0;
    default:
      return 0;
  }
}

/**
 * Enhanced HELOC calculation with budgeting scenarios
 */
export function calculateBudgetingAcceleration(
  budgetScenario: BudgetScenario,
  mortgageInput: MortgageInput,
  helocInput?: Partial<HELOCInput>,
  incomeScenarios: IncomeScenario[] = [],
  expenseScenarios: ExpenseScenario[] = [],
  monthsToProject: number = 360,
): {
  summary: CalculationSummary;
  monthlyResults: BudgetCalculationResult[];
  traditionalComparison: HELOCCalculationResult;
} {
  const monthlyResults: BudgetCalculationResult[] = [];

  // Calculate traditional payoff for comparison
  const traditionalInput: HELOCInput = {
    mortgageBalance: mortgageInput.principal,
    mortgageRate: mortgageInput.annualInterestRate,
    mortgagePayment:
      mortgageInput.monthlyPayment ||
      calculateMonthlyPayment(
        mortgageInput.principal,
        mortgageInput.annualInterestRate,
        mortgageInput.termInMonths,
      ),
    helocLimit: 0,
    helocRate: 0,
    discretionaryIncome: 0,
    propertyValue: mortgageInput.propertyValue,
    pmiMonthly: mortgageInput.pmiMonthly,
  };

  const traditionalComparison = calculateHELOCAcceleration(traditionalInput);

  // Initialize tracking variables
  let currentMortgageBalance = mortgageInput.principal;
  let currentHelocBalance = 0;
  let cumulativeInterestSaved = 0;
  let cumulativeTimeSavedMonths = 0;
  let maxDiscretionaryIncome = budgetScenario.baseDiscretionaryIncome;
  let minDiscretionaryIncome = budgetScenario.baseDiscretionaryIncome;
  let totalDiscretionaryIncome = 0;
  let month = 1;

  const helocLimit = helocInput?.helocLimit || 0;
  const helocRate = helocInput?.helocRate || 0;
  const monthlyMortgageRate = mortgageInput.annualInterestRate / 12;
  const monthlyHelocRate = helocRate / 12;
  const baseMortgagePayment =
    mortgageInput.monthlyPayment ||
    calculateMonthlyPayment(
      mortgageInput.principal,
      mortgageInput.annualInterestRate,
      mortgageInput.termInMonths,
    );

  while (currentMortgageBalance > 0.01 && month <= monthsToProject) {
    // Apply scenarios for this month
    const scenarioResults = applyScenarios(
      budgetScenario.baseMonthlyNetIncome,
      budgetScenario.baseMonthlyExpenses,
      month,
      incomeScenarios,
      expenseScenarios,
    );

    const discretionaryIncome = scenarioResults.discretionaryIncome;
    totalDiscretionaryIncome += discretionaryIncome;
    maxDiscretionaryIncome = Math.max(
      maxDiscretionaryIncome,
      discretionaryIncome,
    );
    minDiscretionaryIncome = Math.min(
      minDiscretionaryIncome,
      discretionaryIncome,
    );

    // Calculate recommended and actual principal payments
    const recommendedPrincipalPayment = calculateRecommendedPrincipalPayment(
      discretionaryIncome,
      budgetScenario.principalMultiplier,
    );

    const actualPrincipalPayment =
      budgetScenario.customPrincipalPayment || recommendedPrincipalPayment;

    // Calculate mortgage payment breakdown
    const mortgageInterest = currentMortgageBalance * monthlyMortgageRate;
    const basePrincipalPayment = baseMortgagePayment - mortgageInterest;
    const totalPrincipalPayment = Math.min(
      basePrincipalPayment + actualPrincipalPayment,
      currentMortgageBalance,
    );

    // Calculate HELOC usage if needed
    let helocUsed = 0;
    let helocPayment = 0;
    let helocInterest = 0;

    if (actualPrincipalPayment > discretionaryIncome && helocLimit > 0) {
      const neededFromHeloc = actualPrincipalPayment - discretionaryIncome;
      const availableHeloc = helocLimit - currentHelocBalance;
      helocUsed = Math.min(neededFromHeloc, availableHeloc);
      currentHelocBalance += helocUsed;
    }

    if (currentHelocBalance > 0) {
      helocInterest = currentHelocBalance * monthlyHelocRate;
      // Use remaining discretionary income to pay down HELOC
      const remainingDiscretionary = Math.max(
        0,
        discretionaryIncome - actualPrincipalPayment,
      );
      helocPayment = Math.min(
        remainingDiscretionary + helocInterest,
        currentHelocBalance,
      );
      currentHelocBalance = Math.max(
        0,
        currentHelocBalance - helocPayment + helocInterest,
      );
    }

    // Calculate PMI
    let pmiPayment = mortgageInput.pmiMonthly || 0;
    let currentLtv = 100;
    let pmiEliminated = false;

    if (mortgageInput.propertyValue && mortgageInput.propertyValue > 0) {
      currentLtv = (currentMortgageBalance / mortgageInput.propertyValue) * 100;
      if (currentLtv <= 78) {
        pmiPayment = 0;
        pmiEliminated = true;
      }
    }

    // Update mortgage balance
    const beginningMortgageBalance = currentMortgageBalance;
    currentMortgageBalance = Math.max(
      0,
      currentMortgageBalance - totalPrincipalPayment,
    );

    // Calculate cash flow metrics
    const totalMonthlyOutflow =
      baseMortgagePayment + actualPrincipalPayment + helocPayment + pmiPayment;
    const remainingCashFlow =
      scenarioResults.adjustedIncome -
      scenarioResults.adjustedExpenses -
      totalMonthlyOutflow;
    const cashFlowStressRatio =
      totalMonthlyOutflow / scenarioResults.adjustedIncome;

    // Calculate cumulative savings vs traditional
    const traditionalMonthData = traditionalComparison.schedule[month - 1];
    if (traditionalMonthData) {
      const interestSavedThisMonth =
        traditionalMonthData.interestPayment - mortgageInterest;
      cumulativeInterestSaved += interestSavedThisMonth;
    }

    // Store monthly result
    const monthlyResult: BudgetCalculationResult = {
      id: `calc-${month}`,
      budgetScenarioId: budgetScenario.id,
      monthNumber: month,
      monthlyGrossIncome: budgetScenario.baseMonthlyGrossIncome,
      monthlyNetIncome: scenarioResults.adjustedIncome,
      monthlyExpenses: scenarioResults.adjustedExpenses,
      discretionaryIncome,
      recommendedPrincipalPayment,
      actualPrincipalPayment,
      paymentAdjustmentReason:
        scenarioResults.scenariosApplied.join(", ") || undefined,
      beginningMortgageBalance,
      endingMortgageBalance: currentMortgageBalance,
      mortgagePayment: baseMortgagePayment,
      mortgageInterest,
      mortgagePrincipal: totalPrincipalPayment,
      beginningHelocBalance: currentHelocBalance + helocUsed - helocInterest,
      endingHelocBalance: currentHelocBalance,
      helocPayment,
      helocInterest,
      helocPrincipal: helocPayment - helocInterest,
      pmiPayment,
      currentLtv,
      pmiEliminated,
      cumulativeInterestPaid: 0, // Will be calculated in post-processing
      cumulativePrincipalPaid: 0, // Will be calculated in post-processing
      cumulativeInterestSaved,
      cumulativeTimeSavedMonths,
      totalMonthlyOutflow,
      remainingCashFlow,
      cashFlowStressRatio,
      calculationTimestamp: new Date().toISOString(),
      calculationVersion: "1.0",
    };

    monthlyResults.push(monthlyResult);
    month++;
  }

  // Post-process cumulative calculations
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  monthlyResults.forEach((result) => {
    cumulativeInterest += result.mortgageInterest + result.helocInterest;
    cumulativePrincipal += result.mortgagePrincipal;
    result.cumulativeInterestPaid = cumulativeInterest;
    result.cumulativePrincipalPaid = cumulativePrincipal;
  });

  // Calculate summary
  const budgetingPayoffMonths = monthlyResults.length;
  const traditionalPayoffMonths = traditionalComparison.payoffMonths;
  const monthsSaved = traditionalPayoffMonths - budgetingPayoffMonths;
  const averageDiscretionaryIncome =
    totalDiscretionaryIncome / budgetingPayoffMonths;

  // Find PMI elimination month
  const pmiEliminationMonth =
    monthlyResults.findIndex((result) => result.pmiEliminated) + 1;

  const summary: CalculationSummary = {
    totalMonths: budgetingPayoffMonths,
    totalInterestSaved: cumulativeInterestSaved,
    pmiEliminationMonth: pmiEliminationMonth || 0,
    maxDiscretionaryIncome,
    minDiscretionaryIncome,
    averageDiscretionaryIncome,
    traditionalPayoffMonths,
    budgetingPayoffMonths,
    monthsSaved,
  };

  return {
    summary,
    monthlyResults,
    traditionalComparison,
  };
}

/**
 * Live calculation for real-time updates (without saving to database)
 */
export function calculateLive(
  request: LiveCalculationRequest,
): LiveCalculationResponse {
  const discretionaryIncome = calculateDiscretionaryIncome(
    request.baseIncome,
    request.baseExpenses,
  );
  const principalMultiplier = request.principalMultiplier || 3.0;
  const recommendedPrincipalPayment = calculateRecommendedPrincipalPayment(
    discretionaryIncome,
    principalMultiplier,
  );

  // Create temporary budget scenario for calculation
  const tempBudgetScenario: BudgetScenario = {
    id: "temp",
    scenarioId: "temp",
    name: "Live Calculation",
    baseMonthlyGrossIncome: request.baseIncome * 1.25, // Estimate gross from net
    baseMonthlyNetIncome: request.baseIncome,
    baseMonthlyExpenses: request.baseExpenses,
    baseDiscretionaryIncome: discretionaryIncome,
    recommendedPrincipalPayment,
    principalMultiplier,
    autoAdjustPayments: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };

  // Convert request scenarios to proper format
  const incomeScenarios: IncomeScenario[] = request.scenarios
    .filter((s) => s.type === "income")
    .map((s, index) => ({
      id: `temp-income-${index}`,
      budgetScenarioId: "temp",
      name: `Income Scenario ${index + 1}`,
      scenarioType: "other" as const,
      amount: s.amount,
      startMonth: s.startMonth,
      endMonth: s.endMonth,
      frequency: s.frequency,
      isActive: true,
      isRecurring: true,
      taxRate: 0.25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

  const expenseScenarios: ExpenseScenario[] = request.scenarios
    .filter((s) => s.type === "expense")
    .map((s, index) => ({
      id: `temp-expense-${index}`,
      budgetScenarioId: "temp",
      name: `Expense Scenario ${index + 1}`,
      category: "other" as const,
      amount: s.amount,
      startMonth: s.startMonth,
      endMonth: s.endMonth,
      frequency: s.frequency,
      isActive: true,
      isRecurring: true,
      isEssential: true,
      priorityLevel: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

  // Perform calculation
  const result = calculateBudgetingAcceleration(
    tempBudgetScenario,
    request.mortgageDetails,
    request.helocDetails,
    incomeScenarios,
    expenseScenarios,
    request.monthsToProject,
  );

  // Return simplified response
  return {
    discretionaryIncome,
    recommendedPrincipalPayment,
    projectedPayoffMonths: result.summary.budgetingPayoffMonths,
    projectedInterestSaved: result.summary.totalInterestSaved,
    pmiEliminationMonth: result.summary.pmiEliminationMonth,
    monthlyBreakdown: result.monthlyResults.slice(0, 60).map((r) => ({
      // First 5 years
      monthNumber: r.monthNumber,
      discretionaryIncome: r.discretionaryIncome,
      principalPayment: r.actualPrincipalPayment,
      mortgageBalance: r.endingMortgageBalance,
      interestSaved: r.cumulativeInterestSaved,
    })),
  };
}
