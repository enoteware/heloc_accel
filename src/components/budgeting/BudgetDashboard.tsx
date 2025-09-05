"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Badge } from "@/components/design-system/Badge";
import { Icon } from "@/components/Icons";
import BudgetSummary from "./BudgetSummary";

interface BudgetingScenario {
  id: string;
  name: string;
  description?: string;
  income_sources: any[];
  expense_categories: any[];
  discretionary_income: number;
  heloc_payment_percentage: number;
  created_at: string;
  updated_at: string;
}

interface CalculationResult {
  traditional_payoff_months: number;
  heloc_payoff_months: number;
  time_saved_months: number;
  interest_saved: number;
  percentage_interest_saved: number;
  monthly_heloc_payment: number;
  total_interest_traditional: number;
  total_interest_heloc: number;
}

interface BudgetDashboardProps {
  scenario: BudgetingScenario;
  onScenarioUpdate: (scenario: BudgetingScenario) => void;
}

export default function BudgetDashboard({
  scenario,
  onScenarioUpdate,
}: BudgetDashboardProps) {
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [helocPaymentPercentage, setHelocPaymentPercentage] = useState(
    scenario.heloc_payment_percentage || 50,
  );

  const calculateMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case "weekly":
        return amount * 4.33;
      case "bi-weekly":
        return amount * 2.17;
      case "annual":
        return amount / 12;
      default:
        return amount;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalMonthlyIncome =
    scenario.income_sources?.reduce(
      (sum, income) =>
        sum +
        calculateMonthlyAmount(Number(income.amount) || 0, income.frequency),
      0,
    ) || 0;

  const totalMonthlyExpenses =
    scenario.expense_categories?.reduce(
      (sum, expense) =>
        sum +
        calculateMonthlyAmount(Number(expense.amount) || 0, expense.frequency),
      0,
    ) || 0;

  const discretionaryIncome = totalMonthlyIncome - totalMonthlyExpenses;
  const availableForHeloc = Math.max(0, discretionaryIncome - 500); // Keep $500 buffer
  const suggestedHelocPayment =
    (availableForHeloc * helocPaymentPercentage) / 100;

  const runLiveCalculation = useCallback(async () => {
    if (availableForHeloc <= 0) return;

    setLoading(true);
    try {
      // Convert scenario data to the format expected by the live calculation API
      const scenarios = [
        ...(scenario.income_sources || []).map((income) => ({
          type: "income" as const,
          amount: Number(income.amount) || 0,
          startMonth: income.start_month || 1,
          endMonth: income.end_month,
          frequency: income.frequency as any,
        })),
        ...(scenario.expense_categories || []).map((expense) => ({
          type: "expense" as const,
          amount: Number(expense.amount) || 0,
          startMonth: expense.start_month || 1,
          endMonth: expense.end_month,
          frequency: expense.frequency as any,
        })),
      ];

      const response = await fetch("/api/budgeting/calculate-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseIncome: totalMonthlyIncome,
          baseExpenses: totalMonthlyExpenses,
          mortgageDetails: {
            principal: 320000,
            annualInterestRate: 0.065,
            termInMonths: 360,
            monthlyPayment: 1932.25,
            propertyValue: 400000,
            pmiMonthly: 250,
          },
          helocDetails: {
            helocLimit: 80000,
            helocRate: 0.0725,
            helocAvailableCredit: 80000,
          },
          scenarios: scenarios,
          monthsToProject: 360,
          principalMultiplier: 3.0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculationResult(data.calculation);
      }
    } catch (error) {
      console.error("Error running live calculation:", error);
    } finally {
      setLoading(false);
    }
  }, [availableForHeloc, scenario, totalMonthlyIncome, totalMonthlyExpenses]);

  useEffect(() => {
    if (discretionaryIncome > 500) {
      runLiveCalculation();
    }
  }, [
    scenario,
    helocPaymentPercentage,
    discretionaryIncome,
    runLiveCalculation,
  ]);

  const getFinancialHealthScore = () => {
    let score = 0;
    let maxScore = 100;

    // Income stability (20 points)
    const primaryIncomeCount =
      scenario.income_sources?.filter(
        (i) => i.is_primary || i.scenario_type === "salary",
      )?.length || 0;
    if (primaryIncomeCount >= 1) score += 20;

    // Savings rate (30 points)
    const savingsRate =
      totalMonthlyIncome > 0
        ? (discretionaryIncome / totalMonthlyIncome) * 100
        : 0;
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;

    // Emergency fund potential (25 points)
    const emergencyFundMonths =
      discretionaryIncome > 0
        ? (discretionaryIncome * 12) / totalMonthlyExpenses
        : 0;
    if (emergencyFundMonths >= 6) score += 25;
    else if (emergencyFundMonths >= 3) score += 15;
    else if (emergencyFundMonths >= 1) score += 10;

    // Expense management (25 points)
    const fixedExpenseRatio =
      totalMonthlyExpenses > 0
        ? ((scenario.expense_categories
            ?.filter((e) => e.is_fixed)
            ?.reduce(
              (sum, e) =>
                sum +
                calculateMonthlyAmount(Number(e.amount) || 0, e.frequency),
              0,
            ) || 0) /
            totalMonthlyExpenses) *
          100
        : 0;
    if (fixedExpenseRatio <= 50) score += 25;
    else if (fixedExpenseRatio <= 70) score += 15;
    else if (fixedExpenseRatio <= 80) score += 10;

    return Math.min(score, maxScore);
  };

  const healthScore = getFinancialHealthScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "success" as const, label: "Excellent" };
    if (score >= 60) return { variant: "warning" as const, label: "Good" };
    return { variant: "danger" as const, label: "Needs Work" };
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="heart" size="sm" className="text-pink-500" />
              <span>Financial Health Score</span>
            </div>
            <Badge variant={getScoreBadge(healthScore).variant}>
              {getScoreBadge(healthScore).label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(healthScore)}`}>
              {healthScore}/100
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Based on:</div>
              <div className="text-xs text-muted-foreground">
                Income stability • Savings rate • Emergency fund • Expense
                management
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                healthScore >= 80
                  ? "bg-primary"
                  : healthScore >= 60
                    ? "bg-accent"
                    : "bg-destructive"
              }`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* HELOC Strategy Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="target" size="sm" className="text-primary" />
            <span>HELOC Acceleration Strategy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discretionaryIncome <= 0 ? (
            <div className="text-center py-6">
              <Icon
                name="alert"
                size="lg"
                className="text-accent mx-auto mb-3"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Insufficient Discretionary Income
              </h3>
              <p className="text-muted-foreground mb-4">
                You need positive discretionary income to use HELOC acceleration
                effectively.
              </p>
              <div className="text-sm text-muted-foreground">
                Current deficit: {formatCurrency(Math.abs(discretionaryIncome))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available funds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(discretionaryIncome)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Discretionary Income
                  </div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(availableForHeloc)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Available for HELOC
                  </div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(suggestedHelocPayment)}
                  </div>
                  <div className="text-sm text-gray-600">Suggested Payment</div>
                </div>
              </div>

              {/* HELOC Payment Percentage Slider */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  HELOC Payment Allocation: {helocPaymentPercentage}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={helocPaymentPercentage}
                  onChange={(e) =>
                    setHelocPaymentPercentage(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Conservative (10%)</span>
                  <span>Aggressive (90%)</span>
                </div>
              </div>

              {/* Calculation Results */}
              {calculationResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Projected Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>Time Saved:</span>
                        <span className="font-semibold text-blue-600">
                          {calculationResult.time_saved_months} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Saved:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(calculationResult.interest_saved)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Traditional Payoff:</span>
                        <span>
                          {calculationResult.traditional_payoff_months} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>HELOC Payoff:</span>
                        <span>
                          {calculationResult.heloc_payoff_months} months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={runLiveCalculation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon name="calculator" size="sm" />
                    <span>Run Full HELOC Analysis</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <BudgetSummary
        incomeSourcesData={scenario.income_sources || []}
        expenseCategoriesData={scenario.expense_categories || []}
      />
    </div>
  );
}
