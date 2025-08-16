import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { validateExpenseScenarioRequest } from "@/lib/budgeting/validation";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { CreateExpenseScenarioRequest } from "@/types/budgeting";

// GET /api/budgeting/scenarios/[id]/expense-scenarios - Get expense scenarios for budget scenario
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  logInfo(
    "API:ExpenseScenarios",
    `GET /api/budgeting/scenarios/${params.id}/expense-scenarios called`,
  );

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:ExpenseScenarios", "User authenticated", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:ExpenseScenarios", "Stack Auth error", error);
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

      // Get expense scenarios
      const result = await client.query(
        `SELECT 
          id,
          budget_scenario_id,
          name,
          description,
          category,
          subcategory,
          amount,
          start_month,
          end_month,
          frequency,
          is_active,
          is_recurring,
          is_essential,
          priority_level,
          created_at,
          updated_at
        FROM expense_scenarios
        WHERE budget_scenario_id = $1
        ORDER BY start_month, priority_level DESC, created_at`,
        [params.id],
      );

      logInfo(
        "API:ExpenseScenarios",
        `Found ${result.rows.length} expense scenarios`,
        {
          budgetScenarioId: params.id,
        },
      );

      return NextResponse.json({
        expenseScenarios: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:ExpenseScenarios", "Error fetching expense scenarios", error);
    return NextResponse.json(
      { error: "Failed to fetch expense scenarios" },
      { status: 500 },
    );
  }
}

// POST /api/budgeting/scenarios/[id]/expense-scenarios - Create new expense scenario
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  logInfo(
    "API:ExpenseScenarios",
    `POST /api/budgeting/scenarios/${params.id}/expense-scenarios called`,
  );

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:ExpenseScenarios", "User authenticated for POST", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:ExpenseScenarios", "Stack Auth error in POST", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateExpenseScenarioRequest = await request.json();
    logDebug("API:ExpenseScenarios", "POST body received", {
      budgetScenarioId: params.id,
      name: body.name,
      category: body.category,
    });

    // Validate the request
    const validation = validateExpenseScenarioRequest(body);
    if (!validation.isValid) {
      logError("API:ExpenseScenarios", "Validation failed", validation.errors);
      return NextResponse.json(
        {
          error: "Invalid expense scenario data",
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
        "API:ExpenseScenarios",
        "Inserting expense scenario into database",
        {
          budgetScenarioId: params.id,
          name: body.name,
          category: body.category,
        },
      );

      // Insert the expense scenario
      const insertResult = await client.query(
        `INSERT INTO expense_scenarios (
          budget_scenario_id,
          name,
          description,
          category,
          subcategory,
          amount,
          start_month,
          end_month,
          frequency,
          is_recurring,
          is_essential,
          priority_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING 
          id,
          budget_scenario_id,
          name,
          description,
          category,
          subcategory,
          amount,
          start_month,
          end_month,
          frequency,
          is_active,
          is_recurring,
          is_essential,
          priority_level,
          created_at,
          updated_at`,
        [
          params.id,
          body.name,
          body.description || null,
          body.category,
          body.subcategory || null,
          body.amount,
          body.startMonth,
          body.endMonth || null,
          body.frequency,
          body.isRecurring ?? true,
          body.isEssential ?? true,
          body.priorityLevel ?? 5,
        ],
      );

      const expenseScenario = insertResult.rows[0];

      logInfo("API:ExpenseScenarios", "Expense scenario saved successfully", {
        expenseScenarioId: expenseScenario.id,
        name: expenseScenario.name,
      });

      return NextResponse.json(
        {
          expenseScenario,
          suggestions: validation.suggestions,
        },
        { status: 201 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:ExpenseScenarios", "Error saving expense scenario", error);
    return NextResponse.json(
      { error: "Failed to save expense scenario" },
      { status: 500 },
    );
  }
}
