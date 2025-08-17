"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { Select } from "@/components/design-system/Select";
import { Badge } from "@/components/design-system/Badge";
import { Icon } from "@/components/Icons";
import BudgetForm from "@/components/budgeting/BudgetForm";
import BudgetDashboard from "@/components/budgeting/BudgetDashboard";

// Types
interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "bi-weekly" | "weekly" | "annual";
  is_primary: boolean;
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

interface BudgetingScenario {
  id: string;
  scenario_id: string;
  name: string;
  description?: string;
  base_monthly_gross_income: number;
  base_monthly_net_income: number;
  base_monthly_expenses: number;
  base_discretionary_income: number;
  recommended_principal_payment: number;
  custom_principal_payment?: number;
  principal_multiplier: number;
  auto_adjust_payments: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_scenario_name?: string;
  income_sources?: IncomeSource[];
  expense_categories?: ExpenseCategory[];
}

export default function BudgetingPage() {
  const user = useUser();
  const router = useRouter();
  const t = useTranslations();

  // State
  const [scenarios, setScenarios] = useState<BudgetingScenario[]>([]);
  const [currentScenario, setCurrentScenario] =
    useState<BudgetingScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "income" | "expenses" | "analysis"
  >("income");

  // No longer need form state since we're using BudgetForm component

  const fetchScenarios = useCallback(async () => {
    try {
      const response = await fetch("/api/budgeting/scenarios");
      if (response.ok) {
        const data = await response.json();
        const scenariosWithDefaults = (data.budgetScenarios || []).map(
          (scenario: any) => ({
            ...scenario,
            income_sources: scenario.income_sources || [],
            expense_categories: scenario.expense_categories || [],
            discretionary_income: scenario.discretionary_income || 0,
            heloc_payment_percentage: scenario.heloc_payment_percentage || 0.5,
          }),
        );
        setScenarios(scenariosWithDefaults);
        if (scenariosWithDefaults.length > 0) {
          setCurrentScenario(scenariosWithDefaults[0]);
        }
      } else if (response.status === 401) {
        // Authentication required - let main auth logic handle redirect
        console.log("Authentication required for budget scenarios");
        return;
      } else {
        console.error("Failed to fetch scenarios:", response.status);
      }
    } catch (error) {
      console.error("Error fetching budgeting scenarios:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Handle authentication state with better Stack Auth integration
  useEffect(() => {
    // More generous timeout for Stack Auth initialization
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after auth loading is complete AND we're sure user is null
    if (!authLoading && user === null) {
      console.log("Redirecting to sign-in: user not authenticated");
      router.push(
        "/handler/sign-in?callbackUrl=" + encodeURIComponent("/en/budgeting"),
      );
      return;
    }

    // Fetch scenarios only when user is available and auth loading is done
    if (!authLoading && user) {
      console.log("User authenticated, fetching scenarios");
      fetchScenarios();
    }
  }, [user, router, authLoading, fetchScenarios]);

  const createNewScenario = async () => {
    setSaving(true);
    try {
      // First create a parent scenario if needed
      let parentScenarioId = null;

      // Check if user has any existing scenarios to use as parent
      const existingScenariosResponse = await fetch("/api/scenario");
      if (existingScenariosResponse.ok) {
        const existingData = await existingScenariosResponse.json();
        if (existingData.success && existingData.data?.scenarios?.length > 0) {
          parentScenarioId = existingData.data.scenarios[0].id;
        }
      } else if (existingScenariosResponse.status === 503) {
        throw new Error("Database not configured. Please contact support.");
      }

      // If no parent scenario exists, create one
      if (!parentScenarioId) {
        const createParentResponse = await fetch("/api/scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Default Scenario",
            description: "Base scenario for budgeting analysis",
            currentMortgageBalance: 250000,
            currentInterestRate: 0.065,
            remainingTermMonths: 240,
            monthlyPayment: 1800,
            monthlyGrossIncome: 6000,
            monthlyNetIncome: 5000,
            monthlyExpenses: 3000,
            monthlyDiscretionaryIncome: 2000,
          }),
        });

        if (createParentResponse.ok) {
          const parentData = await createParentResponse.json();
          if (parentData.success) {
            parentScenarioId = parentData.data.scenario.id;
          }
        } else if (createParentResponse.status === 503) {
          throw new Error("Database not configured. Please contact support.");
        }
      }

      if (!parentScenarioId) {
        throw new Error("Failed to create or find parent scenario");
      }

      // Now create the budget scenario
      const response = await fetch("/api/budgeting/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: parentScenarioId,
          name: "New Budget Scenario",
          description: "Budget analysis for mortgage acceleration",
          baseMonthlyGrossIncome: 6000,
          baseMonthlyNetIncome: 5000,
          baseMonthlyExpenses: 3000,
          principalMultiplier: 3.0,
          autoAdjustPayments: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newScenario = {
          ...data.budgetScenario,
          income_sources: data.budgetScenario.income_sources || [],
          expense_categories: data.budgetScenario.expense_categories || [],
          discretionary_income: data.budgetScenario.discretionary_income || 0,
          heloc_payment_percentage:
            data.budgetScenario.heloc_payment_percentage || 0.5,
        };
        setScenarios([...scenarios, newScenario]);
        setCurrentScenario(newScenario);
      } else if (response.status === 503) {
        throw new Error("Database not configured. Please contact support.");
      } else {
        const errorData = await response.json();
        console.error("Error creating budget scenario:", errorData);
        throw new Error(errorData.error || "Failed to create budget scenario");
      }
    } catch (error) {
      console.error("Error creating scenario:", error);
      alert("Failed to create scenario. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addIncomeSource = async (data: any) => {
    if (!currentScenario) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/budgeting/scenarios/${currentScenario.id}/income-scenarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        await fetchScenarios();
      }
    } catch (error) {
      console.error("Error adding income source:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addExpenseCategory = async (data: any) => {
    if (!currentScenario) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/budgeting/scenarios/${currentScenario.id}/expense-scenarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        await fetchScenarios();
      }
    } catch (error) {
      console.error("Error adding expense category:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading
              ? "Checking authentication..."
              : loading
                ? "Loading budgeting tool..."
                : "Preparing budgeting interface..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Budgeting Tool
              </h1>
              <p className="mt-2 text-gray-600">
                Analyze your income and expenses to optimize HELOC acceleration
                strategy
              </p>
            </div>
            <Button
              onClick={createNewScenario}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Icon name="plus" size="sm" />
              <span>New Scenario</span>
            </Button>
          </div>
        </div>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <div className="mb-6">
            <Select
              value={currentScenario?.id || ""}
              onChange={(e) => {
                const scenario = scenarios.find((s) => s.id === e.target.value);
                if (scenario) {
                  setCurrentScenario({
                    ...scenario,
                    discretionary_income:
                      (scenario as any).discretionary_income || 0,
                    heloc_payment_percentage:
                      (scenario as any).heloc_payment_percentage || 0.5,
                  } as any);
                } else {
                  setCurrentScenario(null);
                }
              }}
              className="max-w-md"
              options={[
                { value: "", label: "Select a scenario" },
                ...(scenarios || []).map((scenario) => ({
                  value: scenario.id,
                  label: scenario.name,
                })),
              ]}
            />
          </div>
        )}

        {/* Main Content */}
        {currentScenario ? (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  {
                    id: "income",
                    label: "Income Sources",
                    icon: "dollar-sign",
                  },
                  { id: "expenses", label: "Expenses", icon: "credit-card" },
                  { id: "analysis", label: "Analysis", icon: "bar-chart" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon name={tab.icon as any} size="sm" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "income" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetForm
                  type="income"
                  onSubmit={addIncomeSource}
                  loading={saving}
                />

                {/* Income Sources List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Income Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(currentScenario.income_sources?.length || 0) === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No income sources added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {currentScenario.income_sources?.map((income) => (
                          <div
                            key={income.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{income.name}</div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(income.amount)}{" "}
                                {income.frequency}
                                {income.is_primary && (
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
                                    income.amount,
                                    income.frequency,
                                  ),
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                monthly
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetForm
                  type="expense"
                  onSubmit={addExpenseCategory}
                  loading={saving}
                />

                {/* Expenses List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(currentScenario.expense_categories?.length || 0) === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No expenses added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {currentScenario.expense_categories?.map((expense) => (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{expense.name}</div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(expense.amount)}{" "}
                                {expense.frequency}
                                <Badge
                                  variant={
                                    expense.is_fixed ? "secondary" : "default"
                                  }
                                  className="ml-2"
                                >
                                  {expense.is_fixed ? "Fixed" : "Variable"}
                                </Badge>
                                <Badge
                                  variant="default"
                                  className="ml-1 capitalize"
                                >
                                  {expense.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600">
                                {formatCurrency(
                                  calculateMonthlyAmount(
                                    expense.amount,
                                    expense.frequency,
                                  ),
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                monthly
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analysis" && currentScenario && (
              <BudgetDashboard
                scenario={currentScenario as any}
                onScenarioUpdate={(updatedScenario) => {
                  setCurrentScenario(updatedScenario as any);
                  fetchScenarios(); // Refresh the scenarios list
                }}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Icon
              name="calculator"
              size="lg"
              className="text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No budgeting scenarios yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first budgeting scenario to analyze your income and
              expenses for HELOC acceleration.
            </p>
            <Button onClick={createNewScenario} disabled={saving}>
              Create First Scenario
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
