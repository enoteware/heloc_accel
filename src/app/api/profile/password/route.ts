import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/database'
import { ApiResponse } from '@/lib/types'
import bcrypt from 'bcryptjs'

// PUT /api/profile/password - Change user password
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    const body = await request.json()

    const { currentPassword, newPassword, confirmPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password, new password, and confirmation are required'
      }, { status: 400 })
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'New password and confirmation do not match'
      }, { status: 400 })
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      }, { status: 400 })
    }

    // Get current user data
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [session.user.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const currentUser = userResult.rows[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password is incorrect'
      }, { status: 400 })
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password_hash)
    if (isSamePassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'New password must be different from current password'
      }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, session.user.id]
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to change password'
    }, { status: 500 })
  }
}