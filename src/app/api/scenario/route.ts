import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  validateCalculatorInputs,
  sanitizeCalculatorInputs,
} from "@/lib/validation";
import { ApiResponse, CreateScenarioInput, Scenario } from "@/lib/types";
import { withAuth } from "@/lib/api-auth";

// GET /api/scenario - Get all scenarios for authenticated user
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    // If DATABASE_URL is not set, return error
    if (!process.env.DATABASE_URL) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      );
    }

    // Fetch user's scenarios from database using local user ID
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, description, 
                current_mortgage_balance, current_interest_rate, remaining_term_months,
                monthly_payment, heloc_limit, heloc_interest_rate, heloc_available_credit,
                monthly_gross_income, monthly_net_income, monthly_expenses, 
                monthly_discretionary_income, property_value, property_tax_monthly,
                insurance_monthly, hoa_fees_monthly, traditional_payoff_months,
                traditional_total_interest, heloc_payoff_months, heloc_total_interest,
                time_saved_months, interest_saved, created_at, updated_at,
                is_public, public_share_token
         FROM scenarios 
         WHERE user_id = $1 
         ORDER BY updated_at DESC`,
        [user.localUser.id],
      );

      const scenarios = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        current_mortgage_balance: row.current_mortgage_balance,
        current_interest_rate: row.current_interest_rate,
        remaining_term_months: row.remaining_term_months,
        monthly_payment: row.monthly_payment,
        heloc_limit: row.heloc_limit,
        heloc_interest_rate: row.heloc_interest_rate,
        heloc_available_credit: row.heloc_available_credit,
        monthly_gross_income: row.monthly_gross_income,
        monthly_net_income: row.monthly_net_income,
        monthly_expenses: row.monthly_expenses,
        monthly_discretionary_income: row.monthly_discretionary_income,
        property_value: row.property_value,
        property_tax_monthly: row.property_tax_monthly,
        insurance_monthly: row.insurance_monthly,
        hoa_fees_monthly: row.hoa_fees_monthly,
        traditional_payoff_months: row.traditional_payoff_months,
        traditional_total_interest: row.traditional_total_interest,
        heloc_payoff_months: row.heloc_payoff_months,
        heloc_total_interest: row.heloc_total_interest,
        time_saved_months: row.time_saved_months,
        interest_saved: row.interest_saved,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_public: row.is_public,
        public_share_token: row.public_share_token,
      }));

      return NextResponse.json<ApiResponse>({
        success: true,
        data: scenarios,
        message: "Scenarios retrieved successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get scenarios error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to retrieve scenarios",
      },
      { status: 500 },
    );
  }
});

// POST /api/scenario - Create new scenario
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Scenario name is required",
        },
        { status: 400 },
      );
    }

    // If DATABASE_URL is not set, return error
    if (!process.env.DATABASE_URL) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      );
    }

    // Sanitize and validate calculator inputs if provided
    if (body.current_mortgage_balance) {
      const sanitizedInputs = sanitizeCalculatorInputs(body);
      const validation = validateCalculatorInputs(sanitizedInputs);

      if (!validation.isValid) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Invalid calculator inputs",
            data: { validationErrors: validation.errors },
          },
          { status: 400 },
        );
      }
    }

    // Create scenario in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO scenarios (
          user_id, name, description, current_mortgage_balance, current_interest_rate,
          remaining_term_months, monthly_payment, heloc_limit, heloc_interest_rate,
          heloc_available_credit, monthly_gross_income, monthly_net_income,
          monthly_expenses, monthly_discretionary_income, property_value,
          property_tax_monthly, insurance_monthly, hoa_fees_monthly,
          traditional_payoff_months, traditional_total_interest,
          heloc_payoff_months, heloc_total_interest, time_saved_months, interest_saved
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING id, name, description, created_at, updated_at`,
        [
          user.localUser.id,
          body.name,
          body.description || "",
          body.current_mortgage_balance || null,
          body.current_interest_rate || null,
          body.remaining_term_months || null,
          body.monthly_payment || null,
          body.heloc_limit || null,
          body.heloc_interest_rate || null,
          body.heloc_available_credit || null,
          body.monthly_gross_income || null,
          body.monthly_net_income || null,
          body.monthly_expenses || null,
          body.monthly_discretionary_income || null,
          body.property_value || null,
          body.property_tax_monthly || null,
          body.insurance_monthly || null,
          body.hoa_fees_monthly || null,
          body.traditional_payoff_months || null,
          body.traditional_total_interest || null,
          body.heloc_payoff_months || null,
          body.heloc_total_interest || null,
          body.time_saved_months || null,
          body.interest_saved || null,
        ],
      );

      const newScenario = result.rows[0];

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          id: newScenario.id,
          name: newScenario.name,
          description: newScenario.description,
          created_at: newScenario.created_at,
          updated_at: newScenario.updated_at,
        },
        message: "Scenario created successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Save scenario error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to save scenario",
      },
      { status: 500 },
    );
  }
});
