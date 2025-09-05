"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { useUser } from "@stackframe/stack";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FastCalculatorForm from "@/components/FastCalculatorForm";
import LiveCalculatorForm from "@/components/LiveCalculatorForm";
import LiveResultsPanel from "@/components/LiveResultsPanel";
import SaveScenarioModal from "@/components/SaveScenarioModal";
import ErrorDisplay from "@/components/ErrorDisplay";
import Disclaimer from "@/components/Disclaimer";
import CalculationLoader from "@/components/design-system/CalculationLoader";
import { Button } from "@/components/design-system/Button";
import type {
  CalculatorValidationInput,
  ValidationError,
} from "@/lib/validation";
import { ValidationErrorDisplay } from "@/components/ValidationErrorDisplay";
import { getApiUrl } from "@/lib/api-url";
import Logo from "@/components/Logo";
import { logError, logInfo } from "@/lib/debug-logger";

// Lazy load heavy components that are only shown after calculation
const ResultsDisplay = lazy(() => import("@/components/ResultsDisplay"));
const PayoffChart = lazy(() => import("@/components/PayoffChart"));

interface CalculationResults {
  traditional: {
    payoffMonths: number;
    totalInterest: number;
    monthlyPayment: number;
    totalPayments: number;
    schedule: any[];
  };
  heloc: {
    payoffMonths: number;
    totalInterest: number;
    totalMortgageInterest: number;
    totalHelocInterest: number;
    maxHelocUsed: number;
    averageHelocBalance: number;
    schedule: any[];
  };
  comparison: {
    timeSavedMonths: number;
    timeSavedYears: number;
    interestSaved: number;
    percentageInterestSaved: number;
    monthlyPaymentDifference: number;
  };
}

