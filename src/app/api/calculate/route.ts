import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validateCalculatorInputs, sanitizeCalculatorInputs } from '@/lib/validation'
import { compareStrategies } from '@/lib/calculations'
import { ApiResponse } from '@/lib/types'
import { applyRateLimit, calculationRateLimit } from '@/lib/rate-limit'
import { applySecurityHeaders, defaultSecurityHeaders } from '@/lib/security-headers'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request, calculationRateLimit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Check authentication (skip in demo mode)
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    let user = null
    if (!isDemoMode) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Authentication required'
        }, { status: 401 })
      }
      user = session.user
    }

    const body = await request.json()

    // Sanitize inputs
    const sanitizedInputs = sanitizeCalculatorInputs(body)

    // Validate inputs
    const validation = validateCalculatorInputs(sanitizedInputs)

    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid input data',
        data: { validationErrors: validation.errors }
      }, { status: 400 })
    }

    // Convert percentage inputs to decimals if needed
    const currentInterestRate = sanitizedInputs.currentInterestRate > 1
      ? sanitizedInputs.currentInterestRate / 100
      : sanitizedInputs.currentInterestRate

    const helocInterestRate = sanitizedInputs.helocInterestRate && sanitizedInputs.helocInterestRate > 1
      ? sanitizedInputs.helocInterestRate / 100
      : sanitizedInputs.helocInterestRate || 0

    // Prepare inputs for calculation
    const mortgageInput = {
      principal: sanitizedInputs.currentMortgageBalance,
      annualInterestRate: currentInterestRate,
      termInMonths: sanitizedInputs.remainingTermMonths,
      currentBalance: sanitizedInputs.currentMortgageBalance,
      monthlyPayment: sanitizedInputs.monthlyPayment
    }

    const helocInput = {
      mortgageBalance: sanitizedInputs.currentMortgageBalance,
      mortgageRate: currentInterestRate,
      mortgagePayment: sanitizedInputs.monthlyPayment,
      helocLimit: sanitizedInputs.helocLimit || 0,
      helocRate: helocInterestRate,
      discretionaryIncome: sanitizedInputs.monthlyDiscretionaryIncome,
      helocAvailableCredit: sanitizedInputs.helocAvailableCredit || sanitizedInputs.helocLimit || 0
    }

    // Perform calculations
    const results = compareStrategies(mortgageInput, helocInput)

    // Format response
    const response = {
      traditional: {
        payoffMonths: results.traditional.payoffMonths,
        totalInterest: Math.round(results.traditional.totalInterest * 100) / 100,
        monthlyPayment: Math.round(results.traditional.monthlyPayment * 100) / 100,
        totalPayments: Math.round(results.traditional.totalPayments * 100) / 100,
        schedule: results.traditional.schedule.map(payment => ({
          month: payment.month,
          beginningBalance: Math.round(payment.beginningBalance * 100) / 100,
          paymentAmount: Math.round(payment.paymentAmount * 100) / 100,
          principalPayment: Math.round(payment.principalPayment * 100) / 100,
          interestPayment: Math.round(payment.interestPayment * 100) / 100,
          endingBalance: Math.round(payment.endingBalance * 100) / 100,
          cumulativeInterest: Math.round(payment.cumulativeInterest * 100) / 100,
          cumulativePrincipal: Math.round(payment.cumulativePrincipal * 100) / 100
        }))
      },
      heloc: {
        payoffMonths: results.heloc.payoffMonths,
        totalInterest: Math.round(results.heloc.totalInterest * 100) / 100,
        totalMortgageInterest: Math.round(results.heloc.totalMortgageInterest * 100) / 100,
        totalHelocInterest: Math.round(results.heloc.totalHelocInterest * 100) / 100,
        maxHelocUsed: Math.round(results.heloc.maxHelocUsed * 100) / 100,
        averageHelocBalance: Math.round(results.heloc.averageHelocBalance * 100) / 100,
        schedule: results.heloc.schedule.map(payment => ({
          month: payment.month,
          beginningBalance: Math.round(payment.beginningBalance * 100) / 100,
          paymentAmount: Math.round(payment.paymentAmount * 100) / 100,
          principalPayment: Math.round(payment.principalPayment * 100) / 100,
          interestPayment: Math.round(payment.interestPayment * 100) / 100,
          endingBalance: Math.round(payment.endingBalance * 100) / 100,
          cumulativeInterest: Math.round(payment.cumulativeInterest * 100) / 100,
          cumulativePrincipal: Math.round(payment.cumulativePrincipal * 100) / 100,
          helocBalance: Math.round(payment.helocBalance * 100) / 100,
          helocPayment: Math.round(payment.helocPayment * 100) / 100,
          helocInterest: Math.round(payment.helocInterest * 100) / 100,
          totalMonthlyPayment: Math.round(payment.totalMonthlyPayment * 100) / 100,
          discretionaryUsed: Math.round(payment.discretionaryUsed * 100) / 100
        }))
      },
      comparison: {
        timeSavedMonths: results.comparison.timeSavedMonths,
        timeSavedYears: Math.round((results.comparison.timeSavedMonths / 12) * 10) / 10,
        interestSaved: Math.round(results.comparison.interestSaved * 100) / 100,
        percentageInterestSaved: Math.round(results.comparison.percentageInterestSaved * 100) / 100,
        monthlyPaymentDifference: Math.round(results.comparison.monthlyPaymentDifference * 100) / 100
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        userId: user?.id || 'demo',
        inputs: sanitizedInputs
      }
    }

    const successResponse = NextResponse.json<ApiResponse>({
      success: true,
      data: response,
      message: 'Calculation completed successfully'
    }, { status: 200 })

    return applySecurityHeaders(successResponse, defaultSecurityHeaders)

  } catch (error) {
    console.error('Calculation error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      const authResponse = NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
      return applySecurityHeaders(authResponse, defaultSecurityHeaders)
    }

    const errorResponse = NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during calculation'
    }, { status: 500 })

    return applySecurityHeaders(errorResponse, defaultSecurityHeaders)
  }
}