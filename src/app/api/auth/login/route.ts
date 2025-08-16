import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // This endpoint is no longer needed since Stack Auth handles authentication
    // All authentication should go through Stack Auth

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error:
          "Authentication is handled by Stack Auth. Please use the Stack Auth login flow.",
        data: {
          redirectUrl: `${process.env.NEXT_PUBLIC_STACK_URL || "/stack"}/sign-in`,
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Authentication is handled by Stack Auth",
      },
      { status: 500 },
    );
  }
}
