'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { CalculatorValidationInput } from '@/lib/validation'

interface CalculatorFormProps {
  onSubmit: (data: CalculatorValidationInput) => void
  loading?: boolean
  initialData?: Partial<CalculatorValidationInput>
}

// Validation rules
const validationRules = {
  currentMortgageBalance: {
    required: true,
    min: 1000,
    max: 10000000,
    message: 'Mortgage balance must be between $1,000 and $10,000,000'
  },
  currentInterestRate: {
    required: true,
    min: 0.1,
    max: 30,
    message: 'Interest rate must be between 0.1% and 30%'
  },
  remainingTermMonths: {
    required: true,
    min: 1,
    max: 480,
    message: 'Remaining term must be between 1 and 480 months (40 years)'
  },
  monthlyPayment: {
    required: true,
    min: 100,
    max: 100000,
    message: 'Monthly payment must be between $100 and $100,000'
  },
  helocLimit: {
    required: true,
    min: 1000,
    max: 5000000,
    message: 'HELOC limit must be between $1,000 and $5,000,000'
  },
  helocInterestRate: {
    required: true,
    min: 0.1,
    max: 30,
    message: 'HELOC interest rate must be between 0.1% and 30%'
  },
  monthlyGrossIncome: {
    required: true,
    min: 1000,
    max: 1000000,
    message: 'Monthly gross income must be between $1,000 and $1,000,000'
  },
  monthlyNetIncome: {
    required: true,
    min: 500,
    max: 1000000,
    message: 'Monthly net income must be between $500 and $1,000,000'
  },
  monthlyExpenses: {
    required: true,
    min: 0,
    max: 1000000,
    message: 'Monthly expenses must be between $0 and $1,000,000'
  },
  monthlyDiscretionaryIncome: {
    required: true,
    min: 0,
    max: 1000000,
    message: 'Discretionary income must be between $0 and $1,000,000'
  }
}

