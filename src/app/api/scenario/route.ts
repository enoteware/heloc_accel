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

    // In demo mode, return demo scenarios
    const demoScenarios = [
      {
        id: 'demo-scenario-001',
        name: 'Primary Residence HELOC',
        description: 'Main home HELOC acceleration strategy',
        current_mortgage_balance: 250000,
        current_interest_rate: 6.5,
        remaining_term_months: 240,
        monthly_payment: 1850,
        heloc_limit: 100000,
        heloc_interest_rate: 7.25,
        monthly_gross_income: 8000,
        monthly_net_income: 6000,
        monthly_expenses: 4500,
        monthly_discretionary_income: 1500,
        property_value: 400000,
        property_tax_monthly: 500,
        insurance_monthly: 150,
        hoa_fees_monthly: 0,
        traditional_payoff_months: 240,
        traditional_total_interest: 194000,
        heloc_payoff_months: 156,
        heloc_total_interest: 142000,
        time_saved_months: 84,
        interest_saved: 52000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: false,
        public_share_token: null
      }
    ]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: demoScenarios,
      message: 'Demo scenarios retrieved successfully'
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

    // In demo mode, just return success response
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: 'demo-scenario-new',
        name: 'Demo Scenario',
        description: 'Created in demo mode',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Scenario creation not available in demo mode'
    })

  } catch (error) {
    console.error('Save scenario error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to save scenario'
    }, { status: 500 })
  }
}