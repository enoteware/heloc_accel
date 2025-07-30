'use client'

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import FastCalculatorForm from '@/components/FastCalculatorForm'
import LiveCalculatorForm from '@/components/LiveCalculatorForm'
import LiveResultsPanel from '@/components/LiveResultsPanel'
import SaveScenarioModal from '@/components/SaveScenarioModal'
import ErrorDisplay from '@/components/ErrorDisplay'
import Disclaimer from '@/components/Disclaimer'
import type { CalculatorValidationInput, ValidationError } from '@/lib/validation'
import { ValidationErrorDisplay } from '@/components/ValidationErrorDisplay'
import { getDemoScenario, generateSampleScenarios, addDemoScenario } from '@/lib/demo-storage'
import { getApiUrl } from '@/lib/api-url'
import Logo from '@/components/Logo'
import DebugPanel from '@/components/DebugPanel'

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
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status || 'loading'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [initialData, setInitialData] = useState<Partial<CalculatorValidationInput>>({})
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentFormData, setCurrentFormData] = useState<CalculatorValidationInput | null>(null)
  const [liveMode, setLiveMode] = useState(true) // Toggle between live and traditional mode
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase() === 'true'

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

  const loadScenarioData = useCallback(async (scenarioId: string, isEdit: boolean, customName?: string | null) => {
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
  }, [isDemoMode])

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
  }, [searchParams, loadScenarioData])

  const handleCalculation = async (formData: CalculatorValidationInput) => {
    setLoading(true)
    setError(null)
    setValidationErrors([])
    setCurrentFormData(formData) // Store form data for saving

    console.log('=== CALCULATION REQUEST START ===')
    console.log('Form data received:', formData)
    console.log('API URL:', getApiUrl('api/calculate'))
    console.log('Request body:', JSON.stringify(formData, null, 2))

    try {
      const response = await fetch(getApiUrl('api/calculate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API Error Response:', data)
        if (data.data?.validationErrors) {
          console.error('Validation Errors:', data.data.validationErrors)
          setValidationErrors(data.data.validationErrors)
        }
        throw new Error(data.error || 'Calculation failed')
      }

      if (data.success) {
        console.log('Calculation successful!')
        setResults(data.data)
      } else {
        console.error('API returned unsuccessful result:', data)
        throw new Error(data.error || 'Calculation failed')
      }
    } catch (err) {
      console.error('=== CALCULATION ERROR ===')
      console.error('Error type:', err?.constructor?.name)
      console.error('Error message:', err instanceof Error ? err.message : err)
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      
      let errorMessage = 'An error occurred during calculation'
      if (err instanceof Error) {
        errorMessage = err.message
        if (err.message.includes('fetch')) {
          errorMessage = 'Network error - please check your connection'
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log('=== CALCULATION REQUEST END ===')
    }
  }

  const handleLiveCalculation = useCallback(async (formData: CalculatorValidationInput) => {
    setLiveLoading(true)
    setLiveError(null)
    setValidationErrors([])
    setCurrentFormData(formData) // Store form data for saving

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
        if (data.data?.validationErrors) {
          setValidationErrors(data.data.validationErrors)
        }
        throw new Error(data.error || 'Calculation failed')
      }

      if (data.success) {
        setResults(data.data)
      } else {
        throw new Error(data.error || 'Calculation failed')
      }
    } catch (err) {
      let errorMessage = 'An error occurred during calculation'
      if (err instanceof Error) {
        errorMessage = err.message
        if (err.message.includes('fetch')) {
          errorMessage = 'Network error - please check your connection'
        }
      }
      
      setLiveError(errorMessage)
    } finally {
      setLiveLoading(false)
    }
  }, [])

  const handleSaveScenario = async () => {
    console.log('=== SAVE SCENARIO BUTTON CLICKED ===')
    console.log('Results available:', !!results)
    console.log('Form data available:', !!currentFormData)
    
    if (!results || !currentFormData) {
      console.log('❌ Cannot save: Missing results or form data')
      return
    }
    
    console.log('✅ Opening save modal')
    setShowSaveModal(true)
  }

  const handleSaveConfirm = async (scenarioName: string, description: string) => {
    console.log('=== SAVE SCENARIO CONFIRM ===')
    console.log('Scenario name:', scenarioName)
    console.log('Description:', description)
    console.log('Demo mode:', isDemoMode)
    console.log('Results available:', !!results)
    console.log('Form data available:', !!currentFormData)
    
    if (!results || !currentFormData) {
      console.log('❌ Cannot save: Missing results or form data')
      return
    }

    setIsSaving(true)
    try {
      if (isDemoMode) {
        console.log('📱 Demo mode: Saving to localStorage')
        
        // Save to localStorage in demo mode
        const scenarioData = {
          name: scenarioName,
          description,
          currentMortgageBalance: currentFormData.currentMortgageBalance,
          currentInterestRate: currentFormData.currentInterestRate / 100, // Convert back to decimal
          remainingTermMonths: currentFormData.remainingTermMonths,
          monthlyPayment: currentFormData.monthlyPayment,
          helocLimit: currentFormData.helocLimit,
          helocInterestRate: currentFormData.helocInterestRate ? currentFormData.helocInterestRate / 100 : 0,
          monthlyGrossIncome: currentFormData.monthlyGrossIncome,
          monthlyNetIncome: currentFormData.monthlyNetIncome,
          monthlyExpenses: currentFormData.monthlyExpenses,
          monthlyDiscretionaryIncome: currentFormData.monthlyDiscretionaryIncome,
          propertyValue: currentFormData.propertyValue,
          propertyTaxMonthly: currentFormData.propertyTaxMonthly,
          insuranceMonthly: currentFormData.insuranceMonthly,
          hoaFeesMonthly: currentFormData.hoaFeesMonthly,
          traditionalPayoffMonths: results.traditional.payoffMonths,
          traditionalTotalInterest: results.traditional.totalInterest,
          helocPayoffMonths: results.heloc.payoffMonths,
          helocTotalInterest: results.heloc.totalInterest,
          timeSavedMonths: results.comparison.timeSavedMonths,
          interestSaved: results.comparison.interestSaved
        }
        
        console.log('Demo scenario data:', scenarioData)
        console.log('Calling addDemoScenario...')
        
        const savedScenario = addDemoScenario(scenarioData)
        
        console.log('✅ Demo scenario saved:', savedScenario)
        console.log('🔄 Redirecting to dashboard...')
        
        // Redirect to dashboard to see saved scenarios
        router.push('/dashboard')
      } else {
        console.log('🗄️ Production mode: Saving to database via API')
        
        // Save to database via API
        const payload = {
          scenarioName,
          description,
          calculationResults: results,
          ...currentFormData
        }

        console.log('API payload:', payload)
        console.log('Making POST request to /api/scenario...')

        const response = await fetch('/api/scenario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        console.log('API response status:', response.status)
        
        const data = await response.json()
        console.log('API response data:', data)

        if (!response.ok) {
          console.log('❌ API request failed with status:', response.status)
          throw new Error(data.error || 'Failed to save scenario')
        }

        if (!data.success) {
          console.log('❌ API returned unsuccessful result')
          throw new Error(data.error || 'Failed to save scenario')
        }

        console.log('✅ Database scenario saved successfully')
        console.log('🔄 Redirecting to dashboard...')
        
        // Redirect to dashboard to see saved scenarios
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Save scenario error:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      throw error // Let the modal handle the error display
    } finally {
      console.log('🔄 Setting isSaving to false')
      setIsSaving(false)
    }
  }

  const handleNewCalculation = () => {
    setResults(null)
    setError(null)
    setValidationErrors([])
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

        {/* Environment Banner */}
        {isDemoMode ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">🎮 Demo Mode Active</h3>
                  <p className="text-sm text-green-700">
                    Try all features without signing up • Data saved locally • Sample scenarios included
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View Dashboard →
              </button>
            </div>
          </div>
        ) : (
          <div className={`rounded-lg p-4 mb-8 border-2 ${
            process.env.NODE_ENV === 'development'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className={`w-6 h-6 ${
                    process.env.NODE_ENV === 'development' ? 'text-blue-600' : 'text-purple-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    process.env.NODE_ENV === 'development' ? 'text-blue-800' : 'text-purple-800'
                  }`}>
                    {process.env.NODE_ENV === 'development' ? '🔧 Development Environment' : '🚀 Production Environment'}
                  </h3>
                  <p className={`text-sm ${
                    process.env.NODE_ENV === 'development' ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    {process.env.NODE_ENV === 'development'
                      ? 'Development build • Debug mode enabled • Local database'
                      : 'Production build • Optimized performance • Live database'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className={`font-medium text-sm hover:opacity-80 ${
                  process.env.NODE_ENV === 'development' ? 'text-blue-600' : 'text-purple-600'
                }`}
              >
                View Dashboard →
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
        {(error || validationErrors.length > 0) && (
          <div className="mb-8">
            {validationErrors.length > 0 ? (
              <ValidationErrorDisplay 
                errors={validationErrors} 
                showFieldNames={true}
              />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            ) : null}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
            <button
              onClick={() => setLiveMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                liveMode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Mode (Two-Column)
            </button>
            <button
              onClick={() => setLiveMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                !liveMode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Traditional Mode
            </button>
          </div>
        </div>

        {/* Main Content */}
        {liveMode ? (
          // Live Mode - Two Column Layout
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div>
              <LiveCalculatorForm
                onCalculate={handleLiveCalculation}
                onClear={() => setResults(null)}
                initialData={initialData}
                validationErrors={validationErrors}
              />
            </div>

            {/* Right Column - Live Results */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <LiveResultsPanel
                results={results}
                loading={liveLoading}
                error={liveError}
                currentFormData={currentFormData}
              />
              
              {/* Save Button */}
              {results && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSaveScenario}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    Save This Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Traditional Mode
          !results ? (
            <FastCalculatorForm
              onSubmit={handleCalculation}
              loading={loading}
              initialData={initialData}
              validationErrors={validationErrors}
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
                  inputs={currentFormData || undefined}
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
          )
        )}

        {/* Save Scenario Modal */}
        <SaveScenarioModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveConfirm}
          isLoading={isSaving}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <Disclaimer />
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} HELOC Accelerator. All rights reserved.</p>
          <p className="mt-2">
            <a href="/terms" className="hover:text-gray-700 underline">Terms of Service</a>
            <span className="mx-2">•</span>
            <a href="/privacy" className="hover:text-gray-700 underline">Privacy Policy</a>
            <span className="mx-2">•</span>
            <a href="/contact" className="hover:text-gray-700 underline">Contact Us</a>
          </p>
        </div>
      </footer>

      {/* Debug Panel */}
      <DebugPanel
        isVisible={showDebugPanel}
        onToggle={() => setShowDebugPanel(!showDebugPanel)}
      />
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