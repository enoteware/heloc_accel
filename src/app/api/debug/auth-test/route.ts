import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { logInfo, logError } from "@/lib/debug-logger";

export async function GET(request: NextRequest) {
  try {
    logInfo("AuthTest", "Debug auth test endpoint called");

    // Get all cookies
    const cookies = request.cookies.getAll();
    const cookieInfo = cookies.map((cookie) => ({
      name: cookie.name,
      hasValue: !!cookie.value,
      valueLength: cookie.value?.length || 0,
    }));

    // Get headers
    const headers = {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent")?.substring(0, 100),
      authorization: request.headers.get("authorization")
        ? "present"
        : "missing",
      cookie: request.headers.get("cookie") ? "present" : "missing",
    };

    // Test Stack Auth
    let stackAuthResult = null;
    let stackAuthError = null;

    try {
      const stackUser = await stackServerApp.getUser({ tokenStore: request });
      if (stackUser) {
        stackAuthResult = {
          id: stackUser.id,
          email: stackUser.primaryEmail,
          displayName: stackUser.displayName,
          hasServerMetadata: !!stackUser.serverMetadata,
        };
      } else {
        stackAuthResult = null;
      }
    } catch (error) {
      stackAuthError = error instanceof Error ? error.message : String(error);
      logError("AuthTest", "Stack Auth error", error);
    }

    // Environment check
    const envCheck = {
      hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    };

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      request: {
        method: request.method,
        url: request.url,
        pathname: request.nextUrl.pathname,
        headers,
        cookies: cookieInfo,
      },
      stackAuth: {
        user: stackAuthResult,
        error: stackAuthError,
        configured:
          envCheck.hasProjectId &&
          envCheck.hasPublishableKey &&
          envCheck.hasSecretKey,
      },
    };

    logInfo("AuthTest", "Auth test completed", {
      hasUser: !!stackAuthResult,
      cookieCount: cookies.length,
      hasStackCookies: cookies.some(
        (c) => c.name.includes("stack") || c.name.includes("auth"),
      ),
    });

    return NextResponse.json(response);
  } catch (error) {
    logError("AuthTest", "Auth test failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
