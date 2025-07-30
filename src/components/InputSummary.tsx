'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CalculatorValidationInput } from '@/lib/validation'

interface InputSummaryProps {
  formData: CalculatorValidationInput | null
  className?: string
  timestamp?: string
}

export default function InputSummary({ formData, className = '', timestamp }: InputSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (!formData) return null

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === 0) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === 0) return '-'
    return `${value.toFixed(2)}%`
  }

  const formatMonths = (value: number | undefined) => {
    if (value === undefined || value === 0) return '-'
    const years = Math.floor(value / 12)
    const months = value % 12
    if (years === 0) return `${months} mo`
    if (months === 0) return `${years} yr`
    return `${years} yr ${months} mo`
  }

  const copyToClipboard = async () => {
    const summaryText = `Input Summary${timestamp ? ` (as of ${new Date(timestamp).toLocaleTimeString()})` : ''}

Mortgage Details:
- Current Balance: ${formatCurrency(formData.currentMortgageBalance)}
- Interest Rate: ${formatPercent(formData.currentInterestRate)}
- Remaining Term: ${formatMonths(formData.remainingTermMonths)}
- Monthly Payment: ${formatCurrency(formData.monthlyPayment)}

${formData.propertyValue ? `Property Information:
- Property Value: ${formatCurrency(formData.propertyValue)}
- Loan-to-Value: ${formData.currentMortgageBalance && formData.propertyValue ? ((formData.currentMortgageBalance / formData.propertyValue) * 100).toFixed(1) + '%' : '-'}
${formData.propertyTaxMonthly ? `- Property Tax: ${formatCurrency(formData.propertyTaxMonthly)}/mo` : ''}
${formData.insuranceMonthly ? `- Insurance: ${formatCurrency(formData.insuranceMonthly)}/mo` : ''}
${formData.hoaFeesMonthly ? `- HOA Fees: ${formatCurrency(formData.hoaFeesMonthly)}/mo` : ''}
${formData.pmiMonthly ? `- MIP/PMI: ${formatCurrency(formData.pmiMonthly)}/mo` : ''}
` : ''}

HELOC Details:
- Credit Limit: ${formatCurrency(formData.helocLimit)}
- Interest Rate: ${formatPercent(formData.helocInterestRate)}
${formData.helocAvailableCredit !== undefined ? `- Available Credit: ${formatCurrency(formData.helocAvailableCredit)}` : ''}

Income & Expenses:
- Gross Income: ${formatCurrency(formData.monthlyGrossIncome)}/mo
- Net Income: ${formatCurrency(formData.monthlyNetIncome)}/mo
- Monthly Expenses: ${formatCurrency(formData.monthlyExpenses)}/mo
- Discretionary Income: ${formatCurrency(formData.monthlyDiscretionaryIncome)}/mo

${formData.scenarioName ? `Scenario: ${formData.scenarioName}` : ''}
${formData.description ? formData.description : ''}`

    try {
      await navigator.clipboard.writeText(summaryText)
      
      // Visual feedback
      const button = document.getElementById('copy-summary-btn')
      if (button) {
        const originalText = button.textContent
        button.textContent = '✓ Copied!'
        button.classList.add('bg-green-50', 'text-green-600')
        
        setTimeout(() => {
          button.textContent = originalText || 'Copy Summary'
          button.classList.remove('bg-green-50', 'text-green-600')
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
    >
      <div className="p-5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Input Summary
          </h3>
          {timestamp && (
            <span className="text-xs text-gray-500 ml-2">as of {new Date(timestamp).toLocaleTimeString()}</span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
          {/* Mortgage Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
              Mortgage Details
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Balance</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.currentMortgageBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interest Rate</span>
                <span className="text-sm font-medium text-gray-900">{formatPercent(formData.currentInterestRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining Term</span>
                <span className="text-sm font-medium text-gray-900">{formatMonths(formData.remainingTermMonths)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Payment</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.monthlyPayment)}</span>
              </div>
            </div>
          </div>

          {/* Property Information */}
          {(formData.propertyValue || formData.propertyTaxMonthly || formData.insuranceMonthly || formData.hoaFeesMonthly || formData.pmiMonthly) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                Property Information
              </h4>
              <div className="space-y-1.5">
                {formData.propertyValue && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Property Value</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.propertyValue)}</span>
                  </div>
                )}
                {formData.propertyValue && formData.currentMortgageBalance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Loan-to-Value</span>
                    <span className="text-sm font-medium text-gray-900">
                      {((formData.currentMortgageBalance / formData.propertyValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {formData.propertyTaxMonthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Property Tax</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.propertyTaxMonthly)}/mo</span>
                  </div>
                )}
                {formData.insuranceMonthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Insurance</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.insuranceMonthly)}/mo</span>
                  </div>
                )}
                {formData.hoaFeesMonthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HOA Fees</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.hoaFeesMonthly)}/mo</span>
                  </div>
                )}
                {formData.pmiMonthly && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">MIP/PMI</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.pmiMonthly)}/mo</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HELOC Details */}
          {(formData.helocLimit || formData.helocInterestRate) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                HELOC Details
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Credit Limit</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.helocLimit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="text-sm font-medium text-gray-900">{formatPercent(formData.helocInterestRate)}</span>
                </div>
                {formData.helocAvailableCredit !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Credit</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.helocAvailableCredit)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Income & Expenses */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
              Income & Expenses
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Income</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.monthlyGrossIncome)}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Income</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.monthlyNetIncome)}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Expenses</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.monthlyExpenses)}/mo</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Discretionary Income</span>
                <span className="text-sm font-bold text-blue-600">{formatCurrency(formData.monthlyDiscretionaryIncome)}/mo</span>
              </div>
            </div>
          </div>

          {/* Scenario Info */}
          {formData.scenarioName && (
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Scenario: </span>
                <span className="text-gray-900">{formData.scenarioName}</span>
              </div>
              {formData.description && (
                <p className="text-xs text-gray-600 mt-1">{formData.description}</p>
              )}
            </div>
          )}
          
          {/* Copy Button */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <button
              id="copy-summary-btn"
              onClick={copyToClipboard}
              className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Summary
            </button>
          </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}