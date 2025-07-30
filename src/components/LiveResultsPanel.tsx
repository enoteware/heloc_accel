'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConfetti } from '@/hooks/useConfetti'
import { renderToString } from 'react-dom/server'
import PrintableReport from './PrintableReport'
import { printReportInNewWindow } from '@/lib/print-utils'
import InputSummary from './InputSummary'
import type { CalculatorValidationInput } from '@/lib/validation'
import { useCompany } from '@/contexts/CompanyContext'
import { useTranslations } from 'next-intl'

interface LiveResultsPanelProps {
  results: any | null
  loading?: boolean
  error?: string | null
  currentFormData?: CalculatorValidationInput | null
}

export default function LiveResultsPanel({ results, loading = false, error = null, currentFormData = null }: LiveResultsPanelProps) {
  const t = useTranslations('calculator')
  const { triggerConfetti } = useConfetti()
  const { companySettings, assignedAgent } = useCompany()
  const previousResultsRef = useRef<any>(null)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value))
  }

  // Trigger confetti when positive results are achieved
  useEffect(() => {
    console.log('Confetti useEffect - results:', results, 'loading:', loading, 'previous:', previousResultsRef.current)
    
    if (results && !loading) {
      const savingsAmount = results.comparison?.interestSaved || 0
      const timeSaved = results.comparison?.timeSavedYears || 0
      
      console.log('Savings amount:', savingsAmount, 'Time saved:', timeSaved)
      
      // Check if this is a new calculation (not the same results)
      const isNewCalculation = !previousResultsRef.current || 
        previousResultsRef.current.comparison?.interestSaved !== savingsAmount
      
      if (isNewCalculation && (savingsAmount > 0 || timeSaved > 0)) {
        console.log('Triggering confetti!')
        // Small delay to let the results render first
        setTimeout(() => {
          if (savingsAmount > 50000) {
            // Huge savings - celebration confetti
            triggerConfetti({ type: 'celebration' })
          } else if (savingsAmount > 25000) {
            // Great savings - savings confetti
            triggerConfetti({ type: 'savings' })
          } else {
            // Any positive savings - success confetti
            triggerConfetti({ type: 'success' })
          }
        }, 300)
      }
      
      previousResultsRef.current = results
    }
  }, [results, loading, triggerConfetti])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!results && !loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noResultsYet')}</h3>
        <p className="text-gray-600">{t('enterMortgageDetails')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Savings Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200"
      >
        <h3 className="text-lg font-semibold text-green-900 mb-4">Potential Savings with HELOC</h3>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="animate-pulse">
                <div className="h-8 bg-green-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-green-200 rounded w-1/2"></div>
              </div>
            </motion.div>
          ) : results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(results.comparison.interestSaved)}
                </p>
                <p className="text-sm text-green-600">Total Interest Saved</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xl font-semibold text-green-700">
                    {results.comparison.timeSavedYears.toFixed(1)} years
                  </p>
                  <p className="text-xs text-green-600">Time Saved</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-green-700">
                    {results.comparison.percentageInterestSaved.toFixed(0)}%
                  </p>
                  <p className="text-xs text-green-600">Interest Reduction</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Traditional vs HELOC Comparison */}
      <div className="grid grid-cols-1 gap-4">
        {/* Traditional Mortgage Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg p-5 shadow-md border border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-600 mb-3">Traditional Mortgage</h4>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payoff Time</span>
                  <span className="font-semibold text-gray-900">{(results.traditional.payoffMonths / 12).toFixed(1)} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Interest</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(results.traditional.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Monthly Payment</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(results.traditional.monthlyPayment)}</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* HELOC Strategy Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 shadow-md border border-blue-200"
        >
          <h4 className="text-sm font-medium text-blue-700 mb-3">HELOC Strategy</h4>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                </div>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Payoff Time</span>
                  <span className="font-semibold text-blue-700">{(results.heloc.payoffMonths / 12).toFixed(1)} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Total Interest</span>
                  <span className="font-semibold text-blue-700">{formatCurrency(results.heloc.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Max HELOC Used</span>
                  <span className="font-semibold text-blue-700">{formatCurrency(results.heloc.maxHelocUsed)}</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Quick Stats */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">
                Pay off mortgage <span className="font-semibold text-green-600">{results.comparison.timeSavedYears.toFixed(1)} years faster</span>
              </span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">
                Save <span className="font-semibold text-green-600">{formatCurrency(results.comparison.interestSaved)}</span> in interest
              </span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">
                Using <span className="font-semibold">{formatCurrency(results.heloc.maxHelocUsed)}</span> of HELOC limit
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Download PDF Report Button */}
      {results && currentFormData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6"
        >
          <button
            onClick={() => {
              // Render the report component to HTML string
              const reportHTML = renderToString(
                <PrintableReport 
                  results={results} 
                  inputs={currentFormData} 
                  companySettings={companySettings}
                  assignedAgent={assignedAgent}
                />
              )
              
              // Use the utility function to print in a new window
              printReportInNewWindow(
                reportHTML,
                currentFormData.scenarioName 
                  ? `HELOC Report - ${currentFormData.scenarioName}` 
                  : 'HELOC Report'
              )
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF Report</span>
          </button>
        </motion.div>
      )}

      {/* Input Summary - Now below the PDF button */}
      {currentFormData && (
        <InputSummary formData={currentFormData} />
      )}
    </div>
  )
}