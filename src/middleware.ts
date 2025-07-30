import { auth } from "@/auth"
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing)

// Helper function to get locale from pathname or default
function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (routing.locales.includes(potentialLocale as any)) {
    return potentialLocale
  }

  return routing.defaultLocale
}

// Helper function to create locale-aware URLs
function createLocaleAwareUrl(path: string, req: any): URL {
  const locale = getLocaleFromPathname(req.nextUrl.pathname)
  const localizedPath = `/${locale}${path}`
  return new URL(localizedPath, req.url)
}

export default auth((req) => {
  const token = req.auth
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const pathname = req.nextUrl.pathname

  // Check admin access
  if (isAdminPath) {
    // In demo mode, any authenticated user can access admin
    if (isDemoMode) {
      if (!token) {
        const loginUrl = createLocaleAwareUrl('/login', req)
        // Prevent redirect loop
        if (!pathname.includes('/login')) {
          return NextResponse.redirect(loginUrl)
        }
      }
    } else {
      // In production, check for admin role
      const isAdmin = token?.user?.email === 'admin@helocaccelerator.com' ||
                     (token as any)?.role === 'admin' ||
                     (token as any)?.isAdmin === true

      if (!isAdmin) {
        const dashboardUrl = createLocaleAwareUrl('/dashboard', req)
        // Prevent redirect loop
        if (!pathname.includes('/dashboard')) {
          return NextResponse.redirect(dashboardUrl)
        }
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