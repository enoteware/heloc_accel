import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { ApiResponse } from "@/lib/types";

// PUT /api/profile/password - Change user password
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Password changes are handled by Stack Auth directly
    // This endpoint would redirect to Stack Auth's password change flow
    // or handle it through Stack Auth's API

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Password changes must be done through Stack Auth",
        data: {
          redirectUrl: `${process.env.NEXT_PUBLIC_STACK_URL || "/stack"}/password-change`,
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to change password",
      },
      { status: 500 },
    );
  }
}
