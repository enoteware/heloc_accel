"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";

interface DebugInfo {
  auth?: any;
  status?: any;
  error?: string;
}

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export default function DebugPanel({
  isVisible = false,
  onToggle,
}: DebugPanelProps) {
  const user = useUser();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"auth" | "status" | "user">(
    "auth",
  );

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      // Fetch auth debug info
      const authResponse = await fetch("/api/debug/auth");
      const authData = await authResponse.json();

      // Fetch system status
      const statusResponse = await fetch("/api/debug/status");
      const statusData = await statusResponse.json();

      setDebugInfo({
        auth: authData.debug || authData,
        status: statusData.status || statusData,
      });
    } catch (error) {
      setDebugInfo({
        error:
          error instanceof Error ? error.message : "Failed to fetch debug info",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchDebugInfo();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg hover:bg-primary/90 z-40 flex items-center space-x-2"
        title="Open Debug Panel"
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
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <span>Debug</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary shadow-2xl z-40"
      style={{ height: "40vh" }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-foreground">
              Debug Panel
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("auth")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === "auth"
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-card/50"
                }`}
              >
                Auth
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === "status"
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-card/50"
                }`}
              >
                System
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === "user"
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-card/50"
                }`}
              >
                User
              </button>
            </div>
            <button
              onClick={fetchDebugInfo}
              disabled={loading}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <button
            onClick={onToggle}
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {debugInfo.error ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <p className="text-destructive">{debugInfo.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "auth" && debugInfo.auth && (
                <div className="space-y-4">
                  {/* Authentication Status */}
                  <div className="bg-card rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Authentication Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">
                          Authenticated:
                        </span>
                        <span
                          className={`font-medium ${debugInfo.auth.authentication?.isAuthenticated ? "text-primary" : "text-destructive"}`}
                        >
                          {debugInfo.auth.authentication?.isAuthenticated
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      {debugInfo.auth.authentication?.user && (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">
                              User ID:
                            </span>
                            <span className="font-mono text-xs">
                              {debugInfo.auth.authentication.user.id}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">
                              Email:
                            </span>
                            <span>
                              {debugInfo.auth.authentication.user.email}
                            </span>
                          </div>
                        </>
                      )}
                      {debugInfo.auth.authentication?.error && (
                        <div
                          className="mt-2 p-2 rounded"
                          style={{
                            backgroundColor:
                              "rgb(var(--color-error-background))",
                          }}
                        >
                          <p className="text-sm text-destructive">
                            {debugInfo.auth.authentication.error.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cookies */}
                  <div className="bg-card rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Cookies
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Total cookies: {debugInfo.auth.cookies?.total || 0}
                      </p>
                      {debugInfo.auth.cookies?.stackRelated?.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-gray-700">
                            Stack Auth Cookies:
                          </p>
                          <div className="mt-1 space-y-1">
                            {debugInfo.auth.cookies.stackRelated.map(
                              (cookie: any, i: number) => (
                                <div key={i} className="pl-4 text-xs font-mono">
                                  {cookie.name} ({cookie.valueLength} chars)
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Environment */}
                  <div className="bg-card rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Environment
                    </h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(debugInfo.auth.environment || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-mono text-xs">
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "status" && debugInfo.status && (
                <div className="space-y-4">
                  {/* System Info */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      System
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>Node: {debugInfo.status.system?.nodeVersion}</div>
                      <div>Platform: {debugInfo.status.system?.platform}</div>
                      <div>
                        Memory: {debugInfo.status.system?.memory?.used}MB /{" "}
                        {debugInfo.status.system?.memory?.total}MB
                      </div>
                      <div>
                        Uptime:{" "}
                        {Math.round(
                          (debugInfo.status.system?.uptime || 0) / 60,
                        )}{" "}
                        minutes
                      </div>
                    </div>
                  </div>

                  {/* Database Status */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Database
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>Connected:</span>
                        <span
                          className={`font-medium ${debugInfo.status.database?.connected ? "text-primary" : "text-destructive"}`}
                        >
                          {debugInfo.status.database?.connected ? "Yes" : "No"}
                        </span>
                      </div>
                      {debugInfo.status.database?.error && (
                        <p className="text-destructive text-xs mt-1">
                          {debugInfo.status.database.error}
                        </p>
                      )}
                      {debugInfo.status.database?.poolStats && (
                        <div className="mt-2 text-xs text-foreground-secondary">
                          <div>
                            Total connections:{" "}
                            {debugInfo.status.database.poolStats.totalCount}
                          </div>
                          <div>
                            Idle:{" "}
                            {debugInfo.status.database.poolStats.idleCount}
                          </div>
                          <div>
                            Waiting:{" "}
                            {debugInfo.status.database.poolStats.waitingCount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logs Summary */}
                  <div className="bg-card rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Logs</h4>
                    <div className="space-y-1 text-sm">
                      <div>Total logs: {debugInfo.status.logs?.total || 0}</div>
                      {debugInfo.status.logs?.byLevel && (
                        <div className="flex space-x-4 mt-2">
                          {Object.entries(debugInfo.status.logs.byLevel).map(
                            ([level, count]) => (
                              <div
                                key={level}
                                className="flex items-center space-x-1"
                              >
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    level === "error"
                                      ? "bg-destructive/15 text-destructive"
                                      : level === "warn"
                                        ? "bg-accent/15 text-accent"
                                        : level === "info"
                                          ? "bg-accent/15 text-accent"
                                          : "bg-muted text-foreground"
                                  }`}
                                >
                                  {level}
                                </span>
                                <span className="text-xs">
                                  {count as number}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "user" && (
                <div className="bg-card rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    Current User (Client-Side)
                  </h4>
                  {user ? (
                    <pre className="text-xs font-mono overflow-auto">
                      {JSON.stringify(
                        {
                          id: user.id,
                          email: user.primaryEmail,
                          displayName: user.displayName,
                          emailVerified: (user as any).emailVerified,
                          signedUpAt: user.signedUpAt,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No user logged in</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
