'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icons'
import { AnimatedCounter } from './HighlightComponents'

interface PaymentFlowDiagramProps {
  monthlyIncome: number
  monthlyExpenses: number
  discretionaryIncome: number
  mortgagePayment: number
  helocBalance: number
  extraPayment: number
  className?: string
}

export default function PaymentFlowDiagram({
  monthlyIncome,
  monthlyExpenses,
  discretionaryIncome,
  mortgagePayment,
  helocBalance,
  extraPayment,
  className
}: PaymentFlowDiagramProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={cn('bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="git-branch" size="sm" className="text-blue-600" />
        HELOC Payment Flow Strategy
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Income Flow */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              1
            </span>
            <h4 className="font-semibold text-gray-900">Monthly Cash Flow</h4>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(monthlyExpenses)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Discretionary</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(discretionaryIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-secondary-100 p-2 rounded-full">
              <Icon name="arrow-down" size="sm" className="text-secondary-600" />
            </div>
          </div>
        </div>

        {/* Step 2: HELOC Usage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-secondary-600 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              2
            </span>
            <h4 className="font-semibold text-gray-900">HELOC Acceleration</h4>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-secondary-200">
            <div className="space-y-3">
              <div className="text-center mb-2">
                <p className="text-xs text-gray-600 uppercase tracking-wide">HELOC Balance</p>
                <p className="text-2xl font-bold text-secondary-600">
                  <AnimatedCounter value={helocBalance} prefix="$" />
                </p>
              </div>
              
              <div className="bg-secondary-50 p-3 rounded text-center">
                <p className="text-xs text-secondary-700 mb-1">Extra Payment to Mortgage</p>
                <p className="text-lg font-bold text-secondary-900">
                  {formatCurrency(extraPayment)}
                </p>
              </div>
              
              <p className="text-xs text-gray-600 text-center">
                Discretionary income pays down HELOC monthly
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-green-100 p-2 rounded-full">
              <Icon name="arrow-down" size="sm" className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Step 3: Results */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-green-600 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              3
            </span>
            <h4 className="font-semibold text-gray-900">Accelerated Payoff</h4>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Regular Payment</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(mortgagePayment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Extra Principal</span>
                <span className="font-medium text-secondary-600">
                  +{formatCurrency(extraPayment)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Payment</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(mortgagePayment + extraPayment)}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-50 p-2 rounded text-center mt-3">
                <p className="text-xs font-semibold text-green-800">
                  🎯 Mortgage Paid Off Faster!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Summary */}
      <div className="mt-6 bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Income</span>
          <Icon name="arrow-right" size="xs" className="text-secondary-600" />
          <span className="font-medium text-secondary-600">HELOC</span>
          <Icon name="arrow-right" size="xs" className="text-secondary-600" />
          <span className="font-medium text-gray-700">Extra Principal</span>
          <Icon name="arrow-right" size="xs" className="text-green-600" />
          <span className="font-bold text-green-600">Early Payoff</span>
        </div>
      </div>
    </div>
  )
}