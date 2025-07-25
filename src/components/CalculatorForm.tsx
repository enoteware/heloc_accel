'use client'

import React, { useState } from 'react'
import type { CalculatorValidationInput } from '@/lib/validation'

interface CalculatorFormProps {
  onSubmit: (data: CalculatorValidationInput) => void
  loading?: boolean
  initialData?: Partial<CalculatorValidationInput>
}

export default function CalculatorForm({ onSubmit, loading = false, initialData = {} }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculatorValidationInput>({
    currentMortgageBalance: initialData.currentMortgageBalance || 0,
    currentInterestRate: initialData.currentInterestRate || 0,
    remainingTermMonths: initialData.remainingTermMonths || 0,
    monthlyPayment: initialData.monthlyPayment || 0,
    propertyValue: initialData.propertyValue,
    propertyTaxMonthly: initialData.propertyTaxMonthly,
    insuranceMonthly: initialData.insuranceMonthly,
    hoaFeesMonthly: initialData.hoaFeesMonthly,
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

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof CalculatorValidationInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    onSubmit(formData)
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
    setErrors({})
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
    setErrors({})
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mortgage Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Mortgage Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentMortgageBalance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Mortgage Balance *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="currentMortgageBalance"
                value={formData.currentMortgageBalance || ''}
                onChange={(e) => handleInputChange('currentMortgageBalance', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="350,000"
                required
              />
            </div>
            {errors.currentMortgageBalance && (
              <p className="mt-1 text-sm text-red-600">{errors.currentMortgageBalance}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Current Interest Rate * (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="currentInterestRate"
                value={formData.currentInterestRate || ''}
                onChange={(e) => handleInputChange('currentInterestRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="6.5"
                step="0.01"
                min="0"
                max="30"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {errors.currentInterestRate && (
              <p className="mt-1 text-sm text-red-600">{errors.currentInterestRate}</p>
            )}
          </div>

          <div>
            <label htmlFor="remainingTermMonths" className="block text-sm font-medium text-gray-700 mb-1">
              Remaining Term (months) *
            </label>
            <input
              type="number"
              id="remainingTermMonths"
              value={formData.remainingTermMonths || ''}
              onChange={(e) => handleInputChange('remainingTermMonths', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="300"
              min="1"
              max="480"
              required
            />
            {errors.remainingTermMonths && (
              <p className="mt-1 text-sm text-red-600">{errors.remainingTermMonths}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.remainingTermMonths ? `${Math.round(formData.remainingTermMonths / 12 * 10) / 10} years` : ''}
            </p>
          </div>

          <div>
            <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">
              Current Monthly Payment *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyPayment"
                value={formData.monthlyPayment || ''}
                onChange={(e) => handleInputChange('monthlyPayment', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="2,200"
                required
              />
            </div>
            {errors.monthlyPayment && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyPayment}</p>
            )}
          </div>
        </div>
      </div>

      {/* HELOC Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">HELOC Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="helocLimit" className="block text-sm font-medium text-gray-700 mb-1">
              HELOC Credit Limit *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="helocLimit"
                value={formData.helocLimit || ''}
                onChange={(e) => handleInputChange('helocLimit', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="100,000"
                required
              />
            </div>
            {errors.helocLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.helocLimit}</p>
            )}
          </div>

          <div>
            <label htmlFor="helocInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              HELOC Interest Rate * (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="helocInterestRate"
                value={formData.helocInterestRate || ''}
                onChange={(e) => handleInputChange('helocInterestRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="7.5"
                step="0.01"
                min="0"
                max="30"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {errors.helocInterestRate && (
              <p className="mt-1 text-sm text-red-600">{errors.helocInterestRate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Income and Expenses Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income & Expenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlyGrossIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Gross Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyGrossIncome"
                value={formData.monthlyGrossIncome || ''}
                onChange={(e) => handleInputChange('monthlyGrossIncome', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="8,500"
                required
              />
            </div>
            {errors.monthlyGrossIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyGrossIncome}</p>
            )}
          </div>

          <div>
            <label htmlFor="monthlyNetIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Net Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyNetIncome"
                value={formData.monthlyNetIncome || ''}
                onChange={(e) => handleInputChange('monthlyNetIncome', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="6,800"
                required
              />
            </div>
            {errors.monthlyNetIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyNetIncome}</p>
            )}
          </div>

          <div>
            <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Expenses *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyExpenses"
                value={formData.monthlyExpenses || ''}
                onChange={(e) => handleInputChange('monthlyExpenses', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="4,500"
                required
              />
            </div>
            {errors.monthlyExpenses && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses}</p>
            )}
          </div>

          <div>
            <label htmlFor="monthlyDiscretionaryIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Discretionary Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyDiscretionaryIncome"
                value={formData.monthlyDiscretionaryIncome || ''}
                onChange={(e) => handleInputChange('monthlyDiscretionaryIncome', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="2,300"
                required
              />
            </div>
            {errors.monthlyDiscretionaryIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyDiscretionaryIncome}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Available for HELOC acceleration strategy
            </p>
          </div>
        </div>
      </div>

      {/* Optional Property Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="500,000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="propertyTaxMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Property Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="propertyTaxMonthly"
                value={formData.propertyTaxMonthly || ''}
                onChange={(e) => handleInputChange('propertyTaxMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="850"
              />
            </div>
          </div>

          <div>
            <label htmlFor="insuranceMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="insuranceMonthly"
                value={formData.insuranceMonthly || ''}
                onChange={(e) => handleInputChange('insuranceMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="250"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hoaFeesMonthly" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly HOA Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="hoaFeesMonthly"
                value={formData.hoaFeesMonthly || ''}
                onChange={(e) => handleInputChange('hoaFeesMonthly', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Prefill Demo Button */}
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Fill Demo Data</span>
        </button>

        {/* Clear Form Button */}
        <button
          type="button"
          onClick={handleClearForm}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Clear Form</span>
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{loading ? 'Calculating...' : 'Calculate HELOC Strategy'}</span>
        </button>
      </div>
    </form>
  )
}