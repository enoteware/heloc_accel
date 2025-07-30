import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { validateCalculatorInputs, sanitizeCalculatorInputs } from '@/lib/validation'
import { ApiResponse, CreateScenarioInput, Scenario } from '@/lib/types'

// GET /api/scenario - Get all scenarios for authenticated user
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication not implemented for production mode'
      }, { status: 501 })
    }

    const result = await query(
      `SELECT id, name, description, current_mortgage_balance, current_interest_rate,
              remaining_term_months, monthly_payment, heloc_limit, heloc_interest_rate,
              monthly_gross_income, monthly_net_income, monthly_expenses, monthly_discretionary_income,
              property_value, property_tax_monthly, insurance_monthly, hoa_fees_monthly,
              traditional_payoff_months, traditional_total_interest, heloc_payoff_months,
              heloc_total_interest, time_saved_months, interest_saved,
              created_at, updated_at, is_public, public_share_token
       FROM scenarios
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [session.user.id]
    )

    const scenarios = result.rows.map((row: any) => ({
      ...row,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: scenarios,
      message: 'Scenarios retrieved successfully'
    })

  } catch (error) {
    console.error('Get scenarios error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve scenarios'
    }, { status: 500 })
  }
}

// POST /api/scenario - Create new scenario
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication not implemented for production mode'
      }, { status: 501 })
    }
    const body = await request.json()

    // Extract scenario metadata and calculation inputs
    const { scenarioName, description, calculationResults, ...calculationInputs } = body

    if (!scenarioName || !scenarioName.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario name is required'
      }, { status: 400 })
    }

    // Sanitize and validate inputs
    const sanitizedInputs = sanitizeCalculatorInputs(calculationInputs)
    const validation = validateCalculatorInputs(sanitizedInputs)

    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid input data',
        data: { validationErrors: validation.errors }
      }, { status: 400 })
    }

    // Check if scenario name already exists for this user
    const existingResult = await query(
      'SELECT id FROM scenarios WHERE user_id = $1 AND name = $2',
      [session.user.id, scenarioName.trim()]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'A scenario with this name already exists'
      }, { status: 409 })
    }

    // Convert percentage inputs to decimals if needed
    const currentInterestRate = sanitizedInputs.currentInterestRate > 1
      ? sanitizedInputs.currentInterestRate / 100
      : sanitizedInputs.currentInterestRate

    const helocInterestRate = sanitizedInputs.helocInterestRate && sanitizedInputs.helocInterestRate > 1
      ? sanitizedInputs.helocInterestRate / 100
      : sanitizedInputs.helocInterestRate || 0

    // Extract calculation results if provided
    let traditionalPayoffMonths = null
    let traditionalTotalInterest = null
    let helocPayoffMonths = null
    let helocTotalInterest = null
    let timeSavedMonths = null
    let interestSaved = null

    if (calculationResults) {
      traditionalPayoffMonths = calculationResults.traditional?.payoffMonths
      traditionalTotalInterest = calculationResults.traditional?.totalInterest
      helocPayoffMonths = calculationResults.heloc?.payoffMonths
      helocTotalInterest = calculationResults.heloc?.totalInterest
      timeSavedMonths = calculationResults.comparison?.timeSavedMonths
      interestSaved = calculationResults.comparison?.interestSaved
    }

    // Create scenario
    const result = await query(
      `INSERT INTO scenarios (
        user_id, name, description,
        current_mortgage_balance, current_interest_rate, remaining_term_months, monthly_payment,
        heloc_limit, heloc_interest_rate, heloc_available_credit,
        monthly_gross_income, monthly_net_income, monthly_expenses, monthly_discretionary_income,
        property_value, property_tax_monthly, insurance_monthly, hoa_fees_monthly,
        traditional_payoff_months, traditional_total_interest, heloc_payoff_months,
        heloc_total_interest, time_saved_months, interest_saved
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24
      ) RETURNING id, name, description, created_at, updated_at`,
      [
        session.user.id,
        scenarioName.trim(),
        description?.trim() || null,
        sanitizedInputs.currentMortgageBalance,
        currentInterestRate,
        sanitizedInputs.remainingTermMonths,
        sanitizedInputs.monthlyPayment,
        sanitizedInputs.helocLimit,
        helocInterestRate,
        sanitizedInputs.helocAvailableCredit || sanitizedInputs.helocLimit,
        sanitizedInputs.monthlyGrossIncome,
        sanitizedInputs.monthlyNetIncome,
        sanitizedInputs.monthlyExpenses,
        sanitizedInputs.monthlyDiscretionaryIncome,
        sanitizedInputs.propertyValue || null,
        sanitizedInputs.propertyTaxMonthly || null,
        sanitizedInputs.insuranceMonthly || null,
        sanitizedInputs.hoaFeesMonthly || null,
        traditionalPayoffMonths,
        traditionalTotalInterest,
        helocPayoffMonths,
        helocTotalInterest,
        timeSavedMonths,
        interestSaved
      ]
    )

    const newScenario = result.rows[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: newScenario.id,
        name: newScenario.name,
        description: newScenario.description,
        created_at: newScenario.created_at.toISOString(),
        updated_at: newScenario.updated_at.toISOString()
      },
      message: 'Scenario saved successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Save scenario error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to save scenario'
    }, { status: 500 })
  }
}