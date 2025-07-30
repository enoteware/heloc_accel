import React from 'react'
import type { ValidationError } from '@/lib/validation'

interface ValidationErrorDisplayProps {
  errors: ValidationError[]
  className?: string
  showFieldNames?: boolean
}

export function ValidationErrorDisplay({ 
  errors, 
  className = '',
  showFieldNames = true 
}: ValidationErrorDisplayProps) {
  if (!errors || errors.length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Validation Error' : `${errors.length} Validation Errors`}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {errors.length === 1 ? (
              <p>{errors[0].message}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={`${error.field}-${index}`}>
                    {showFieldNames && (
                      <span className="font-medium">
                        {formatFieldName(error.field)}:
                      </span>
                    )}{' '}
                    {error.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  )
}

// Helper function to format field names for display
function formatFieldName(fieldName: string): string {
  const fieldNameMap: Record<string, string> = {
    currentMortgageBalance: 'Mortgage Balance',
    currentInterestRate: 'Interest Rate',
    remainingTermMonths: 'Remaining Term',
    monthlyPayment: 'Monthly Payment',
    propertyValue: 'Property Value',
    propertyTaxMonthly: 'Property Tax',
    insuranceMonthly: 'Insurance',
    hoaFeesMonthly: 'HOA Fees',
    pmiMonthly: 'MIP/PMI',
    helocLimit: 'HELOC Limit',
    helocInterestRate: 'HELOC Interest Rate',
    helocAvailableCredit: 'HELOC Available Credit',
    monthlyGrossIncome: 'Gross Income',
    monthlyNetIncome: 'Net Income',
    monthlyExpenses: 'Monthly Expenses',
    monthlyDiscretionaryIncome: 'Discretionary Income',
    scenarioName: 'Scenario Name'
  }

  return fieldNameMap[fieldName] || fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}