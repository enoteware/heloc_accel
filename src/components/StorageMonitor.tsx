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
    if (usage.isCritical)
      return "text-destructive bg-[rgb(var(--color-error-background))]";
    if (usage.isNearLimit)
      return "text-warning bg-[rgb(var(--color-warning-background))]";
    return "text-success bg-[rgb(var(--color-success-background))]";
  };

  const getProgressBarColor = () => {
    if (usage.isCritical) return "bg-destructive";
    if (usage.isNearLimit) return "bg-warning";
    return "bg-success";
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
        <div className="mt-2 p-4 bg-card border border-border rounded-lg shadow-sm">
          {/* Usage Details */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Storage Usage
            </h4>
            <div className="space-y-1 text-sm text-foreground-secondary">
              <div>Used: {(usage.used / 1024).toFixed(1)} KB</div>
              <div>Available: {(usage.available / 1024).toFixed(1)} KB</div>
              <div>Total: {(usage.total / 1024).toFixed(1)} KB</div>
              <div>Percentage: {(usage.percentage * 100).toFixed(2)}%</div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {usage.isCritical && (
                <span
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: "rgb(var(--color-error-background))",
                    color: "rgb(var(--color-error))",
                  }}
                >
                  Critical Usage
                </span>
              )}
              {usage.isNearLimit && !usage.isCritical && (
                <span
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: "rgb(var(--color-warning-background))",
                    color: "rgb(var(--color-warning))",
                  }}
                >
                  Near Limit
                </span>
              )}
              {!usage.isNearLimit && (
                <span
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: "rgb(var(--color-success-background))",
                    color: "rgb(var(--color-success))",
                  }}
                >
                  Healthy
                </span>
              )}
              {isMonitoring && (
                <span
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: "rgb(var(--color-info-background))",
                    color: "rgb(var(--color-info))",
                  }}
                >
                  Monitoring Active
                </span>
              )}
            </div>
          </div>

          {/* Recent Events */}
          {events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Recent Events
                </h4>
                <button
                  onClick={clearEvents}
                  className="text-xs text-foreground-muted hover:text-foreground"
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
                        <div className="text-foreground-secondary">
                          {event.message}
                        </div>
                        <div className="text-foreground-muted">
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
              className="px-3 py-1 text-xs bg-info text-info-foreground rounded hover:bg-info/90"
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
              className="px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80"
            >
              Copy Info
            </button>
          </div>

          {/* Recommendations */}
          {(usage.isNearLimit || usage.isCritical) && (
            <div
              className="mt-4 p-3 rounded border"
              style={{
                backgroundColor: "rgb(var(--color-warning-background))",
                borderColor: "rgb(var(--color-warning-border))",
              }}
            >
              <h5 className="text-sm font-medium text-warning mb-1">
                Recommendations
              </h5>
              <ul className="text-xs text-warning space-y-1">
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

  const color = usage.isCritical ? "text-destructive" : "text-warning";
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
