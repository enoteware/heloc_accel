"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/Card";
import { Badge } from "@/components/design-system/Badge";
import { Icon } from "@/components/Icons";

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "bi-weekly" | "weekly" | "annual";
  is_primary?: boolean;
  scenario_type?: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "bi-weekly" | "weekly" | "annual";
  category:
    | "housing"
    | "transportation"
    | "food"
    | "utilities"
    | "insurance"
    | "debt"
    | "entertainment"
    | "other";
  is_fixed: boolean;
}

interface BudgetSummaryProps {
  incomeSourcesData: IncomeSource[];
  expenseCategoriesData: ExpenseCategory[];
  className?: string;
}

export default function BudgetSummary({
  incomeSourcesData,
  expenseCategoriesData,
  className = "",
}: BudgetSummaryProps) {
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

  const totalMonthlyIncome = incomeSourcesData.reduce(
    (sum, income) =>
      sum +
      calculateMonthlyAmount(Number(income.amount) || 0, income.frequency),
    0,
  );

  const totalMonthlyExpenses = expenseCategoriesData.reduce(
    (sum, expense) =>
      sum +
      calculateMonthlyAmount(Number(expense.amount) || 0, expense.frequency),
    0,
  );

  const discretionaryIncome = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate =
    totalMonthlyIncome > 0
      ? (discretionaryIncome / totalMonthlyIncome) * 100
      : 0;

  // Categorize expenses
  const expensesByCategory = expenseCategoriesData.reduce(
    (acc, expense) => {
      const monthlyAmount = calculateMonthlyAmount(
        Number(expense.amount) || 0,
        expense.frequency,
      );
      acc[expense.category] = (acc[expense.category] || 0) + monthlyAmount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const fixedExpenses = expenseCategoriesData
    .filter((expense) => expense.is_fixed)
    .reduce(
      (sum, expense) =>
        sum +
        calculateMonthlyAmount(Number(expense.amount) || 0, expense.frequency),
      0,
    );

  const variableExpenses = totalMonthlyExpenses - fixedExpenses;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Income
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalMonthlyIncome)}
                </p>
              </div>
              <Icon name="trending-up" size="lg" className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Expenses
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalMonthlyExpenses)}
                </p>
              </div>
              <Icon name="trending-down" size="lg" className="text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Discretionary
                </p>
                <p
                  className={`text-2xl font-bold ${discretionaryIncome >= 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {formatCurrency(discretionaryIncome)}
                </p>
              </div>
              <Icon name="dollar-sign" size="lg" className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Savings Rate
                </p>
                <p
                  className={`text-2xl font-bold ${savingsRate >= 20 ? "text-green-600" : savingsRate >= 10 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <Icon name="target" size="lg" className="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="trending-up" size="sm" className="text-green-500" />
              <span>Income Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeSourcesData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No income sources added
              </p>
            ) : (
              <div className="space-y-3">
                {incomeSourcesData.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{income.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(Number(income.amount) || 0)}{" "}
                        {income.frequency}
                        {(income.is_primary ||
                          income.scenario_type === "salary") && (
                          <Badge variant="primary" className="ml-2">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(
                          calculateMonthlyAmount(
                            Number(income.amount) || 0,
                            income.frequency,
                          ),
                        )}
                      </div>
                      <div className="text-xs text-gray-500">monthly</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="credit-card" size="sm" className="text-red-500" />
              <span>Expense Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No expenses added
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage =
                      totalMonthlyExpenses > 0
                        ? (amount / totalMonthlyExpenses) * 100
                        : 0;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {category}
                          </div>
                          <div className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% of expenses
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">
                            {formatCurrency(amount)}
                          </div>
                          <div className="text-xs text-gray-500">monthly</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="heart" size="sm" className="text-pink-500" />
            <span>Financial Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">Fixed vs Variable</div>
              <div className="text-sm text-gray-600 mt-1">
                Fixed: {formatCurrency(fixedExpenses)} (
                {totalMonthlyExpenses > 0
                  ? ((fixedExpenses / totalMonthlyExpenses) * 100).toFixed(1)
                  : 0}
                %)
              </div>
              <div className="text-sm text-gray-600">
                Variable: {formatCurrency(variableExpenses)} (
                {totalMonthlyExpenses > 0
                  ? ((variableExpenses / totalMonthlyExpenses) * 100).toFixed(1)
                  : 0}
                %)
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">Emergency Fund</div>
              <div className="text-sm text-gray-600 mt-1">
                Recommended: {formatCurrency(totalMonthlyExpenses * 3)}
              </div>
              <div className="text-sm text-gray-600">
                (3 months of expenses)
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">HELOC Potential</div>
              <div className="text-sm text-gray-600 mt-1">
                Available:{" "}
                {formatCurrency(Math.max(0, discretionaryIncome - 500))}
              </div>
              <div className="text-sm text-gray-600">(after $500 buffer)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
