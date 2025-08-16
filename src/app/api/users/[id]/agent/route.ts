import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/users/[id]/agent - Get assigned agent for a user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { id: userId } = await params;

    // Check if user is requesting their own agent or is admin
    if (user.id !== userId) {
      // TODO: Add admin role check when roles are implemented
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      );
    }

    // Fetch agent assignment from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT a.id, a.first_name, a.last_name, a.title, a.email, a.phone 
         FROM agents a 
         JOIN user_agent_assignments ua ON a.id = ua.agent_id 
         WHERE ua.user_id = $1 AND a.is_active = true`,
        [userId],
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No agent assigned",
          },
          { status: 404 },
        );
      }

      const agent = result.rows[0];
      return NextResponse.json({
        success: true,
        data: {
          id: agent.id,
          firstName: agent.first_name,
          lastName: agent.last_name,
          title: agent.title,
          email: agent.email,
          phone: agent.phone,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching user agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch agent assignment",
      },
      { status: 500 },
    );
  }
}

// POST /api/users/[id]/agent - Assign agent to user (admin only)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // TODO: Check for admin role when roles are implemented
    // For now, only allow self-assignment (user can't assign agents to others)
    const { id: userId } = await params;
    if (user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent ID is required",
        },
        { status: 400 },
      );
    }

    // Assign agent in database
    const client = await pool.connect();
    try {
      // First check if agent exists and is active
      const agentResult = await client.query(
        "SELECT id FROM agents WHERE id = $1 AND is_active = true",
        [agentId],
      );

      if (agentResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Agent not found or inactive",
          },
          { status: 404 },
        );
      }

      // Insert or update agent assignment
      await client.query(
        `INSERT INTO user_agent_assignments (user_id, agent_id, assigned_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET agent_id = $2, assigned_at = NOW()`,
        [userId, agentId],
      );

      return NextResponse.json({
        success: true,
        message: "Agent assigned successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error assigning agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to assign agent",
      },
      { status: 500 },
    );
  }
}
