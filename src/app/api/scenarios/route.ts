import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import pool from '@/lib/db'
import { validateCalculatorInputs } from '@/lib/validation'
import { logInfo, logError, logDebug } from '@/lib/debug-logger'

// GET /api/scenarios - List user's scenarios
export async function GET(request: NextRequest) {
  logInfo('API:Scenarios', 'GET /api/scenarios called')
  
  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request })
      logDebug('API:Scenarios', 'User authenticated', { userId: user?.id, email: user?.primaryEmail })
    } catch (error) {
      logError('API:Scenarios', 'Stack Auth error', error)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!user) {
      logError('API:Scenarios', 'No user found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()
    try {
      logDebug('API:Scenarios', 'Querying scenarios for user', { userId: user.id })
      const result = await client.query(
        `SELECT 
          id, 
          name, 
          description,
          created_at,
          updated_at,
          traditional_payoff_months,
          heloc_payoff_months,
          time_saved_months,
          interest_saved
        FROM scenarios 
        WHERE user_id = $1 
        ORDER BY updated_at DESC`,
        [user.id]
      )

      logInfo('API:Scenarios', `Found ${result.rows.length} scenarios`, { userId: user.id })
      return NextResponse.json({ scenarios: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    logError('API:Scenarios', 'Error fetching scenarios', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

// POST /api/scenarios - Create new scenario
export async function POST(request: NextRequest) {
  logInfo('API:Scenarios', 'POST /api/scenarios called')
  console.log('=== SCENARIOS POST ENDPOINT CALLED ===')
  
  try {
    let user;
    try {
      console.log('Attempting to get user from Stack Auth...')
      user = await stackServerApp.getUser({ tokenStore: request })
      console.log('User authentication result:', { 
        success: !!user, 
        userId: user?.id, 
        email: user?.primaryEmail 
      })
      logDebug('API:Scenarios', 'User authenticated for POST', { userId: user?.id, email: user?.primaryEmail })
    } catch (error) {
      console.error('Stack Auth error:', error)
      logError('API:Scenarios', 'Stack Auth error in POST', error)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!user) {
      console.log('No user found - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Parsing request body...')
    const body = await request.json()
    console.log('Body received:', JSON.stringify(body, null, 2))
    const { inputs, results } = body
    
    logDebug('API:Scenarios', 'POST body received', { 
      hasInputs: !!inputs, 
      hasResults: !!results,
      scenarioName: inputs?.scenarioName 
    })
    console.log('Extracted from body:', {
      hasInputs: !!inputs,
      hasResults: !!results,
      scenarioName: inputs?.scenarioName,
      inputKeys: inputs ? Object.keys(inputs) : [],
      resultKeys: results ? Object.keys(results) : []
    })

    // Validate inputs
    const validation = validateCalculatorInputs(inputs)
    if (!validation.isValid) {
      logError('API:Scenarios', 'Validation failed', validation.errors)
      return NextResponse.json(
        { error: 'Invalid inputs', errors: validation.errors },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    console.log('Database client connected')
    try {
      logInfo('API:Scenarios', 'Inserting scenario into database', { scenarioName: inputs.scenarioName })
      console.log('Preparing to insert scenario with values:', {
        userId: user.id,
        name: inputs.scenarioName || 'HELOC Analysis',
        description: inputs.description || null
      })
      
      // Insert the scenario
      const insertResult = await client.query(
        `INSERT INTO scenarios (
          user_id,
          name,
          description,
          -- Mortgage fields
          current_mortgage_balance,
          current_interest_rate,
          remaining_term_months,
          monthly_payment,
          -- HELOC fields
          heloc_limit,
          heloc_interest_rate,
          heloc_available_credit,
          -- Income fields
          monthly_gross_income,
          monthly_net_income,
          monthly_expenses,
          monthly_discretionary_income,
          -- Property fields
          property_value,
          property_tax_monthly,
          insurance_monthly,
          hoa_fees_monthly,
          pmi_monthly,
          -- Results summary
          traditional_payoff_months,
          traditional_total_interest,
          traditional_monthly_payment,
          traditional_total_payments,
          heloc_payoff_months,
          heloc_total_interest,
          heloc_max_used,
          heloc_average_balance,
          heloc_total_mortgage_interest,
          heloc_total_heloc_interest,
          time_saved_months,
          time_saved_years,
          interest_saved,
          percentage_interest_saved,
          -- JSON data
          calculation_results_json,
          heloc_schedule_json
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
        ) RETURNING id`,
        [
          user.id,
          inputs.scenarioName || 'HELOC Analysis',
          inputs.description || null,
          // Mortgage
          inputs.currentMortgageBalance,
          inputs.currentInterestRate / 100, // Convert percentage to decimal
          inputs.remainingTermMonths,
          inputs.monthlyPayment,
          // HELOC
          inputs.helocLimit || null,
          inputs.helocInterestRate ? inputs.helocInterestRate / 100 : null,
          inputs.helocAvailableCredit || null,
          // Income
          inputs.monthlyGrossIncome,
          inputs.monthlyNetIncome,
          inputs.monthlyExpenses,
          inputs.monthlyDiscretionaryIncome,
          // Property
          inputs.propertyValue || null,
          inputs.propertyTaxMonthly || null,
          inputs.insuranceMonthly || null,
          inputs.hoaFeesMonthly || null,
          inputs.pmiMonthly || null,
          // Results summary
          results.traditional.payoffMonths,
          results.traditional.totalInterest,
          results.traditional.monthlyPayment,
          results.traditional.totalPayments,
          results.heloc.payoffMonths,
          results.heloc.totalInterest,
          results.heloc.maxHelocUsed,
          results.heloc.averageHelocBalance,
          results.heloc.totalMortgageInterest,
          results.heloc.totalHelocInterest,
          results.comparison.timeSavedMonths,
          results.comparison.timeSavedYears,
          results.comparison.interestSaved,
          results.comparison.percentageInterestSaved,
          // JSON data
          JSON.stringify(results),
          JSON.stringify(results.heloc.schedule)
        ]
      )

      logInfo('API:Scenarios', 'Scenario saved successfully', { 
        scenarioId: insertResult.rows[0].id,
        scenarioName: inputs.scenarioName 
      })
      
      return NextResponse.json({ 
        success: true, 
        scenarioId: insertResult.rows[0].id,
        id: insertResult.rows[0].id // Add id field for compatibility
      })
    } finally {
      client.release()
    }
  } catch (error) {
    logError('API:Scenarios', 'Error saving scenario', error)
    return NextResponse.json(
      { error: 'Failed to save scenario' },
      { status: 500 }
    )
  }
}