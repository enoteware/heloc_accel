// NextAuth has been replaced with Stack Auth
// This file is temporarily disabled to prevent compilation errors
// TODO: Remove or replace with Stack Auth equivalents

/*
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
*/

/*
// Demo users for development/demo mode
const DEMO_USERS = [
  {
    id: "demo-user-001",
    email: "demo@example.com",
    name: "Demo User",
    password: "demo123",
  },
  {
    id: "demo-user-002",
    email: "john@example.com",
    name: "John Smith",
    password: "password123",
  },
  {
    id: "demo-user-003",
    email: "jane@example.com",
    name: "Jane Doe",
    password: "password123",
  },
]

export const config: NextAuthConfig = {
  debug: false, // Disabled since we're using Stack Auth now
  theme: {
    logo: "/heloc_accel.svg",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase() === 'true'
        
        console.log('[AUTH DEBUG] Authorize called with:', {
          email: credentials?.email,
          passwordProvided: !!credentials?.password,
          isDemoMode,
          demoUsers: DEMO_USERS.map(u => u.email)
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH DEBUG] Missing credentials')
          return null
        }

        if (isDemoMode) {
          // Demo mode: check against hardcoded demo users
          const user = DEMO_USERS.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password
          )

          console.log('[AUTH DEBUG] Demo mode user lookup:', {
            found: !!user,
            email: credentials.email,
            userId: user?.id
          })

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          }
        } else {
          // Production mode: query database
          try {
            const { Client } = require('pg')
            const bcrypt = require('bcryptjs')
            
            const client = new Client({
              connectionString: process.env.DATABASE_URL,
              ssl: {
                rejectUnauthorized: false
              }
            })
            
            await client.connect()
            
            // Find user by email
            const result = await client.query(
              'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1 AND is_active = true',
              [credentials.email]
            )
            
            await client.end()
            
            if (result.rows.length === 0) {
              console.log('[AUTH DEBUG] User not found:', credentials.email)
              return null
            }
            
            const user = result.rows[0]
            
            // Verify password
            const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
            
            console.log('[AUTH DEBUG] Database auth:', {
              email: credentials.email,
              userFound: true,
              passwordValid: isValidPassword
            })
            
            if (isValidPassword) {
              return {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
              }
            }
          } catch (error) {
            console.error('[AUTH DEBUG] Database error:', error.message)
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnProfile = nextUrl.pathname.startsWith("/profile")
      const isOnCalculator = nextUrl.pathname.startsWith("/calculator")
      const isOnCompare = nextUrl.pathname.startsWith("/compare")
      const isProtectedRoute = isOnDashboard || isOnProfile || isOnCalculator || isOnCompare

      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
}
*/

// export const { handlers, signIn, signOut, auth } = NextAuth(config)

// Temporary placeholder exports to prevent import errors
export const handlers = { GET: () => {}, POST: () => {} };
export const signIn = () => Promise.resolve();
export const signOut = () => Promise.resolve();
export const auth = () => Promise.resolve(null);
