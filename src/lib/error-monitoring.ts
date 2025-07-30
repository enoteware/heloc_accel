// Error monitoring and reporting system for LTV/PMI functionality

import { debugLogger } from './debug-utils'

export interface ErrorReport {
  id: string
  timestamp: string
  type: 'calculation' | 'validation' | 'form' | 'ui' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  context: any
  stackTrace?: string
  userAgent?: string
  url?: string
  userId?: string
}

export interface ValidationErrorReport extends ErrorReport {
  type: 'validation'
  fieldName: string
  fieldValue: any
  formName: string
  validationRule: string
}

export interface CalculationErrorReport extends ErrorReport {
  type: 'calculation'
  calculationType: 'ltv' | 'pmi' | 'mortgage' | 'heloc'
  inputs: any
  expectedOutput?: any
  actualOutput?: any
}

class ErrorMonitor {
  private errors: ErrorReport[] = []
  private maxErrors = 500
  private isEnabled = true

  constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    }
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleGlobalError(event: ErrorEvent) {
    this.reportError({
      type: 'ui',
      severity: 'high',
      message: event.message,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      stackTrace: event.error?.stack
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.reportError({
      type: 'network',
      severity: 'medium',
      message: `Unhandled promise rejection: ${event.reason}`,
      context: { reason: event.reason },
      stackTrace: event.reason?.stack
    })
  }

  reportError(errorData: Omit<ErrorReport, 'id' | 'timestamp' | 'userAgent' | 'url'>): string {
    const error: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      ...errorData
    }

    this.errors.push(error)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to debug system
    debugLogger.log('error', 'calculation', `Error reported: ${error.message}`, error)

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR MONITOR] ${error.type.toUpperCase()}: ${error.message}`, error)
    }

    return error.id
  }

  reportValidationError(
    formName: string,
    fieldName: string,
    fieldValue: any,
    validationRule: string,
    message: string,
    context?: any
  ): string {
    return this.reportError({
      type: 'validation',
      severity: 'low',
      message,
      context: {
        formName,
        fieldName,
        fieldValue,
        validationRule,
        ...context
      }
    })
  }

  reportCalculationError(
    calculationType: CalculationErrorReport['calculationType'],
    inputs: any,
    message: string,
    error?: Error,
    expectedOutput?: any,
    actualOutput?: any
  ): string {
    return this.reportError({
      type: 'calculation',
      severity: 'high',
      message,
      context: {
        calculationType,
        inputs,
        expectedOutput,
        actualOutput
      },
      stackTrace: error?.stack
    })
  }

  getErrors(type?: ErrorReport['type'], severity?: ErrorReport['severity']): ErrorReport[] {
    let filteredErrors = this.errors

    if (type) {
      filteredErrors = filteredErrors.filter(error => error.type === type)
    }

    if (severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === severity)
    }

    return filteredErrors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getErrorSummary(): {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    recent: ErrorReport[]
  } {
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      recent: this.errors.slice(-10)
    }
  }

  exportErrors(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: this.getErrorSummary(),
      errors: this.errors,
      environment: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        nodeEnv: process.env.NODE_ENV
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  clearErrors() {
    this.errors = []
    debugLogger.log('info', 'calculation', 'Error monitor cleared')
  }

  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor()

// Utility functions for specific error scenarios
export function reportLTVCalculationError(
  loanAmount: any,
  propertyValue: any,
  error: Error,
  expectedLTV?: number
): string {
  return errorMonitor.reportCalculationError(
    'ltv',
    { loanAmount, propertyValue },
    `LTV calculation failed: ${error.message}`,
    error,
    expectedLTV
  )
}

export function reportPMICalculationError(
  ltvRatio: number,
  loanAmount: number,
  error: Error,
  expectedPMI?: number
): string {
  return errorMonitor.reportCalculationError(
    'pmi',
    { ltvRatio, loanAmount },
    `PMI calculation failed: ${error.message}`,
    error,
    expectedPMI
  )
}

export function reportFormValidationError(
  formName: string,
  fieldName: string,
  fieldValue: any,
  validationRule: string,
  errorMessage: string
): string {
  return errorMonitor.reportValidationError(
    formName,
    fieldName,
    fieldValue,
    validationRule,
    errorMessage
  )
}

// Error boundary helper for React components
export function withErrorMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args)
    } catch (error) {
      errorMonitor.reportError({
        type: 'ui',
        severity: 'medium',
        message: `Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: { args, functionName: fn.name },
        stackTrace: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }) as T
}

// Global error monitoring utilities for browser console
if (typeof window !== 'undefined') {
  (window as any).errorMonitor = {
    getErrors: (type?: string, severity?: string) => errorMonitor.getErrors(type as any, severity as any),
    getSummary: () => errorMonitor.getErrorSummary(),
    export: () => errorMonitor.exportErrors(),
    clear: () => errorMonitor.clearErrors(),
    report: (type: string, severity: string, message: string, context?: any) => 
      errorMonitor.reportError({ type: type as any, severity: severity as any, message, context })
  }
}
