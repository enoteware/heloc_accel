/**
 * Storage Monitor Test Page
 *
 * This page allows testing the storage monitoring functionality
 * by artificially filling localStorage and observing the monitor's behavior.
 */

"use client";

import React, { useState } from "react";
import StorageMonitor from "@/components/StorageMonitor";
import { useStorageMonitor } from "@/hooks/useStorageMonitor";
import { logError } from "@/lib/debug-logger";

export default function StorageTestPage() {
  const { usage, events, getFormattedUsage } = useStorageMonitor();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestData = async (sizeKB: number) => {
    setIsGenerating(true);

    try {
      const chunkSize = 1000; // 1KB chunks
      const chunks = Math.ceil(sizeKB);

      for (let i = 0; i < chunks; i++) {
        const data = "x".repeat(chunkSize);
        localStorage.setItem(`test-data-${i}`, data);

        // Small delay to allow monitoring to detect changes
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    } catch (error) {
      logError("StorageTest", "Error generating test data", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const clearTestData = () => {
    const keys = Object.keys(localStorage);
    const testKeys = keys.filter((key) => key.startsWith("test-data-"));

    testKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    alert(`Cleared ${testKeys.length} test data items`);
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear ALL localStorage data? This cannot be undone.",
      )
    ) {
      localStorage.clear();
      alert("All localStorage data cleared");
    }
  };

  const addDebugData = () => {
    const debugData = {
      logs: Array(1000).fill("Debug log entry with some data"),
      timestamp: new Date().toISOString(),
      session: "test-session-" + Math.random(),
    };

    localStorage.setItem("heloc_debug_logs", JSON.stringify(debugData));
    localStorage.setItem("debug-mode", "true");
    localStorage.setItem("temp_cache_data", JSON.stringify(debugData));

    alert("Added debug data that should be cleaned up automatically");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Storage Monitor Test Page
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground-secondary mb-4">
              Current Storage Status
            </h2>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-foreground-muted">Used</div>
                  <div className="text-lg">
                    {(usage.used / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-foreground-muted">
                    Available
                  </div>
                  <div className="text-lg">
                    {(usage.available / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-foreground-muted">Total</div>
                  <div className="text-lg">
                    {(usage.total / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-foreground-muted">
                    Percentage
                  </div>
                  <div className="text-lg">
                    {(usage.percentage * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-medium text-foreground-muted mb-2">
                  Status
                </div>
                <div className="flex space-x-2">
                  {usage.isCritical && (
                    <span className="px-2 py-1 text-destructive-foreground bg-destructive text-xs rounded">
                      Critical
                    </span>
                  )}
                  {usage.isNearLimit && !usage.isCritical && (
                    <span className="px-2 py-1 text-warning-foreground bg-warning text-xs rounded">
                      Near Limit
                    </span>
                  )}
                  {!usage.isNearLimit && (
                    <span className="px-2 py-1 text-success-foreground bg-success text-xs rounded">
                      Healthy
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground-secondary mb-4">
              Test Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => generateTestData(100)}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? "Generating..." : "Add 100KB Data"}
              </button>

              <button
                onClick={() => generateTestData(500)}
                disabled={isGenerating}
                className="btn-outline"
              >
                {isGenerating ? "Generating..." : "Add 500KB Data"}
              </button>

              <button
                onClick={() => generateTestData(1000)}
                disabled={isGenerating}
                className="btn-danger"
              >
                {isGenerating ? "Generating..." : "Add 1MB Data"}
              </button>

              <button onClick={addDebugData} className="btn-secondary">
                Add Debug Data
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={clearTestData} className="btn-secondary">
                Clear Test Data
              </button>

              <button
                onClick={() => {
                  const formatted = getFormattedUsage();
                  navigator.clipboard?.writeText(formatted);
                  alert("Storage info copied to clipboard");
                }}
                className="btn-outline"
              >
                Copy Storage Info
              </button>

              <button onClick={clearAllData} className="btn-danger">
                Clear All Data
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground-secondary mb-4">
              Storage Monitor Component
            </h2>
            <StorageMonitor showDetails={true} className="border rounded-lg" />
          </div>

          {events.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground-secondary mb-4">
                Recent Events ({events.length})
              </h2>
              <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                {events
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 bg-card rounded border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`badge-sm ${
                            event.type === "critical"
                              ? "badge-danger"
                              : event.type === "warning"
                                ? "badge-warning"
                                : event.type === "cleanup"
                                  ? "badge-success"
                                  : "badge-default"
                          }`}
                        >
                          {event.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-foreground-secondary">
                        {event.message}
                      </div>
                      <div className="mt-1 text-xs text-foreground-muted">
                        Usage: {(event.usage.percentage * 100).toFixed(1)}% (
                        {(event.usage.used / 1024).toFixed(1)}KB /
                        {(event.usage.total / 1024).toFixed(1)}KB)
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-info-background border border-info-border rounded-lg p-4">
            <h3 className="font-medium text-info-foreground mb-2">
              Testing Instructions
            </h3>
            <ul className="text-sm text-info-foreground space-y-1">
              <li>• Use the "Add Data" buttons to simulate storage usage</li>
              <li>• Watch the storage monitor component update in real-time</li>
              <li>
                • Try adding enough data to trigger warning (80%) and critical
                (90%) thresholds
              </li>
              <li>
                • The "Add Debug Data" button creates data that should be
                automatically cleaned up
              </li>
              <li>
                • Monitor the events section to see automatic cleanup actions
              </li>
              <li>
                • Check browser console for any QuotaExceededError messages
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
