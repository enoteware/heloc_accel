'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@stackframe/stack'
import {
  CompanySettings,
  Agent,
  getDemoCompanySettings,
  getDemoUserAgent,
  initializeDemoCompanyData
} from '@/lib/company-data'

interface CompanyContextType {
  companySettings: CompanySettings | null
  assignedAgent: Agent | null
  loading: boolean
  error: string | null
  refreshCompanyData: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const user = useUser()
  const session = user ? { user } : null
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const fetchCompanyData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isDemoMode) {
        // Initialize demo data if needed
        initializeDemoCompanyData()
        
        // Get demo data
        const settings = getDemoCompanySettings()
        setCompanySettings(settings)

        // Get assigned agent for demo user
        if (session?.user?.id) {
          const agent = getDemoUserAgent(session.user.id)
          setAssignedAgent(agent)
        }
      } else {
        // Fetch company settings from API
        const settingsResponse = await fetch('/api/company')
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch company settings')
        }
        const settingsData = await settingsResponse.json()
        if (settingsData.success) {
          setCompanySettings(settingsData.data)
        }

        // Fetch assigned agent if user is logged in
        if (session?.user?.id) {
          const agentResponse = await fetch(`/api/users/${session.user.id}/agent`)
          if (agentResponse.ok) {
            const agentData = await agentResponse.json()
            if (agentData.success) {
              setAssignedAgent(agentData.data)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching company data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount and when session changes
  useEffect(() => {
    fetchCompanyData()
  }, [session?.user?.id, isDemoMode])

  const refreshCompanyData = async () => {
    await fetchCompanyData()
  }

  const contextValue: CompanyContextType = {
    companySettings,
    assignedAgent,
    loading,
    error,
    refreshCompanyData
  }

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

// Hook for getting formatted company info
export function useCompanyInfo() {
  const { companySettings, assignedAgent } = useCompany()
  
  return {
    company: {
      name: companySettings?.companyName || 'HELOC Accelerator',
      phone: companySettings?.companyPhone || '1-800-HELOC',
      email: companySettings?.companyEmail || 'info@helocaccelerator.com',
      website: companySettings?.companyWebsite || 'https://helocaccelerator.com',
      address: companySettings?.companyAddress || '',
      nmls: companySettings?.companyNmlsNumber || '',
      license: companySettings?.companyLicenseNumber || ''
    },
    agent: assignedAgent ? {
      name: `${assignedAgent.firstName} ${assignedAgent.lastName}`,
      title: assignedAgent.title || 'Mortgage Advisor',
      email: assignedAgent.email,
      phone: assignedAgent.phone || '',
      mobile: assignedAgent.mobilePhone || '',
      nmls: assignedAgent.nmlsNumber || '',
      bio: assignedAgent.bio || ''
    } : null
  }
}