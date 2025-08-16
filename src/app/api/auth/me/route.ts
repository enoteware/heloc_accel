import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Ensure JWT_SECRET is set - never use fallback in production
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const decoded = jwt.verify(token.value, jwtSecret) as any;

    return NextResponse.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    // Log the error for debugging but don't expose details
    console.error("JWT verification error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
