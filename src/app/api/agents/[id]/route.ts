import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/agents/[id] - Get single agent by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid agent ID",
        },
        { status: 400 },
      );
    }

    // Agent details are public information (for contact purposes)
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, first_name, last_name, title, email, phone, is_active FROM agents WHERE id = $1",
        [agentId],
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Agent not found",
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
          isActive: agent.is_active,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch agent",
      },
      { status: 500 },
    );
  }
}

// PUT /api/agents/[id] - Update agent (admin only)
export async function PUT(request: NextRequest, { params }: Params) {
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
    // For now, restrict to prevent unauthorized updates
    return NextResponse.json(
      {
        success: false,
        error: "Admin access required",
      },
      { status: 403 },
    );

    // When admin roles are implemented, uncomment the following:
    /*
    const { id } = await params
    const agentId = parseInt(id)
    const body = await request.json()

    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid agent ID'
        },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE agents 
         SET first_name = $1, last_name = $2, title = $3, email = $4, phone = $5, is_active = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING id, first_name, last_name, title, email, phone, is_active, updated_at`,
        [
          body.firstName,
          body.lastName,
          body.title || '',
          body.email,
          body.phone || '',
          body.isActive ?? true,
          agentId
        ]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found'
          },
          { status: 404 }
        )
      }

      const updatedAgent = result.rows[0]
      return NextResponse.json({
        success: true,
        data: {
          id: updatedAgent.id,
          firstName: updatedAgent.first_name,
          lastName: updatedAgent.last_name,
          title: updatedAgent.title,
          email: updatedAgent.email,
          phone: updatedAgent.phone,
          isActive: updatedAgent.is_active,
          updatedAt: updatedAgent.updated_at
        }
      })
    } finally {
      client.release()
    }
    */
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update agent",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/agents/[id] - Delete agent (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
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
    // For now, restrict to prevent unauthorized deletions
    return NextResponse.json(
      {
        success: false,
        error: "Admin access required",
      },
      { status: 403 },
    );

    // When admin roles are implemented, uncomment the following:
    /*
    const { id } = await params
    const agentId = parseInt(id)

    if (isNaN(agentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid agent ID'
        },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM agents WHERE id = $1 RETURNING id',
        [agentId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found'
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Agent deleted successfully'
      })
    } finally {
      client.release()
    }
    */
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete agent",
      },
      { status: 500 },
    );
  }
}
