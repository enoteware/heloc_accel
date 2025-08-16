import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { randomBytes } from "crypto";

// POST /api/scenario/[id]/share - Generate or toggle sharing for a scenario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id: scenarioId } = await params;
    const body = await request.json();
    const { isPublic } = body;

    // Update scenario sharing settings in database
    const client = await pool.connect();
    try {
      // First check if user owns this scenario
      const checkResult = await client.query(
        "SELECT id, is_public, public_share_token FROM scenarios WHERE id = $1 AND user_id = $2",
        [scenarioId, user.id],
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Scenario not found or access denied",
          },
          { status: 404 },
        );
      }

      const scenario = checkResult.rows[0];
      let shareToken = scenario.public_share_token;

      // Generate new share token if making public and doesn't have one
      if (isPublic && !shareToken) {
        shareToken = randomBytes(32).toString("hex");
      }

      // Update sharing settings
      const updateResult = await client.query(
        `UPDATE scenarios 
         SET is_public = $1, public_share_token = $2, updated_at = NOW()
         WHERE id = $3 AND user_id = $4
         RETURNING is_public, public_share_token`,
        [isPublic, isPublic ? shareToken : null, scenarioId, user.id],
      );

      const updatedScenario = updateResult.rows[0];
      const shareUrl = updatedScenario.is_public
        ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/shared/${updatedScenario.public_share_token}`
        : null;

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          isPublic: updatedScenario.is_public,
          shareUrl,
          shareToken: updatedScenario.public_share_token,
        },
        message: isPublic
          ? "Scenario shared successfully"
          : "Scenario sharing disabled",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Share scenario error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update sharing settings",
      },
      { status: 500 },
    );
  }
}

// GET /api/scenario/[id]/share - Get sharing status for a scenario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id: scenarioId } = await params;

    // Get scenario sharing status from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT is_public, public_share_token FROM scenarios WHERE id = $1 AND user_id = $2",
        [scenarioId, user.id],
      );

      if (result.rows.length === 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Scenario not found or access denied",
          },
          { status: 404 },
        );
      }

      const scenario = result.rows[0];
      const shareUrl = scenario.is_public
        ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/shared/${scenario.public_share_token}`
        : null;

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          isPublic: scenario.is_public,
          shareUrl,
          shareToken: scenario.public_share_token,
        },
        message: "Sharing status retrieved successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get sharing status error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to get sharing status",
      },
      { status: 500 },
    );
  }
}