export default function FastCalculatorForm({ onSubmit, loading = false, initialData = {} }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculatorValidationInput>(() => ({
    currentMortgageBalance: initialData.currentMortgageBalance || 0,
    currentInterestRate: initialData.currentInterestRate || 0,
    remainingTermMonths: initialData.remainingTermMonths || 0,
    monthlyPayment: initialData.monthlyPayment || 0,
    propertyValue: initialData.propertyValue || 0,
    propertyTaxMonthly: initialData.propertyTaxMonthly || 0,
    insuranceMonthly: initialData.insuranceMonthly || 0,
    hoaFeesMonthly: initialData.hoaFeesMonthly || 0,
    helocLimit: initialData.helocLimit || 0,
    helocInterestRate: initialData.helocInterestRate || 0,
    helocAvailableCredit: initialData.helocAvailableCredit || 0,
    monthlyGrossIncome: initialData.monthlyGrossIncome || 0,
    monthlyNetIncome: initialData.monthlyNetIncome || 0,
    monthlyExpenses: initialData.monthlyExpenses || 0,
    monthlyDiscretionaryIncome: initialData.monthlyDiscretionaryIncome || 0,
    scenarioName: initialData.scenarioName || '',
    description: initialData.description || ''
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase() === 'true'

  // Debug logging function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data, null, 2) : ''}`
    console.log(logMessage)
    if (isDemoMode) {
      setDebugLogs(prev => [...prev.slice(-10), logMessage]) // Keep last 10 logs
    }
  }

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      addDebugLog('Updating form data with initialData', initialData)
      setFormData({
        currentMortgageBalance: initialData.currentMortgageBalance || 0,
        currentInterestRate: initialData.currentInterestRate || 0,
        remainingTermMonths: initialData.remainingTermMonths || 0,
        monthlyPayment: initialData.monthlyPayment || 0,
        propertyValue: initialData.propertyValue || 0,
        propertyTaxMonthly: initialData.propertyTaxMonthly || 0,
        insuranceMonthly: initialData.insuranceMonthly || 0,
        hoaFeesMonthly: initialData.hoaFeesMonthly || 0,
        helocLimit: initialData.helocLimit || 0,
        helocInterestRate: initialData.helocInterestRate || 0,
        helocAvailableCredit: initialData.helocAvailableCredit || 0,
        monthlyGrossIncome: initialData.monthlyGrossIncome || 0,
        monthlyNetIncome: initialData.monthlyNetIncome || 0,
        monthlyExpenses: initialData.monthlyExpenses || 0,
        monthlyDiscretionaryIncome: initialData.monthlyDiscretionaryIncome || 0,
        scenarioName: initialData.scenarioName || '',
        description: initialData.description || ''
      })
      setErrors({})
      setTouched({})
    }
  }, [initialData])

  const validateField = useCallback((field: keyof CalculatorValidationInput, value: number): string => {
    const rule = validationRules[field as keyof typeof validationRules]
    if (!rule) return ''

    if (rule.required && (!value || value <= 0)) {
      return `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
    }

    if (rule.min && value < rule.min) {
      return rule.message
    }

    if (rule.max && value > rule.max) {
      return rule.message
    }

    return ''
  }, [])

  const handleInputChange = useCallback((field: keyof CalculatorValidationInput, value: string | number) => {
    addDebugLog(`Input change for ${field}`, { value, type: typeof value })
    
    let processedValue: string | number = value
    
    // Handle string inputs - keep as string during typing for better UX
    if (typeof value === 'string') {
      // Allow empty string during typing
      if (value === '') {
        processedValue = ''
      } else {
        // Only convert to number if it's a valid number
        const numericValue = parseFloat(value)
        processedValue = isNaN(numericValue) ? '' : numericValue
      }
    }

    addDebugLog(`Processed value for ${field}`, { processedValue, type: typeof processedValue })

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: processedValue
      }
      addDebugLog('Updated form data', newData)
      return newData
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  const handleBlur = useCallback((field: keyof CalculatorValidationInput) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    // Convert string to number for validation
    const value = formData[field]
    const numericValue = typeof value === 'string' ? (value === '' ? 0 : parseFloat(value)) : value
    
    // Update formData to ensure numeric value
    if (typeof value === 'string' && value !== '') {
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }))
    }

    const error = validateField(field, numericValue || 0)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [formData, validateField])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addDebugLog('Form submission started', formData)
    
    try {
      // Convert all form data to proper types and validate
      const processedData: CalculatorValidationInput = {
        // Required numeric fields - ensure they're numbers
        currentMortgageBalance: Number(formData.currentMortgageBalance) || 0,
        currentInterestRate: Number(formData.currentInterestRate) || 0,
        remainingTermMonths: Number(formData.remainingTermMonths) || 0,
        monthlyPayment: Number(formData.monthlyPayment) || 0,
        helocLimit: Number(formData.helocLimit) || 0,
        helocInterestRate: Number(formData.helocInterestRate) || 0,
        monthlyGrossIncome: Number(formData.monthlyGrossIncome) || 0,
        monthlyNetIncome: Number(formData.monthlyNetIncome) || 0,
        monthlyExpenses: Number(formData.monthlyExpenses) || 0,
        monthlyDiscretionaryIncome: Number(formData.monthlyDiscretionaryIncome) || 0,
        
        // Optional numeric fields - only include if they have values
        ...(formData.propertyValue && Number(formData.propertyValue) > 0 && { propertyValue: Number(formData.propertyValue) }),
        ...(formData.propertyTaxMonthly && Number(formData.propertyTaxMonthly) > 0 && { propertyTaxMonthly: Number(formData.propertyTaxMonthly) }),
        ...(formData.insuranceMonthly && Number(formData.insuranceMonthly) > 0 && { insuranceMonthly: Number(formData.insuranceMonthly) }),
        ...(formData.hoaFeesMonthly && Number(formData.hoaFeesMonthly) > 0 && { hoaFeesMonthly: Number(formData.hoaFeesMonthly) }),
        ...(formData.helocAvailableCredit && Number(formData.helocAvailableCredit) > 0 && { helocAvailableCredit: Number(formData.helocAvailableCredit) }),
        
        // Text fields
        ...(formData.scenarioName && formData.scenarioName.trim() && { scenarioName: formData.scenarioName.trim() }),
        ...(formData.description && formData.description.trim() && { description: formData.description.trim() })
      }
      
      addDebugLog('Processed form data for submission', processedData)
      
      const newErrors: Record<string, string> = {}
      const requiredFields = Object.keys(validationRules) as Array<keyof typeof validationRules>
      
      requiredFields.forEach(field => {
        const value = processedData[field] as number
        const error = validateField(field, value)
        if (error) {
          newErrors[field] = error
          addDebugLog(`Validation error for ${field}`, { value, error })
        }
      })

      addDebugLog('Final validation errors', newErrors)

      setErrors(newErrors)
      setTouched(Object.fromEntries(requiredFields.map(field => [field, true])))

      if (Object.keys(newErrors).length === 0) {
        addDebugLog('Submitting valid data to onSubmit callback')
        onSubmit(processedData)
      } else {
        addDebugLog('Form submission blocked due to validation errors')
      }
    } catch (error) {
      addDebugLog('Error during form submission', error)
      console.error('Form submission error:', error)
    }
  }

  const handlePrefillDemo = () => {
    const demoData: CalculatorValidationInput = {
      currentMortgageBalance: 350000,
      currentInterestRate: 6.5,
      remainingTermMonths: 300,
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

  const CurrencyInput = ({ 
    field, 
    label, 
    description, 
    required = false 
  }: { 
    field: keyof CalculatorValidationInput
    label: string
    description: string
    required?: boolean 
  }) => (
    <div>
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input
          type="number"
          id={field}
          value={formData[field] === 0 ? '' : formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800 ${
            errors[field] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="0"
          min="0"
          step="1"
        />
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  )

  const PercentageInput = ({ 
    field, 
    label, 
    description, 
    required = false 
  }: { 
    field: keyof CalculatorValidationInput
    label: string
    description: string
    required?: boolean 
  }) => (
    <div>
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="relative">
        <input
          type="number"
          id={field}
          value={formData[field] === 0 ? '' : formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800 ${
            errors[field] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="0.00"
          step="0.01"
          min="0"
          max="30"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  )

  const NumberInput = ({ 
    field, 
    label, 
    description, 
    required = false 
  }: { 
    field: keyof CalculatorValidationInput
    label: string
    description: string
    required?: boolean 
  }) => (
    <div>
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <input
        type="number"
        id={field}
        value={formData[field] === 0 ? '' : formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800 ${
          errors[field] ? 'border-red-300' : 'border-gray-300'
        }`}
        placeholder="0"
        min="1"
        max="480"
      />
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
      {field === 'remainingTermMonths' && formData[field] && (
        <p className="mt-1 text-xs text-gray-500">
          {Math.round((formData[field] as number) / 12 * 10) / 10} years
        </p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Debug Console (Demo Mode Only) */}
      {isDemoMode && debugLogs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-green-300 font-bold">Debug Console</h4>
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="text-gray-400 hover:text-white text-xs"
            >
              Clear
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {debugLogs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap break-all">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Fill Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {isDemoMode && (
            <span className="text-green-600 font-medium">
              🎮 Debug mode active - errors shown above
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
        >
          Fill with Demo Data
        </button>
      </div>

      {/* Mortgage Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 pb-2 border-b border-blue-200 dark:border-blue-700">
          Current Mortgage Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyInput
            field="currentMortgageBalance"
            label="Current Mortgage Balance"
            description="The remaining principal balance on your current mortgage"
            required
          />
          
          <PercentageInput
            field="currentInterestRate"
            label="Current Interest Rate"
            description="Your current mortgage interest rate (annual percentage)"
            required
          />
          
          <NumberInput
            field="remainingTermMonths"
            label="Remaining Term (months)"
            description="Number of months left on your current mortgage"
            required
          />
          
          <CurrencyInput
            field="monthlyPayment"
            label="Current Monthly Payment"
            description="Your current principal and interest payment (excluding taxes/insurance)"
            required
          />
        </div>
      </div>

      {/* HELOC Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 pb-2 border-b border-blue-200 dark:border-blue-700">
          HELOC Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyInput
            field="helocLimit"
            label="HELOC Credit Limit"
            description="Maximum amount you can borrow on your HELOC"
            required
          />
          
          <PercentageInput
            field="helocInterestRate"
            label="HELOC Interest Rate"
            description="Current variable interest rate on your HELOC"
            required
          />
          
          <CurrencyInput
            field="helocAvailableCredit"
            label="Available HELOC Credit"
            description="Current available credit (limit minus current balance)"
          />
        </div>
      </div>

      {/* Monthly Income & Expenses Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 pb-2 border-b border-blue-200 dark:border-blue-700">
          Monthly Income & Expenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyInput
            field="monthlyGrossIncome"
            label="Monthly Gross Income"
            description="Total monthly income before taxes and deductions"
            required
          />
          
          <CurrencyInput
            field="monthlyNetIncome"
            label="Monthly Net Income"
            description="Take-home pay after taxes and deductions"
            required
          />
          
          <CurrencyInput
            field="monthlyExpenses"
            label="Monthly Expenses"
            description="All monthly expenses (excluding current mortgage payment)"
            required
          />
          
          <CurrencyInput
            field="monthlyDiscretionaryIncome"
            label="Monthly Discretionary Income"
            description="Extra income available for additional mortgage payments"
            required
          />
        </div>
      </div>

      {/* Property Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 pb-2 border-b border-blue-200 dark:border-blue-700">
          Property Information (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyInput
            field="propertyValue"
            label="Property Value"
            description="Current estimated market value of your property"
          />
          
          <CurrencyInput
            field="propertyTaxMonthly"
            label="Monthly Property Tax"
            description="Monthly property tax payment"
          />
          
          <CurrencyInput
            field="insuranceMonthly"
            label="Monthly Insurance"
            description="Monthly homeowners insurance payment"
          />
          
          <CurrencyInput
            field="hoaFeesMonthly"
            label="Monthly HOA Fees"
            description="Monthly homeowners association fees (if applicable)"
          />
        </div>
      </div>

      {/* Scenario Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 pb-2 border-b border-blue-200 dark:border-blue-700">
          Scenario Details (Optional)
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Name
            </label>
            <p className="text-xs text-gray-500 mb-2">Give this scenario a memorable name</p>
            <input
              type="text"
              id="scenarioName"
              value={formData.scenarioName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, scenarioName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800"
              placeholder="My HELOC Strategy"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-xs text-gray-500 mb-2">Add notes about this scenario</p>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800"
              placeholder="Optional description of this scenario..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{loading ? 'Calculating...' : 'Calculate HELOC Strategy'}</span>
        </button>
      </div>
    </form>
  )
}