'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { CalculatorValidationInput } from '@/lib/validation'
import { useDebounce } from '@/hooks/useDebounce'
import { Home, CreditCard, DollarSign, Building } from 'lucide-react'

interface LiveCalculatorFormProps {
  onCalculate: (data: CalculatorValidationInput) => void
  onClear?: () => void
  initialData?: Partial<CalculatorValidationInput>
}

export default function LiveCalculatorForm({ onCalculate, onClear, initialData = {} }: LiveCalculatorFormProps) {
  const [useYearsInput, setUseYearsInput] = useState(true)
  const [formData, setFormData] = useState<CalculatorValidationInput>({
    currentMortgageBalance: initialData.currentMortgageBalance || 0,
    currentInterestRate: initialData.currentInterestRate || 0,
    remainingTermMonths: initialData.remainingTermMonths || 0,
    monthlyPayment: initialData.monthlyPayment || 0,
    propertyValue: initialData.propertyValue,
    propertyTaxMonthly: initialData.propertyTaxMonthly,
    insuranceMonthly: initialData.insuranceMonthly,
    hoaFeesMonthly: initialData.hoaFeesMonthly,
    pmiMonthly: initialData.pmiMonthly,
    helocLimit: initialData.helocLimit || 0,
    helocInterestRate: initialData.helocInterestRate || 0,
    helocAvailableCredit: initialData.helocAvailableCredit,
    monthlyGrossIncome: initialData.monthlyGrossIncome || 0,
    monthlyNetIncome: initialData.monthlyNetIncome || 0,
    monthlyExpenses: initialData.monthlyExpenses || 0,
    monthlyDiscretionaryIncome: initialData.monthlyDiscretionaryIncome || 0,
    scenarioName: initialData.scenarioName,
    description: initialData.description
  })

  // Debounce the form data to avoid too many calculations
  const debouncedFormData = useDebounce(formData, 500)

  // Trigger calculation when debounced data changes
  useEffect(() => {
    // Only calculate if we have minimum required fields
    if (
      debouncedFormData.currentMortgageBalance > 0 &&
      debouncedFormData.currentInterestRate > 0 &&
      debouncedFormData.remainingTermMonths > 0 &&
      debouncedFormData.monthlyPayment > 0 &&
      (debouncedFormData.helocLimit ?? 0) > 0 &&
      (debouncedFormData.helocInterestRate ?? 0) > 0 &&
      (debouncedFormData.monthlyDiscretionaryIncome ?? 0) > 0
    ) {
      onCalculate(debouncedFormData)
    }
  }, [debouncedFormData, onCalculate])

  const handleInputChange = (field: keyof CalculatorValidationInput, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Auto-calculate discretionary income
      if (field === 'monthlyNetIncome' || field === 'monthlyExpenses') {
        const netIncome = field === 'monthlyNetIncome' ? Number(value) : Number(prev.monthlyNetIncome) || 0
        const expenses = field === 'monthlyExpenses' ? Number(value) : Number(prev.monthlyExpenses) || 0
        newData.monthlyDiscretionaryIncome = Math.max(0, netIncome - expenses)
      }
      
      return newData
    })
  }

  const handlePrefillDemo = () => {
    const demoData: CalculatorValidationInput = {
      currentMortgageBalance: 350000,
      currentInterestRate: 6.5,
      remainingTermMonths: 300, // 25 years
      monthlyPayment: 2347,
      propertyValue: 500000,
      propertyTaxMonthly: 583,
      insuranceMonthly: 125,
      hoaFeesMonthly: 0,
      pmiMonthly: 175,
      helocLimit: 100000,
      helocInterestRate: 7.25,
      helocAvailableCredit: 100000,
      monthlyGrossIncome: 8500,
      monthlyNetIncome: 6200,
      monthlyExpenses: 3900,
      monthlyDiscretionaryIncome: 2300,
      scenarioName: 'Demo Scenario',
      description: 'Sample data for testing the HELOC acceleration strategy'
    }

    setFormData(demoData)
  }

  const handleClearForm = () => {
    const emptyData: CalculatorValidationInput = {
      currentMortgageBalance: 0,
      currentInterestRate: 0,
      remainingTermMonths: 0,
      monthlyPayment: 0,
      propertyValue: undefined,
      propertyTaxMonthly: undefined,
      insuranceMonthly: undefined,
      hoaFeesMonthly: undefined,
      pmiMonthly: undefined,
      helocLimit: 0,
      helocInterestRate: 0,
      helocAvailableCredit: undefined,
      monthlyGrossIncome: 0,
      monthlyNetIncome: 0,
      monthlyExpenses: 0,
      monthlyDiscretionaryIncome: 0,
      scenarioName: undefined,
      description: undefined
    }

    setFormData(emptyData)
    // Call the onClear callback if provided to clear results
    if (onClear) {
      onClear()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Calculator Inputs</h2>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Fill Demo Data</span>
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mortgage Information Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Current Mortgage
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="currentMortgageBalance" className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="currentMortgageBalance"
                value={formData.currentMortgageBalance || ''}
                onChange={(e) => handleInputChange('currentMortgageBalance', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="currentInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="currentInterestRate"
                value={formData.currentInterestRate || ''}
                onChange={(e) => handleInputChange('currentInterestRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                step="0.01"
                min="0"
                max="30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="remainingTerm" className="block text-sm font-medium text-gray-700">
                  Remaining Term
                </label>
                <button
                  type="button"
                  onClick={() => setUseYearsInput(!useYearsInput)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Switch to {useYearsInput ? 'months' : 'years'}
                </button>
              </div>
              {useYearsInput ? (
                <>
                  <input
                    type="number"
                    id="remainingTermYears"
                    value={formData.remainingTermMonths ? (formData.remainingTermMonths / 12).toFixed(1) : ''}
                    onChange={(e) => {
                      const years = parseFloat(e.target.value) || 0
                      handleInputChange('remainingTermMonths', Math.round(years * 12))
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 25"
                    min="0.1"
                    max="40"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.remainingTermMonths ? `= ${formData.remainingTermMonths} months` : 'Enter years remaining'}
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    id="remainingTermMonths"
                    value={formData.remainingTermMonths || ''}
                    onChange={(e) => handleInputChange('remainingTermMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 300"
                    min="1"
                    max="480"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.remainingTermMonths ? `= ${(formData.remainingTermMonths / 12).toFixed(1)} years` : 'Enter months remaining'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyPayment"
                value={formData.monthlyPayment || ''}
                onChange={(e) => handleInputChange('monthlyPayment', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* HELOC Information Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          HELOC Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="helocLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Credit Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="helocLimit"
                value={formData.helocLimit || ''}
                onChange={(e) => handleInputChange('helocLimit', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="helocInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="helocInterestRate"
              value={formData.helocInterestRate || ''}
              onChange={(e) => handleInputChange('helocInterestRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              step="0.01"
              min="0"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Income and Expenses Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Monthly Finances
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="monthlyGrossIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Gross Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monthlyGrossIncome"
                  value={formData.monthlyGrossIncome || ''}
                  onChange={(e) => handleInputChange('monthlyGrossIncome', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="monthlyNetIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Net Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monthlyNetIncome"
                  value={formData.monthlyNetIncome || ''}
                  onChange={(e) => handleInputChange('monthlyNetIncome', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                Expenses
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monthlyExpenses"
                  value={formData.monthlyExpenses || ''}
                  onChange={(e) => handleInputChange('monthlyExpenses', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="monthlyDiscretionaryIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Discretionary Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monthlyDiscretionaryIncome"
                  value={formData.monthlyDiscretionaryIncome || ''}
                  readOnly
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md bg-blue-50 text-gray-700 cursor-not-allowed"
                  placeholder="Auto-calculated"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Net income - Expenses = ${formData.monthlyDiscretionaryIncome?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          Property Details (Optional)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700 mb-1">
              Property Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="propertyValue"
                value={formData.propertyValue || ''}
                onChange={(e) => handleInputChange('propertyValue', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="propertyTaxMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              Property Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="propertyTaxMonthly"
                value={formData.propertyTaxMonthly || ''}
                onChange={(e) => handleInputChange('propertyTaxMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="insuranceMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="insuranceMonthly"
                value={formData.insuranceMonthly || ''}
                onChange={(e) => handleInputChange('insuranceMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hoaFeesMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              HOA Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="hoaFeesMonthly"
                value={formData.hoaFeesMonthly || ''}
                onChange={(e) => handleInputChange('hoaFeesMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pmiMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              PMI (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="pmiMonthly"
                value={formData.pmiMonthly || ''}
                onChange={(e) => handleInputChange('pmiMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Private Mortgage Insurance</p>
          </div>
        </div>
      </div>
    </div>
  )
}