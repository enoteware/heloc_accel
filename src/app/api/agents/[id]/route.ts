import { NextRequest, NextResponse } from 'next/server'
import { getDemoAgent } from '@/lib/company-data'

interface Params {
  params: Promise<{
    id: string
  }>
}

// GET /api/agents/[id] - Get single agent by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const agentId = parseInt(id)
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid agent ID'
        },
        { status: 400 }
      )
    }

    if (isDemoMode) {
      const agent = getDemoAgent(agentId)
      
      if (!agent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found'
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
        error: 'Agent not found'
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent'
      },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id] - Update agent (admin only)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // In demo mode, skip auth check for now
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      // In production, would check for admin role using Stack Auth
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication not implemented for production mode'
        },
        { status: 501 }
      )
    }

    const { id } = await params
    const agentId = parseInt(id)
    const body = await request.json()

    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid agent ID'
        },
        { status: 400 }
      )
    }

    // In production, would update in database
    // For now, return the input as if it was saved
    return NextResponse.json({
      success: true,
      data: {
        id: agentId,
        ...body,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update agent'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Delete agent (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // In demo mode, skip auth check for now
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      // In production, would check for admin role using Stack Auth
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication not implemented for production mode'
        },
        { status: 501 }
      )
    }

    const { id } = await params
    const agentId = parseInt(id)

    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid agent ID'
        },
        { status: 400 }
      )
    }

    // In production, would delete from database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete agent'
      },
      { status: 500 }
    )
  }
}