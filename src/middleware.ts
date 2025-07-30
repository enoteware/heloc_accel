import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { stackServerApp } from '@/stack'

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

export default async function middleware(req: any) {
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const pathname = req.nextUrl.pathname

  // Check admin access
  if (isAdminPath) {
    try {
      // Get user from Stack Auth
      const user = await stackServerApp.getUser({ tokenStore: req })

      // In demo mode, any authenticated user can access admin
      if (isDemoMode) {
        if (!user) {
          const loginUrl = createLocaleAwareUrl('/handler/sign-in', req)
          // Prevent redirect loop
          if (!pathname.includes('/handler/sign-in')) {
            return NextResponse.redirect(loginUrl)
          }
        }
      } else {
        // In production, check for admin role
        const isAdmin = user?.primaryEmail === 'admin@helocaccelerator.com' ||
                       user?.serverMetadata?.role === 'admin' ||
                       user?.serverMetadata?.isAdmin === true

        if (!isAdmin) {
          const dashboardUrl = createLocaleAwareUrl('/dashboard', req)
          // Prevent redirect loop
          if (!pathname.includes('/dashboard')) {
            return NextResponse.redirect(dashboardUrl)
          }
        }
      }
    } catch (error) {
      // If Stack Auth fails, redirect to sign-in
      const loginUrl = createLocaleAwareUrl('/handler/sign-in', req)
      if (!pathname.includes('/handler/sign-in')) {
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(req)
}

// Only run middleware on specific protected routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files
     * - Stack Auth handler routes
     * - Images and other assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*handler.*).*)'
  ],
}