import { NextRequest, NextResponse } from 'next/server'
import { getDemoUserAgent } from '@/lib/company-data'

interface Params {
  params: Promise<{
    id: string
  }>
}

// GET /api/users/[id]/agent - Get assigned agent for a user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication not implemented for production mode'
        },
        { status: 501 }
      )
    }

    const { id: userId } = await params

    if (isDemoMode) {
      const agent = getDemoUserAgent(userId)
      
      if (!agent) {
        return NextResponse.json(
          {
            success: false,
            error: 'No agent assigned'
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: agent
      })
    }

    // In production, would fetch from database
    return NextResponse.json(
      {
        success: false,
        error: 'No agent assigned'
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching user agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent assignment'
      },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/agent - Assign agent to user (admin only)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication not implemented for production mode'
        },
        { status: 501 }
      )
    }

    // In demo mode, just return success response
    return NextResponse.json({
      success: true,
      message: 'Agent assignment not available in demo mode'
    })
  } catch (error) {
    console.error('Error assigning agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign agent'
      },
      { status: 500 }
    )
  }
}