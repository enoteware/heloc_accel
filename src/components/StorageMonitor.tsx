/**
 * Storage Monitor UI Component
 *
 * Displays storage usage and provides controls for storage management
 */

"use client";

import React, { useState } from "react";
import { useStorageMonitor } from "@/hooks/useStorageMonitor";
import { StorageEvent } from "@/lib/storage-monitor";

interface StorageMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export default function StorageMonitor({
  showDetails = false,
  className = "",
}: StorageMonitorProps) {
  const { usage, isMonitoring, events, clearEvents, getFormattedUsage } =
    useStorageMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    if (usage.isCritical) return "text-red-600 bg-red-50";
    if (usage.isNearLimit) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getProgressBarColor = () => {
    if (usage.isCritical) return "bg-red-500";
    if (usage.isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatEventTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const getEventIcon = (type: StorageEvent["type"]) => {
    switch (type) {
      case "critical":
        return "🚨";
      case "warning":
        return "⚠️";
      case "cleanup":
        return "🧹";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  if (!showDetails && !usage.isNearLimit) {
    return null; // Hide when storage is healthy and details not requested
  }

  return (
    <div className={`storage-monitor ${className}`}>
      {/* Compact Status Bar */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span className="text-sm font-medium">
            Storage: {(usage.percentage * 100).toFixed(1)}%
          </span>
          {isMonitoring && (
            <span className="text-xs opacity-75">Monitoring</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(usage.percentage * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-white border rounded-lg shadow-sm">
          {/* Usage Details */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Storage Usage
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Used: {(usage.used / 1024).toFixed(1)} KB</div>
              <div>Available: {(usage.available / 1024).toFixed(1)} KB</div>
              <div>Total: {(usage.total / 1024).toFixed(1)} KB</div>
              <div>Percentage: {(usage.percentage * 100).toFixed(2)}%</div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
            <div className="flex flex-wrap gap-2">
              {usage.isCritical && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Critical Usage
                </span>
              )}
              {usage.isNearLimit && !usage.isCritical && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                  Near Limit
                </span>
              )}
              {!usage.isNearLimit && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                  Healthy
                </span>
              )}
              {isMonitoring && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  Monitoring Active
                </span>
              )}
            </div>
          </div>

          {/* Recent Events */}
          {events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Recent Events
                </h4>
                <button
                  onClick={clearEvents}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {events
                  .slice(-5)
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 text-xs"
                    >
                      <span>{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="text-gray-600">{event.message}</div>
                        <div className="text-gray-400">
                          {formatEventTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  // Trigger manual cleanup
                  const keys = Object.keys(localStorage);
                  const debugKeys = keys.filter(
                    (key) =>
                      key.includes("debug") ||
                      key.includes("temp") ||
                      key.includes("cache"),
                  );
                  debugKeys.forEach((key) => localStorage.removeItem(key));

                  // Show success message
                  alert(`Cleaned up ${debugKeys.length} temporary items`);
                }
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Clean Temp Data
            </button>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const usage = getFormattedUsage();
                  navigator.clipboard?.writeText(usage);
                  alert("Storage info copied to clipboard");
                }
              }}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Copy Info
            </button>
          </div>

          {/* Recommendations */}
          {(usage.isNearLimit || usage.isCritical) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h5 className="text-sm font-medium text-yellow-800 mb-1">
                Recommendations
              </h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                {usage.isCritical && (
                  <li>
                    • Storage is critically full. Automatic cleanup has been
                    triggered.
                  </li>
                )}
                <li>• Clear browser cache and temporary data</li>
                <li>• Remove old saved scenarios you no longer need</li>
                <li>
                  • Consider using fewer browser tabs with this application
                </li>
                {usage.isCritical && (
                  <li>• If issues persist, try refreshing the page</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export a minimal version for status bars
export function StorageStatusIndicator({
  className = "",
}: {
  className?: string;
}) {
  const { usage } = useStorageMonitor();

  if (!usage.isNearLimit) return null;

  const color = usage.isCritical ? "text-red-500" : "text-yellow-500";
  const icon = usage.isCritical ? "🚨" : "⚠️";

  return (
    <div className={`flex items-center space-x-1 ${color} ${className}`}>
      <span>{icon}</span>
      <span className="text-xs">
        Storage: {(usage.percentage * 100).toFixed(0)}%
      </span>
    </div>
  );
}
