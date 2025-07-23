/**
 * Next.js middleware for security, authentication, and routing
 */

import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders, defaultSecurityHeaders, developmentSecurityHeaders } from '@/lib/security-headers'
import { applyRateLimit, apiRateLimit, authRateLimit } from '@/lib/rate-limit'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/style-guide', // Design system style guide
  '/api/auth/*', // All NextAuth.js routes
  '/api/auth/register',
  '/api/auth/login',
  '/api/shared',
  '/api/health'
]

// API routes that need rate limiting
const rateLimitedRoutes = [
  '/api/auth',
  '/api/calculate',
  '/api/scenario',
  '/api/profile'
]

// Auth-specific routes that need stricter rate limiting
const authRoutes = [
  '/api/auth/register',
  '/api/auth/login'
]

/**
 * Check if a path matches any pattern in the list
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1))
    }
    return pathname === pattern || pathname.startsWith(pattern + '/')
  })
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return matchesPath(pathname, publicRoutes)
}

/**
 * Check if route needs rate limiting
 */
function needsRateLimit(pathname: string): boolean {
  return matchesPath(pathname, rateLimitedRoutes)
}

/**
 * Check if route is auth-related
 */
function isAuthRoute(pathname: string): boolean {
  return matchesPath(pathname, authRoutes)
}

/**
 * Get JWT token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Try cookie as fallback
  const tokenCookie = request.cookies.get('auth-token')
  return tokenCookie?.value || null
}

/**
 * Verify JWT token (simplified - in production use proper JWT verification)
 */
function verifyToken(token: string): boolean {
  try {
    // In a real implementation, you would verify the JWT signature
    // For now, just check if it's not empty and has the right format
    return token.length > 0 && token.includes('.')
  } catch {
    return false
  }
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') && !pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }
  
  // Create response
  let response = NextResponse.next()
  
  // Apply security headers
  const securityHeaders = process.env.NODE_ENV === 'production' 
    ? defaultSecurityHeaders 
    : developmentSecurityHeaders
  
  response = applySecurityHeaders(response, securityHeaders)
  
  // Apply rate limiting for API routes
  if (needsRateLimit(pathname)) {
    const rateLimiter = isAuthRoute(pathname) ? authRateLimit : apiRateLimit
    const rateLimitResponse = applyRateLimit(request, rateLimiter)
    
    if (rateLimitResponse) {
      // Rate limit response is already a Response, convert to NextResponse
      const nextResponse = new NextResponse(rateLimitResponse.body, {
        status: rateLimitResponse.status,
        headers: rateLimitResponse.headers
      })
      return applySecurityHeaders(nextResponse, securityHeaders)
    }
  }
  
  // Authentication check for protected routes (skip in demo mode)
  if (!isPublicRoute(pathname) && process.env.DEMO_MODE !== 'true') {
    const token = getTokenFromRequest(request)

    if (!token || !verifyToken(token)) {
      // For API routes, return JSON error
      if (pathname.startsWith('/api/')) {
        const errorResponse = NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
        return applySecurityHeaders(errorResponse, securityHeaders)
      }

      // For page routes, redirect to signin
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      const redirectResponse = NextResponse.redirect(signInUrl)
      return applySecurityHeaders(redirectResponse, securityHeaders)
    }
  }
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const corsResponse = new NextResponse(null, { status: 200 })
      corsResponse.headers.set('Access-Control-Allow-Origin', '*')
      corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
      corsResponse.headers.set('Access-Control-Max-Age', '86400')
      
      return applySecurityHeaders(corsResponse, securityHeaders)
    }
    
    // Add CORS headers to API responses
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  }
  
  // Add security headers for all responses
  return response
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

/**
 * Additional security utilities for use in API routes
 */

/**
 * Validate request origin for CSRF protection
 */
export function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  if (!origin && !referer) {
    return false
  }
  
  const requestOrigin = origin || (referer ? new URL(referer).origin : null)
  const expectedOrigin = `${request.nextUrl.protocol}//${host}`
  
  return requestOrigin === expectedOrigin ||
         (process.env.NODE_ENV === 'development' && Boolean(requestOrigin?.includes('localhost')))
}

/**
 * Check for suspicious request patterns
 */
export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // Check for suspicious paths
  const suspiciousPaths = [
    '/admin',
    '/wp-admin',
    '/.env',
    '/config',
    '/backup',
    '/phpmyadmin'
  ]
  
  if (suspiciousPaths.some(suspiciousPath => path.includes(suspiciousPath))) {
    return true
  }
  
  return false
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: Record<string, any>
) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ip,
    userAgent: request.headers.get('user-agent'),
    path: request.nextUrl.pathname,
    method: request.method,
    ...details
  }
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logData))
  } else {
    console.warn('Security Event:', logData)
  }
}
