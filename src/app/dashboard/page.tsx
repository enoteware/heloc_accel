'use client'

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getDemoScenarios, deleteDemoScenario, updateDemoScenario, generateSampleScenarios, clearDemoScenarios, getStorageInfo } from '@/lib/demo-storage'
import { FirstConfirmationModal, SecondConfirmationModal, SuccessModal } from '@/components/ConfirmationModals'
import { Modal, ModalBody, ModalFooter } from '../../components/design-system/Modal'
import { Button } from '../../components/design-system/Button'

// Lazy load heavy components
const PayoffChart = lazy(() => import('@/components/PayoffChart'))

interface Scenario {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  traditional_payoff_months?: number
  heloc_payoff_months?: number
  interest_saved?: number
  is_public?: boolean
  public_share_token?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [sharingLoading, setSharingLoading] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])

  // Demo data clearing modal states
  const [showFirstConfirmation, setShowFirstConfirmation] = useState(false)
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [clearingData, setClearingData] = useState(false)

  // Individual scenario deletion modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
  const [deletingScenario, setDeletingScenario] = useState(false)

  // Storage availability state
  const [storageInfo, setStorageInfo] = useState<{ used: number; available: boolean; error?: string } | null>(null)

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Get user ID for demo storage (use session user email hash or fallback to demo user)
  const getUserId = useCallback(() => {
    if (isDemoMode) {
      if (session?.user?.email) {
        // Create consistent user ID from email
        const emailHash = session.user.email.toLowerCase().replace(/[^a-z0-9]/g, '')
        return `demo-user-${emailHash.slice(0, 8)}`
      }
      return 'demo-user-default'
    }
    return session?.user?.id || session?.user?.email
  }, [isDemoMode, session?.user?.email, session?.user?.id])

  // Initialize demo data if in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const userId = getUserId()
      // Check storage availability
      const info = getStorageInfo(userId || 'demo-user-default')
      setStorageInfo(info)

      if (info.available) {
        generateSampleScenarios(userId || 'demo-user-default')
        loadScenarios()
      } else {
        setError(info.error || 'localStorage is not available')
      }
    }
  }, [isDemoMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to login if not authenticated (unless in demo mode)
  useEffect(() => {
    if (isDemoMode) return // Skip auth check in demo mode
    if (status === 'loading') return
    if (!session) {
      router.push('/login?callbackUrl=/dashboard')
    }
  }, [session, status, router, isDemoMode])

  const loadScenarios = useCallback(async () => {
    try {
      setLoading(true)

      if (isDemoMode) {
        // Load from localStorage in demo mode
        const userId = getUserId()
        const demoScenarios = getDemoScenarios(userId || 'demo-user-default')
        // Convert demo scenarios to dashboard format
        const formattedScenarios = demoScenarios.map(scenario => ({
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          created_at: scenario.createdAt,
          updated_at: scenario.updatedAt,
          traditional_payoff_months: scenario.traditionalPayoffMonths,
          heloc_payoff_months: scenario.helocPayoffMonths,
          interest_saved: scenario.interestSaved,
          is_public: scenario.isPublic,
          public_share_token: scenario.publicShareToken
        }))
        setScenarios(formattedScenarios)
      } else {
        // Load from API in normal mode
        const response = await fetch('/api/scenario', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

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
  }, [isDemoMode, getUserId])

  // Load user scenarios
  useEffect(() => {
    if (isDemoMode || session) {
      loadScenarios()
    }
  }, [session, isDemoMode, loadScenarios])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }
  }

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarioToDelete(scenarioId)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteConfirmationProceed = async () => {
    if (!scenarioToDelete) return

    try {
      setDeletingScenario(true)

      if (isDemoMode) {
        // Delete from localStorage in demo mode
        const userId = getUserId()
        const success = deleteDemoScenario(scenarioToDelete, userId || 'demo-user-default')
        if (!success) {
          throw new Error('Scenario not found')
        }
      } else {
        // Delete via API in normal mode
        const response = await fetch(`/heloc/api/scenario/${scenarioToDelete}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete scenario')
        }
      }

      // Remove from local state
      setScenarios(prev => prev.filter(s => s.id !== scenarioToDelete))

      // Close modal and reset state
      setShowDeleteConfirmation(false)
      setScenarioToDelete(null)
    } catch (err) {
      console.error('Error deleting scenario:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scenario'
      setError(errorMessage)

      // Close the modal on error
      setShowDeleteConfirmation(false)
      setScenarioToDelete(null)
    } finally {
      setDeletingScenario(false)
    }
  }

  const handleDeleteConfirmationCancel = () => {
    setShowDeleteConfirmation(false)
    setScenarioToDelete(null)
  }

  const handleEditScenario = (scenarioId: string) => {
    // Navigate to calculator with scenario data pre-filled
    router.push(`/calculator?edit=${scenarioId}`)
  }

  const handleDuplicateScenario = async (scenario: Scenario) => {
    // Navigate to calculator with scenario data pre-filled but no ID (for new scenario)
    const params = new URLSearchParams({
      duplicate: scenario.id,
      name: `${scenario.name} (Copy)`
    })
    router.push(`/calculator?${params.toString()}`)
  }

  const handleShareScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario)

    // Check if already shared
    if (scenario.is_public && scenario.public_share_token) {
      const url = `${window.location.origin}/shared/${scenario.public_share_token}`
      setShareUrl(url)
      setShareModalOpen(true)
    } else {
      // Generate share link
      await toggleScenarioSharing(scenario.id, true)
    }
  }

  const toggleScenarioSharing = async (scenarioId: string, enable: boolean) => {
    try {
      setSharingLoading(true)
      const response = await fetch(`/heloc/api/scenario/${scenarioId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enable })
      })

      if (!response.ok) {
        throw new Error('Failed to update sharing settings')
      }

      const data = await response.json()
      if (data.success) {
        if (enable && data.data.shareUrl) {
          setShareUrl(data.data.shareUrl)
          setShareModalOpen(true)
        }

        // Update local state
        setScenarios(prev => prev.map(s =>
          s.id === scenarioId
            ? { ...s, is_public: data.data.isPublic, public_share_token: data.data.shareToken }
            : s
        ))
      } else {
        throw new Error(data.error || 'Failed to update sharing settings')
      }
    } catch (err) {
      console.error('Error updating sharing:', err)
      setError('Failed to update sharing settings')
    } finally {
      setSharingLoading(false)
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // You could add a toast notification here
      alert('Share link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Share link copied to clipboard!')
    }
  }

  const handleComparisonToggle = (scenarioId: string) => {
    setSelectedForComparison(prev => {
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

  const goToComparison = () => {
    if (selectedForComparison.length >= 2) {
      const params = new URLSearchParams({
        scenarios: selectedForComparison.join(',')
      })
      router.push(`/compare?${params.toString()}`)
    }
  }

  // Clear all demo data handlers
  const handleClearAllDataClick = () => {
    setShowFirstConfirmation(true)
  }

  const handleFirstConfirmationProceed = () => {
    setShowFirstConfirmation(false)
    setShowSecondConfirmation(true)
  }

  const handleFirstConfirmationCancel = () => {
    setShowFirstConfirmation(false)
  }

  const handleSecondConfirmationProceed = async () => {
    try {
      setClearingData(true)

      // Clear all demo scenarios
      const userId = getUserId()
      clearDemoScenarios(userId || 'demo-user-default')

      // Update local state
      setScenarios([])
      setSelectedForComparison([])

      // Close second confirmation and show success
      setShowSecondConfirmation(false)
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Error clearing demo data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear demo data'
      setError(errorMessage)

      // Close the modal on error
      setShowSecondConfirmation(false)
    } finally {
      setClearingData(false)
    }
  }

  const handleSecondConfirmationCancel = () => {
    setShowSecondConfirmation(false)
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
  }

  const handleRegenerateSampleData = () => {
    const userId = getUserId()
    generateSampleScenarios(userId || 'demo-user-default')
    loadScenarios()
    setShowSuccessModal(false)
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

  if (!isDemoMode && !session && status !== 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Demo Mode Dashboard</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                  <div>
                    <p className="font-medium mb-1">✅ Features Available:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Save & manage scenarios locally</li>
                      <li>• Edit and delete scenarios</li>
                      <li>• Compare multiple scenarios</li>
                      <li>• Export and share results</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">💡 Demo Info:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Data persists in your browser</li>
                      <li>• Sample scenarios pre-loaded</li>
                      <li>• No account required</li>
                      <li>• Full calculator functionality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isDemoMode ? 'Demo Dashboard' : `Welcome back, ${session?.user?.name || 'User'}!`}
          </h1>
          <p className="text-gray-600">
            {isDemoMode
              ? 'Explore HELOC acceleration scenarios in demo mode. All data is stored locally in your browser.'
              : 'Manage your HELOC acceleration scenarios and track your mortgage payoff progress.'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scenarios</p>
                <p className="text-2xl font-bold text-gray-900">{scenarios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {scenarios.length > 0 ? formatCurrency(scenarios.reduce((sum, s) => sum + (s.interest_saved || 0), 0)) : '$0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-purple-600">
                  {scenarios.length > 0
                    ? `${Math.round(scenarios.reduce((sum, s) => sum + ((s.traditional_payoff_months || 0) - (s.heloc_payoff_months || 0)), 0) / 12)} years`
                    : '0 years'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Warning */}
        {isDemoMode && storageInfo && !storageInfo.available && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Storage Not Available</h3>
                <p className="text-sm text-red-700">
                  {storageInfo.error || 'Your browser does not support localStorage or it is disabled. Demo data cannot be saved between sessions.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Data Management Section */}
        {isDemoMode && storageInfo?.available && (
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Demo Data Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your demo scenarios and data stored in your browser
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Statistics */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Data Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stored Scenarios:</span>
                      <span className="text-sm font-medium text-gray-900">{scenarios.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage Used:</span>
                      <span className={`text-sm font-medium ${
                        storageInfo && storageInfo.used > 1024 * 1024 ? 'text-yellow-600' :
                        storageInfo && storageInfo.used > 2 * 1024 * 1024 ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        {storageInfo ? Math.round(storageInfo.used / 1024) : Math.round(JSON.stringify(scenarios).length / 1024)} KB
                        {storageInfo && storageInfo.used > 1024 * 1024 && (
                          <span className="ml-1 text-xs">⚠️</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {scenarios.length > 0
                          ? new Date(Math.max(...scenarios.map(s => new Date(s.updated_at).getTime()))).toLocaleDateString()
                          : 'No data'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Actions */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Data Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleClearAllDataClick}
                      className="w-full flex items-center justify-center px-4 py-3 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition duration-200 font-medium"
                      disabled={scenarios.length === 0}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All Demo Data
                    </button>

                    <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-yellow-800 mb-1">⚠️ Important:</p>
                          <ul className="space-y-1 text-yellow-700">
                            <li>• Clearing data will permanently delete all scenarios</li>
                            <li>• This action cannot be undone</li>
                            <li>• Data is only stored in your browser</li>
                            <li>• You can regenerate sample data after clearing</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Scenarios</h2>
                {selectedForComparison.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedForComparison.length} selected for comparison
                    </span>
                    {selectedForComparison.length >= 2 && (
                      <button
                        onClick={goToComparison}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition duration-200"
                      >
                        Compare
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedForComparison([])}
                      className="text-gray-400 hover:text-gray-600"
                      title="Clear selection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {scenarios.length >= 2 && (
                  <Link
                    href="/compare"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Compare Scenarios
                  </Link>
                )}
                <Link
                  href="/calculator"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Create New Scenario
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading scenarios...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadScenarios}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first HELOC acceleration scenario to get started.
                </p>
                <Link
                  href="/calculator"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition duration-200"
                >
                  Create Your First Scenario
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(scenario.id)}
                          onChange={() => handleComparisonToggle(scenario.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={!selectedForComparison.includes(scenario.id) && selectedForComparison.length >= 3}
                        />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {scenario.name}
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditScenario(scenario.id)}
                          className="text-gray-400 hover:text-blue-600 transition duration-200"
                          title="Edit scenario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDuplicateScenario(scenario)}
                          className="text-gray-400 hover:text-green-600 transition duration-200"
                          title="Duplicate scenario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(scenario.id)}
                          className="text-gray-400 hover:text-red-600 transition duration-200"
                          title="Delete scenario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {scenario.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {scenario.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {scenario.interest_saved && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Interest Saved:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(scenario.interest_saved)}
                          </span>
                        </div>
                      )}

                      {scenario.traditional_payoff_months && scenario.heloc_payoff_months && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time Saved:</span>
                          <span className="font-medium text-purple-600">
                            {Math.round((scenario.traditional_payoff_months - scenario.heloc_payoff_months) / 12)} years
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <span>Created: {formatDate(scenario.created_at)}</span>
                      <span>Updated: {formatDate(scenario.updated_at)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditScenario(scenario.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition duration-200"
                      >
                        View & Edit
                      </button>
                      <button
                        onClick={() => handleShareScenario(scenario)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
                        title="Share scenario"
                      >
                        {scenario.is_public ? 'Shared' : 'Share'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && selectedScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Scenario</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Share &quot;{selectedScenario.name}&quot; with others using this link:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={copyShareUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Anyone with this link can view your scenario data.
                    You can disable sharing at any time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  toggleScenarioSharing(selectedScenario.id, false)
                  setShareModalOpen(false)
                }}
                className="flex-1 safe-neutral-light hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition duration-200"
                disabled={sharingLoading}
              >
                Disable Sharing
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="flex-1 safe-info hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Scenario Delete Modal */}
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteConfirmationCancel}
        title="Delete Scenario"
        size="md"
        closeOnOverlayClick={false}
        closeOnEscape={true}
      >
        <ModalBody>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-body text-neutral-700 leading-relaxed">
                Are you sure you want to delete <strong>&quot;{scenarios.find(s => s.id === scenarioToDelete)?.name || 'this scenario'}&quot;</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleDeleteConfirmationCancel}
            disabled={deletingScenario}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirmationProceed}
            loading={deletingScenario}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Demo Data Clearing Modals */}
      <FirstConfirmationModal
        isOpen={showFirstConfirmation}
        onClose={handleFirstConfirmationCancel}
        onConfirm={handleFirstConfirmationProceed}
        title="⚠️ Clear All Demo Data"
        message="This will permanently delete all your saved scenarios and calculations. This action cannot be undone. Are you sure you want to continue?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />

      <SecondConfirmationModal
        isOpen={showSecondConfirmation}
        onClose={handleSecondConfirmationCancel}
        onConfirm={handleSecondConfirmationProceed}
        title="🚨 Final Confirmation"
        message="This will permanently delete all your demo data. This action cannot be undone."
        confirmationText="DELETE ALL DATA"
        placeholder="Type the confirmation text exactly as shown..."
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        loading={clearingData}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onRegenerateData={handleRegenerateSampleData}
        title="✅ Demo Data Cleared"
        message="All demo data has been successfully cleared from your browser. You can now start fresh or regenerate sample data to explore the application."
        showRegenerateOption={true}
        regenerateText="Generate Sample Data"
        closeText="Close"
      />
    </div>
  )
}