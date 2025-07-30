'use client'

import React, { useState } from 'react'
import PrintableReport from './PrintableReport'
import { printReportInNewWindow } from '@/lib/print-utils'
import { renderToString } from 'react-dom/server'
import type { CalculatorValidationInput } from '@/lib/validation'
import { Icon } from '@/components/Icons'
import { useConfetti } from '@/hooks/useConfetti'
import InputSummary from './InputSummary'
import { useCompany } from '@/contexts/CompanyContext'

interface CalculationResults {
  traditional: {
    payoffMonths: number
    totalInterest: number
    monthlyPayment: number
    totalPayments: number
  }
  heloc: {
    payoffMonths: number
    totalInterest: number
    totalMortgageInterest: number
    totalHelocInterest: number
    maxHelocUsed: number
    averageHelocBalance: number
    schedule: Array<{
      month: number
      helocPayment: number
      helocBalance: number
      helocInterest: number
      discretionaryUsed: number
      pmiPayment?: number
      totalMonthlyPayment: number
    }>
  }
  comparison: {
    timeSavedMonths: number
    timeSavedYears: number
    interestSaved: number
    percentageInterestSaved: number
    monthlyPaymentDifference: number
  }
}

interface ResultsDisplayProps {
  results: CalculationResults
  inputs?: CalculatorValidationInput
  onSaveScenario?: () => void
  onNewCalculation?: () => void
}

