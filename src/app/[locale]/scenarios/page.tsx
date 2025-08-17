"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Icon } from "@/components/Icons";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ScenarioSummary {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  traditional_payoff_months?: number;
  heloc_payoff_months?: number;
  time_saved_months?: number;
  interest_saved?: number;
  percentage_interest_saved?: number;
}

export default function ScenariosPage() {
  const user = useUser();
  const router = useRouter();
  const t = useTranslations("scenarios");
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/handler/sign-in");
      return;
    }

    fetchScenarios();
  }, [user, router]);

  const fetchScenarios = async () => {
    try {
      const response = await fetch("/api/scenarios");
      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      const data = await response.json();
      setScenarios(data.scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load scenarios",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenario?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }

      // Remove from local state
      setScenarios(scenarios.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting scenario:", error);
      alert("Failed to delete scenario");
    } finally {
      setDeletingId(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Scenarios
              </h1>
              <p className="mt-2 text-muted-foreground">
                View and manage your saved HELOC analysis scenarios
              </p>
            </div>
            <Link
              href="/calculator"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <Icon name="plus" size="sm" />
              <span>New Scenario</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-card border border-destructive rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="alert" size="sm" className="text-destructive mr-2" />
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Scenarios Grid */}
        {scenarios.length === 0 ? (
          <div className="bg-card rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <Icon
                name="calculator"
                size="lg"
                className="text-muted-foreground mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No scenarios yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first HELOC analysis scenario to see how much you
                can save on your mortgage.
              </p>
              <Link
                href="/calculator"
                className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                <Icon name="calculator" size="sm" />
                <span>Create First Scenario</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground flex-1">
                      {scenario.name}
                    </h3>
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      disabled={deletingId === scenario.id}
                      className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete scenario"
                    >
                      {deletingId === scenario.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                      ) : (
                        <Icon name="x-circle" size="sm" />
                      )}
                    </button>
                  </div>

                  {scenario.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {scenario.description}
                    </p>
                  )}

                  {/* Key Metrics */}
                  <div className="space-y-3 mb-4">
                    {scenario.interest_saved && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Interest Saved:
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(scenario.interest_saved)}
                        </span>
                      </div>
                    )}

                    {scenario.time_saved_months && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Time Saved:
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {scenario.time_saved_months} months
                        </span>
                      </div>
                    )}

                    {scenario.percentage_interest_saved && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Interest Reduction:
                        </span>
                        <span className="text-sm font-semibold text-purple-600">
                          {scenario.percentage_interest_saved.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-muted-foreground space-y-1 mb-4">
                    <p>Created: {formatDate(scenario.created_at)}</p>
                    {scenario.updated_at !== scenario.created_at && (
                      <p>Updated: {formatDate(scenario.updated_at)}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/scenarios/${scenario.id}`}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded text-center text-sm transition duration-200"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/calculator?load=${scenario.id}`}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded text-center text-sm transition duration-200"
                    >
                      Load in Calculator
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
