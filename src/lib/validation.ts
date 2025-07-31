// Input validation schemas and utilities for HELOC Accelerator

import { calculateLTV, isMIPRequired } from './calculations'
import { errorMonitor, reportFormValidationError } from './error-monitoring'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  data?: any
}

// Validation rules
export const VALIDATION_RULES = {
  mortgageBalance: {
    min: 1000,
    max: 10000000,
    message: 'Mortgage balance must be between $1,000 and $10,000,000. Please check your latest mortgage statement for the principal balance.'
  },
  interestRate: {
    min: 0.001, // 0.1%
    max: 0.30,  // 30%
    message: 'Interest rate must be between 0.1% and 30%. Enter as a percentage (e.g., 6.5 for 6.5%).'
  },
  termMonths: {
    min: 12,    // 1 year
    max: 480,   // 40 years
    message: 'Loan term must be between 1 and 40 years (12-480 months). Check your mortgage documents for remaining term.'
  },
  monthlyPayment: {
    min: 100,
    max: 100000,
    message: 'Monthly payment must be between $100 and $100,000. This should be your principal and interest payment only.'
  },
  helocLimit: {
    min: 1000,
    max: 5000000,
    message: 'HELOC limit must be between $1,000 and $5,000,000. This is your maximum approved credit line.'
  },
  income: {
    min: 1000,
    max: 1000000,
    message: 'Monthly income must be between $1,000 and $1,000,000. Include all sources of regular monthly income.'
  },
  expenses: {
    min: 0,
    max: 500000,
    message: 'Monthly expenses must be between $0 and $500,000. Include all regular monthly bills except your mortgage payment.'
  },
  propertyValue: {
    min: 10000,
    max: 50000000,
    message: 'Original purchase price must be between $10,000 and $50,000,000.'
  },
  pmiMonthly: {
    min: 0,
    max: 5000,
    message: 'MIP/PMI must be between $0 and $5,000 per month. This is required if your loan-to-value ratio exceeds 80%.'
  }
}

// Input interfaces for validation
export interface MortgageValidationInput {
  currentMortgageBalance: number
  currentInterestRate: number
  remainingTermMonths: number
  monthlyPayment: number
  propertyValue?: number
  propertyTaxMonthly?: number
  insuranceMonthly?: number
  hoaFeesMonthly?: number
  pmiMonthly?: number
}

export interface HELOCValidationInput {
  helocLimit: number
  helocInterestRate: number
  helocAvailableCredit?: number
}

export interface IncomeValidationInput {
  monthlyGrossIncome: number
  monthlyNetIncome: number
  monthlyExpenses: number
  monthlyDiscretionaryIncome: number
}

export interface CalculatorValidationInput extends MortgageValidationInput, Partial<HELOCValidationInput>, IncomeValidationInput {
  scenarioName?: string
  description?: string
}

// Validation functions
export function validateNumber(
  value: any,
  fieldName: string,
  rules: { min: number; max: number; message: string },
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = []

  if (required && (value === undefined || value === null || value === '')) {
    const friendlyName = fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()
    errors.push({
      field: fieldName,
      message: `Please enter your ${friendlyName}`
    })
    return errors
  }

  if (!required && (value === undefined || value === null || value === '')) {
    return errors
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    const friendlyName = fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()
    errors.push({
      field: fieldName,
      message: `Please enter a valid number for ${friendlyName}`
    })
    return errors
  }

  if (numValue < rules.min || numValue > rules.max) {
    errors.push({
      field: fieldName,
      message: rules.message
    })
  }

  return errors
}

export function validatePercentage(
  value: any,
  fieldName: string,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = []

  if (required && (value === undefined || value === null || value === '')) {
    errors.push({
      field: fieldName,
      message: `Please enter the ${fieldName.toLowerCase().replace('current', '').replace('monthly', '').trim()}`
    })
    return errors
  }

  if (!required && (value === undefined || value === null || value === '')) {
    return errors
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    errors.push({
      field: fieldName,
      message: `Please enter a valid percentage (e.g., 6.5 for 6.5%)`
    })
    return errors
  }

  // Convert percentage to decimal if it's > 1 (assume user entered as percentage)
  const decimalValue = numValue > 1 ? numValue / 100 : numValue

  if (decimalValue < 0.001) {
    errors.push({
      field: fieldName,
      message: 'Interest rate must be at least 0.1%. Please enter as a percentage (e.g., 6.5 for 6.5%).'
    })
  } else if (decimalValue > 0.30) {
    errors.push({
      field: fieldName,
      message: 'Interest rate cannot exceed 30%. Please verify and enter as a percentage (e.g., 6.5 for 6.5%).'
    })
  }

  return errors
}

