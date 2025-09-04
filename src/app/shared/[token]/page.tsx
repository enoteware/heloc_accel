"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ResultsDisplay from "@/components/ResultsDisplay";
import PayoffChart from "@/components/PayoffChart";

interface SharedScenario {
  id: string;
  name: string;
  description?: string;
  current_mortgage_balance: number;
  current_interest_rate: number;
  remaining_term_months: number;
  monthly_payment: number;
  heloc_limit?: number;
  heloc_interest_rate?: number;
  heloc_available_credit?: number;
  monthly_gross_income: number;
  monthly_net_income: number;
  monthly_expenses: number;
  monthly_discretionary_income: number;
  property_value?: number;
  property_tax_monthly?: number;
  insurance_monthly?: number;
  hoa_fees_monthly?: number;
  traditional_payoff_months?: number;
  traditional_total_interest?: number;
  heloc_payoff_months?: number;
  heloc_total_interest?: number;
  time_saved_months?: number;
  interest_saved?: number;
  created_at: string;
  updated_at: string;
  shared_by: string;
}

export default function SharedScenarioPage() {
  const params = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState<SharedScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = params.token as string;

  const loadSharedScenario = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shared/${token}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "This shared scenario is no longer available or the link is invalid.",
          );
        }
        throw new Error("Failed to load shared scenario");
      }

      const data = await response.json();
      if (data.success) {
        setScenario(data.data);
      } else {
        throw new Error(data.error || "Failed to load shared scenario");
      }
    } catch (err) {
      console.error("Error loading shared scenario:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load shared scenario",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadSharedScenario();
    }
  }, [token, loadSharedScenario]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Convert scenario data to results format for display
  const getResultsFromScenario = () => {
    if (!scenario) return null;

    return {
      traditional: {
        payoffMonths: scenario.traditional_payoff_months || 0,
        totalInterest: scenario.traditional_total_interest || 0,
        monthlyPayment: scenario.monthly_payment,
        totalPayments:
          (scenario.traditional_payoff_months || 0) * scenario.monthly_payment,
        schedule: [], // Not needed for display
      },
      heloc: {
        payoffMonths: scenario.heloc_payoff_months || 0,
        totalInterest: scenario.heloc_total_interest || 0,
        totalMortgageInterest: scenario.heloc_total_interest || 0,
        totalHelocInterest: 0,
        maxHelocUsed: scenario.heloc_limit || 0,
        averageHelocBalance: (scenario.heloc_limit || 0) / 2,
        schedule: [], // Not needed for display
      },
      comparison: {
        timeSavedMonths: scenario.time_saved_months || 0,
        timeSavedYears:
          Math.round(((scenario.time_saved_months || 0) / 12) * 10) / 10,
        interestSaved: scenario.interest_saved || 0,
        percentageInterestSaved: scenario.traditional_total_interest
          ? ((scenario.interest_saved || 0) /
              scenario.traditional_total_interest) *
            100
          : 0,
        monthlyPaymentDifference: 0,
      },
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: "rgb(var(--color-primary))" }}
          ></div>
          <p className="mt-4 text-foreground-secondary">
            Loading shared scenario...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div
            className="px-4 py-3 rounded mb-4 border"
            style={{
              backgroundColor: "rgb(var(--color-error-background))",
              borderColor: "rgb(var(--color-error-border))",
              color: "rgb(var(--color-error))",
            }}
          >
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
          <Link
            href="/"
            className="btn-primary px-6 py-3 rounded-md font-medium"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return null;
  }

  const results = getResultsFromScenario();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Shared HELOC Analysis
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            This scenario has been shared with you to demonstrate HELOC
            acceleration strategy benefits
          </p>
        </div>

        {/* Scenario Info */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {scenario.name}
              </h2>
              {scenario.description && (
                <p className="text-foreground-secondary mt-2">
                  {scenario.description}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-foreground-muted">
              <p>Shared by: {scenario.shared_by}</p>
              <p>Created: {formatDate(scenario.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                Mortgage Details
              </h3>
              <p className="text-sm text-foreground-secondary">
                Balance: {formatCurrency(scenario.current_mortgage_balance)}
              </p>
              <p className="text-sm text-foreground-secondary">
                Rate: {(scenario.current_interest_rate * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-foreground-secondary">
                Payment: {formatCurrency(scenario.monthly_payment)}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                HELOC Details
              </h3>
              <p className="text-sm text-foreground-secondary">
                Limit: {formatCurrency(scenario.heloc_limit || 0)}
              </p>
              <p className="text-sm text-foreground-secondary">
                Rate: {((scenario.heloc_interest_rate || 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                Monthly Income
              </h3>
              <p className="text-sm text-foreground-secondary">
                Gross: {formatCurrency(scenario.monthly_gross_income)}
              </p>
              <p className="text-sm text-foreground-secondary">
                Net: {formatCurrency(scenario.monthly_net_income)}
              </p>
              <p className="text-sm text-foreground-secondary">
                Discretionary:{" "}
                {formatCurrency(scenario.monthly_discretionary_income)}
              </p>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="space-y-8">
            <ResultsDisplay
              results={results}
              onNewCalculation={() => router.push("/calculator")}
            />
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-card rounded-lg shadow-md p-6 mt-8 text-center border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Want to create your own HELOC analysis?
          </h3>
          <p className="text-foreground-secondary mb-6">
            Use our calculator to analyze your own mortgage and see how much you
            could save with a HELOC acceleration strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="btn-primary px-6 py-3 rounded-md font-medium"
            >
              Try the Calculator
            </Link>
            <Link
              href="/"
              className="btn-outline px-6 py-3 rounded-md font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
