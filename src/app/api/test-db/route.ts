import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Test basic connection
      const result = await client.query("SELECT NOW() as current_time");

      // Test table existence
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%budget%'
      `);

      // Test budget_scenarios table specifically
      let budgetScenariosExists = false;
      let budgetScenariosCount = 0;
      try {
        const countResult = await client.query(
          "SELECT COUNT(*) FROM budget_scenarios",
        );
        budgetScenariosExists = true;
        budgetScenariosCount = parseInt(countResult.rows[0].count);
      } catch (error) {
        console.error("Error accessing budget_scenarios:", error);
      }

      return NextResponse.json({
        success: true,
        currentTime: result.rows[0].current_time,
        budgetTables: tableCheck.rows,
        budgetScenariosExists,
        budgetScenariosCount,
        connectionInfo: {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount,
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
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
