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
      console.error("Error generating test data:", error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Storage Monitor Test Page
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Current Storage Status
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-600">Used</div>
                  <div className="text-lg">
                    {(usage.used / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">Available</div>
                  <div className="text-lg">
                    {(usage.available / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">Total</div>
                  <div className="text-lg">
                    {(usage.total / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600">Percentage</div>
                  <div className="text-lg">
                    {(usage.percentage * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-medium text-gray-600 mb-2">Status</div>
                <div className="flex space-x-2">
                  {usage.isCritical && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Critical
                    </span>
                  )}
                  {usage.isNearLimit && !usage.isCritical && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      Near Limit
                    </span>
                  )}
                  {!usage.isNearLimit && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Healthy
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Test Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => generateTestData(100)}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Add 100KB Data"}
              </button>

              <button
                onClick={() => generateTestData(500)}
                disabled={isGenerating}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Add 500KB Data"}
              </button>

              <button
                onClick={() => generateTestData(1000)}
                disabled={isGenerating}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Add 1MB Data"}
              </button>

              <button
                onClick={addDebugData}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Add Debug Data
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={clearTestData}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Test Data
              </button>

              <button
                onClick={() => {
                  const formatted = getFormattedUsage();
                  navigator.clipboard?.writeText(formatted);
                  alert("Storage info copied to clipboard");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Copy Storage Info
              </button>

              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Storage Monitor Component
            </h2>
            <StorageMonitor showDetails={true} className="border rounded-lg" />
          </div>

          {events.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Recent Events ({events.length})
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                {events
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 bg-white rounded border-l-4 border-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            event.type === "critical"
                              ? "bg-red-100 text-red-700"
                              : event.type === "warning"
                                ? "bg-yellow-100 text-yellow-700"
                                : event.type === "cleanup"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {event.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">
                        {event.message}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Usage: {(event.usage.percentage * 100).toFixed(1)}% (
                        {(event.usage.used / 1024).toFixed(1)}KB /{" "}
                        {(event.usage.total / 1024).toFixed(1)}KB)
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              Testing Instructions
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
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
