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
    const session = await auth()
    const { id: userId } = await params
    
    // Users can only access their own agent assignment
    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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
    const session = await auth()
    
    // In production, would check for admin role
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    const { id: userId } = await params
    const body = await request.json()
    
    if (!body.agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required'
        },
        { status: 400 }
      )
    }

    // In production, would save to database
    return NextResponse.json({
      success: true,
      data: {
        userId,
        agentId: body.agentId,
        assignmentType: body.assignmentType || 'primary',
        assignedAt: new Date()
      }
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