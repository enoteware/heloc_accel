'use client'

import React from 'react'

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
  onSaveScenario?: () => void
  onNewCalculation?: () => void
}

export default function ResultsDisplay({ results, onSaveScenario, onNewCalculation }: ResultsDisplayProps) {
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
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
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
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
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
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
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
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
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
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
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
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
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
                      <svg className="w-4 h-4 text-orange-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Save Scenario</span>
          </button>
        )}

        {onNewCalculation && (
          <button
            onClick={onNewCalculation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>New Calculation</span>
          </button>
        )}
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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