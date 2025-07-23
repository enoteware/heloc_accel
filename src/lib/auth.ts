import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './database'
import { User } from './types'
import { getDummyUserAccount as getDummyUserAccountFromLib, getAllDummyUsers as getAllDummyUsersFromLib } from './dummy-users'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo mode - allow demo credentials
        if (process.env.DEMO_MODE === 'true') {
          return getDummyUserAccountFromLib(credentials.email, credentials.password)
        }

        try {
          // Find user by email
          const result = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            return null
          }

          const user: User = result.rows[0]

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isValidPassword) {
            return null
          }

          // Update last login
          await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
          )

          return {
            id: user.id,
            email: user.email,
            name: user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            emailVerified: user.email_verified
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.emailVerified = (user as any).emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as any
        user.id = token.id as string
        user.firstName = token.firstName as string
        user.lastName = token.lastName as string
        user.emailVerified = token.emailVerified as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Helper function to generate JWT tokens
export function generateToken(payload: any, expiresIn: string = '30d'): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn } as jwt.SignOptions)
}

// Export dummy user functions for server-side use
export const getDummyUserAccount = getDummyUserAccountFromLib
export const getAllDummyUsers = getAllDummyUsersFromLib

// Helper function to verify JWT tokens
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

// Helper function to generate random tokens for email verification, password reset, etc.
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}