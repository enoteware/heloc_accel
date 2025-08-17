import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { logger } from "@/lib/logger";
import {
  getOrCreateLocalUser,
  updateLastLogin,
  type LocalUser,
} from "@/lib/user-sync";

export interface AuthenticatedUser {
  id: string;
  primaryEmail: string;
  displayName?: string;
  serverMetadata?: any;
  localUser: LocalUser;
}

export interface AuthResult {
  success: true;
  user: AuthenticatedUser;
}

export interface AuthError {
  success: false;
  error: string;
  status: number;
}

/**
 * Authenticate a user from a Next.js API request using Stack Auth
 * Also syncs with local database user
 * @param request - The Next.js request object
 * @returns Promise<AuthResult | AuthError>
 */
export async function authenticateApiRequest(
  request: NextRequest,
): Promise<AuthResult | AuthError> {
  try {
    const stackUser = await stackServerApp.getUser({ tokenStore: request });

    if (!stackUser) {
      logger.warn("API authentication failed: No user found", {
        path: request.nextUrl.pathname,
        method: request.method,
      });

      return {
        success: false,
        error: "Authentication required",
        status: 401,
      };
    }

    // Get or create local database user
    const localUser = await getOrCreateLocalUser(stackUser);

    // Update last login timestamp
    await updateLastLogin(localUser.id);

    logger.info("API authentication successful", {
      stackUserId: stackUser.id,
      localUserId: localUser.id,
      email: stackUser.primaryEmail,
      path: request.nextUrl.pathname,
      method: request.method,
    });

    return {
      success: true,
      user: {
        id: stackUser.id,
        primaryEmail: stackUser.primaryEmail || "",
        displayName: stackUser.displayName || "",
        serverMetadata: stackUser.serverMetadata,
        localUser,
      },
    };
  } catch (error) {
    logger.error(
      "API authentication error",
      error instanceof Error ? error : new Error(String(error)),
      {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    );

    return {
      success: false,
      error: "Authentication error",
      status: 401,
    };
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * @param handler - The API route handler function
 * @returns Wrapped handler that checks authentication first
 */
export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser },
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    return handler(request, { user: authResult.user }, ...args);
  };
}

/**
 * Check if a user has admin privileges
 * @param user - The authenticated user
 * @returns boolean indicating if user is admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return (
    user.primaryEmail === "admin@helocaccelerator.com" ||
    user.serverMetadata?.role === "admin" ||
    user.serverMetadata?.isAdmin === true
  );
}

/**
 * Middleware wrapper for API routes that require admin access
 * @param handler - The API route handler function
 * @returns Wrapped handler that checks admin access first
 */
export function withAdminAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser },
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    if (!isAdmin(authResult.user)) {
      logger.warn("Admin access denied", {
        userId: authResult.user.id,
        email: authResult.user.primaryEmail,
        path: request.nextUrl.pathname,
        method: request.method,
      });

      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    return handler(request, { user: authResult.user }, ...args);
  };
}

/**
 * Optional authentication - returns user if authenticated, null if not
 * Useful for endpoints that work differently for authenticated vs anonymous users
 * @param request - The Next.js request object
 * @returns Promise<AuthenticatedUser | null>
 */
export async function getOptionalUser(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  try {
    const stackUser = await stackServerApp.getUser({ tokenStore: request });

    if (!stackUser) {
      return null;
    }

    // Get or create local database user
    const localUser = await getOrCreateLocalUser(stackUser);

    return {
      id: stackUser.id,
      primaryEmail: stackUser.primaryEmail || "",
      displayName: stackUser.displayName || "",
      serverMetadata: stackUser.serverMetadata,
      localUser,
    };
  } catch (error) {
    logger.debug("Optional authentication failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: request.nextUrl.pathname,
    });
    return null;
  }
}
