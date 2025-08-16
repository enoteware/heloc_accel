import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { validateIncomeScenarioRequest } from "@/lib/budgeting/validation";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { CreateIncomeScenarioRequest } from "@/types/budgeting";

// GET /api/budgeting/scenarios/[id]/income-scenarios - Get income scenarios for budget scenario
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  logInfo(
    "API:IncomeScenarios",
    `GET /api/budgeting/scenarios/${params.id}/income-scenarios called`,
  );

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:IncomeScenarios", "User authenticated", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:IncomeScenarios", "Stack Auth error", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // Verify budget scenario ownership
      const ownershipCheck = await client.query(
        `SELECT bs.id 
         FROM budget_scenarios bs
         JOIN scenarios s ON bs.scenario_id = s.id
         WHERE bs.id = $1 AND s.user_id = $2`,
        [params.id, user.id],
      );

      if (ownershipCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Budget scenario not found or access denied" },
          { status: 404 },
        );
      }

      // Get income scenarios
      const result = await client.query(
        `SELECT 
          id,
          budget_scenario_id,
          name,
          description,
          scenario_type,
          amount,
          start_month,
          end_month,
          frequency,
          is_active,
          is_recurring,
          tax_rate,
          created_at,
          updated_at
        FROM income_scenarios
        WHERE budget_scenario_id = $1
        ORDER BY start_month, created_at`,
        [params.id],
      );

      logInfo(
        "API:IncomeScenarios",
        `Found ${result.rows.length} income scenarios`,
        {
          budgetScenarioId: params.id,
        },
      );

      return NextResponse.json({
        incomeScenarios: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:IncomeScenarios", "Error fetching income scenarios", error);
    return NextResponse.json(
      { error: "Failed to fetch income scenarios" },
      { status: 500 },
    );
  }
}

// POST /api/budgeting/scenarios/[id]/income-scenarios - Create new income scenario
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  logInfo(
    "API:IncomeScenarios",
    `POST /api/budgeting/scenarios/${params.id}/income-scenarios called`,
  );

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:IncomeScenarios", "User authenticated for POST", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:IncomeScenarios", "Stack Auth error in POST", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateIncomeScenarioRequest = await request.json();
    logDebug("API:IncomeScenarios", "POST body received", {
      budgetScenarioId: params.id,
      name: body.name,
      scenarioType: body.scenarioType,
    });

    // Validate the request
    const validation = validateIncomeScenarioRequest(body);
    if (!validation.isValid) {
      logError("API:IncomeScenarios", "Validation failed", validation.errors);
      return NextResponse.json(
        {
          error: "Invalid income scenario data",
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    try {
      // Verify budget scenario ownership
      const ownershipCheck = await client.query(
        `SELECT bs.id 
         FROM budget_scenarios bs
         JOIN scenarios s ON bs.scenario_id = s.id
         WHERE bs.id = $1 AND s.user_id = $2`,
        [params.id, user.id],
      );

      if (ownershipCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Budget scenario not found or access denied" },
          { status: 404 },
        );
      }

      logInfo(
        "API:IncomeScenarios",
        "Inserting income scenario into database",
        {
          budgetScenarioId: params.id,
          name: body.name,
          scenarioType: body.scenarioType,
        },
      );

      // Insert the income scenario
      const insertResult = await client.query(
        `INSERT INTO income_scenarios (
          budget_scenario_id,
          name,
          description,
          scenario_type,
          amount,
          start_month,
          end_month,
          frequency,
          is_recurring,
          tax_rate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id,
          budget_scenario_id,
          name,
          description,
          scenario_type,
          amount,
          start_month,
          end_month,
          frequency,
          is_active,
          is_recurring,
          tax_rate,
          created_at,
          updated_at`,
        [
          params.id,
          body.name,
          body.description || null,
          body.scenarioType,
          body.amount,
          body.startMonth,
          body.endMonth || null,
          body.frequency,
          body.isRecurring ?? true,
          body.taxRate ?? 0.25,
        ],
      );

      const incomeScenario = insertResult.rows[0];

      logInfo("API:IncomeScenarios", "Income scenario saved successfully", {
        incomeScenarioId: incomeScenario.id,
        name: incomeScenario.name,
      });

      return NextResponse.json(
        {
          incomeScenario,
          suggestions: validation.suggestions,
        },
        { status: 201 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:IncomeScenarios", "Error saving income scenario", error);
    return NextResponse.json(
      { error: "Failed to save income scenario" },
      { status: 500 },
    );
  }
}
