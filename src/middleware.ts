import { auth } from "@/auth"

export default auth((req) => {
  // req.auth is now available
})

// Only run middleware on specific protected routes
export const config = {
  matcher: [
    /*
     * Match only protected routes that need authentication:
     * - /dashboard
     * - /profile
     * - /calculator
     * - /compare
     * Exclude all API routes, static files, and auth pages
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/calculator/:path*",
    "/compare/:path*"
  ],
}