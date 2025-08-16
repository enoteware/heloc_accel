import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { ApiResponse } from "@/lib/types";

// GET /api/profile - Get user profile information
export async function GET(request: NextRequest) {
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

    // Get additional profile data from database if needed
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT created_at, updated_at, last_login FROM users WHERE id = $1",
        [user.id],
      );

      const dbProfile = result.rows[0] || {};

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          id: user.id,
          email: user.primaryEmail,
          displayName: user.displayName,
          emailVerified: (user as any).emailVerified,
          signedUpAt: user.signedUpAt,
          createdAt: dbProfile.created_at || user.signedUpAt,
          updatedAt: dbProfile.updated_at || user.signedUpAt,
          lastLogin: dbProfile.last_login || null,
        },
        message: "Profile retrieved successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to retrieve profile",
      },
      { status: 500 },
    );
  }
}

// PUT /api/profile - Update user profile information
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

    const body = await request.json();

    // Update profile in database (Stack Auth handles core profile updates)
    const client = await pool.connect();
    try {
      // For now, we'll just update the last_login timestamp
      // Stack Auth handles the core profile fields like email, displayName etc.
      // Additional custom fields could be stored in a separate user_profiles table

      await client.query(
        `INSERT INTO users (id, email, created_at, updated_at, last_login)
         VALUES ($1, $2, NOW(), NOW(), NOW())
         ON CONFLICT (id) 
         DO UPDATE SET updated_at = NOW()`,
        [user.id, user.primaryEmail],
      );

      return NextResponse.json<ApiResponse>({
        success: true,
        message: "Profile updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