export function validateMortgageInputs(input: MortgageValidationInput): ValidationResult {
  const errors: ValidationError[] = []

  // Validate mortgage balance
  if (input.currentMortgageBalance <= 0) {
    errors.push({
      field: 'currentMortgageBalance',
      message: 'Mortgage balance must be greater than $0. Please enter your current principal balance.'
    })
  } else {
    errors.push(...validateNumber(
      input.currentMortgageBalance,
      'currentMortgageBalance',
      VALIDATION_RULES.mortgageBalance
    ))
  }

  // Validate interest rate
  if (input.currentInterestRate < 0) {
    errors.push({
      field: 'currentInterestRate',
      message: 'Interest rate cannot be negative. Please enter your current mortgage rate as a percentage (e.g., 6.5 for 6.5%).'
    })
  } else if (input.currentInterestRate > 30) {
    errors.push({
      field: 'currentInterestRate',
      message: 'Interest rate seems too high (maximum 30%). Please verify your rate and enter as a percentage (e.g., 6.5 for 6.5%).'
    })
  }

  // Validate term
  if (input.remainingTermMonths < 1) {
    errors.push({
      field: 'remainingTermMonths',
      message: 'Remaining term must be at least 1 month. Please check your mortgage statement for the exact number of months remaining.'
    })
  } else if (input.remainingTermMonths > 600) {
    errors.push({
      field: 'remainingTermMonths',
      message: 'Remaining term cannot exceed 600 months (50 years). Please verify the number of months remaining on your mortgage.'
    })
  }

  // Validate monthly payment
  errors.push(...validateNumber(
    input.monthlyPayment,
    'monthlyPayment',
    VALIDATION_RULES.monthlyPayment
  ))

  // Validate optional fields
  if (input.propertyValue !== undefined) {
    errors.push(...validateNumber(
      input.propertyValue,
      'propertyValue',
      VALIDATION_RULES.propertyValue,
      false
    ))
  }

  if (input.propertyTaxMonthly !== undefined) {
    errors.push(...validateNumber(
      input.propertyTaxMonthly,
      'propertyTaxMonthly',
      { min: 0, max: 50000, message: 'Property tax must be between $0 and $50,000' },
      false
    ))
  }

  if (input.insuranceMonthly !== undefined) {
    errors.push(...validateNumber(
      input.insuranceMonthly,
      'insuranceMonthly',
      { min: 0, max: 10000, message: 'Insurance must be between $0 and $10,000' },
      false
    ))
  }

  if (input.hoaFeesMonthly !== undefined) {
    errors.push(...validateNumber(
      input.hoaFeesMonthly,
      'hoaFeesMonthly',
      { min: 0, max: 5000, message: 'HOA fees must be between $0 and $5,000' },
      false
    ))
  }

  if (input.pmiMonthly !== undefined) {
    errors.push(...validateNumber(
      input.pmiMonthly,
      'pmiMonthly',
      VALIDATION_RULES.pmiMonthly,
      false
    ))
  }

  // Validate LTV-based MIP/PMI requirements
  if (input.propertyValue !== undefined && input.currentMortgageBalance !== undefined) {
    try {
      const ltvRatio = calculateLTV(input.currentMortgageBalance, input.propertyValue)

      // If LTV > 80%, MIP/PMI should be provided
      if (isMIPRequired(ltvRatio) && (input.pmiMonthly === undefined || input.pmiMonthly === 0)) {
        const errorMessage = `MIP/PMI is required when LTV exceeds 80% (current LTV: ${ltvRatio.toFixed(1)}%)`
        errors.push({
          field: 'pmiMonthly',
          message: errorMessage
        })

        // Report validation error for monitoring
        reportFormValidationError(
          'MortgageValidation',
          'pmiMonthly',
          input.pmiMonthly,
          'ltvBasedRequirement',
          errorMessage
        )
      }

      // If LTV <= 80%, warn if PMI is still being paid (but don't block calculation)
      // This is just informational - some loans may still require PMI even with low LTV
      if (!isMIPRequired(ltvRatio) && input.pmiMonthly && input.pmiMonthly > 0) {
        const warningMessage = `MIP/PMI may not be required when LTV is ${ltvRatio.toFixed(1)}% (≤80%). Consider removing PMI.`
        // Log the warning but don't add it to validation errors
        console.info('PMI Warning:', warningMessage)
        
        // Report validation warning for monitoring
        reportFormValidationError(
          'MortgageValidation',
          'pmiMonthly',
          input.pmiMonthly,
          'ltvBasedWarning',
          warningMessage
        )
      }
    } catch (error) {
      // LTV calculation failed - report this error
      console.warn('LTV calculation failed during validation:', error)
      errorMonitor.reportCalculationError(
        'ltv',
        { loanAmount: input.currentMortgageBalance, propertyValue: input.propertyValue },
        `LTV calculation failed during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateHELOCInputs(input: HELOCValidationInput): ValidationResult {
  const errors: ValidationError[] = []

  // Validate HELOC limit
  if (input.helocLimit <= 0) {
    errors.push({
      field: 'helocLimit',
      message: 'HELOC limit must be greater than $0. Please enter your approved HELOC credit limit.'
    })
  } else {
    errors.push(...validateNumber(
      input.helocLimit,
      'helocLimit',
      VALIDATION_RULES.helocLimit
    ))
  }

  // Validate HELOC interest rate
  errors.push(...validatePercentage(
    input.helocInterestRate,
    'helocInterestRate'
  ))

  // Validate available credit (optional)
  if (input.helocAvailableCredit !== undefined) {
    errors.push(...validateNumber(
      input.helocAvailableCredit,
      'helocAvailableCredit',
      VALIDATION_RULES.helocLimit,
      false
    ))

    // Available credit should not exceed limit
    if (input.helocAvailableCredit > input.helocLimit) {
      errors.push({
        field: 'helocAvailableCredit',
        message: `Available credit ($${input.helocAvailableCredit.toLocaleString()}) cannot exceed your HELOC limit ($${input.helocLimit.toLocaleString()}). Please verify both amounts.`
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateIncomeInputs(input: IncomeValidationInput): ValidationResult {
  const errors: ValidationError[] = []

  // Validate gross income
  errors.push(...validateNumber(
    input.monthlyGrossIncome,
    'monthlyGrossIncome',
    VALIDATION_RULES.income
  ))

  // Validate net income
  errors.push(...validateNumber(
    input.monthlyNetIncome,
    'monthlyNetIncome',
    VALIDATION_RULES.income
  ))

  // Validate expenses
  errors.push(...validateNumber(
    input.monthlyExpenses,
    'monthlyExpenses',
    VALIDATION_RULES.expenses
  ))

  // Validate discretionary income
  errors.push(...validateNumber(
    input.monthlyDiscretionaryIncome,
    'monthlyDiscretionaryIncome',
    { min: 0, max: 500000, message: 'Discretionary income must be between $0 and $500,000' }
  ))

  // Business logic validations
  if (!isNaN(input.monthlyNetIncome) && !isNaN(input.monthlyGrossIncome)) {
    if (input.monthlyNetIncome > input.monthlyGrossIncome) {
      errors.push({
        field: 'monthlyNetIncome',
        message: `Net income ($${input.monthlyNetIncome.toLocaleString()}) cannot exceed gross income ($${input.monthlyGrossIncome.toLocaleString()}). Net income should be your take-home pay after taxes.`
      })
    }
  }

  if (!isNaN(input.monthlyExpenses) && !isNaN(input.monthlyNetIncome)) {
    if (input.monthlyExpenses > input.monthlyNetIncome) {
      const deficit = input.monthlyExpenses - input.monthlyNetIncome
      errors.push({
        field: 'monthlyExpenses',
        message: `Monthly expenses ($${input.monthlyExpenses.toLocaleString()}) exceed net income by $${deficit.toLocaleString()}. HELOC acceleration requires positive cash flow. Please verify your expenses.`
      })
    }
  }

  if (!isNaN(input.monthlyDiscretionaryIncome) && !isNaN(input.monthlyNetIncome) && !isNaN(input.monthlyExpenses)) {
    const calculatedDiscretionary = input.monthlyNetIncome - input.monthlyExpenses
    const tolerance = 50 // Allow $50 tolerance for rounding

    if (Math.abs(input.monthlyDiscretionaryIncome - calculatedDiscretionary) > tolerance) {
      errors.push({
        field: 'monthlyDiscretionaryIncome',
        message: `Discretionary income should be $${calculatedDiscretionary.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (Net Income: $${input.monthlyNetIncome.toLocaleString()} - Expenses: $${input.monthlyExpenses.toLocaleString()}). This is the amount available for accelerating your mortgage payoff.`
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateCalculatorInputs(input: CalculatorValidationInput): ValidationResult {
  const errors: ValidationError[] = []

  console.log('=== API VALIDATION START ===', input)

  // Validate mortgage inputs
  console.log('Validating mortgage inputs...')
  const mortgageValidation = validateMortgageInputs(input)
  console.log('Mortgage validation result:', mortgageValidation)
  errors.push(...mortgageValidation.errors)

  // Validate HELOC inputs only if provided
  if (input.helocLimit !== undefined || input.helocInterestRate !== undefined) {
    console.log('Validating HELOC inputs...')
    const helocValidation = validateHELOCInputs(input as HELOCValidationInput)
    console.log('HELOC validation result:', helocValidation)
    errors.push(...helocValidation.errors)
  }

  // Validate income inputs
  console.log('Validating income inputs...')
  const incomeValidation = validateIncomeInputs(input)
  console.log('Income validation result:', incomeValidation)
  errors.push(...incomeValidation.errors)

  // Cross-validation between sections
  console.log('Performing cross-validation checks...')
  
  if (input.helocLimit && input.helocAvailableCredit && input.helocAvailableCredit > input.helocLimit) {
    console.log('HELOC credit validation failed:', { limit: input.helocLimit, available: input.helocAvailableCredit })
    errors.push({
      field: 'helocAvailableCredit',
      message: `Available credit ($${input.helocAvailableCredit.toLocaleString()}) cannot exceed your HELOC limit ($${input.helocLimit.toLocaleString()}). Please check your HELOC statement for the correct amounts.`
    })
  }

  // Note: Removed mortgage vs property value check - underwater mortgages are valid scenarios

  // Validate scenario name if provided
  if (input.scenarioName !== undefined && input.scenarioName.trim().length === 0) {
    errors.push({
      field: 'scenarioName',
      message: 'Please provide a name for this scenario (e.g., "Current Mortgage" or "HELOC Strategy")'
    })
  }

  if (input.scenarioName && input.scenarioName.length > 255) {
    errors.push({
      field: 'scenarioName',
      message: `Scenario name is too long (${input.scenarioName.length} characters). Please use a shorter name (maximum 255 characters).`
    })
  }

  console.log('=== API VALIDATION END ===')
  console.log('Total validation errors:', errors.length)
  console.log('All validation errors:', errors)

  return {
    isValid: errors.length === 0,
    errors,
    data: input
  }
}

// Alias for backward compatibility and test expectations
export const validateCalculatorInput = validateCalculatorInputs

// Utility function to sanitize and normalize inputs
export function sanitizeCalculatorInputs(input: any): CalculatorValidationInput {
  return {
    currentMortgageBalance: parseFloat(input.currentMortgageBalance) || 0,
    currentInterestRate: parseFloat(input.currentInterestRate) || 0,
    remainingTermMonths: parseInt(input.remainingTermMonths) || 0,
    monthlyPayment: parseFloat(input.monthlyPayment) || 0,
    propertyValue: input.propertyValue ? parseFloat(input.propertyValue) : undefined,
    propertyTaxMonthly: input.propertyTaxMonthly ? parseFloat(input.propertyTaxMonthly) : undefined,
    insuranceMonthly: input.insuranceMonthly ? parseFloat(input.insuranceMonthly) : undefined,
    hoaFeesMonthly: input.hoaFeesMonthly ? parseFloat(input.hoaFeesMonthly) : undefined,
    pmiMonthly: input.pmiMonthly ? parseFloat(input.pmiMonthly) : undefined,
    helocLimit: parseFloat(input.helocLimit) || 0,
    helocInterestRate: parseFloat(input.helocInterestRate) || 0,
    helocAvailableCredit: input.helocAvailableCredit ? parseFloat(input.helocAvailableCredit) : undefined,
    monthlyGrossIncome: parseFloat(input.monthlyGrossIncome) || 0,
    monthlyNetIncome: parseFloat(input.monthlyNetIncome) || 0,
    monthlyExpenses: parseFloat(input.monthlyExpenses) || 0,
    monthlyDiscretionaryIncome: parseFloat(input.monthlyDiscretionaryIncome) || 0,
    scenarioName: input.scenarioName ? input.scenarioName.trim() : undefined,
    description: input.description ? input.description.trim() : undefined
  }
}