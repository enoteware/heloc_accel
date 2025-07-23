import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { hashPassword, generateRandomToken } from '@/lib/auth'
import { CreateUserInput, ApiResponse } from '@/lib/types'
import { applyRateLimit, registrationRateLimit } from '@/lib/rate-limit'
import { sanitizeUserInput } from '@/lib/sanitization'
import { applySecurityHeaders, defaultSecurityHeaders } from '@/lib/security-headers'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request, registrationRateLimit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()

    // Sanitize input
    const sanitizedInput = sanitizeUserInput(body)
    const { email, password, firstName, lastName } = sanitizedInput

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Validate password strength
    if (!passwordRegex.test(password)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate email verification token
    const emailVerificationToken = generateRandomToken()

    // Create user
    const createUserInput: CreateUserInput = {
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email_verified: false
    }

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, email_verified, email_verification_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, created_at, email_verified`,
      [
        createUserInput.email,
        createUserInput.password_hash,
        createUserInput.first_name,
        createUserInput.last_name,
        createUserInput.email_verified,
        emailVerificationToken
      ]
    )

    const newUser = result.rows[0]

    // TODO: Send email verification email
    // For now, we'll just log the token
    console.log(`Email verification token for ${email}: ${emailVerificationToken}`)

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        createdAt: newUser.created_at,
        emailVerified: newUser.email_verified
      },
      message: 'User created successfully. Please check your email for verification instructions.'
    }, { status: 201 })

    // Apply security headers
    return applySecurityHeaders(response, defaultSecurityHeaders)

  } catch (error) {
    console.error('Registration error:', error)
    const response = NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })

    // Apply security headers even to error responses
    return applySecurityHeaders(response, defaultSecurityHeaders)
  }
}