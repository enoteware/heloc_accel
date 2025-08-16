import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { cookies } from "next/headers";
import { logInfo, logDebug, logError } from "@/lib/debug-logger";

export async function GET(request: NextRequest) {
  logInfo("Debug:Auth", "Debug auth endpoint called");

  try {
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    logDebug("Debug:Auth", "All cookies", {
      count: allCookies.length,
      names: allCookies.map((c) => c.name),
    });

    // Try to get user from Stack Auth
    let user = null;
    let authError = null;

    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logInfo("Debug:Auth", "User retrieved successfully", {
        userId: user?.id,
        email: user?.primaryEmail,
        displayName: user?.displayName,
      });
    } catch (error) {
      authError = error;
      logError("Debug:Auth", "Failed to get user", error);
    }

    // Check Stack Auth cookies specifically
    const stackCookies = allCookies.filter(
      (c) =>
        c.name.includes("stack") ||
        c.name.includes("auth") ||
        c.name.includes("session"),
    );

    // Get request headers
    const headers = Object.fromEntries(request.headers.entries());

    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
      projectIdLength: process.env.NEXT_PUBLIC_STACK_PROJECT_ID?.length || 0,
      publishableKeyPrefix:
        process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?.substring(
          0,
          10,
        ) || "not-set",
      nodeEnv: process.env.NODE_ENV,
    };

    const debugInfo = {
      timestamp: new Date().toISOString(),
      authentication: {
        isAuthenticated: !!user,
        user: user
          ? {
              id: user.id,
              email: user.primaryEmail,
              displayName: user.displayName,
              emailVerified: (user as any).emailVerified,
              signedUpAt: user.signedUpAt,
            }
          : null,
        error: authError
          ? {
              message: (authError as any).message || "Unknown error",
              name: (authError as any).name || "Error",
              stack: (authError as any).stack
                ?.split("\n")
                .slice(0, 5)
                .join("\n"),
            }
          : null,
      },
      cookies: {
        total: allCookies.length,
        stackRelated: stackCookies.map((c) => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0,
          httpOnly: (c as any).httpOnly,
          secure: (c as any).secure,
          sameSite: (c as any).sameSite,
          path: (c as any).path,
          domain: (c as any).domain,
        })),
      },
      headers: {
        cookie: headers.cookie ? "present" : "missing",
        authorization: headers.authorization ? "present" : "missing",
        contentType: headers["content-type"],
        userAgent: headers["user-agent"],
        referer: headers.referer,
        origin: headers.origin,
      },
      environment: envCheck,
      stackApp: {
        isConfigured: !!stackServerApp,
        tokenStore: "nextjs-cookie",
      },
    };

    logDebug("Debug:Auth", "Debug info compiled", debugInfo);

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    logError("Debug:Auth", "Debug endpoint error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          error instanceof Error
            ? error.stack?.split("\n").slice(0, 5).join("\n")
            : undefined,
      },
      { status: 500 },
    );
  }
}
