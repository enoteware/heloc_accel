import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Generate JWT token
export function generateToken(payload: { userId: string; email: string; emailVerified: boolean }): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  
  return jwt.sign(
    {
      id: payload.userId,
      email: payload.email,
      emailVerified: payload.emailVerified
    },
    jwtSecret,
    { expiresIn: '7d' } // 7 days
  )
}

// Verify JWT token
export function verifyToken(token: string): any {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  
  return jwt.verify(token, jwtSecret)
}

// Generate random token for email verification, etc.
export function generateRandomToken(): string {
  return require('crypto').randomBytes(32).toString('hex')
}