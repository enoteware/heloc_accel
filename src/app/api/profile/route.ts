import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

// GET /api/profile - Get user profile information
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

    // Return demo profile data
    const userProfile = {
      id: 'demo-user-001',
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      email_verified: true
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
        lastLogin: userProfile.last_login,
        emailVerified: userProfile.email_verified
      },
      message: 'Profile retrieved successfully'
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve profile'
    }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile information
export async function PUT(request: NextRequest) {
  try {
    // TODO: Implement Stack Auth server-side authentication
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemoMode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication not implemented for production mode'
      }, { status: 501 })
    }

    // In demo mode, just return a success response
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile update not available in demo mode'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 })
  }
}