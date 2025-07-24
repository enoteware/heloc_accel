import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('[Simple Login] Attempting login for:', email)
    
    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' })
    }
    
    const user = result.rows[0]
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' })
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      }
    })
  } catch (error: any) {
    console.error('[Simple Login] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 })
  }
}