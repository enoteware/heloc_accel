import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from './auth'

// Protected routes that require authentication
const protectedRoutes = [
  '/api/scenario',
  '/api/calculate',
  '/dashboard',
  '/calculator',
  '/profile'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/auth',
  '/api/health',
  '/auth/signin',
  '/auth/signup',
  '/auth/error'
]

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Demo mode - bypass all authentication
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (isDemoMode) {
    // Add demo user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', 'demo-user-default')
    requestHeaders.set('x-user-email', 'demo@example.com')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route) || pathname === route
  )

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  // For protected routes, verify authentication
  if (isProtectedRoute) {
    // Try NextAuth.js token first
    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (nextAuthToken) {
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', nextAuthToken.id as string)
      requestHeaders.set('x-user-email', nextAuthToken.email as string)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // Try custom JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)

      if (decoded) {
        // Add user info to headers for API routes
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', decoded.userId)
        requestHeaders.set('x-user-email', decoded.email)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    }

    // No valid authentication found
    if (pathname.startsWith('/api/')) {
      // For API routes, return 401
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    } else {
      // For page routes, redirect to signin
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

// Helper function to extract user info from request headers
export function getUserFromHeaders(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  if (!userId || !userEmail) {
    return null
  }

  return {
    id: userId,
    email: userEmail
  }
}

// Helper function to require authentication in API routes
export function requireAuth(request: NextRequest) {
  // Demo mode - return demo user
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (isDemoMode) {
    return {
      id: 'demo-user-default',
      email: 'demo@example.com'
    }
  }

  const user = getUserFromHeaders(request)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}