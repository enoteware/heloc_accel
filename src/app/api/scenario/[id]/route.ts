import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { query } from '@/lib/database'
import { ApiResponse } from '@/lib/types'
import { randomBytes } from 'crypto'

// GET /api/scenario/[id] - Get a specific scenario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    const scenarioId = params.id

    const result = await query(
      `SELECT id, name, description, current_mortgage_balance, current_interest_rate,
              remaining_term_months, monthly_payment, heloc_limit, heloc_interest_rate,
              heloc_available_credit, monthly_gross_income, monthly_net_income, 
              monthly_expenses, monthly_discretionary_income, property_value, 
              property_tax_monthly, insurance_monthly, hoa_fees_monthly,
              traditional_payoff_months, traditional_total_interest, heloc_payoff_months,
              heloc_total_interest, time_saved_months, interest_saved,
              created_at, updated_at, is_public, public_share_token
       FROM scenarios
       WHERE id = $1 AND (user_id = $2 OR is_public = true)`,
      [scenarioId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario not found or access denied'
      }, { status: 404 })
    }

    const scenario = {
      ...result.rows[0],
      created_at: result.rows[0].created_at.toISOString(),
      updated_at: result.rows[0].updated_at.toISOString()
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: scenario,
      message: 'Scenario retrieved successfully'
    })

  } catch (error) {
    console.error('Get scenario error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve scenario'
    }, { status: 500 })
  }
}

// DELETE /api/scenario/[id] - Delete a specific scenario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    const scenarioId = params.id

    // Check if scenario exists and belongs to user
    const existingResult = await query(
      'SELECT id FROM scenarios WHERE id = $1 AND user_id = $2',
      [scenarioId, user.id]
    )

    if (existingResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario not found or access denied'
      }, { status: 404 })
    }

    // Delete the scenario (cascade will delete related calculation_results)
    await query(
      'DELETE FROM scenarios WHERE id = $1 AND user_id = $2',
      [scenarioId, user.id]
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Scenario deleted successfully'
    })

  } catch (error) {
    console.error('Delete scenario error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete scenario'
    }, { status: 500 })
  }
}

// PUT /api/scenario/[id] - Update a specific scenario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    const scenarioId = params.id
    const body = await request.json()

    // Check if scenario exists and belongs to user
    const existingResult = await query(
      'SELECT id FROM scenarios WHERE id = $1 AND user_id = $2',
      [scenarioId, user.id]
    )

    if (existingResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario not found or access denied'
      }, { status: 404 })
    }

    // Extract updatable fields
    const { name, description, is_public } = body

    // Update scenario
    const result = await query(
      `UPDATE scenarios 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, description, updated_at`,
      [name, description, is_public, scenarioId, user.id]
    )

    const updatedScenario = result.rows[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: updatedScenario.id,
        name: updatedScenario.name,
        description: updatedScenario.description,
        updated_at: updatedScenario.updated_at.toISOString()
      },
      message: 'Scenario updated successfully'
    })

  } catch (error) {
    console.error('Update scenario error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update scenario'
    }, { status: 500 })
  }
}
