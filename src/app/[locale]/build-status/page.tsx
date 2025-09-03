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

  useEffect(() => {
    fetch("/api/build-log?format=json")
      .then((res) => res.json())
      .then((data) => {
        setBuildLog(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching build log:", error);
        setLoading(false);
      });
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
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "building":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                <span className="text-green-500 mr-3">✅</span>
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
                <span className="text-blue-500 mr-3">🔧</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">📋 Notes</h3>
          <p className="text-muted-foreground">{buildLog.notes}</p>
        </div>

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
