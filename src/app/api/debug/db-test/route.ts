import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    const client = await pool.connect();

    try {
      // Test simple query
      const result = await client.query(
        "SELECT NOW() as current_time, version() as db_version",
      );

      // Test user table access
      const userCount = await client.query(
        "SELECT COUNT(*) as count FROM users",
      );

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version,
          userCount: userCount.rows[0].count,
        },
        environment: {
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlLength: process.env.DATABASE_URL?.length || 0,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        environment: {
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlLength: process.env.DATABASE_URL?.length || 0,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
      },
      { status: 503 },
    );
  }
}
