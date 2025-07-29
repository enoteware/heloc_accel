// Custom error types for HELOC Accelerator

export enum ErrorCode {
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INTEREST_RATE = 'INVALID_INTEREST_RATE',
  INVALID_LOAN_TERM = 'INVALID_LOAN_TERM',
  INVALID_PAYMENT = 'INVALID_PAYMENT',
  
  // Calculation errors
  NEGATIVE_AMORTIZATION = 'NEGATIVE_AMORTIZATION',
  INSUFFICIENT_PAYMENT = 'INSUFFICIENT_PAYMENT',
  CALCULATION_OVERFLOW = 'CALCULATION_OVERFLOW',
  INVALID_CALCULATION_INPUT = 'INVALID_CALCULATION_INPUT',
  
  // Business logic errors
  HELOC_EXCEEDS_LIMIT = 'HELOC_EXCEEDS_LIMIT',
  INSUFFICIENT_DISCRETIONARY = 'INSUFFICIENT_DISCRETIONARY',
  UNDERWATER_MORTGAGE = 'UNDERWATER_MORTGAGE',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ErrorDetails {
  code: ErrorCode
  message: string
  userMessage: string
  suggestion?: string
  field?: string
  value?: any
}

export class CalculationError extends Error {
  code: ErrorCode
  userMessage: string
  suggestion?: string
  field?: string
  value?: any

