"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Icon } from "@/components/Icons";
import Link from "next/link";
import ResultsDisplay from "@/components/ResultsDisplay";
import InputSummary from "@/components/InputSummary";
import type { DbScenario } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ScenarioDetailPage({ params }: PageProps) {
  const user = useUser();
  const router = useRouter();
  const [scenario, setScenario] = useState<DbScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setScenarioId(id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!user) {
      router.push("/handler/sign-in");
      return;
    }

    const fetchScenario = async () => {
      if (!scenarioId) return;

      try {
        const response = await fetch(`/api/scenarios/${scenarioId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Scenario not found");
          }
          throw new Error("Failed to fetch scenario");
        }
        const data = await response.json();
        setScenario(data.scenario);
      } catch (error) {
        console.error("Error fetching scenario:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load scenario",
        );
      } finally {
        setLoading(false);
      }
    };

    if (scenarioId) {
      fetchScenario();
    }
  }, [user, router, scenarioId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Icon
              name="alert"
              size="lg"
              className="text-red-600 mx-auto mb-4"
            />
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              {error || "Scenario not found"}
            </h2>
            <Link
              href="/scenarios"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Icon name="arrow-left" size="sm" />
              <span>Back to scenarios</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reconstruct the inputs and results from the saved data
  const inputs = {
    scenarioName: scenario.name,
    description: scenario.description,
    currentMortgageBalance: scenario.current_mortgage_balance,
    currentInterestRate: scenario.current_interest_rate,
    remainingTermMonths: scenario.remaining_term_months,
    monthlyPayment: scenario.monthly_payment,
    helocLimit: scenario.heloc_limit,
    helocInterestRate: scenario.heloc_interest_rate,
    helocAvailableCredit: scenario.heloc_available_credit,
    monthlyGrossIncome: scenario.monthly_gross_income,
    monthlyNetIncome: scenario.monthly_net_income,
    monthlyExpenses: scenario.monthly_expenses,
    monthlyDiscretionaryIncome: scenario.monthly_discretionary_income,
    propertyValue: scenario.property_value,
    propertyTaxMonthly: scenario.property_tax_monthly,
    insuranceMonthly: scenario.insurance_monthly,
    hoaFeesMonthly: scenario.hoa_fees_monthly,
    pmiMonthly: scenario.pmi_monthly,
  };

  const results = scenario.calculation_results_json || {
    traditional: {
      payoffMonths: scenario.traditional_payoff_months || 0,
      totalInterest: scenario.traditional_total_interest || 0,
      monthlyPayment: scenario.traditional_monthly_payment || 0,
      totalPayments: scenario.traditional_total_payments || 0,
    },
    heloc: {
      payoffMonths: scenario.heloc_payoff_months || 0,
      totalInterest: scenario.heloc_total_interest || 0,
      totalMortgageInterest: scenario.heloc_total_mortgage_interest || 0,
      totalHelocInterest: scenario.heloc_total_heloc_interest || 0,
      maxHelocUsed: scenario.heloc_max_used || 0,
      averageHelocBalance: scenario.heloc_average_balance || 0,
      schedule: scenario.heloc_schedule_json || [],
    },
    comparison: {
      timeSavedMonths: scenario.time_saved_months || 0,
      timeSavedYears: scenario.time_saved_years || 0,
      interestSaved: scenario.interest_saved || 0,
      percentageInterestSaved: scenario.percentage_interest_saved || 0,
      monthlyPaymentDifference: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/scenarios"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icon name="arrow-left" size="sm" className="mr-2" />
                Back to scenarios
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {scenario.name}
              </h1>
              {scenario.description && (
                <p className="mt-2 text-gray-600">{scenario.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/calculator?load=${scenario.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <Icon name="calculator" size="sm" />
                <span>Load in Calculator</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Input Summary */}
        <div className="mb-8">
          <InputSummary formData={inputs} />
        </div>

        {/* Results Display */}
        <ResultsDisplay results={results} inputs={inputs} />
      </div>
    </div>
  );
}