function CalculatorPageContent() {
  const user = useUser();
  const session = user ? { user } : null;
  const status = user ? "authenticated" : "unauthenticated";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [initialData, setInitialData] = useState<
    Partial<CalculatorValidationInput>
  >({});
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(
    null,
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormData, setCurrentFormData] =
    useState<CalculatorValidationInput | null>(null);
  const [liveMode, setLiveMode] = useState(true); // Toggle between live and traditional mode
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // TOC sections (similar approach to scenarios page)
  const tocSections = useMemo(
    () => [
      { id: "summary", label: "Summary" },
      { id: "input-form", label: "Input Form" },
      { id: "live-results", label: "Live Results" },
      { id: "results", label: "Results" },
      { id: "chart", label: "Payoff Chart" },
      { id: "disclaimer", label: "Disclaimer" },
    ],
    [],
  );
  const [activeSection, setActiveSection] = useState<string>(tocSections[0].id);
  const [availableToc, setAvailableToc] = useState(tocSections);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === undefined) return; // Still loading
    if (!user) {
      router.push("/login?callbackUrl=/calculator");
    }
  }, [user, router]);

  const loadScenarioData = useCallback(
    async (scenarioId: string, isEdit: boolean, customName?: string | null) => {
      try {
        setLoading(true);

        // Load from API
        const response = await fetch(`/api/scenario/${scenarioId}`);
        if (!response.ok) {
          throw new Error("Failed to load scenario");
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error("Failed to load scenario");
        }
        const scenario = data.data;

        // Convert scenario data to form format - snake_case mapping
        const formData: Partial<CalculatorValidationInput> = {
          currentMortgageBalance: scenario.current_mortgage_balance,
          currentInterestRate: scenario.current_interest_rate * 100, // Convert to percentage
          remainingTermMonths: scenario.remaining_term_months,
          monthlyPayment: scenario.monthly_payment,
          propertyValue: scenario.property_value,
          propertyTaxMonthly: scenario.property_tax_monthly,
          insuranceMonthly: scenario.insurance_monthly,
          hoaFeesMonthly: scenario.hoa_fees_monthly,
          helocLimit: scenario.heloc_limit,
          helocInterestRate: scenario.heloc_interest_rate * 100, // Convert to percentage
          helocAvailableCredit: scenario.heloc_available_credit,
          monthlyGrossIncome: scenario.monthly_gross_income,
          monthlyNetIncome: scenario.monthly_net_income,
          monthlyExpenses: scenario.monthly_expenses,
          monthlyDiscretionaryIncome: scenario.monthly_discretionary_income,
        };

        // Add scenario name and description
        formData.scenarioName = customName || scenario.name;
        formData.description = scenario.description;

        setInitialData(formData);
        if (isEdit) {
          setEditingScenarioId(scenarioId);
        }
      } catch (err) {
        logError("Calculator", "Error loading scenario", err);
        setError("Failed to load scenario data");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Load scenario data if editing or duplicating
  useEffect(() => {
    const editId = searchParams.get("edit");
    const duplicateId = searchParams.get("duplicate");
    const scenarioName = searchParams.get("name");

    if (editId || duplicateId) {
      const scenarioId = editId || duplicateId;
      if (scenarioId) {
        loadScenarioData(scenarioId, !!editId, scenarioName);
      }
    }
  }, [searchParams, loadScenarioData]);

  // Scrollspy: observe sections and update activeSection + availableToc
  useEffect(() => {
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
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [tocSections, liveMode, results]);

  const handleCalculation = async (formData: CalculatorValidationInput) => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setCurrentFormData(formData); // Store form data for saving

    try {
      const response = await fetch(getApiUrl("api/calculate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        logError("Calculator", "API Error Response", data);
        if (data.data?.validationErrors) {
          logError(
            "Calculator",
            "Validation Errors",
            data.data.validationErrors,
          );
          setValidationErrors(data.data.validationErrors);
        }
        throw new Error(data.error || "Calculation failed");
      }

      if (data.success) {
        logInfo("Calculator", "Calculation successful");
        setResults(data.data);
      } else {
        logError("Calculator", "API returned unsuccessful result", data);
        throw new Error(data.error || "Calculation failed");
      }
    } catch (err) {
      logError("Calculator", "Calculation error", {
        errorType: err?.constructor?.name,
        message: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : "No stack trace",
      });

      let errorMessage = "An error occurred during calculation";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes("fetch")) {
          errorMessage = "Network error - please check your connection";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveCalculation = useCallback(
    async (formData: CalculatorValidationInput) => {
      setLiveLoading(true);
      setLiveError(null);
      setValidationErrors([]);
      setCurrentFormData(formData); // Store form data for saving

      try {
        const response = await fetch(getApiUrl("api/calculate"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.data?.validationErrors) {
            setValidationErrors(data.data.validationErrors);
          }
          throw new Error(data.error || "Calculation failed");
        }

        if (data.success) {
          setResults(data.data);
        } else {
          throw new Error(data.error || "Calculation failed");
        }
      } catch (err) {
        let errorMessage = "An error occurred during calculation";
        if (err instanceof Error) {
          errorMessage = err.message;
          if (err.message.includes("fetch")) {
            errorMessage = "Network error - please check your connection";
          }
        }

        setLiveError(errorMessage);
      } finally {
        setLiveLoading(false);
      }
    },
    [],
  );

  const handleSaveScenario = async () => {
    if (!results || !currentFormData) {
      return;
    }

    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (
    scenarioName: string,
    description: string,
  ) => {
    logInfo("SaveScenario", "Save scenario initiated", {
      scenarioName,
      description,
      hasResults: !!results,
      hasFormData: !!currentFormData,
    });

    if (!results || !currentFormData) {
      logError("SaveScenario", "Cannot save: Missing results or form data");
      return;
    }

    setIsSaving(true);
    try {
      logInfo("Calculator", "Saving scenario to database");

      // Save to database via API
      const payload = {
        inputs: {
          ...currentFormData,
          scenarioName,
          description,
        },
        results: results,
      };

      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Save scenario API error: ${response.status}`, {
          status: response.status,
          error: data.error || "Unknown error",
          data: data,
        });
        throw new Error(data.error || "Failed to save scenario");
      }

      // Redirect to dashboard to see saved scenarios
      router.push("/en/dashboard");
    } catch (error) {
      logError("SaveScenario", "Failed to save scenario", {
        error,
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      throw error; // Let the modal handle the error display
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewCalculation = () => {
    setResults(null);
    setError(null);
    setValidationErrors([]);
  };

  const prepareChartData = () => {
    if (!results) return [];

    const maxLength = Math.max(
      results.traditional.schedule.length,
      results.heloc.schedule.length,
    );

    const chartData = [];
    for (let i = 0; i < maxLength; i++) {
      const traditionalData = results.traditional.schedule[i];
      const helocData = results.heloc.schedule[i];

      chartData.push({
        month: i + 1,
        traditionalBalance: traditionalData?.endingBalance || 0,
        helocBalance: helocData?.endingBalance || 0,
        traditionalInterest: traditionalData?.cumulativeInterest || 0,
        helocInterest: helocData?.cumulativeInterest || 0,
      });
    }

    return chartData;
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div id="summary" className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo
              size="lg"
              showText={false}
              clickable={true}
              priority={true}
              className="drop-shadow-md"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {editingScenarioId
              ? "Edit Scenario"
              : "HELOC Accelerator Calculator"}
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            {editingScenarioId
              ? "Update your HELOC acceleration scenario with new parameters"
              : "Compare traditional mortgage payments with HELOC acceleration strategy to see potential savings"}
          </p>
        </div>
        {/* Grid layout with left TOC and main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left sticky TOC */}
          <aside
            className="hidden lg:block lg:col-span-2"
            aria-labelledby="on-this-page"
          >
            <div className="lg:sticky lg:top-20">
              <nav
                aria-labelledby="on-this-page"
                className="bg-card border border-border rounded-lg p-3"
              >
                <h2
                  id="on-this-page"
                  className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted"
                >
                  On this page
                </h2>
                <ul className="mt-2 space-y-1">
                  {availableToc.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                          activeSection === id
                            ? "text-primary bg-muted font-medium"
                            : "text-foreground-muted hover:text-foreground hover:bg-muted"
                        }`}
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

          {/* Main content */}
          <section
            className="lg:col-span-10"
            aria-labelledby="calculator-content"
          >
            <h2 id="calculator-content" className="sr-only">
              Calculator Content
            </h2>

            {/* Mobile TOC dropdown */}
            <div className="mb-4 lg:hidden">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileTocOpen((v) => !v)}
                  aria-expanded={isMobileTocOpen}
                  className={`w-full flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                >
                  <span>
                    {
                      (
                        availableToc.find((t) => t.id === activeSection) ||
                        availableToc[0]
                      )?.label
                    }
                  </span>
                  <span
                    className={`transition-transform ${isMobileTocOpen ? "rotate-180" : ""}`}
                  >
                    ⌄
                  </span>
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
                            className={`block px-3 py-2 text-sm ${
                              activeSection === id
                                ? "bg-muted text-primary"
                                : "text-foreground hover:bg-muted"
                            }`}
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

            {/* User Welcome */}
            <div className="bg-card border border-border rounded-lg shadow-md p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">
                    Welcome back,
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.displayName || user?.primaryEmail}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="safe-link font-medium"
                >
                  View Dashboard
                </button>
              </div>
            </div>

            {/* Error Display */}
            {(error || validationErrors.length > 0) && (
              <div className="mb-8">
                {validationErrors.length > 0 ? (
                  <ValidationErrorDisplay
                    errors={validationErrors}
                    showFieldNames={true}
                  />
                ) : error ? (
                  <div className="safe-alert-danger">
                    <div className="flex">
                      <div className="ml-1">
                        <h3 className="text-sm font-medium">
                          Calculation Error
                        </h3>
                        <div className="mt-2 text-sm">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-card rounded-lg shadow-sm border border-border p-1 inline-flex">
                <button
                  onClick={() => setLiveMode(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    liveMode
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Live Mode (Two-Column)
                </button>
                <button
                  onClick={() => setLiveMode(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    !liveMode
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Traditional Mode
                </button>
              </div>
            </div>

            {/* Main Content */}
            {liveMode ? (
              // Live Mode - Two Column Layout
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div id="input-form">
                  <LiveCalculatorForm
                    onCalculate={handleLiveCalculation}
                    onClear={() => setResults(null)}
                    initialData={initialData}
                    validationErrors={validationErrors}
                  />
                </div>

                {/* Right Column - Live Results */}
                <div id="live-results" className="lg:sticky lg:top-8 lg:h-fit">
                  <LiveResultsPanel
                    results={results}
                    loading={liveLoading}
                    error={liveError}
                    currentFormData={currentFormData}
                  />

                  {/* Save Button */}
                  {results && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="primary"
                        onClick={handleSaveScenario}
                        loading={isSaving}
                        disabled={isSaving}
                        icon="save"
                      >
                        {isSaving ? "Saving..." : "Save This Scenario"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : // Traditional Mode
            !results ? (
              <div id="input-form">
                <FastCalculatorForm
                  onSubmit={handleCalculation}
                  loading={loading}
                  initialData={initialData}
                  validationErrors={validationErrors}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <section id="results">
                  <Suspense
                    fallback={
                      <div className="bg-card rounded-lg shadow-md p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-4/6"></div>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <ResultsDisplay
                      results={results}
                      inputs={currentFormData || undefined}
                      onSaveScenario={handleSaveScenario}
                      onNewCalculation={handleNewCalculation}
                    />
                  </Suspense>
                </section>

                <section id="chart">
                  <Suspense
                    fallback={
                      <div className="bg-card border border-border rounded-lg shadow-md p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                          <div className="h-64 bg-muted rounded"></div>
                        </div>
                      </div>
                    }
                  >
                    <PayoffChart
                      data={prepareChartData()}
                      title="Mortgage Balance Over Time"
                    />
                  </Suspense>
                </section>
              </div>
            )}

            {/* Save Scenario Modal */}
            <SaveScenarioModal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              onSave={handleSaveConfirm}
              isLoading={isSaving}
            />

            {/* Calculation Loading Overlay */}
            <CalculationLoader
              isVisible={loading}
              title="Calculating Your HELOC Strategy"
              description="Analyzing your mortgage details and optimizing payment strategies..."
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer id="disclaimer" className="mt-12 pt-8 border-t border-border">
        <Disclaimer />
        <div className="mt-8 text-center text-sm text-foreground-muted">
          <p>
            &copy; {new Date().getFullYear()} HELOC Accelerator. All rights
            reserved.
          </p>
          <p className="mt-2">
            <Link href="/terms" className="safe-link">
              Terms of Service
            </Link>
            <span className="mx-2">•</span>
            <Link href="/privacy" className="safe-link">
              Privacy Policy
            </Link>
            <span className="mx-2">•</span>
            <Link href="/contact" className="safe-link">
              Contact Us
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: "rgb(var(--color-primary))" }}
            ></div>
            <p className="mt-4 text-foreground-secondary">
              Loading calculator...
            </p>
          </div>
        </div>
      }
    >
      <CalculatorPageContent />
    </Suspense>
  );
}
