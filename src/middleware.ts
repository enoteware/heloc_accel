import { auth } from "@/auth"
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing)

export default auth((req) => {
  const token = req.auth
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Check admin access
  if (isAdminPath) {
    // In demo mode, any authenticated user can access admin
    if (isDemoMode) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    } else {
      // In production, check for admin role
      const isAdmin = token?.user?.email === 'admin@helocaccelerator.com' || 
                     (token as any)?.role === 'admin' ||
                     (token as any)?.isAdmin === true

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
})

// Only run middleware on specific protected routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files
     * - Auth routes
     * - Images and other assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)'
  ],
}