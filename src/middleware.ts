import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { stackServerApp } from "@/stack";

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

// Helper function to get locale from pathname or default
function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];

  if (routing.locales.includes(potentialLocale as any)) {
    return potentialLocale;
  }

  return routing.defaultLocale;
}

// Helper function to create locale-aware URLs
function createLocaleAwareUrl(path: string, req: any): URL {
  const locale = getLocaleFromPathname(req.nextUrl.pathname);
  const localizedPath = `/${locale}${path}`;
  return new URL(localizedPath, req.url);
}

export default async function middleware(req: any) {
  const pathname = req.nextUrl.pathname;

  // Gate debug/test APIs when DISABLE_DEBUG is true
  if (pathname.startsWith("/api/debug/") || pathname.startsWith("/api/test/")) {
    const disabled =
      process.env.DISABLE_DEBUG === "true" ||
      process.env.NEXT_PUBLIC_DISABLE_DEBUG === "true";
    if (disabled) {
      return NextResponse.json(
        { success: false, error: "Debug endpoints are disabled" },
        { status: 403 },
      );
    }
  }

  const isApiPath = pathname.startsWith("/api/");
  const isAdminPath = pathname.startsWith("/admin");
  const isProtectedApiPath = isApiPath && !isPublicApiPath(pathname);
  const isProtectedPagePath = isProtectedPageRoute(pathname);

  // Check authentication for protected routes
  if (isAdminPath || isProtectedApiPath || isProtectedPagePath) {
    try {
      // Get user from Stack Auth
      const user = await stackServerApp.getUser({ tokenStore: req });

      if (!user) {
        // For API routes, return 401 instead of redirect
        if (isProtectedApiPath) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }

        // For page routes, redirect to sign-in
        const loginUrl = createLocaleAwareUrl("/handler/sign-in", req);
        // Prevent redirect loop
        if (!pathname.includes("/handler/sign-in")) {
          return NextResponse.redirect(loginUrl);
        }
      }

      // Check for admin role on admin paths
      if (isAdminPath && user) {
        const isAdmin =
          user?.primaryEmail === "admin@helocaccelerator.com" ||
          user?.serverMetadata?.role === "admin" ||
          user?.serverMetadata?.isAdmin === true;

        if (!isAdmin) {
          // For API routes, return 403
          if (pathname.startsWith("/api/admin")) {
            return NextResponse.json(
              { error: "Admin access required" },
              { status: 403 },
            );
          }

          // For page routes, redirect to dashboard
          const dashboardUrl = createLocaleAwareUrl("/dashboard", req);
          if (!pathname.includes("/dashboard")) {
            return NextResponse.redirect(dashboardUrl);
          }
        }
      }
    } catch (error) {
      // If Stack Auth fails
      if (isProtectedApiPath) {
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 401 },
        );
      }

      // For page routes, redirect to sign-in
      const loginUrl = createLocaleAwareUrl("/handler/sign-in", req);
      if (!pathname.includes("/handler/sign-in")) {
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Skip internationalization for API routes
  if (isApiPath) {
    return NextResponse.next();
  }

  // Apply internationalization middleware for page routes only
  return intlMiddleware(req);
}

/**
 * Check if an API path should be publicly accessible
 */
function isPublicApiPath(pathname: string): boolean {
  const publicPaths = [
    "/api/auth/", // Auth endpoints
    "/api/company", // Company info (public)
    "/api/test-auth", // Test endpoint
    "/api/health", // Health check
    "/api/build-log", // Build status (public for client sharing)
  ];

  return publicPaths.some((path) => pathname.startsWith(path));
}

/**
 * Check if a page route requires authentication
 */
function isProtectedPageRoute(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/calculator",
    "/budgeting",
    "/scenarios",
    "/compare",
  ];

  return protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
}

// Run middleware on protected routes including API routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Static files
     * - Stack Auth handler routes
     * - Images and other assets
     * - Next.js internals
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*handler.*).*)",
  ],
};
