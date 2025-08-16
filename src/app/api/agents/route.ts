import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import type { Agent } from "@/lib/company-data";

// GET /api/agents - Get all agents (or active agents with ?active=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    // Agents list is public information (for contact purposes)
    // But in production you might want to restrict this based on business rules

    const client = await pool.connect();
    try {
      let query =
        "SELECT id, first_name, last_name, title, email, phone, is_active FROM agents";
      const params: any[] = [];

      if (activeOnly) {
        query += " WHERE is_active = true";
      }

      query += " ORDER BY last_name, first_name";

      const result = await client.query(query, params);

      const agents = result.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        title: row.title,
        email: row.email,
        phone: row.phone,
        isActive: row.is_active,
      }));

      return NextResponse.json({
        success: true,
        data: agents,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch agents",
      },
      { status: 500 },
    );
  }
}

// POST /api/agents - Create new agent (admin only)
export async function POST(request: NextRequest) {
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
    // For now, restrict to prevent unauthorized agent creation
    return NextResponse.json(
      {
        success: false,
        error: "Admin access required",
      },
      { status: 403 },
    );

    // When admin roles are implemented, uncomment the following:
    /*
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: firstName, lastName, email'
        },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO agents (first_name, last_name, title, email, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name, title, email, phone, is_active, created_at, updated_at`,
        [
          body.firstName,
          body.lastName,
          body.title || '',
          body.email,
          body.phone || '',
          body.isActive ?? true
        ]
      )

      const newAgent = result.rows[0]
      return NextResponse.json({
        success: true,
        data: {
          id: newAgent.id,
          firstName: newAgent.first_name,
          lastName: newAgent.last_name,
          title: newAgent.title,
          email: newAgent.email,
          phone: newAgent.phone,
          isActive: newAgent.is_active,
          createdAt: newAgent.created_at,
          updatedAt: newAgent.updated_at
        }
      })
    } finally {
      client.release()
    }
    */
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create agent",
      },
      { status: 500 },
    );
  }
}
