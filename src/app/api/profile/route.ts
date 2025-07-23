import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { query } from '@/lib/database'
import { ApiResponse } from '@/lib/types'
import bcrypt from 'bcryptjs'

// GET /api/profile - Get user profile information
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const result = await query(
      `SELECT id, email, first_name, last_name, created_at, updated_at, 
              last_login, email_verified
       FROM users 
       WHERE id = $1`,
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const userProfile = result.rows[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        createdAt: userProfile.created_at.toISOString(),
        updatedAt: userProfile.updated_at.toISOString(),
        lastLogin: userProfile.last_login?.toISOString(),
        emailVerified: userProfile.email_verified
      },
      message: 'Profile retrieved successfully'
    })

  } catch (error) {
    console.error('Get profile error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve profile'
    }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile information
export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const body = await request.json()

    const { firstName, lastName, email } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'First name, last name, and email are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, user.id]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Email address is already in use'
        }, { status: 409 })
      }
    }

    // Update user profile
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, updated_at`,
      [firstName.trim(), lastName.trim(), email.trim(), user.id]
    )

    const updatedUser = result.rows[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        updatedAt: updatedUser.updated_at.toISOString()
      },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 })
  }
}