export default function ResultsDisplay({ results, inputs, onSaveScenario, onNewCalculation }: ResultsDisplayProps) {
  const { triggerConfetti } = useConfetti()
  const { companySettings, assignedAgent } = useCompany()
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) {
      return `${months} months`
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="space-y-8">
      {/* Input Summary - Only on larger screens */}
      {inputs && (
        <div className="hidden lg:block">
          <InputSummary formData={inputs} className="max-w-2xl mx-auto" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Saved Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Time Saved</p>
              <p className="text-2xl font-bold text-green-900">
                {results.comparison.timeSavedYears} years
              </p>
              <p className="text-sm text-green-700">
                ({results.comparison.timeSavedMonths} months)
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <Icon name="calendar" size="lg" className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Interest Saved Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Interest Saved</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(results.comparison.interestSaved)}
              </p>
              <p className="text-sm text-blue-700">
                {formatPercentage(results.comparison.percentageInterestSaved)} savings
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Icon name="dollar" size="lg" className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Max HELOC Used Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Max HELOC Used</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(results.heloc.maxHelocUsed)}
              </p>
              <p className="text-sm text-purple-700">
                Peak utilization
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Icon name="bar-chart" size="lg" className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Strategy Comparison</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Traditional Strategy */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Icon name="home" size="sm" className="text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Traditional Mortgage</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payoff Time:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatMonths(results.traditional.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Payment:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.traditional.monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interest:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.traditional.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Payments:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.traditional.totalPayments)}
                </span>
              </div>
            </div>
          </div>

          {/* HELOC Strategy */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Icon name="trending-up" size="sm" className="text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">HELOC Acceleration</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payoff Time:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatMonths(results.heloc.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Interest:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(results.heloc.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mortgage Interest:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.heloc.totalMortgageInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">HELOC Interest:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.heloc.totalHelocInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg HELOC Balance:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.heloc.averageHelocBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly HELOC Payment Strategy */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <Icon name="trending-up" size="sm" className="text-blue-600 mr-2" />
            Monthly HELOC Payment Strategy
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Here&apos;s how your monthly HELOC payments will work
          </p>
        </div>

        <div className="p-6">
          {(() => {
            // Find key months for HELOC payment timing
            const helocSchedule = results.heloc.schedule || []
            const firstHelocDrawMonth = helocSchedule.find(m => m.helocBalance > 0)
            const maxHelocMonth = helocSchedule.reduce((max, current) => 
              current.helocBalance > max.helocBalance ? current : max, 
              helocSchedule[0] || { month: 1, helocBalance: 0, helocPayment: 0, helocInterest: 0, discretionaryUsed: 0, totalMonthlyPayment: 0 }
            )
            const firstPaydownMonth = helocSchedule.find(m => m.helocPayment > 0)
            
            // Calculate average payments
            const activeMonths = helocSchedule.filter(m => m.helocBalance > 0)
            const avgHelocInterest = activeMonths.length > 0 
              ? activeMonths.reduce((sum, m) => sum + m.helocInterest, 0) / activeMonths.length
              : 0
            const avgDiscretionaryUsed = helocSchedule.length > 0
              ? helocSchedule.reduce((sum, m) => sum + m.discretionaryUsed, 0) / helocSchedule.length
              : 0

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="safe-badge-info text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        STEP 1
                      </span>
                      Initial HELOC Draw
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Month {firstHelocDrawMonth?.month || 1}:</strong> Start using HELOC to accelerate mortgage payoff
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Initial draw amount:</span>
                          <span className="font-medium text-blue-900">
                            {formatCurrency(firstHelocDrawMonth?.helocBalance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Monthly discretionary income:</span>
                          <span className="font-medium text-blue-900">
                            {formatCurrency(avgDiscretionaryUsed)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="safe-badge-success text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        STEP 2
                      </span>
                      Monthly HELOC Payments
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Average monthly HELOC interest:</span>
                          <span className="font-medium text-green-900">
                            {formatCurrency(avgHelocInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Discretionary income for paydown:</span>
                          <span className="font-medium text-green-900">
                            {formatCurrency(avgDiscretionaryUsed)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-green-200 pt-2">
                          <span className="text-green-700 font-medium">Net monthly HELOC reduction:</span>
                          <span className="font-semibold text-green-900">
                            {formatCurrency(Math.max(0, avgDiscretionaryUsed - avgHelocInterest))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        TIMING
                      </span>
                      Key Milestones
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Peak HELOC Usage</p>
                          <p className="text-xs text-gray-600">Month {maxHelocMonth.month}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-purple-900">
                            {formatCurrency(maxHelocMonth.helocBalance)}
                          </p>
                        </div>
                      </div>
                      
                      {firstPaydownMonth && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">First HELOC Paydown</p>
                            <p className="text-xs text-gray-600">Month {firstPaydownMonth.month}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-900">
                              -{formatCurrency(firstPaydownMonth.helocPayment)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Full Payoff</p>
                          <p className="text-xs text-gray-600">Month {results.heloc.payoffMonths}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-900">
                            🎉 Debt Free!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                      <Icon name="info" size="xs" className="text-orange-600 mr-1" />
                      Payment Strategy Tip
                    </h5>
                    <p className="text-xs text-orange-700">
                      Use your discretionary income each month to pay down the HELOC balance. 
                      This reduces interest charges and accelerates your path to being debt-free. 
                      The key is consistency - treat the HELOC payment like any other monthly bill.
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onSaveScenario && (
          <button
            onClick={onSaveScenario}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="save" size="sm" />
            <span>Save Scenario</span>
          </button>
        )}

        <button
          onClick={() => {
            if (inputs) {
              // Render the report component to HTML string
              const reportHTML = renderToString(
                <PrintableReport 
                  results={results} 
                  inputs={inputs} 
                  companySettings={companySettings}
                  assignedAgent={assignedAgent}
                />
              )
              
              // Use the utility function to print in a new window
              printReportInNewWindow(reportHTML, inputs.scenarioName ? `HELOC Report - ${inputs.scenarioName}` : 'HELOC Report')
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <Icon name="print" size="sm" />
          <span>Print Report</span>
        </button>

        {onNewCalculation && (
          <button
            onClick={onNewCalculation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="calculator" size="sm" />
            <span>New Calculation</span>
          </button>
        )}

        <button
          onClick={() => triggerConfetti({ type: 'celebration' })}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>🎉</span>
          <span>Celebrate Savings!</span>
        </button>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="info" size="sm" className="text-blue-600 mr-2" />
          Key Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Strategy Effectiveness:</span> The HELOC acceleration strategy could save you{' '}
              <span className="font-semibold text-green-600">
                {formatCurrency(results.comparison.interestSaved)}
              </span>{' '}
              in interest payments.
            </p>

            <p className="text-gray-700">
              <span className="font-medium">Time Savings:</span> You could pay off your mortgage{' '}
              <span className="font-semibold text-green-600">
                {results.comparison.timeSavedYears} years earlier
              </span>{' '}
              using this strategy.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">HELOC Utilization:</span> The strategy requires a maximum HELOC balance of{' '}
              <span className="font-semibold text-purple-600">
                {formatCurrency(results.heloc.maxHelocUsed)}
              </span>.
            </p>

            <p className="text-gray-700">
              <span className="font-medium">Interest Reduction:</span> This represents a{' '}
              <span className="font-semibold text-blue-600">
                {formatPercentage(results.comparison.percentageInterestSaved)}
              </span>{' '}
              reduction in total interest paid.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon name="alert" size="sm" className="text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Disclaimer</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This calculation is for educational purposes only and should not be considered financial advice.
                The HELOC acceleration strategy involves risks including variable interest rates, potential loss of home equity,
                and requires disciplined financial management. Please consult with a qualified financial advisor before
                implementing any mortgage acceleration strategy.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}