import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { query } from '@/lib/database'
import { ApiResponse } from '@/lib/types'
import { randomBytes } from 'crypto'

// POST /api/scenario/[id]/share - Generate or toggle sharing for a scenario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    const scenarioId = params.id
    const body = await request.json()
    const { enable } = body

    // Check if scenario exists and belongs to user
    const existingResult = await query(
      'SELECT id, is_public, public_share_token FROM scenarios WHERE id = $1 AND user_id = $2',
      [scenarioId, user.id]
    )

    if (existingResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario not found or access denied'
      }, { status: 404 })
    }

    const scenario = existingResult.rows[0]

    if (enable) {
      // Enable sharing - generate token if doesn't exist
      let shareToken = scenario.public_share_token
      
      if (!shareToken) {
        shareToken = randomBytes(32).toString('hex')
      }

      await query(
        'UPDATE scenarios SET is_public = true, public_share_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [shareToken, scenarioId]
      )

      const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${shareToken}`

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          shareUrl,
          shareToken,
          isPublic: true
        },
        message: 'Scenario sharing enabled'
      })
    } else {
      // Disable sharing
      await query(
        'UPDATE scenarios SET is_public = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [scenarioId]
      )

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          isPublic: false
        },
        message: 'Scenario sharing disabled'
      })
    }

  } catch (error) {
    console.error('Share scenario error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update sharing settings'
    }, { status: 500 })
  }
}

// GET /api/scenario/[id]/share - Get sharing status for a scenario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    const scenarioId = params.id

    // Check if scenario exists and belongs to user
    const result = await query(
      'SELECT is_public, public_share_token FROM scenarios WHERE id = $1 AND user_id = $2',
      [scenarioId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Scenario not found or access denied'
      }, { status: 404 })
    }

    const scenario = result.rows[0]
    const shareUrl = scenario.is_public && scenario.public_share_token 
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${scenario.public_share_token}`
      : null

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        isPublic: scenario.is_public,
        shareUrl,
        shareToken: scenario.public_share_token
      },
      message: 'Sharing status retrieved'
    })

  } catch (error) {
    console.error('Get sharing status error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get sharing status'
    }, { status: 500 })
  }
}
