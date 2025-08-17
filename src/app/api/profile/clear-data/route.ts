import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// DELETE /api/profile/clear-data - Clear all user data
export async function DELETE(request: NextRequest) {
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

    // Clear all user data from database
    const client = await pool.connect();
    try {
      // Start transaction
      await client.query("BEGIN");

      // Delete user scenarios (this will cascade to scenario_calculations)
      await client.query("DELETE FROM scenarios WHERE user_id = $1", [user.id]);

      // Delete user budget scenarios and related data
      await client.query("DELETE FROM budget_scenarios WHERE user_id = $1", [
        user.id,
      ]);

      // Delete user sessions
      await client.query("DELETE FROM user_sessions WHERE user_id = $1", [
        user.id,
      ]);

      // Delete user accounts (OAuth connections)
      await client.query("DELETE FROM user_accounts WHERE user_id = $1", [
        user.id,
      ]);

      // Reset user profile data (keep the user record but clear personal data)
      await client.query(
        `UPDATE users SET
           first_name = NULL,
           last_name = NULL,
           phone_number = NULL,
           address_line1 = NULL,
           address_line2 = NULL,
           city = NULL,
           state = NULL,
           postal_code = NULL,
           country = NULL,
           date_of_birth = NULL,
           age_range = NULL,
           household_size = NULL,
           marital_status = NULL,
           dependents = NULL,
           updated_at = NOW()
         WHERE id = $1`,
        [user.id],
      );

      // Commit transaction
      await client.query("COMMIT");

      return NextResponse.json<ApiResponse>({
        success: true,
        message: "All user data cleared successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Clear user data error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to clear user data",
      },
      { status: 500 },
    );
  }
}
