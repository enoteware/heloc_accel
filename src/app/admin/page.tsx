"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Building,
  UserCheck,
  TrendingUp,
  FileText,
  Plus,
} from "lucide-react";
import StatsCard from "./_components/StatsCard";
import Link from "next/link";

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalUsers: number;
  unassignedUsers: number;
  recentScenarios: number;
  documentsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalUsers: 0,
    unassignedUsers: 0,
    recentScenarios: 0,
    documentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch from API
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Manage your company settings, agents, and user assignments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Agents"
          value={stats.totalAgents}
          description={`${stats.activeAgents} active`}
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon={UserCheck}
          loading={loading}
        />
        <StatsCard
          title="Unassigned Users"
          value={stats.unassignedUsers}
          description="Need agent assignment"
          icon={Building}
          trend={
            stats.unassignedUsers > 0
              ? { value: 15, isPositive: false }
              : undefined
          }
          loading={loading}
        />
        <StatsCard
          title="Recent Scenarios"
          value={stats.recentScenarios}
          description="Last 30 days"
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
          loading={loading}
        />
        <StatsCard
          title="Active Agents"
          value={stats.activeAgents}
          description="Currently available"
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="Documents"
          value={stats.documentsCount}
          description="Legal documents"
          icon={FileText}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/agents/new"
              className="flex items-center justify-center gap-2 px-4 py-3 btn-primary rounded-lg"
            >
              <Plus className="h-5 w-5" />
              Add New Agent
            </Link>
            <Link
              href="/admin/company"
              className="flex items-center justify-center gap-2 px-4 py-3 btn-outline rounded-lg"
            >
              <Building className="h-5 w-5" />
              Update Company Info
            </Link>
            <Link
              href="/admin/assignments?filter=unassigned"
              className="flex items-center justify-center gap-2 px-4 py-3 btn-outline rounded-lg"
            >
              <UserCheck className="h-5 w-5" />
              View Unassigned Users
            </Link>
            <Link
              href="/admin/documents"
              className="flex items-center justify-center gap-2 px-4 py-3 btn-outline rounded-lg"
            >
              <FileText className="h-5 w-5" />
              Manage Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-card border border-border rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgb(var(--color-success-background))",
                    }}
                  >
                    <UserCheck
                      className="h-5 w-5"
                      style={{ color: "rgb(var(--color-success))" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      New user John Smith assigned to Sarah Johnson
                    </p>
                    <p className="text-xs text-foreground-muted">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgb(var(--color-info-background))",
                    }}
                  >
                    <TrendingUp
                      className="h-5 w-5"
                      style={{ color: "rgb(var(--color-info))" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      New scenario calculated: $125,000 potential savings
                    </p>
                    <p className="text-xs text-foreground-muted">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgb(var(--color-accent-foreground))",
                      opacity: 0.1,
                    }}
                  >
                    <Users
                      className="h-5 w-5"
                      style={{ color: "rgb(var(--color-accent))" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Agent Michael Chen updated availability
                    </p>
                    <p className="text-xs text-foreground-muted">5 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
