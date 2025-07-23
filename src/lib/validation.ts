// Input validation schemas and utilities for HELOC Accelerator

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
const VALIDATION_RULES = {
  mortgageBalance: {
    min: 1000,
    max: 10000000,
    message: 'Mortgage balance must be between $1,000 and $10,000,000'
  },
  interestRate: {
    min: 0.001, // 0.1%
    max: 0.30,  // 30%
    message: 'Interest rate must be between 0.1% and 30%'
  },
  termMonths: {
    min: 12,    // 1 year
    max: 480,   // 40 years
    message: 'Loan term must be between 1 and 40 years'
  },
  monthlyPayment: {
    min: 100,
    max: 100000,
    message: 'Monthly payment must be between $100 and $100,000'
  },
  helocLimit: {
    min: 1000,
    max: 5000000,
    message: 'HELOC limit must be between $1,000 and $5,000,000'
  },
  income: {
    min: 1000,
    max: 1000000,
    message: 'Monthly income must be between $1,000 and $1,000,000'
  },
  expenses: {
    min: 0,
    max: 500000,
    message: 'Monthly expenses must be between $0 and $500,000'
  },
  propertyValue: {
    min: 10000,
    max: 50000000,
    message: 'Property value must be between $10,000 and $50,000,000'
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
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`
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
      message: `${fieldName} must be a valid number`
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
      message: `${fieldName} is required`
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
      message: `${fieldName} must be a valid percentage`
    })
    return errors
  }

  // Convert percentage to decimal if it's > 1 (assume user entered as percentage)
  const decimalValue = numValue > 1 ? numValue / 100 : numValue

  if (decimalValue < 0.001 || decimalValue > 0.30) {
    errors.push({
      field: fieldName,
      message: 'Interest rate must be between 0.1% and 30%'
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
      message: 'Current mortgage balance must be positive'
    })
  } else {
    errors.push(...validateNumber(
      input.currentMortgageBalance,
      'currentMortgageBalance',
      VALIDATION_RULES.mortgageBalance
    ))
  }

  // Validate interest rate
  if (input.currentInterestRate < 0 || input.currentInterestRate > 30) {
    errors.push({
      field: 'currentInterestRate',
      message: 'Interest rate must be between 0 and 30%'
    })
  }

  // Validate term
  if (input.remainingTermMonths < 1 || input.remainingTermMonths > 600) {
    errors.push({
      field: 'remainingTermMonths',
      message: 'Remaining term must be between 1 and 600 months'
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
      message: 'HELOC limit must be positive'
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
        message: 'Available credit cannot exceed HELOC limit'
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
        message: 'Net income cannot be higher than gross income'
      })
    }
  }

  if (!isNaN(input.monthlyExpenses) && !isNaN(input.monthlyNetIncome)) {
    if (input.monthlyExpenses > input.monthlyNetIncome) {
      errors.push({
        field: 'monthlyExpenses',
        message: 'Monthly expenses cannot exceed net income'
      })
    }
  }

  if (!isNaN(input.monthlyDiscretionaryIncome) && !isNaN(input.monthlyNetIncome) && !isNaN(input.monthlyExpenses)) {
    const calculatedDiscretionary = input.monthlyNetIncome - input.monthlyExpenses
    const tolerance = 50 // Allow $50 tolerance for rounding

    if (Math.abs(input.monthlyDiscretionaryIncome - calculatedDiscretionary) > tolerance) {
      errors.push({
        field: 'monthlyDiscretionaryIncome',
        message: `Discretionary income should equal net income minus expenses (${calculatedDiscretionary.toFixed(2)})`
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

  // Validate mortgage inputs
  const mortgageValidation = validateMortgageInputs(input)
  errors.push(...mortgageValidation.errors)

  // Validate HELOC inputs only if provided
  if (input.helocLimit !== undefined || input.helocInterestRate !== undefined) {
    const helocValidation = validateHELOCInputs(input as HELOCValidationInput)
    errors.push(...helocValidation.errors)
  }

  // Validate income inputs
  const incomeValidation = validateIncomeInputs(input)
  errors.push(...incomeValidation.errors)

  // Cross-validation between sections
  if (input.helocLimit && input.helocAvailableCredit && input.helocAvailableCredit > input.helocLimit) {
    errors.push({
      field: 'helocAvailableCredit',
      message: 'HELOC available credit cannot exceed HELOC limit'
    })
  }

  if (input.propertyValue && input.currentMortgageBalance > input.propertyValue) {
    errors.push({
      field: 'currentMortgageBalance',
      message: 'Mortgage balance cannot exceed property value'
    })
  }

  // Validate scenario name if provided
  if (input.scenarioName !== undefined && input.scenarioName.trim().length === 0) {
    errors.push({
      field: 'scenarioName',
      message: 'Scenario name is required'
    })
  }

  if (input.scenarioName && input.scenarioName.length > 255) {
    errors.push({
      field: 'scenarioName',
      message: 'Scenario name must be less than 255 characters'
    })
  }

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