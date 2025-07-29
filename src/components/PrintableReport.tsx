'use client'

import React from 'react'
import type { CalculatorValidationInput } from '@/lib/validation'

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

interface PrintableReportProps {
  results: CalculationResults
  inputs: CalculatorValidationInput
  generatedDate?: Date
}

export default function PrintableReport({ results, inputs, generatedDate = new Date() }: PrintableReportProps) {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
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

  // Calculate monthly HELOC payment info
  const activeMonths = results.heloc.schedule.filter(m => m.helocBalance > 0)
  const avgHelocInterest = activeMonths.length > 0 
    ? activeMonths.reduce((sum, m) => sum + m.helocInterest, 0) / activeMonths.length
    : 0

  return (
    <div className="printable-report bg-white p-8 max-w-[8.5in] mx-auto">
      {/* Header */}
      <header className="mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">HELOC Acceleration Strategy Report</h1>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Generated: {formatDate(generatedDate)}</span>
          {inputs.scenarioName && <span className="font-medium">{inputs.scenarioName}</span>}
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-300">
        <h2 className="text-lg font-bold text-blue-900 mb-3">Executive Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{results.comparison.timeSavedYears}</div>
            <div className="text-xs text-gray-700">Years Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{formatCurrency(results.comparison.interestSaved)}</div>
            <div className="text-xs text-gray-700">Interest Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{formatPercentage(results.comparison.percentageInterestSaved)}</div>
            <div className="text-xs text-gray-700">Interest Reduction</div>
          </div>
        </div>
      </section>

      {/* Property & Loan Details */}
      <section className="mb-6 grid grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Property & Mortgage Details</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Property Value:</span>
              <span className="font-medium">{formatCurrency(inputs.propertyValue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Balance:</span>
              <span className="font-medium">{formatCurrency(inputs.currentMortgageBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium">{formatPercentage(inputs.currentInterestRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-medium">{formatCurrency(inputs.monthlyPayment)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Financial Capacity</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Net Income:</span>
              <span className="font-medium">{formatCurrency(inputs.monthlyNetIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Expenses:</span>
              <span className="font-medium">{formatCurrency(inputs.monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discretionary Income:</span>
              <span className="font-medium text-green-700">{formatCurrency(inputs.monthlyDiscretionaryIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">HELOC Limit:</span>
              <span className="font-medium">{formatCurrency(inputs.helocLimit || 0)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Comparison */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Strategy Comparison</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              Traditional Mortgage
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payoff Time:</span>
                <span className="font-medium">{formatMonths(results.traditional.payoffMonths)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium">{formatCurrency(results.traditional.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-medium">{formatCurrency(results.traditional.totalPayments)}</span>
              </div>
            </div>
          </div>

          <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              HELOC Acceleration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payoff Time:</span>
                <span className="font-semibold text-green-700">{formatMonths(results.heloc.payoffMonths)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-semibold text-green-700">{formatCurrency(results.heloc.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max HELOC Used:</span>
                <span className="font-medium">{formatCurrency(results.heloc.maxHelocUsed)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Recommendations */}
      <section className="mb-6 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-300">
        <h2 className="text-lg font-bold text-green-900 mb-3">Implementation Strategy</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Monthly Payment Plan</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-gray-700">Continue Mortgage Payment:</span>
                <span className="font-medium">{formatCurrency(inputs.monthlyPayment)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-700">Avg. HELOC Interest:</span>
                <span className="font-medium">{formatCurrency(avgHelocInterest)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-700">Apply Discretionary Income:</span>
                <span className="font-medium text-green-700">{formatCurrency(inputs.monthlyDiscretionaryIncome)}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Key Milestones</h4>
            <ul className="space-y-1 text-xs">
              <li className="text-gray-700">• Begin HELOC draws in Month 1</li>
              <li className="text-gray-700">• Peak HELOC: {formatCurrency(results.heloc.maxHelocUsed)}</li>
              <li className="text-gray-700">• Full payoff in {formatMonths(results.heloc.payoffMonths)}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visual Timeline */}
      <section className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">Payoff Timeline Comparison</h3>
        <div className="relative h-16 bg-gray-100 rounded-lg p-2">
          {/* Traditional timeline */}
          <div className="absolute top-2 left-2 right-2 h-5 bg-gray-300 rounded-full">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium pr-2">
              {results.traditional.payoffMonths} mo
            </div>
          </div>
          {/* HELOC timeline */}
          <div 
            className="absolute bottom-2 left-2 h-5 bg-green-500 rounded-full"
            style={{ width: `${(results.heloc.payoffMonths / results.traditional.payoffMonths) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium pr-2 text-white">
              {results.heloc.payoffMonths} mo
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
        <p className="font-semibold mb-1">Important Disclaimer:</p>
        <p>
          This report is for educational purposes only and should not be considered financial advice. 
          The HELOC acceleration strategy involves risks including variable interest rates and requires 
          disciplined financial management. Consult with a qualified financial advisor before implementing 
          any mortgage acceleration strategy.
        </p>
      </footer>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .printable-report {
            margin: 0;
            padding: 0.5in;
            font-size: 11pt;
            color: black !important;
            background: white !important;
          }

          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: letter;
            margin: 0.5in;
          }

          body {
            margin: 0;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}