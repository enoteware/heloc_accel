import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import pool from '@/lib/db'
import { validateCalculatorInputs } from '@/lib/validation'

// GET /api/scenarios - List user's scenarios
export async function GET(request: NextRequest) {
  try {
    let user;
    try {
      user = await stackServerApp.getUser()
    } catch (error) {
      console.error('Stack Auth error:', error)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()
    try {
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
          interest_saved,
          percentage_interest_saved
        FROM scenarios 
        WHERE user_id = $1 
        ORDER BY updated_at DESC`,
        [user.id]
      )

      return NextResponse.json({ scenarios: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

// POST /api/scenarios - Create new scenario
export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      user = await stackServerApp.getUser()
    } catch (error) {
      console.error('Stack Auth error:', error)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inputs, results } = body

    // Validate inputs
    const validation = validateCalculatorInputs(inputs)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid inputs', errors: validation.errors },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
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

      return NextResponse.json({ 
        success: true, 
        scenarioId: insertResult.rows[0].id 
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error saving scenario:', error)
    return NextResponse.json(
      { error: 'Failed to save scenario' },
      { status: 500 }
    )
  }
}