import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/scenarios/[id] - Get specific scenario
export const GET = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await context.params;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM scenarios 
         WHERE id = $1 AND user_id = $2`,
          [id, user.localUser.id],
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Scenario not found" },
            { status: 404 },
          );
        }

        const scenario = result.rows[0];

        // Convert decimal rates back to percentages for display
        if (scenario.current_interest_rate) {
          scenario.current_interest_rate = scenario.current_interest_rate * 100;
        }
        if (scenario.heloc_interest_rate) {
          scenario.heloc_interest_rate = scenario.heloc_interest_rate * 100;
        }

        return NextResponse.json({ scenario });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching scenario:", error);
      return NextResponse.json(
        { error: "Failed to fetch scenario" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/scenarios/[id] - Delete scenario
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await context.params;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM scenarios 
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
          [id, user.localUser.id],
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Scenario not found or unauthorized" },
            { status: 404 },
          );
        }

        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
      return NextResponse.json(
        { error: "Failed to delete scenario" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/scenarios/[id] - Update scenario
export const PUT = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await context.params;

      const body = await request.json();
      const { name, description } = body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE scenarios 
         SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND user_id = $4
         RETURNING id`,
          [name, description, id, user.localUser.id],
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Scenario not found or unauthorized" },
            { status: 404 },
          );
        }

        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error updating scenario:", error);
      return NextResponse.json(
        { error: "Failed to update scenario" },
        { status: 500 },
      );
    }
  },
);