  constructor(details: ErrorDetails) {
    super(details.message)
    this.name = 'CalculationError'
    this.code = details.code
    this.userMessage = details.userMessage
    this.suggestion = details.suggestion
    this.field = details.field
    this.value = details.value
  }
}

// Error message templates with user-friendly messages and suggestions
export const ERROR_MESSAGES: Record<ErrorCode, (params?: any) => ErrorDetails> = {
  [ErrorCode.VALIDATION_FAILED]: (params) => ({
    code: ErrorCode.VALIDATION_FAILED,
    message: 'Input validation failed',
    userMessage: 'Please check your input values',
    suggestion: 'Review the highlighted fields and ensure all values are within acceptable ranges',
    ...params
  }),

  [ErrorCode.INVALID_INTEREST_RATE]: (params) => ({
    code: ErrorCode.INVALID_INTEREST_RATE,
    message: `Invalid interest rate: ${params?.value}`,
    userMessage: 'The interest rate appears to be invalid',
    suggestion: 'Interest rates should be between 0.1% and 30%. For example, enter 6.5 for 6.5%',
    field: 'interestRate',
    ...params
  }),

  [ErrorCode.INVALID_LOAN_TERM]: (params) => ({
    code: ErrorCode.INVALID_LOAN_TERM,
    message: `Invalid loan term: ${params?.value} months`,
    userMessage: 'The loan term seems unusually short or long',
    suggestion: params?.value < 12 
      ? 'Did you mean to enter years instead of months? A typical mortgage is 15-30 years (180-360 months)'
      : 'Loan terms are typically between 1 and 40 years (12-480 months)',
    field: 'loanTerm',
    ...params
  }),

  [ErrorCode.INVALID_PAYMENT]: (params) => ({
    code: ErrorCode.INVALID_PAYMENT,
    message: `Invalid payment amount: ${params?.value}`,
    userMessage: 'The payment amount appears to be invalid',
    suggestion: 'Please enter a valid monthly payment amount. This should be a positive number representing your current monthly mortgage payment.',
    field: 'monthlyPayment',
    ...params
  }),

  [ErrorCode.NEGATIVE_AMORTIZATION]: (params) => ({
    code: ErrorCode.NEGATIVE_AMORTIZATION,
    message: `Monthly payment ($${params?.payment}) is less than monthly interest ($${params?.interest})`,
    userMessage: 'Your monthly payment is too low to cover the interest',
    suggestion: 'This would cause your loan balance to increase over time. Please check:\n• Your monthly payment amount\n• Your interest rate\n• Your remaining loan term',
    field: 'monthlyPayment',
    ...params
  }),

  [ErrorCode.INSUFFICIENT_PAYMENT]: (params) => ({
    code: ErrorCode.INSUFFICIENT_PAYMENT,
    message: 'Monthly payment insufficient to pay off loan',
    userMessage: 'The monthly payment is too low for the loan terms',
    suggestion: `Based on your balance and interest rate, the minimum payment should be at least $${params?.minPayment}`,
    field: 'monthlyPayment',
    ...params
  }),

  [ErrorCode.HELOC_EXCEEDS_LIMIT]: (params) => ({
    code: ErrorCode.HELOC_EXCEEDS_LIMIT,
    message: 'HELOC usage would exceed credit limit',
    userMessage: 'The HELOC strategy would require more credit than available',
    suggestion: 'Consider:\n• Increasing your HELOC limit\n• Reducing your monthly discretionary income\n• Using a smaller initial HELOC draw',
    ...params
  }),

  [ErrorCode.INSUFFICIENT_DISCRETIONARY]: (params) => ({
    code: ErrorCode.INSUFFICIENT_DISCRETIONARY,
    message: 'Insufficient discretionary income for HELOC strategy',
    userMessage: 'Your discretionary income is too low for the HELOC acceleration strategy',
    suggestion: 'The HELOC strategy requires positive discretionary income. Try:\n• Reducing your monthly expenses\n• Increasing your income\n• Considering a traditional payoff approach',
    field: 'monthlyDiscretionaryIncome',
    ...params
  }),

  [ErrorCode.UNDERWATER_MORTGAGE]: (params) => ({
    code: ErrorCode.UNDERWATER_MORTGAGE,
    message: 'Mortgage balance exceeds property value',
    userMessage: 'Your mortgage balance is higher than your property value',
    suggestion: 'This is common and doesn\'t prevent using the calculator. However, you may have limited HELOC options until you build more equity.',
    ...params
  }),

  [ErrorCode.CALCULATION_OVERFLOW]: (params) => ({
    code: ErrorCode.CALCULATION_OVERFLOW,
    message: 'Calculation resulted in overflow',
    userMessage: 'The calculation produced numbers too large to process',
    suggestion: 'Please check your input values, particularly:\n• Loan balance (should be in dollars, not cents)\n• Interest rates (should be percentages, like 6.5 for 6.5%)',
    ...params
  }),

  [ErrorCode.DATABASE_ERROR]: () => ({
    code: ErrorCode.DATABASE_ERROR,
    message: 'Database operation failed',
    userMessage: 'Unable to save or retrieve data',
    suggestion: 'Please try again. If the problem persists, your data is safe in local storage.'
  }),

  [ErrorCode.AUTHENTICATION_REQUIRED]: () => ({
    code: ErrorCode.AUTHENTICATION_REQUIRED,
    message: 'Authentication required',
    userMessage: 'Please sign in to continue',
    suggestion: 'You need to be logged in to use this feature. Click "Sign In" to continue.'
  }),

  [ErrorCode.RATE_LIMIT_EXCEEDED]: () => ({
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded',
    userMessage: 'Too many calculations in a short time',
    suggestion: 'Please wait a moment before trying again. The limit resets every minute.'
  }),

  [ErrorCode.INTERNAL_ERROR]: () => ({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end',
    suggestion: 'Please try again. If the issue persists, try refreshing the page.'
  }),

  [ErrorCode.INVALID_CALCULATION_INPUT]: (params) => ({
    code: ErrorCode.INVALID_CALCULATION_INPUT,
    message: `Invalid calculation input: ${params?.field}`,
    userMessage: 'One or more calculation inputs are invalid',
    suggestion: 'Please review your inputs and ensure all required fields are filled correctly.',
    field: params?.field,
    ...params
  })
}

// Helper function to create user-friendly error responses
export function createErrorResponse(code: ErrorCode, params?: any): ErrorDetails {
  const errorTemplate = ERROR_MESSAGES[code]
  if (!errorTemplate) {
    return ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR]()
  }
  return errorTemplate(params)
}

// Helper to extract error details from unknown errors
export function extractErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof CalculationError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      suggestion: error.suggestion,
      field: error.field,
      value: error.value
    }
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('Monthly payment') && error.message.includes('less than monthly interest')) {
      const paymentMatch = error.message.match(/\$(\d+\.?\d*)/)
      const interestMatch = error.message.match(/interest \(\$(\d+\.?\d*)/)
      return createErrorResponse(ErrorCode.NEGATIVE_AMORTIZATION, {
        payment: paymentMatch?.[1],
        interest: interestMatch?.[1]
      })
    }

    if (error.message.includes('Authentication required')) {
      return createErrorResponse(ErrorCode.AUTHENTICATION_REQUIRED)
    }

    if (error.message.includes('Rate limit')) {
      return createErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED)
    }
  }

  // Default to internal error
  return createErrorResponse(ErrorCode.INTERNAL_ERROR)
}