"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface BuildLog {
  timestamp: string;
  version: string;
  status: "success" | "failed" | "building";
  buildTime: string;
  commit: string;
  branch: string;
  environment: string;
  features: string[];
  fixes: string[];
  notes: string;
  deploymentUrl?: string;
}

export default function BuildStatusPage() {
  const t = useTranslations("common");
  const [buildLog, setBuildLog] = useState<BuildLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientUpdateMd, setClientUpdateMd] = useState<string | null>(null);
  const [buildLogMd, setBuildLogMd] = useState<string | null>(null);
  const [successSummaryMd, setSuccessSummaryMd] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [logRes, mdRes, buildMdRes] = await Promise.all([
          fetch("/api/build-log?format=json"),
          fetch("/api/build-status/md"),
          fetch("/api/build-status/build-md"),
        ]);
        const logJson = await logRes.json();
        setBuildLog(logJson);
        if (mdRes.ok) {
          const mdText = await mdRes.text();
          setClientUpdateMd(mdText);
        }
        if (buildMdRes.ok) {
          const { buildLog, successSummary } = await buildMdRes.json();
          if (buildLog) setBuildLogMd(buildLog);
          if (successSummary) setSuccessSummaryMd(successSummary);
        }
      } catch (error) {
        console.error("Error loading build data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading build status...</p>
        </div>
      </div>
    );
  }

  if (!buildLog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load build status</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-[rgb(var(--color-success-background))] text-success border-success-border";
      case "failed":
        return "bg-[rgb(var(--color-error-background))] text-destructive border-destructive";
      case "building":
        return "bg-[rgb(var(--color-info-background))] text-info border-info-border";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Executive Summary */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Executive Summary</h2>
              <p className="text-muted-foreground">
                Current release status and highlights using semantic tokens.
              </p>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                buildLog.status,
              )}`}
            >
              {buildLog.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-surface border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Version
              </div>
              <div className="font-semibold">{buildLog.version}</div>
            </div>
            <div className="bg-surface border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Build Time
              </div>
              <div className="font-semibold">{buildLog.buildTime}</div>
            </div>
            <div className="bg-surface border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Environment
              </div>
              <div className="font-semibold capitalize">
                {buildLog.environment}
              </div>
            </div>
            <div className="bg-surface border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Commit
              </div>
              <div className="font-semibold font-mono truncate">
                {buildLog.commit}
              </div>
            </div>
          </div>

          {(buildLog.features?.length || buildLog.fixes?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {buildLog.features?.length ? (
                <div className="bg-surface border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Key Features
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {buildLog.features.slice(0, 3).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {buildLog.fixes?.length ? (
                <div className="bg-surface border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Top Fixes
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {buildLog.fixes.slice(0, 3).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">🏠 HELOC Accelerator</h1>
          <p className="text-primary-foreground/90 mb-4">
            Build Status & Deployment Information
          </p>
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide border ${getStatusColor(
              buildLog.status,
            )}`}
          >
            {buildLog.status}
          </span>
        </div>

        {/* Build Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Version
            </div>
            <div className="text-lg font-semibold">{buildLog.version}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Build Time
            </div>
            <div className="text-lg font-semibold">{buildLog.buildTime}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Commit
            </div>
            <div className="text-lg font-semibold font-mono">
              {buildLog.commit}
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Environment
            </div>
            <div className="text-lg font-semibold capitalize">
              {buildLog.environment}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            🚀 Available Features
          </h3>
          <ul className="space-y-2">
            {buildLog.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-success mr-3">✅</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Fixes */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            🔧 Recent Fixes & Improvements
          </h3>
          <ul className="space-y-2">
            {buildLog.fixes.map((fix, index) => (
              <li key={index} className="flex items-center">
                <span className="text-info mr-3">🔧</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Client Status Update (Markdown) */}
        {clientUpdateMd && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              📣 Client Status Update
            </h3>
            <article className="text-foreground whitespace-pre-wrap leading-relaxed">
              {clientUpdateMd}
            </article>
          </div>
        )}

        {/* Detailed Build Log (Markdown) */}
        {buildLogMd && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              🧱 Detailed Build Log
            </h3>
            <p className="text-muted-foreground mb-4">
              Latest main branch production build details.
            </p>
            <article className="text-foreground whitespace-pre-wrap leading-relaxed">
              {buildLogMd}
            </article>
          </div>
        )}

        {/* Build Success Summary (Markdown) */}
        {successSummaryMd && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              ✅ Build Success Summary
            </h3>
            <article className="text-foreground whitespace-pre-wrap leading-relaxed">
              {successSummaryMd}
            </article>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">🔗 Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={buildLog.deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View Application
            </a>
            <a
              href={`${buildLog.deploymentUrl}/en/scenarios`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Test Scenarios
            </a>
            <a
              href="/api/build-log"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Shareable Link
            </a>
            <button
              onClick={() => {
                const url = `${window.location.origin}/api/build-log`;
                navigator.clipboard.writeText(url);
                alert("Shareable URL copied to clipboard!");
              }}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Copy Share URL
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>Last updated: {new Date(buildLog.timestamp).toLocaleString()}</p>
          <p className="mt-1">
            HELOC Accelerator - Mortgage Acceleration Calculator
          </p>
        </div>
      </div>
    </div>
  );
}
