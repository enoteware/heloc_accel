'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import CalculatorForm from '@/components/CalculatorForm'
import type { CalculatorValidationInput } from '@/lib/validation'
import { getDemoScenario, generateSampleScenarios } from '@/lib/demo-storage'
import { getApiUrl } from '@/lib/api-url'
import Logo from '@/components/Logo'

// Lazy load heavy components that are only shown after calculation
const ResultsDisplay = lazy(() => import('@/components/ResultsDisplay'))
const PayoffChart = lazy(() => import('@/components/PayoffChart'))

interface CalculationResults {
  traditional: {
    payoffMonths: number
    totalInterest: number
    monthlyPayment: number
    totalPayments: number
    schedule: any[]
  }
  heloc: {
    payoffMonths: number
    totalInterest: number
    totalMortgageInterest: number
    totalHelocInterest: number
    maxHelocUsed: number
    averageHelocBalance: number
    schedule: any[]
  }
  comparison: {
    timeSavedMonths: number
    timeSavedYears: number
    interestSaved: number
    percentageInterestSaved: number
    monthlyPaymentDifference: number
  }
}

function CalculatorPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<Partial<CalculatorValidationInput>>({})
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Initialize demo data if in demo mode
  useEffect(() => {
    if (isDemoMode) {
      generateSampleScenarios()
    }
  }, [isDemoMode])

  // Redirect to login if not authenticated (unless in demo mode)
  useEffect(() => {
    if (isDemoMode) return // Skip auth check in demo mode
    if (status === 'loading') return // Still loading
    if (!session?.user) {
      router.push('/login?callbackUrl=/calculator')
    }
  }, [session, status, router, isDemoMode])

  // Load scenario data if editing or duplicating
  useEffect(() => {
    const editId = searchParams.get('edit')
    const duplicateId = searchParams.get('duplicate')
    const scenarioName = searchParams.get('name')

    if (editId || duplicateId) {
      const scenarioId = editId || duplicateId
      if (scenarioId) {
        loadScenarioData(scenarioId, !!editId, scenarioName)
      }
    }
  }, [searchParams])

  const loadScenarioData = async (scenarioId: string, isEdit: boolean, customName?: string | null) => {
    try {
      setLoading(true)

      let scenario: any = null

      if (isDemoMode) {
        // Load from localStorage in demo mode
        scenario = getDemoScenario(scenarioId)
        if (!scenario) {
          throw new Error('Scenario not found in demo storage')
        }
      } else {
        // Load from API in normal mode
        const response = await fetch(`/api/scenario/${scenarioId}`)
        if (!response.ok) {
          throw new Error('Failed to load scenario')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error('Failed to load scenario')
        }
        scenario = data.data
      }

      // Convert scenario data to form format
      const formData: Partial<CalculatorValidationInput> = isDemoMode ? {
        // Demo mode - direct mapping
        currentMortgageBalance: scenario.currentMortgageBalance,
        currentInterestRate: scenario.currentInterestRate * 100, // Convert to percentage
        remainingTermMonths: scenario.remainingTermMonths,
        monthlyPayment: scenario.monthlyPayment,
        propertyValue: scenario.propertyValue,
        propertyTaxMonthly: scenario.propertyTaxMonthly,
        insuranceMonthly: scenario.insuranceMonthly,
        hoaFeesMonthly: scenario.hoaFeesMonthly,
        helocLimit: scenario.helocLimit,
        helocInterestRate: scenario.helocInterestRate * 100, // Convert to percentage
        helocAvailableCredit: scenario.helocAvailableCredit,
        monthlyGrossIncome: scenario.monthlyGrossIncome,
        monthlyNetIncome: scenario.monthlyNetIncome,
        monthlyExpenses: scenario.monthlyExpenses,
        monthlyDiscretionaryIncome: scenario.monthlyDiscretionaryIncome,
      } : {
        // Database mode - snake_case mapping
        currentMortgageBalance: scenario.current_mortgage_balance,
        currentInterestRate: scenario.current_interest_rate * 100, // Convert to percentage
        remainingTermMonths: scenario.remaining_term_months,
        monthlyPayment: scenario.monthly_payment,
        propertyValue: scenario.property_value,
        propertyTaxMonthly: scenario.property_tax_monthly,
        insuranceMonthly: scenario.insurance_monthly,
        hoaFeesMonthly: scenario.hoa_fees_monthly,
        helocLimit: scenario.heloc_limit,
        helocInterestRate: scenario.heloc_interest_rate * 100, // Convert to percentage
        helocAvailableCredit: scenario.heloc_available_credit,
        monthlyGrossIncome: scenario.monthly_gross_income,
        monthlyNetIncome: scenario.monthly_net_income,
        monthlyExpenses: scenario.monthly_expenses,
        monthlyDiscretionaryIncome: scenario.monthly_discretionary_income,
      }

      // Add scenario name and description
      formData.scenarioName = customName || scenario.name
      formData.description = scenario.description

      setInitialData(formData)
      if (isEdit) {
        setEditingScenarioId(scenarioId)
      }
    } catch (err) {
      console.error('Error loading scenario:', err)
      setError('Failed to load scenario data')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculation = async (formData: CalculatorValidationInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiUrl('api/calculate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed')
      }

      if (data.success) {
        setResults(data.data)
      } else {
        throw new Error(data.error || 'Calculation failed')
      }
    } catch (err) {
      console.error('Calculation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during calculation')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScenario = async () => {
    if (!results) return

    // TODO: Implement scenario saving
    alert('Scenario saving will be implemented in the next phase')
  }

  const handleNewCalculation = () => {
    setResults(null)
    setError(null)
  }

  const prepareChartData = () => {
    if (!results) return []

    const maxLength = Math.max(
      results.traditional.schedule.length,
      results.heloc.schedule.length
    )

    const chartData = []
    for (let i = 0; i < maxLength; i++) {
      const traditionalData = results.traditional.schedule[i]
      const helocData = results.heloc.schedule[i]

      chartData.push({
        month: i + 1,
        traditionalBalance: traditionalData?.endingBalance || 0,
        helocBalance: helocData?.endingBalance || 0,
        traditionalInterest: traditionalData?.cumulativeInterest || 0,
        helocInterest: helocData?.cumulativeInterest || 0,
      })
    }

    return chartData
  }

  if (!isDemoMode && status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isDemoMode && !session?.user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo
              size="lg"
              showText={false}
              clickable={true}
              priority={true}
              className="drop-shadow-md"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {editingScenarioId ? 'Edit Scenario' : 'HELOC Accelerator Calculator'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {editingScenarioId
              ? 'Update your HELOC acceleration scenario with new parameters'
              : 'Compare traditional mortgage payments with HELOC acceleration strategy to see potential savings'
            }
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Demo Mode Active</h3>
                  <p className="text-sm text-green-700">
                    Try all features without signing up • Data saved locally • Sample scenarios included
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View Saved Scenarios →
              </button>
            </div>
          </div>
        )}

        {/* User Welcome */}
        {!isDemoMode && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session?.user?.name || session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Calculation Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!results ? (
          <CalculatorForm
            onSubmit={handleCalculation}
            loading={loading}
            initialData={initialData}
          />
        ) : (
          <div className="space-y-8">
            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            }>
              <ResultsDisplay
                results={results}
                onSaveScenario={handleSaveScenario}
                onNewCalculation={handleNewCalculation}
              />
            </Suspense>

            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            }>
              <PayoffChart
                data={prepareChartData()}
                title="Mortgage Balance Over Time"
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calculator...</p>
        </div>
      </div>
    }>
      <CalculatorPageContent />
    </Suspense>
  )
}