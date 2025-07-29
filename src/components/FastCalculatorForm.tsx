'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { CalculatorValidationInput } from '@/lib/validation'
import { EnhancedCurrencyInput, EnhancedPercentageInput, EnhancedNumberInput } from './EnhancedCalculatorInputs'
import { CalculatorProgressBar } from './CalculatorProgressBar'
import { SectionCompletionIndicator } from './SectionCompletionIndicator'
import { Card, CardHeader, CardTitle, CardContent } from './design-system/Card'

interface CalculatorFormProps {
  onSubmit: (data: CalculatorValidationInput) => void
  loading?: boolean
  initialData?: Partial<CalculatorValidationInput & { remainingTermYears?: number; pmiMonthly?: number }>
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
  remainingTermYears: {
    required: true,
    min: 1,
    max: 40,
    message: 'Remaining term must be between 1 and 40 years'
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
  },
  pmiMonthly: {
    required: false,
    min: 0,
    max: 2000,
    message: 'PMI must be between $0 and $2,000'
  }
}

export default function FastCalculatorForm({ onSubmit, loading = false, initialData = {} }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculatorValidationInput & { remainingTermYears: number; pmiMonthly: number }>(() => ({
    currentMortgageBalance: initialData.currentMortgageBalance || 0,
    currentInterestRate: initialData.currentInterestRate || 0,
    remainingTermYears: initialData.remainingTermYears || (initialData.remainingTermMonths ? Math.round(initialData.remainingTermMonths / 12) : 0),
    remainingTermMonths: initialData.remainingTermMonths || (initialData.remainingTermYears ? initialData.remainingTermYears * 12 : 0),
    monthlyPayment: initialData.monthlyPayment || 0,
    propertyValue: initialData.propertyValue || 0,
    propertyTaxMonthly: initialData.propertyTaxMonthly || 0,
    insuranceMonthly: initialData.insuranceMonthly || 0,
    hoaFeesMonthly: initialData.hoaFeesMonthly || 0,
    pmiMonthly: initialData.pmiMonthly || 0,
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
        remainingTermYears: initialData.remainingTermYears || (initialData.remainingTermMonths ? Math.round(initialData.remainingTermMonths / 12) : 0),
        remainingTermMonths: initialData.remainingTermMonths || (initialData.remainingTermYears ? initialData.remainingTermYears * 12 : 0),
        monthlyPayment: initialData.monthlyPayment || 0,
        propertyValue: initialData.propertyValue || 0,
        propertyTaxMonthly: initialData.propertyTaxMonthly || 0,
        insuranceMonthly: initialData.insuranceMonthly || 0,
        hoaFeesMonthly: initialData.hoaFeesMonthly || 0,
        pmiMonthly: initialData.pmiMonthly || 0,
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

  const validateField = useCallback((field: keyof (CalculatorValidationInput & { remainingTermYears: number; pmiMonthly: number }), value: number): string => {
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

  const handleInputChange = useCallback((field: keyof (CalculatorValidationInput & { remainingTermYears: number; pmiMonthly: number }), value: string | number) => {
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
      
      // Special handling for remainingTermYears - auto-calculate months
      if (field === 'remainingTermYears' && typeof processedValue === 'number') {
        newData.remainingTermMonths = processedValue * 12
      }
      
      // Auto-calculate discretionary income when income or expenses change
      if (field === 'monthlyNetIncome' || field === 'monthlyExpenses') {
        const netIncome = field === 'monthlyNetIncome' ? (typeof processedValue === 'number' ? processedValue : 0) : (typeof prev.monthlyNetIncome === 'number' ? prev.monthlyNetIncome : 0)
        const expenses = field === 'monthlyExpenses' ? (typeof processedValue === 'number' ? processedValue : 0) : (typeof prev.monthlyExpenses === 'number' ? prev.monthlyExpenses : 0)
        
        if (netIncome > 0 && expenses >= 0) {
          newData.monthlyDiscretionaryIncome = Math.max(0, netIncome - expenses)
        }
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

  const handleBlur = useCallback((field: keyof (CalculatorValidationInput & { remainingTermYears: number; pmiMonthly: number })) => {
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
        remainingTermMonths: Number(formData.remainingTermMonths) || (Number(formData.remainingTermYears) * 12) || 0,
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
        ...(formData.pmiMonthly && Number(formData.pmiMonthly) > 0 && { pmiMonthly: Number(formData.pmiMonthly) }),
        ...(formData.helocAvailableCredit && Number(formData.helocAvailableCredit) > 0 && { helocAvailableCredit: Number(formData.helocAvailableCredit) }),
        
        // Text fields
        ...(formData.scenarioName && formData.scenarioName.trim() && { scenarioName: formData.scenarioName.trim() }),
        ...(formData.description && formData.description.trim() && { description: formData.description.trim() })
      }
      
      addDebugLog('Processed form data for submission', processedData)
      
      const newErrors: Record<string, string> = {}
      const requiredFields = Object.keys(validationRules) as Array<keyof typeof validationRules>
      
      requiredFields.forEach(field => {
        // Skip remainingTermYears as it's not in processedData (we use remainingTermMonths)
        if (field === 'remainingTermYears') return
        
        const value = processedData[field as keyof CalculatorValidationInput] as number
        const error = validateField(field as keyof (CalculatorValidationInput & { remainingTermYears: number; pmiMonthly: number }), value)
        if (error) {
          newErrors[field] = error
          addDebugLog(`Validation error for ${field}`, { value, error })
        }
      })

      // Business logic validations (same as API)
      // Note: Removed mortgage vs property value check - underwater mortgages are valid scenarios

      if (processedData.helocLimit && processedData.helocAvailableCredit && processedData.helocAvailableCredit > processedData.helocLimit) {
        newErrors.helocAvailableCredit = 'HELOC available credit cannot exceed HELOC limit'
        addDebugLog('Business logic validation failed: HELOC credit > limit', {
          credit: processedData.helocAvailableCredit,
          limit: processedData.helocLimit
        })
      }

      // HELOC limit cannot equal initial draw
      if (processedData.helocLimit && processedData.helocAvailableCredit && processedData.helocLimit === processedData.helocAvailableCredit) {
        newErrors.helocAvailableCredit = 'HELOC limit cannot be the same as initial draw amount'
        addDebugLog('Business logic validation failed: HELOC limit equals initial draw')
      }

      // Income validation
      if (processedData.monthlyNetIncome && processedData.monthlyGrossIncome && processedData.monthlyNetIncome > processedData.monthlyGrossIncome) {
        newErrors.monthlyNetIncome = 'Net income cannot exceed gross income'
        addDebugLog('Business logic validation failed: net > gross income')
      }

      // Discretionary income validation
      if (processedData.monthlyNetIncome && processedData.monthlyExpenses && processedData.monthlyDiscretionaryIncome) {
        const calculatedDiscretionary = processedData.monthlyNetIncome - processedData.monthlyExpenses
        const tolerance = 50
        if (Math.abs(processedData.monthlyDiscretionaryIncome - calculatedDiscretionary) > tolerance) {
          newErrors.monthlyDiscretionaryIncome = `Discretionary income should equal net income minus expenses ($${calculatedDiscretionary.toLocaleString()})`
          addDebugLog('Business logic validation failed: discretionary income mismatch', {
            provided: processedData.monthlyDiscretionaryIncome,
            calculated: calculatedDiscretionary,
            difference: Math.abs(processedData.monthlyDiscretionaryIncome - calculatedDiscretionary)
          })
        }
      }

      addDebugLog('Final validation errors', newErrors)

      setErrors(newErrors)
      setTouched(Object.fromEntries(requiredFields.map(field => [field, true])))

      if (Object.keys(newErrors).length === 0) {
        addDebugLog('Submitting valid data to onSubmit callback')
        addDebugLog('About to call onSubmit with data', processedData)
        try {
          onSubmit(processedData)
          addDebugLog('onSubmit callback completed successfully')
        } catch (error) {
          addDebugLog('Error in onSubmit callback', error)
        }
      } else {
        addDebugLog('Form submission blocked due to validation errors')
      }
    } catch (error) {
      addDebugLog('Error during form submission', error)
      console.error('Form submission error:', error)
    }
  }

  const handlePrefillDemo = () => {
    const demoData = {
      currentMortgageBalance: 350000,
      currentInterestRate: 6.5,
      remainingTermYears: 25,
      remainingTermMonths: 300,
      monthlyPayment: 2347,
      propertyValue: 500000,
      propertyTaxMonthly: 583,
      insuranceMonthly: 125,
      hoaFeesMonthly: 0,
      pmiMonthly: 175,
      helocLimit: 100000,
      helocInterestRate: 7.25,
      helocAvailableCredit: 85000,
      monthlyGrossIncome: 8500,
      monthlyNetIncome: 6200,
      monthlyExpenses: 3900,
      monthlyDiscretionaryIncome: 2300,
      scenarioName: 'Demo Scenario',
      description: 'Sample data for testing the HELOC acceleration strategy'
    }

    addDebugLog('Loading demo data with proper values', demoData)

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
      <p className="text-xs text-gray-700 mb-2">{description}</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">$</span>
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
      <p className="text-xs text-gray-700 mb-2">{description}</p>
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
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">%</span>
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
      <p className="text-xs text-gray-700 mb-2">{description}</p>
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
        <p className="mt-1 text-xs text-gray-700">
          {Math.round((formData[field] as number) / 12 * 10) / 10} years
        </p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      <CalculatorProgressBar formData={formData} />
      {/* Debug Console (Demo Mode Only) */}
      {isDemoMode && debugLogs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-green-300 font-bold">Debug Console</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const logText = debugLogs.join('\n')
                  navigator.clipboard.writeText(logText).then(() => {
                    // Temporarily show copied feedback
                    const btn = document.activeElement as HTMLButtonElement
                    const originalText = btn.textContent
                    btn.textContent = 'Copied!'
                    btn.style.color = '#10b981'
                    setTimeout(() => {
                      btn.textContent = originalText
                      btn.style.color = '#9ca3af'
                    }, 1000)
                  }).catch(() => {
                    // Fallback for browsers that don't support clipboard API
                    const textArea = document.createElement('textarea')
                    textArea.value = logText
                    document.body.appendChild(textArea)
                    textArea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textArea)
                    
                    const btn = document.activeElement as HTMLButtonElement
                    const originalText = btn.textContent
                    btn.textContent = 'Copied!'
                    btn.style.color = '#10b981'
                    setTimeout(() => {
                      btn.textContent = originalText
                      btn.style.color = '#9ca3af'
                    }, 1000)
                  })
                }}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 border border-gray-600 rounded hover:border-gray-500"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setDebugLogs([])}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 border border-gray-600 rounded hover:border-gray-500"
              >
                Clear
              </button>
            </div>
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
        <div className="text-sm text-gray-700">
          {isDemoMode && (
            <span className="text-green-600 font-medium">
              🎮 Debug mode active - errors shown above
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="px-4 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        >
          Fill with Demo Data
        </button>
      </div>

      {/* Mortgage Information Section */}
      <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
              🏠 Current Mortgage Information
            </CardTitle>
            <SectionCompletionIndicator 
              formData={formData}
              requiredFields={['currentMortgageBalance', 'currentInterestRate', 'remainingTermMonths', 'monthlyPayment']}
              color="blue"
              size="md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCurrencyInput
              field="currentMortgageBalance"
              label="Current Mortgage Balance"
              description="The remaining principal balance on your current mortgage"
              required
              priority="high"
              value={formData.currentMortgageBalance || 0}
              error={errors.currentMortgageBalance}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $350,000"
              tooltip="This is the amount you still owe on your mortgage"
            />
            
            <EnhancedPercentageInput
              field="currentInterestRate"
              label="Current Interest Rate"
              description="Your current mortgage interest rate (annual percentage)"
              required
              priority="high"
              value={formData.currentInterestRate || 0}
              error={errors.currentInterestRate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. 6.50"
              tooltip="Check your latest mortgage statement for this rate"
            />
            
            <div>
              <label htmlFor="remainingTermYears" className="block text-sm font-medium text-gray-700 mb-1">
                Remaining Term (years) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-700 mb-2">Number of years left on your current mortgage</p>
              <div className="relative">
                <input
                  type="number"
                  id="remainingTermYears"
                  value={formData.remainingTermYears === 0 ? '' : formData.remainingTermYears || ''}
                  onChange={(e) => handleInputChange('remainingTermYears', e.target.value)}
                  onBlur={() => handleBlur('remainingTermYears')}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 !text-gray-900 dark:!text-white bg-white dark:bg-neutral-800 ${
                    errors.remainingTermYears ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 25"
                  min="1"
                  max="40"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {formData.remainingTermYears && (
                <p className="mt-1 text-xs text-gray-700">
                  = {formData.remainingTermYears * 12} months
                </p>
              )}
              {errors.remainingTermYears && (
                <p className="mt-1 text-sm text-red-600">{errors.remainingTermYears}</p>
              )}
            </div>
            
            <EnhancedCurrencyInput
              field="monthlyPayment"
              label="Current Monthly Payment"
              description="Your current principal and interest payment (excluding taxes/insurance)"
              required
              priority="high"
              value={formData.monthlyPayment || 0}
              error={errors.monthlyPayment}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $2,347"
              tooltip="Principal and interest only, not including escrow"
            />
          </div>
        </CardContent>
      </Card>

      {/* HELOC Information Section */}
      <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
              💳 HELOC Information
            </CardTitle>
            <SectionCompletionIndicator 
              formData={formData}
              requiredFields={['helocLimit', 'helocInterestRate']}
              color="green"
              size="md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCurrencyInput
              field="helocLimit"
              label="HELOC Credit Limit"
              description="Maximum amount you can borrow on your HELOC"
              required
              priority="high"
              value={formData.helocLimit || 0}
              error={errors.helocLimit}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $100,000"
              tooltip="This is your total HELOC credit line from your lender"
            />
            
            <EnhancedPercentageInput
              field="helocInterestRate"
              label="HELOC Interest Rate"
              description="Current variable interest rate on your HELOC"
              required
              priority="high"
              value={formData.helocInterestRate || 0}
              error={errors.helocInterestRate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. 7.25"
              tooltip="Your lender's variable rate. Usually changes monthly."
            />
            
            <EnhancedCurrencyInput
              field="helocAvailableCredit"
              label="Available HELOC Credit"
              description="Current available credit (limit minus current balance)"
              value={formData.helocAvailableCredit || 0}
              error={errors.helocAvailableCredit}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $100,000"
              tooltip="If you haven't used your HELOC yet, this equals your limit"
            />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income & Expenses Section */}
      <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              💰 Monthly Income & Expenses
            </CardTitle>
            <SectionCompletionIndicator 
              formData={formData}
              requiredFields={['monthlyGrossIncome', 'monthlyNetIncome', 'monthlyExpenses']}
              color="purple"
              size="md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCurrencyInput
              field="monthlyGrossIncome"
              label="Monthly Gross Income"
              description="Total monthly income before taxes and deductions"
              required
              priority="high"
              value={formData.monthlyGrossIncome || 0}
              error={errors.monthlyGrossIncome}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $8,500"
              tooltip="Your total income before any deductions"
            />
            
            <EnhancedCurrencyInput
              field="monthlyNetIncome"
              label="Monthly Net Income"
              description="Take-home pay after taxes and deductions"
              required
              priority="high"
              value={formData.monthlyNetIncome || 0}
              error={errors.monthlyNetIncome}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $6,200"
              tooltip="What actually hits your bank account each month"
            />
            
            <EnhancedCurrencyInput
              field="monthlyExpenses"
              label="Monthly Expenses"
              description="All monthly expenses (excluding current mortgage payment)"
              required
              value={formData.monthlyExpenses || 0}
              error={errors.monthlyExpenses}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $3,900"
              tooltip="Food, utilities, insurance, etc. (not including your mortgage)"
            />
            
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Monthly Discretionary Income
                    </h4>
                    <p className="text-xs text-green-700 mt-1">Available for additional mortgage payments</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-900">
                      ${formData.monthlyDiscretionaryIncome ? new Intl.NumberFormat('en-US').format(formData.monthlyDiscretionaryIncome) : '0'}
                    </div>
                    <div className="text-xs text-green-700">
                      {formData.monthlyNetIncome && formData.monthlyExpenses 
                        ? `$${new Intl.NumberFormat('en-US').format(typeof formData.monthlyNetIncome === 'number' ? formData.monthlyNetIncome : 0)} - $${new Intl.NumberFormat('en-US').format(typeof formData.monthlyExpenses === 'number' ? formData.monthlyExpenses : 0)}`
                        : 'Enter income and expenses above'
                      }
                    </div>
                  </div>
                </div>
                {formData.monthlyDiscretionaryIncome < 0 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-start">
                    <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-red-800">Budget Deficit</p>
                      <p className="text-xs text-red-700">Your expenses exceed your net income. Consider reducing expenses or the HELOC strategy may not be suitable.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Information Section */}
      <Card variant="outlined" className="bg-gradient-to-br from-gray-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              🏘️ Property Information (Optional)
            </CardTitle>
            <SectionCompletionIndicator 
              formData={formData}
              requiredFields={['propertyValue']}
              color="gray"
              size="sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCurrencyInput
              field="propertyValue"
              label="Property Value"
              description="Current estimated market value of your property"
              value={formData.propertyValue || 0}
              error={errors.propertyValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $500,000"
              tooltip="Use recent appraisal or market estimate"
            />
            
            <EnhancedCurrencyInput
              field="propertyTaxMonthly"
              label="Monthly Property Tax"
              description="Monthly property tax payment"
              value={formData.propertyTaxMonthly || 0}
              error={errors.propertyTaxMonthly}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $583"
              tooltip="Annual tax divided by 12 months"
            />
            
            <EnhancedCurrencyInput
              field="insuranceMonthly"
              label="Monthly Insurance"
              description="Monthly homeowners insurance payment"
              value={formData.insuranceMonthly || 0}
              error={errors.insuranceMonthly}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $125"
              tooltip="Your homeowners insurance premium per month"
            />
            
            <EnhancedCurrencyInput
              field="hoaFeesMonthly"
              label="Monthly HOA Fees"
              description="Monthly homeowners association fees (if applicable)"
              value={formData.hoaFeesMonthly || 0}
              error={errors.hoaFeesMonthly}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $0"
              tooltip="Leave blank or enter 0 if no HOA"
            />
            
            <EnhancedCurrencyInput
              field="pmiMonthly"
              label="Monthly PMI"
              description="Private mortgage insurance payment (if applicable)"
              value={formData.pmiMonthly || 0}
              error={errors.pmiMonthly}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g. $175"
              tooltip="This will be removed when you reach 20% equity"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scenario Details */}
      <Card variant="outlined" className="bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
            📝 Scenario Details (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name
              </label>
              <p className="text-xs text-gray-700 mb-2">Give this scenario a memorable name</p>
              <input
                type="text"
                id="scenarioName"
                value={formData.scenarioName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, scenarioName: e.target.value }))}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-custom dark:!text-white dark:bg-neutral-800 ${
                  !formData.scenarioName?.trim() 
                    ? 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-400' 
                    : 'border-gray-300 hover:border-gray-400 bg-white !text-gray-900'
                }`}
                placeholder="My HELOC Strategy"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-xs text-gray-700 mb-2">Add notes about this scenario</p>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 placeholder-custom dark:!text-white dark:bg-neutral-800 ${
                  !formData.description?.trim() 
                    ? 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-400' 
                    : 'border-gray-300 hover:border-gray-400 bg-white !text-gray-900'
                }`}
                placeholder="Optional description of this scenario..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-bold text-lg py-4 px-8 sm:px-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center space-x-3 min-h-[44px] w-full sm:w-auto max-w-sm sm:max-w-none"
        >
          {loading && (
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span className="relative">
            {loading ? 'Calculating Your Strategy...' : '🚀 Calculate HELOC Strategy'}
          </span>
          {!loading && (
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          )}
        </button>
      </div>
    </form>
  )
}