'use client'

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Note: ComparisonTable component would be lazy loaded here when created

interface Scenario {
  id: string
  name: string
  description?: string
  current_mortgage_balance: number
  current_interest_rate: number
  remaining_term_months: number
  monthly_payment: number
  heloc_limit?: number
  heloc_interest_rate?: number
  monthly_gross_income: number
  monthly_net_income: number
  monthly_expenses: number
  monthly_discretionary_income: number
  traditional_payoff_months?: number
  traditional_total_interest?: number
  heloc_payoff_months?: number
  heloc_total_interest?: number
  time_saved_months?: number
  interest_saved?: number
  created_at: string
  updated_at: string
}

function ComparePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Redirect to login if not authenticated (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return // Skip auth check in demo mode
    if (status === 'loading') return
    if (!session) {
      router.push('/login?callbackUrl=/compare')
    }
  }, [session, status, router, isDemoMode])

  const loadScenarios = useCallback(async () => {
    try {
      setLoading(true)
      
      if (isDemoMode) {
        // In demo mode, load scenarios from localStorage
        const demoUserId = session?.user?.id || 'demo-user-001'
        const storageKey = `heloc_demo_user_${demoUserId}_scenarios`
        const storedScenarios = localStorage.getItem(storageKey)
        
        if (storedScenarios) {
          const parsedScenarios = JSON.parse(storedScenarios)
          setScenarios(parsedScenarios)
        } else {
          setScenarios([])
        }
      } else {
        // Production mode - fetch from API
        const response = await fetch('/api/scenario')
        
        if (!response.ok) {
          throw new Error('Failed to load scenarios')
        }

        const data = await response.json()
        if (data.success) {
          setScenarios(data.data)
        } else {
          throw new Error(data.error || 'Failed to load scenarios')
        }
      }
    } catch (err) {
      console.error('Error loading scenarios:', err)
      setError('Failed to load scenarios')
    } finally {
      setLoading(false)
    }
  }, [isDemoMode, session?.user?.id])

  // Load scenarios and pre-select from URL params
  useEffect(() => {
    if (isDemoMode || session) {
      loadScenarios()
      
      // Pre-select scenarios from URL params
      const preSelected = searchParams.get('scenarios')?.split(',') || []
      setSelectedScenarios(preSelected.slice(0, 3)) // Max 3 scenarios
    }
  }, [session, searchParams, isDemoMode, loadScenarios])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatMonths = (months: number) => {
    if (!months) return 'N/A'
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) {
      return `${months} months`
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    } else {
      return `${years}y ${remainingMonths}m`
    }
  }

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId)
      } else if (prev.length < 3) {
        return [...prev, scenarioId]
      } else {
        // Replace the first selected scenario
        return [prev[1], prev[2], scenarioId]
      }
    })
  }

  const getSelectedScenarioData = () => {
    return selectedScenarios.map(id => scenarios.find(s => s.id === id)).filter(Boolean) as Scenario[]
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    )
  }

  if (!isDemoMode && !session) {
    return null
  }

  const selectedScenarioData = getSelectedScenarioData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">Demo Mode - Scenario Comparison</h3>
                <p className="text-sm text-green-700">
                  Comparing scenarios stored locally in your browser. Data will not be saved to a database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compare Scenarios
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select up to 3 scenarios to compare their HELOC acceleration strategies side-by-side
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios to compare</h3>
              <p className="text-gray-600 mb-4">
                You need at least 2 scenarios to use the comparison feature.
              </p>
              <Link
                href="/calculator"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition duration-200"
              >
                Create Your First Scenario
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Scenario Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Scenarios to Compare ({selectedScenarios.length}/3)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition duration-200 ${
                      selectedScenarios.includes(scenario.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleScenarioToggle(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{scenario.name}</h3>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedScenarios.includes(scenario.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedScenarios.includes(scenario.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {scenario.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{scenario.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      <p>Balance: {formatCurrency(scenario.current_mortgage_balance)}</p>
                      {scenario.interest_saved && (
                        <p>Potential Savings: {formatCurrency(scenario.interest_saved)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            {selectedScenarioData.length >= 2 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Comparison Results</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        {selectedScenarioData.map((scenario) => (
                          <th key={scenario.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {scenario.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Mortgage Balance
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(scenario.current_mortgage_balance)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Interest Rate
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(scenario.current_interest_rate * 100).toFixed(2)}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Monthly Payment
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(scenario.monthly_payment)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          HELOC Limit
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {scenario.heloc_limit ? formatCurrency(scenario.heloc_limit) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Traditional Payoff Time
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {scenario.traditional_payoff_months ? formatMonths(scenario.traditional_payoff_months) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          HELOC Payoff Time
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {scenario.heloc_payoff_months ? formatMonths(scenario.heloc_payoff_months) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Time Saved
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {scenario.time_saved_months ? formatMonths(scenario.time_saved_months) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Interest Saved
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {scenario.interest_saved ? formatCurrency(scenario.interest_saved) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Monthly Discretionary Income
                        </td>
                        {selectedScenarioData.map((scenario) => (
                          <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(scenario.monthly_discretionary_income)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedScenarioData.length < 2 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select scenarios to compare</h3>
                <p className="text-gray-600">
                  Choose at least 2 scenarios from the list above to see a detailed comparison.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}
