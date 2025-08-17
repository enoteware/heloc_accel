"use client";

import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FirstConfirmationModal,
  SecondConfirmationModal,
  SuccessModal,
} from "@/components/ConfirmationModals";
import {
  Modal,
  ModalBody,
  ModalFooter,
} from "@/components/design-system/Modal";
import { Button } from "@/components/design-system/Button";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import DebugLogViewer from "@/components/DebugLogViewer";

// Lazy load heavy components
const PayoffChart = lazy(() => import("@/components/PayoffChart"));

interface Scenario {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  traditional_payoff_months?: number;
  heloc_payoff_months?: number;
  interest_saved?: number;
  is_public?: boolean;
  public_share_token?: string;
}

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null,
  );
  const [shareUrl, setShareUrl] = useState<string>("");
  const [sharingLoading, setSharingLoading] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    [],
  );

  // Individual scenario deletion modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const [deletingScenario, setDeletingScenario] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === undefined) return; // Still loading
    if (!user) {
      router.push("/handler/sign-in?callbackUrl=/dashboard");
    }
  }, [user, router]);

  const loadScenarios = useCallback(async () => {
    try {
      setLoading(true);
      logInfo("Dashboard", "Loading scenarios from API");

      // Load from API
      const response = await fetch("/api/scenarios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      logInfo("Dashboard", `API Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        logError("Dashboard", "API Error", errorData);
        throw new Error(
          errorData.error || `Failed to load scenarios: ${response.status}`,
        );
      }

      const data = await response.json();
      logDebug("Dashboard", "API Response data", data);

      if (data.scenarios) {
        logInfo("Dashboard", `Loaded ${data.scenarios.length} scenarios`);
        setScenarios(data.scenarios);
      } else {
        throw new Error(data.error || "Failed to load scenarios");
      }
    } catch (err) {
      logError("Dashboard", "Error loading scenarios", err);
      setError("Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user scenarios
  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user, loadScenarios]);

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

  const formatMonths = (months: number) => {
    if (!months) return "N/A";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} months`;
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    } else {
      return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
    }
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarioToDelete(scenarioId);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirmationProceed = async () => {
    if (!scenarioToDelete) return;

    try {
      setDeletingScenario(true);

      // Delete via API
      const response = await fetch(`/api/scenarios/${scenarioToDelete}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }

      // Remove from local state
      setScenarios((prev) => prev.filter((s) => s.id !== scenarioToDelete));

      // Close modal and reset state
      setShowDeleteConfirmation(false);
      setScenarioToDelete(null);
    } catch (err) {
      console.error("Error deleting scenario:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete scenario";
      setError(errorMessage);

      // Close the modal on error
      setShowDeleteConfirmation(false);
      setScenarioToDelete(null);
    } finally {
      setDeletingScenario(false);
    }
  };

  const handleDeleteConfirmationCancel = () => {
    setShowDeleteConfirmation(false);
    setScenarioToDelete(null);
  };

  const handleEditScenario = (scenarioId: string) => {
    // Navigate to calculator with scenario data pre-filled
    router.push(`/calculator?edit=${scenarioId}`);
  };

  const handleDuplicateScenario = async (scenario: Scenario) => {
    // Navigate to calculator with scenario data pre-filled but no ID (for new scenario)
    const params = new URLSearchParams({
      duplicate: scenario.id,
      name: `${scenario.name} (Copy)`,
    });
    router.push(`/calculator?${params.toString()}`);
  };

  const handleShareScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario);

    // Check if already shared
    if (scenario.is_public && scenario.public_share_token) {
      const url = `${window.location.origin}/shared/${scenario.public_share_token}`;
      setShareUrl(url);
      setShareModalOpen(true);
    } else {
      // Generate share link
      await toggleScenarioSharing(scenario.id, true);
    }
  };

  const toggleScenarioSharing = async (scenarioId: string, enable: boolean) => {
    try {
      setSharingLoading(true);
      const response = await fetch(`/api/scenario/${scenarioId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable }),
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing settings");
      }

      const data = await response.json();
      if (data.success) {
        if (enable && data.data.shareUrl) {
          setShareUrl(data.data.shareUrl);
          setShareModalOpen(true);
        }

        // Update local state
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenarioId
              ? {
                  ...s,
                  is_public: data.data.isPublic,
                  public_share_token: data.data.shareToken,
                }
              : s,
          ),
        );
      } else {
        throw new Error(data.error || "Failed to update sharing settings");
      }
    } catch (err) {
      console.error("Error updating sharing:", err);
      setError("Failed to update sharing settings");
    } finally {
      setSharingLoading(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
      alert("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Share link copied to clipboard!");
    }
  };

  const handleComparisonToggle = (scenarioId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(scenarioId)) {
        return prev.filter((id) => id !== scenarioId);
      } else if (prev.length < 3) {
        return [...prev, scenarioId];
      } else {
        // Replace the first selected scenario
        return [prev[1], prev[2], scenarioId];
      }
    });
  };

  const goToComparison = () => {
    if (selectedForComparison.length >= 2) {
      const params = new URLSearchParams({
        scenarios: selectedForComparison.join(","),
      });
      router.push(`/compare?${params.toString()}`);
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.displayName || user?.primaryEmail || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your HELOC acceleration scenarios and track your mortgage
            payoff progress.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-card rounded-full border border-border">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Scenarios
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {scenarios.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-muted rounded-full">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Potential Savings
                </p>
                <p className="text-2xl font-bold text-accent">
                  {scenarios.length > 0
                    ? formatCurrency(
                        scenarios.reduce(
                          (sum, s) => sum + (s.interest_saved || 0),
                          0,
                        ),
                      )
                    : "$0"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-muted rounded-full">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Time Saved
                </p>
                <p className="text-2xl font-bold text-accent">
                  {scenarios.length > 0
                    ? `${Math.round(scenarios.reduce((sum, s) => sum + ((s.traditional_payoff_months || 0) - (s.heloc_payoff_months || 0)), 0) / 12)} years`
                    : "0 years"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios Section */}
        <div className="bg-card rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Scenarios
                </h2>
                {selectedForComparison.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedForComparison.length} selected for comparison
                    </span>
                    {selectedForComparison.length >= 2 && (
                      <button
                        onClick={goToComparison}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-sm font-medium transition duration-200"
                      >
                        Compare
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedForComparison([])}
                      className="text-muted-foreground hover:text-foreground"
                      title="Clear selection"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {scenarios.length >= 2 && (
                  <Link
                    href="/compare"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Compare Scenarios
                  </Link>
                )}
                <Link
                  href="/calculator"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Create New Scenario
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading scenarios...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-destructive">{error}</p>
                <button
                  onClick={loadScenarios}
                  className="mt-2 text-primary hover:text-primary/90 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No scenarios yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first HELOC acceleration scenario to get started.
                </p>
                <Link
                  href="/calculator"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition duration-200"
                >
                  Create Your First Scenario
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="border border-border rounded-lg p-6 hover:shadow-md transition duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(scenario.id)}
                          onChange={() => handleComparisonToggle(scenario.id)}
                          className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                          disabled={
                            !selectedForComparison.includes(scenario.id) &&
                            selectedForComparison.length >= 3
                          }
                        />
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {scenario.name}
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditScenario(scenario.id)}
                          className="text-muted-foreground hover:text-primary transition duration-200"
                          title="Edit scenario"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDuplicateScenario(scenario)}
                          className="text-muted-foreground hover:text-accent transition duration-200"
                          title="Duplicate scenario"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(scenario.id)}
                          className="text-muted-foreground hover:text-destructive transition duration-200"
                          title="Delete scenario"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {scenario.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {scenario.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {scenario.interest_saved && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Interest Saved:
                          </span>
                          <span className="font-medium text-accent">
                            {formatCurrency(scenario.interest_saved)}
                          </span>
                        </div>
                      )}

                      {scenario.traditional_payoff_months &&
                        scenario.heloc_payoff_months && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Time Saved:
                            </span>
                            <span className="font-medium text-accent">
                              {Math.round(
                                (scenario.traditional_payoff_months -
                                  scenario.heloc_payoff_months) /
                                  12,
                              )}{" "}
                              years
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                      <span>Created: {formatDate(scenario.created_at)}</span>
                      <span>Updated: {formatDate(scenario.updated_at)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditScenario(scenario.id)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded text-sm font-medium transition duration-200"
                      >
                        View & Edit
                      </button>
                      <button
                        onClick={() => handleShareScenario(scenario)}
                        className="px-3 py-2 border border-input rounded text-sm font-medium text-foreground hover:bg-muted transition duration-200"
                        title="Share scenario"
                      >
                        {scenario.is_public ? "Shared" : "Share"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && selectedScenario && (
        <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Share Scenario
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-2">
                Share &quot;{selectedScenario.name}&quot; with others using this
                link:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-muted text-sm"
                />
                <button
                  onClick={copyShareUrl}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Anyone with this link can view your
                    scenario data. You can disable sharing at any time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  toggleScenarioSharing(selectedScenario.id, false);
                  setShareModalOpen(false);
                }}
                className="flex-1 safe-neutral-light hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition duration-200"
                disabled={sharingLoading}
              >
                Disable Sharing
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="flex-1 safe-info hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Scenario Delete Modal */}
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteConfirmationCancel}
        title="Delete Scenario"
        size="md"
        closeOnOverlayClick={false}
        closeOnEscape={true}
      >
        <ModalBody>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-body text-neutral-700 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong>
                  &quot;
                  {scenarios.find((s) => s.id === scenarioToDelete)?.name ||
                    "this scenario"}
                  &quot;
                </strong>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleDeleteConfirmationCancel}
            disabled={deletingScenario}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirmationProceed}
            loading={deletingScenario}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Debug Log Viewer */}
      <DebugLogViewer />
    </div>
  );
}
