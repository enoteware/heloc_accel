"use client";

import React, { useState, useEffect } from "react";
import { debugLogger, DebugLog } from "@/lib/debug-logger";
import { Button } from "@/components/design-system/Button";

export default function DebugLogViewer() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState({
    level: "",
    category: "",
    limit: 100,
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadLogs = () => {
      const filteredLogs = debugLogger.getLogs({
        level: (filter.level as any) || undefined,
        category: filter.category || undefined,
        limit: filter.limit,
      });
      setLogs(filteredLogs);
    };

    loadLogs();

    // Auto refresh logs
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, filter, autoRefresh]);

  const handleExport = () => {
    const data = debugLogger.export();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heloc-debug-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all debug logs?")) {
      debugLogger.clear();
      setLogs([]);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-destructive bg-[rgb(var(--color-error-background))]";
      case "warn":
        return "text-warning bg-[rgb(var(--color-warning-background))]";
      case "info":
        return "text-info bg-[rgb(var(--color-info-background))]";
      case "debug":
        return "text-foreground-muted bg-muted";
      default:
        return "text-foreground-muted";
    }
  };

  const categories = Array.from(
    new Set(logs.map((log) => log.category)),
  ).sort();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg"
        style={{
          backgroundColor: "rgb(var(--color-surface-tertiary))",
          color: "rgb(var(--color-foreground))",
        }}
        title="Open Debug Logs"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>Debug Logs</span>
        {logs.length > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: "rgb(var(--color-error))",
              color: "rgb(var(--color-error-foreground))",
            }}
          >
            {logs.filter((l) => l.level === "error").length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgb(var(--color-background-overlay) / 0.5)" }}
    >
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Debug Logs</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-foreground-muted hover:text-foreground"
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

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border flex items-center space-x-4">
          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
            className="px-3 py-1 border rounded-md text-sm bg-background text-foreground border-border"
          >
            <option value="">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-1 border rounded-md text-sm bg-background text-foreground border-border"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={filter.limit}
            onChange={(e) =>
              setFilter({ ...filter, limit: parseInt(e.target.value) || 100 })
            }
            className="px-3 py-1 border rounded-md text-sm w-20 bg-background text-foreground border-border"
            placeholder="Limit"
            min="1"
            max="1000"
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto Refresh</span>
          </label>

          <div className="flex-1"></div>

          <Button size="sm" variant="secondary" onClick={handleExport}>
            Export
          </Button>

          <Button size="sm" variant="danger" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-background text-foreground">
          {logs.length === 0 ? (
            <div className="text-center text-foreground-muted py-8">
              No logs to display
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${log.level === "error" ? "border-destructive" : "border-border"}`}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 text-foreground-secondary">
                        <span>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-medium text-foreground">
                          [{log.category}]
                        </span>
                        {log.userId && (
                          <span className="text-xs">User: {log.userId}</span>
                        )}
                      </div>
                      <div className="mt-1 text-foreground">{log.message}</div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-foreground-secondary hover:text-foreground">
                            Data
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-destructive hover:opacity-90">
                            Stack Trace
                          </summary>
                          <pre
                            className="mt-1 p-2 rounded overflow-auto text-xs"
                            style={{
                              backgroundColor:
                                "rgb(var(--color-error-background))",
                              color: "rgb(var(--color-error))",
                            }}
                          >
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 border-t border-border text-sm text-foreground-secondary">
          Showing {logs.length} logs
        </div>
      </div>
    </div>
  );
}
