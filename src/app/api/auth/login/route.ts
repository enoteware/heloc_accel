import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { verifyPassword, generateToken } from '@/lib/auth-utils'
import { getDummyUserAccount } from '@/lib/dummy-users'
import { User, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Demo mode - allow demo credentials
    if (process.env.DEMO_MODE === 'true') {
      const dummyUser = getDummyUserAccount(email, password)

      const token = generateToken({
        userId: dummyUser.id,
        email: dummyUser.email,
        emailVerified: true
      })

      const userData = {
        id: dummyUser.id,
        email: dummyUser.email,
        firstName: dummyUser.firstName,
        lastName: dummyUser.lastName,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          user: userData,
          token: token
        },
        message: 'Demo login successful'
      }, { status: 200 })
    }

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    const user: User = result.rows[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      emailVerified: user.email_verified
    })

    // Create response with user data (excluding sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: userData,
        token: token
      },
      message: 'Login successful'
    }, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}