"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Icon } from "@/components/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ResultsDisplay from "@/components/ResultsDisplay";
import InputSummary from "@/components/InputSummary";
import type { DbScenario } from "@/lib/db";

export default function ScenarioDetailPage() {
  const user = useUser();
  const router = useRouter();
  const [scenario, setScenario] = useState<DbScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  // Table of Contents sections - memoized for stable reference
  const tocSections = useMemo(
    () => [
      { id: "summary", label: "Summary" },
      { id: "comparison", label: "Comparison" },
      { id: "highlights", label: "Highlights" },
      { id: "payment-flow", label: "Payment Flow" },
      { id: "amortization", label: "Amortization" },
      { id: "full-schedule", label: "Full Schedule" },
      { id: "strategy", label: "Strategy" },
      { id: "actions", label: "Actions" },
      { id: "insights", label: "Insights" },
      { id: "disclaimer", label: "Disclaimer" },
    ],
    [],
  );

  const [activeSection, setActiveSection] = useState<string>(tocSections[0].id);
  const [availableToc, setAvailableToc] = useState(tocSections);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const routeParams = useParams<{ locale: string; id: string }>();
  const locale = (routeParams?.locale as string) || "en";

  useEffect(() => {
    setScenarioId((routeParams?.id as string) || null);
  }, [routeParams?.id]);

  useEffect(() => {
    if (!user) {
      router.push("/handler/sign-in");
      return;
    }

    const ac = new AbortController();
    const fetchScenario = async () => {
      if (!scenarioId) return;

      try {
        const response = await fetch(`/api/scenarios/${scenarioId}`, {
          signal: ac.signal,
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Scenario not found");
          }
          throw new Error("Failed to fetch scenario");
        }
        const data = await response.json();
        setScenario(data.scenario);
      } catch (error) {
        if ((error as any)?.name === "AbortError") return;
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

    return () => ac.abort();
  }, [user, router, scenarioId]);

  // Scrollspy: observe sections and update activeSection + availableToc
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1,
          );
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("id");
          if (id) setActiveSection(id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0.1,
      },
    );

    const els = tocSections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const present = tocSections.filter(({ id }) =>
      els.some((el) => el.id === id),
    );
    setAvailableToc(present.length > 0 ? present : tocSections);
    els.forEach((el) => observer.observe(el!));

    return () => observer.disconnect();
  }, [loading, scenarioId, tocSections]);

  if (loading) {
    return (
      <main
        className="min-h-screen bg-background flex items-center justify-center"
        aria-busy="true"
      >
        <div className="text-center" role="status" aria-live="polite">
          <div
            className={cn(
              "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto",
            )}
          />
          <p className="mt-4 text-muted-foreground">Loading scenario...</p>
        </div>
      </main>
    );
  }

  if (error || !scenario) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section
            className={cn(
              "bg-card border border-destructive/30 rounded-lg p-6 text-center",
            )}
            role="alert"
            aria-labelledby="scenario-error-title"
          >
            <Icon
              name="alert"
              size="lg"
              variant="error"
              className="mx-auto mb-4 text-destructive"
              aria-hidden="true"
            />
            <h2
              id="scenario-error-title"
              className="text-lg font-semibold text-destructive mb-2"
            >
              {error || "Scenario not found"}
            </h2>
            <Link
              href={`/${locale}/scenarios`}
              className={cn(
                "inline-flex items-center space-x-2",
                "text-primary hover:text-primary/80 font-medium",
                "transition-colors duration-200",
              )}
            >
              <Icon name="arrow-left" size="sm" />
              <span>Back to scenarios</span>
            </Link>
          </section>
        </div>
      </main>
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

  const showBackToTop = activeSection !== "summary";

  return (
    <main className="min-h-screen bg-background py-8 scroll-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8" aria-labelledby="scenario-title">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <nav aria-label="Breadcrumb" className="mb-3">
                <Link
                  href={`/${locale}/scenarios`}
                  className={cn(
                    "inline-flex items-center",
                    "text-muted-foreground hover:text-foreground",
                    "transition-colors duration-200",
                  )}
                >
                  <Icon name="arrow-left" size="sm" className="mr-2" />
                  Back to scenarios
                </Link>
              </nav>
              <h1
                id="scenario-title"
                className="text-3xl font-bold text-foreground"
              >
                {scenario.name}
              </h1>
              {scenario.description && (
                <p className="mt-2 text-muted-foreground max-w-prose">
                  {scenario.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="calendar" size="sm" />
                  <span>
                    Created {new Date(scenario.created_at).toLocaleDateString()}
                  </span>
                </div>
                {scenario.updated_at !== scenario.created_at && (
                  <div className="flex items-center gap-1">
                    <Icon name="clock" size="sm" />
                    <span>
                      Updated{" "}
                      {new Date(scenario.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/${locale}/calculator?load=${scenario.id}`}
                className={cn(
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "font-semibold py-2 px-4 rounded-lg shadow-sm",
                  "transition-colors duration-200 flex items-center gap-2",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                )}
              >
                <Icon name="calculator" size="sm" />
                <span>Load in Calculator</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left sticky TOC */}
          <aside
            className="hidden lg:block lg:col-span-2"
            role="complementary"
            aria-labelledby="on-this-page"
          >
            <div className="lg:sticky lg:top-20">
              <nav
                aria-labelledby="on-this-page"
                className="bg-card border border-border rounded-lg p-3"
              >
                <h2
                  id="on-this-page"
                  className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  On this page
                </h2>
                <ul className="mt-2 space-y-1">
                  {availableToc.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={cn(
                          "block rounded-md px-2 py-1 text-sm transition-colors",
                          activeSection === id
                            ? "text-primary bg-muted font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                        aria-current={
                          activeSection === id ? "location" : undefined
                        }
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main results */}
          <section className="lg:col-span-7" aria-labelledby="results-heading">
            <h2 id="results-heading" className="sr-only">
              Scenario Results
            </h2>
            {/* Mobile TOC dropdown */}
            <div className="mb-4 lg:hidden">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileTocOpen((v) => !v)}
                  aria-expanded={isMobileTocOpen}
                  className={cn(
                    "w-full flex items-center justify-between rounded-md border border-border bg-card px-3 py-2",
                    "text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  )}
                >
                  <span>
                    {
                      (
                        availableToc.find((t) => t.id === activeSection) ||
                        availableToc[0]
                      )?.label
                    }
                  </span>
                  <Icon
                    name="chevron-down"
                    size="xs"
                    className={cn(
                      "transition-transform",
                      isMobileTocOpen ? "rotate-180" : "",
                    )}
                  />
                </button>
                {isMobileTocOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-card shadow-lg">
                    <ul
                      aria-label="In-page sections"
                      className="max-h-64 overflow-auto py-1"
                    >
                      {availableToc.map(({ id, label }) => (
                        <li key={id}>
                          <a
                            href={`#${id}`}
                            onClick={() => setIsMobileTocOpen(false)}
                            className={cn(
                              "block px-3 py-2 text-sm",
                              activeSection === id
                                ? "bg-muted text-primary"
                                : "text-foreground hover:bg-muted",
                            )}
                            aria-current={
                              activeSection === id ? "location" : undefined
                            }
                          >
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <ResultsDisplay results={results} inputs={inputs} />
          </section>

          {/* Summary sidebar */}
          <aside
            className="lg:col-span-3"
            aria-labelledby="summary-heading"
            role="complementary"
          >
            <h2 id="summary-heading" className="sr-only">
              Input Summary
            </h2>
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* On small screens, keep summary visible above the fold */}
              <div className="block lg:hidden">
                <InputSummary formData={inputs} />
              </div>
              {/* On large screens, use a compact max width for readability */}
              <div className="hidden lg:block">
                <InputSummary formData={inputs} className="max-w-none" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => {
            const el = document.getElementById("scenario-title");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="fixed bottom-4 right-4 z-40 rounded-full border border-border bg-card text-foreground shadow-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 p-2"
          aria-label="Back to top"
        >
          <Icon name="chevron-up" size="sm" />
        </button>
      )}
    </main>
  );
}
