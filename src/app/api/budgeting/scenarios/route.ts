import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { validateBudgetScenarioRequest } from "@/lib/budgeting/validation";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { CreateBudgetScenarioRequest } from "@/types/budgeting";

// GET /api/budgeting/scenarios - List user's budget scenarios
export async function GET(request: NextRequest) {
  logInfo("API:BudgetScenarios", "GET /api/budgeting/scenarios called");

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:BudgetScenarios", "User authenticated", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:BudgetScenarios", "Stack Auth error", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      logError("API:BudgetScenarios", "No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          bs.id,
          bs.scenario_id,
          bs.name,
          bs.description,
          bs.base_monthly_gross_income,
          bs.base_monthly_net_income,
          bs.base_monthly_expenses,
          bs.base_discretionary_income,
          bs.recommended_principal_payment,
          bs.custom_principal_payment,
          bs.principal_multiplier,
          bs.auto_adjust_payments,
          bs.is_active,
          bs.created_at,
          bs.updated_at,
          s.name as parent_scenario_name
        FROM budget_scenarios bs
        JOIN scenarios s ON bs.scenario_id = s.id
        WHERE s.user_id = $1
      `;

      const params: any[] = [user.id];
      let paramIndex = 2;

      if (scenarioId) {
        query += ` AND bs.scenario_id = $${paramIndex}`;
        params.push(scenarioId);
        paramIndex++;
      }

      if (active !== null) {
        query += ` AND bs.is_active = $${paramIndex}`;
        params.push(active === "true");
        paramIndex++;
      }

      query += ` ORDER BY bs.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      logDebug("API:BudgetScenarios", "Querying budget scenarios", {
        userId: user.id,
        scenarioId,
        active,
        limit,
        offset,
      });

      const result = await client.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) 
        FROM budget_scenarios bs
        JOIN scenarios s ON bs.scenario_id = s.id
        WHERE s.user_id = $1
      `;
      const countParams: any[] = [user.id];
      let countParamIndex = 2;

      if (scenarioId) {
        countQuery += ` AND bs.scenario_id = $${countParamIndex}`;
        countParams.push(scenarioId);
        countParamIndex++;
      }

      if (active !== null) {
        countQuery += ` AND bs.is_active = $${countParamIndex}`;
        countParams.push(active === "true");
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      logInfo(
        "API:BudgetScenarios",
        `Found ${result.rows.length} budget scenarios`,
        {
          userId: user.id,
          total,
        },
      );

      return NextResponse.json({
        budgetScenarios: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:BudgetScenarios", "Error fetching budget scenarios", error);
    return NextResponse.json(
      { error: "Failed to fetch budget scenarios" },
      { status: 500 },
    );
  }
}

// POST /api/budgeting/scenarios - Create new budget scenario
export async function POST(request: NextRequest) {
  logInfo("API:BudgetScenarios", "POST /api/budgeting/scenarios called");

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:BudgetScenarios", "User authenticated for POST", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:BudgetScenarios", "Stack Auth error in POST", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateBudgetScenarioRequest = await request.json();
    logDebug("API:BudgetScenarios", "POST body received", {
      scenarioId: body.scenarioId,
      name: body.name,
    });

    // Validate the request
    const validation = validateBudgetScenarioRequest(body);
    if (!validation.isValid) {
      logError("API:BudgetScenarios", "Validation failed", validation.errors);
      return NextResponse.json(
        {
          error: "Invalid budget scenario data",
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      // Verify the parent scenario belongs to the user
      const scenarioCheck = await client.query(
        "SELECT id FROM scenarios WHERE id = $1 AND user_id = $2",
        [body.scenarioId, user.id],
      );

      if (scenarioCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Parent scenario not found or access denied" },
          { status: 404 },
        );
      }

      logInfo(
        "API:BudgetScenarios",
        "Inserting budget scenario into database",
        {
          scenarioId: body.scenarioId,
          name: body.name,
        },
      );

      // Insert the budget scenario
      const insertResult = await client.query(
        `INSERT INTO budget_scenarios (
          scenario_id,
          name,
          description,
          base_monthly_gross_income,
          base_monthly_net_income,
          base_monthly_expenses,
          custom_principal_payment,
          principal_multiplier,
          auto_adjust_payments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
          id,
          scenario_id,
          name,
          description,
          base_monthly_gross_income,
          base_monthly_net_income,
          base_monthly_expenses,
          base_discretionary_income,
          recommended_principal_payment,
          custom_principal_payment,
          principal_multiplier,
          auto_adjust_payments,
          is_active,
          created_at,
          updated_at`,
        [
          body.scenarioId,
          body.name,
          body.description || null,
          body.baseMonthlyGrossIncome,
          body.baseMonthlyNetIncome,
          body.baseMonthlyExpenses,
          body.customPrincipalPayment || null,
          body.principalMultiplier || 3.0,
          body.autoAdjustPayments ?? true,
        ],
      );

      const budgetScenario = insertResult.rows[0];

      logInfo("API:BudgetScenarios", "Budget scenario saved successfully", {
        budgetScenarioId: budgetScenario.id,
        name: budgetScenario.name,
      });

      return NextResponse.json(
        {
          budgetScenario,
          suggestions: validation.suggestions,
        },
        { status: 201 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:BudgetScenarios", "Error saving budget scenario", error);
    return NextResponse.json(
      { error: "Failed to save budget scenario" },
      { status: 500 },
    );
  }
}
