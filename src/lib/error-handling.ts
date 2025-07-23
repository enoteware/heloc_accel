// Error handling utilities for HELOC Accelerator

export class CalculationError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message)
    this.name = 'CalculationError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string, public value?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class MathematicalError extends Error {
  constructor(message: string, public operation: string, public inputs?: any) {
    super(message)
    this.name = 'MathematicalError'
  }
}

// Error codes for different types of calculation errors
export const ERROR_CODES = {
  INVALID_INTEREST_RATE: 'INVALID_INTEREST_RATE',
  INVALID_LOAN_AMOUNT: 'INVALID_LOAN_AMOUNT',
  INVALID_TERM: 'INVALID_TERM',
  PAYMENT_TOO_LOW: 'PAYMENT_TOO_LOW',
  HELOC_LIMIT_EXCEEDED: 'HELOC_LIMIT_EXCEEDED',
  NEGATIVE_CASH_FLOW: 'NEGATIVE_CASH_FLOW',
  CALCULATION_OVERFLOW: 'CALCULATION_OVERFLOW',
  INFINITE_LOOP: 'INFINITE_LOOP',
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO'
} as const

// Validation functions for edge cases
export function validateCalculationInputs(inputs: any): void {
  // Check for zero or negative interest rates
  if (inputs.annualInterestRate <= 0) {
    throw new CalculationError(
      'Interest rate must be greater than 0',
      ERROR_CODES.INVALID_INTEREST_RATE,
      { rate: inputs.annualInterestRate }
    )
  }

  // Check for extremely high interest rates (likely input error)
  if (inputs.annualInterestRate > 0.50) { // 50%
    throw new CalculationError(
      'Interest rate seems unusually high (>50%)',
      ERROR_CODES.INVALID_INTEREST_RATE,
      { rate: inputs.annualInterestRate }
    )
  }

  // Check for zero or negative principal
  if (inputs.principal <= 0) {
    throw new CalculationError(
      'Loan amount must be greater than 0',
      ERROR_CODES.INVALID_LOAN_AMOUNT,
      { principal: inputs.principal }
    )
  }

  // Check for zero or negative term
  if (inputs.termInMonths <= 0) {
    throw new CalculationError(
      'Loan term must be greater than 0 months',
      ERROR_CODES.INVALID_TERM,
      { term: inputs.termInMonths }
    )
  }

  // Check if monthly payment is too low to cover interest
  if (inputs.monthlyPayment) {
    const monthlyInterest = inputs.principal * (inputs.annualInterestRate / 12)
    if (inputs.monthlyPayment <= monthlyInterest) {
      throw new CalculationError(
        'Monthly payment is too low to cover interest charges',
        ERROR_CODES.PAYMENT_TOO_LOW,
        {
          payment: inputs.monthlyPayment,
          minimumRequired: monthlyInterest
        }
      )
    }
  }
}

export function validateHELOCInputs(inputs: any): void {
  // Check HELOC limit vs mortgage balance
  if (inputs.helocLimit && inputs.mortgageBalance) {
    if (inputs.helocLimit > inputs.mortgageBalance * 2) {
      console.warn('HELOC limit is very high relative to mortgage balance')
    }
  }

  // Check for negative discretionary income
  if (inputs.discretionaryIncome < 0) {
    throw new CalculationError(
      'Discretionary income cannot be negative',
      ERROR_CODES.NEGATIVE_CASH_FLOW,
      { discretionaryIncome: inputs.discretionaryIncome }
    )
  }

  // Check HELOC rate vs mortgage rate
  if (inputs.helocRate && inputs.mortgageRate) {
    if (inputs.helocRate > inputs.mortgageRate + 0.10) { // 10% higher
      console.warn('HELOC rate is significantly higher than mortgage rate - strategy may not be beneficial')
    }
  }
}

// Safe mathematical operations
export function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  if (denominator === 0) {
    throw new MathematicalError(
      'Division by zero',
      'division',
      { numerator, denominator }
    )
  }

  if (!isFinite(numerator) || !isFinite(denominator)) {
    throw new MathematicalError(
      'Invalid numbers in division',
      'division',
      { numerator, denominator }
    )
  }

  const result = numerator / denominator

  if (!isFinite(result)) {
    throw new MathematicalError(
      'Division resulted in infinite or NaN',
      'division',
      { numerator, denominator, result }
    )
  }

  return result
}

export function safePower(base: number, exponent: number): number {
  if (!isFinite(base) || !isFinite(exponent)) {
    throw new MathematicalError(
      'Invalid numbers in power operation',
      'power',
      { base, exponent }
    )
  }

  const result = Math.pow(base, exponent)

  if (!isFinite(result)) {
    throw new MathematicalError(
      'Power operation resulted in infinite or NaN',
      'power',
      { base, exponent, result }
    )
  }

  return result
}

// Iteration safety
export function createIterationGuard(maxIterations: number = 600): () => void {
  let count = 0

  return () => {
    count++
    if (count > maxIterations) {
      throw new CalculationError(
        `Calculation exceeded maximum iterations (${maxIterations})`,
        ERROR_CODES.INFINITE_LOOP,
        { iterations: count }
      )
    }
  }
}

// Number formatting and validation
export function formatCurrency(amount: number): string {
  if (!isFinite(amount)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatPercentage(rate: number): string {
  if (!isFinite(rate)) {
    return '0.00%'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rate)
}

// Error recovery functions
export function recoverFromCalculationError(error: Error, fallbackValue?: any): any {
  console.error('Calculation error occurred:', error)

  if (error instanceof CalculationError) {
    // Log specific calculation errors for debugging
    console.error('Calculation Error Details:', {
      code: error.code,
      details: error.details,
      message: error.message
    })
  }

  return fallbackValue || {
    error: true,
    message: error.message,
    type: error.name
  }
}

// Input sanitization
export function sanitizeNumericInput(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  if (typeof value === 'string') {
    // Remove currency symbols, commas, and other non-numeric characters
    const cleaned = value.replace(/[$,\s%]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }

  return 0
}