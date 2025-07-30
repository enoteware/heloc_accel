import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDemoAgents, getDemoActiveAgents } from '@/lib/company-data'
import type { Agent } from '@/lib/company-data'

// GET /api/agents - Get all agents (or active agents with ?active=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (isDemoMode) {
      // Return demo agents
      const agents = activeOnly ? getDemoActiveAgents() : getDemoAgents()
      return NextResponse.json({
        success: true,
        data: agents
      })
    }

    // In production, would fetch from database
    // For now, return sample data
    const sampleAgents: Agent[] = [
      {
        id: 1,
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'Senior HELOC Specialist',
        email: 'sarah.johnson@helocaccelerator.com',
        phone: '555-0101',
        isActive: true
      }
    ]

    const agents = activeOnly 
      ? sampleAgents.filter(a => a.isActive)
      : sampleAgents

    return NextResponse.json({
      success: true,
      data: agents
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents'
      },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create new agent (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: firstName, lastName, email'
        },
        { status: 400 }
      )
    }

    // In production, would save to database
    // For now, return the input as if it was saved
    const newAgent: Agent = {
      id: Date.now(), // Temporary ID
      ...body,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: newAgent
    })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent'
      },
      { status: 500 }
    )
  }
}