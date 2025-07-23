import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponse } from '@/lib/types'

// GET /api/shared/[token] - Get a publicly shared scenario by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const shareToken = params.token

    if (!shareToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Share token is required'
      }, { status: 400 })
    }

    // Get scenario by share token (only if public)
    const result = await query(
      `SELECT s.id, s.name, s.description, s.current_mortgage_balance, s.current_interest_rate,
              s.remaining_term_months, s.monthly_payment, s.heloc_limit, s.heloc_interest_rate,
              s.heloc_available_credit, s.monthly_gross_income, s.monthly_net_income, 
              s.monthly_expenses, s.monthly_discretionary_income, s.property_value, 
              s.property_tax_monthly, s.insurance_monthly, s.hoa_fees_monthly,
              s.traditional_payoff_months, s.traditional_total_interest, s.heloc_payoff_months,
              s.heloc_total_interest, s.time_saved_months, s.interest_saved,
              s.created_at, s.updated_at, u.first_name, u.last_name
       FROM scenarios s
       JOIN users u ON s.user_id = u.id
       WHERE s.public_share_token = $1 AND s.is_public = true`,
      [shareToken]
    )

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Shared scenario not found or no longer available'
      }, { status: 404 })
    }

    const scenario = result.rows[0]
    
    // Format the response (exclude sensitive user data)
    const publicScenario = {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      current_mortgage_balance: scenario.current_mortgage_balance,
      current_interest_rate: scenario.current_interest_rate,
      remaining_term_months: scenario.remaining_term_months,
      monthly_payment: scenario.monthly_payment,
      heloc_limit: scenario.heloc_limit,
      heloc_interest_rate: scenario.heloc_interest_rate,
      heloc_available_credit: scenario.heloc_available_credit,
      monthly_gross_income: scenario.monthly_gross_income,
      monthly_net_income: scenario.monthly_net_income,
      monthly_expenses: scenario.monthly_expenses,
      monthly_discretionary_income: scenario.monthly_discretionary_income,
      property_value: scenario.property_value,
      property_tax_monthly: scenario.property_tax_monthly,
      insurance_monthly: scenario.insurance_monthly,
      hoa_fees_monthly: scenario.hoa_fees_monthly,
      traditional_payoff_months: scenario.traditional_payoff_months,
      traditional_total_interest: scenario.traditional_total_interest,
      heloc_payoff_months: scenario.heloc_payoff_months,
      heloc_total_interest: scenario.heloc_total_interest,
      time_saved_months: scenario.time_saved_months,
      interest_saved: scenario.interest_saved,
      created_at: scenario.created_at.toISOString(),
      updated_at: scenario.updated_at.toISOString(),
      shared_by: `${scenario.first_name || ''} ${scenario.last_name || ''}`.trim() || 'Anonymous'
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: publicScenario,
      message: 'Shared scenario retrieved successfully'
    })

  } catch (error) {
    console.error('Get shared scenario error:', error)

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve shared scenario'
    }, { status: 500 })
  }
}
