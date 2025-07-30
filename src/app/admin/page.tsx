'use client'

import React, { useEffect, useState } from 'react'
import { Users, Building, UserCheck, TrendingUp, FileText, Plus } from 'lucide-react'
import StatsCard from './_components/StatsCard'
import Link from 'next/link'
import { getDemoAgents, getDemoActiveAgents, initializeDemoCompanyData } from '@/lib/company-data'

interface DashboardStats {
  totalAgents: number
  activeAgents: number
  totalUsers: number
  unassignedUsers: number
  recentScenarios: number
  documentsCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalUsers: 0,
    unassignedUsers: 0,
    recentScenarios: 0,
    documentsCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
        
        if (isDemoMode) {
          // Initialize demo data
          initializeDemoCompanyData()
          
          // Get demo stats
          const agents = getDemoAgents()
          const activeAgents = getDemoActiveAgents()
          
          setStats({
            totalAgents: agents.length,
            activeAgents: activeAgents.length,
            totalUsers: 12, // Demo value
            unassignedUsers: 3, // Demo value
            recentScenarios: 45, // Demo value
            documentsCount: 4 // Demo value
          })
        } else {
          // In production, would fetch from API
          const response = await fetch('/api/admin/stats')
          if (response.ok) {
            const data = await response.json()
            setStats(data)
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
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
          trend={stats.unassignedUsers > 0 ? { value: 15, isPositive: false } : undefined}
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
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/agents/new"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add New Agent
            </Link>
            <Link
              href="/admin/company"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="h-5 w-5" />
              Update Company Info
            </Link>
            <Link
              href="/admin/assignments?filter=unassigned"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              View Unassigned Users
            </Link>
            <Link
              href="/admin/documents"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5" />
              Manage Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New user John Smith assigned to Sarah Johnson</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New scenario calculated: $125,000 potential savings</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agent Michael Chen updated availability</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}