import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { randomBytes } from "crypto";

// GET /api/scenario/[id] - Get a specific scenario
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

    // Get scenario from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM scenarios WHERE id = $1 AND user_id = $2`,
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
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          current_mortgage_balance: scenario.current_mortgage_balance,
          current_interest_rate: scenario.current_interest_rate,
          remaining_term_months: scenario.remaining_term_months,
          monthly_payment: scenario.monthly_payment,
          heloc_limit: scenario.heloc_limit,
          heloc_interest_rate: scenario.heloc_interest_rate,
          heloc_available_credit: scenario.heloc_available_credit,
          monthly_gross_income: scenario.monthly_gross_income,
          monthly_net_income: scenario.monthly_net_income,
          monthly_expenses: scenario.monthly_expenses,
          monthly_discretionary_income: scenario.monthly_discretionary_income,
          property_value: scenario.property_value,
          property_tax_monthly: scenario.property_tax_monthly,
          insurance_monthly: scenario.insurance_monthly,
          hoa_fees_monthly: scenario.hoa_fees_monthly,
          traditional_payoff_months: scenario.traditional_payoff_months,
          traditional_total_interest: scenario.traditional_total_interest,
          heloc_payoff_months: scenario.heloc_payoff_months,
          heloc_total_interest: scenario.heloc_total_interest,
          time_saved_months: scenario.time_saved_months,
          interest_saved: scenario.interest_saved,
          created_at: scenario.created_at,
          updated_at: scenario.updated_at,
          is_public: scenario.is_public,
          public_share_token: scenario.public_share_token,
        },
        message: "Scenario retrieved successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get scenario error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to retrieve scenario",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/scenario/[id] - Delete a specific scenario
export async function DELETE(
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

    // Delete scenario from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM scenarios WHERE id = $1 AND user_id = $2 RETURNING id",
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

      return NextResponse.json<ApiResponse>({
        success: true,
        message: "Scenario deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete scenario error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete scenario",
      },
      { status: 500 },
    );
  }
}

// PUT /api/scenario/[id] - Update a specific scenario
export async function PUT(
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

    // Update scenario in database
    const client = await pool.connect();
    try {
      // First check if user owns this scenario
      const checkResult = await client.query(
        "SELECT id FROM scenarios WHERE id = $1 AND user_id = $2",
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

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      // Only update fields that are provided
      const allowedFields = [
        "name",
        "description",
        "current_mortgage_balance",
        "current_interest_rate",
        "remaining_term_months",
        "monthly_payment",
        "heloc_limit",
        "heloc_interest_rate",
        "heloc_available_credit",
        "monthly_gross_income",
        "monthly_net_income",
        "monthly_expenses",
        "monthly_discretionary_income",
        "property_value",
        "property_tax_monthly",
        "insurance_monthly",
        "hoa_fees_monthly",
        "traditional_payoff_months",
        "traditional_total_interest",
        "heloc_payoff_months",
        "heloc_total_interest",
        "time_saved_months",
        "interest_saved",
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(body[field]);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "No valid fields to update",
          },
          { status: 400 },
        );
      }

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      const updateQuery = `
        UPDATE scenarios 
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING id, name, description, updated_at
      `;

      const result = await client.query(updateQuery, [
        ...updateValues,
        scenarioId,
        user.id,
      ]);

      const updatedScenario = result.rows[0];

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          id: updatedScenario.id,
          name: updatedScenario.name,
          description: updatedScenario.description,
          updated_at: updatedScenario.updated_at,
        },
        message: "Scenario updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update scenario error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update scenario",
      },
      { status: 500 },
    );
  }
}
