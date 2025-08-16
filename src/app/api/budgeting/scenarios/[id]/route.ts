import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { validateBudgetScenarioRequest } from "@/lib/budgeting/validation";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { CreateBudgetScenarioRequest } from "@/types/budgeting";
import { withAuth } from "@/lib/api-auth";

// GET /api/budgeting/scenarios/[id] - Get specific budget scenario with related data
export const GET = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    const params = await context.params;
    logInfo(
      "API:BudgetScenario",
      `GET /api/budgeting/scenarios/${params.id} called`,
    );

    try {
      logDebug("API:BudgetScenario", "User authenticated", {
        userId: user.id,
        email: user.primaryEmail,
      });

      const client = await pool.connect();
      try {
        // Get budget scenario with parent scenario verification
        const budgetScenarioResult = await client.query(
          `SELECT 
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
        WHERE bs.id = $1 AND s.user_id = $2`,
          [params.id, user.id],
        );

        if (budgetScenarioResult.rows.length === 0) {
          return NextResponse.json(
            { error: "Budget scenario not found" },
            { status: 404 },
          );
        }

        const budgetScenario = budgetScenarioResult.rows[0];

        // Get related income scenarios
        const incomeScenarios = await client.query(
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

        // Get related expense scenarios
        const expenseScenarios = await client.query(
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
        ORDER BY start_month, created_at`,
          [params.id],
        );

        logInfo(
          "API:BudgetScenario",
          "Budget scenario retrieved successfully",
          {
            budgetScenarioId: params.id,
            incomeScenarios: incomeScenarios.rows.length,
            expenseScenarios: expenseScenarios.rows.length,
          },
        );

        return NextResponse.json({
          budgetScenario: {
            ...budgetScenario,
            incomeScenarios: incomeScenarios.rows,
            expenseScenarios: expenseScenarios.rows,
          },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      logError("API:BudgetScenario", "Error fetching budget scenario", error);
      return NextResponse.json(
        { error: "Failed to fetch budget scenario" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/budgeting/scenarios/[id] - Update budget scenario
export const PUT = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    const params = await context.params;
    logInfo(
      "API:BudgetScenario",
      `PUT /api/budgeting/scenarios/${params.id} called`,
    );

    try {
      logDebug("API:BudgetScenario", "User authenticated for PUT", {
        userId: user.id,
        email: user.primaryEmail,
      });

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body: Partial<CreateBudgetScenarioRequest> = await request.json();
      logDebug("API:BudgetScenario", "PUT body received", {
        budgetScenarioId: params.id,
        name: body.name,
      });

      // Validate the request if we have the required fields
      if (
        body.baseMonthlyGrossIncome !== undefined &&
        body.baseMonthlyNetIncome !== undefined &&
        body.baseMonthlyExpenses !== undefined
      ) {
        const validation = validateBudgetScenarioRequest(
          body as CreateBudgetScenarioRequest,
        );
        if (!validation.isValid) {
          logError(
            "API:BudgetScenario",
            "Validation failed",
            validation.errors,
          );
          return NextResponse.json(
            {
              error: "Invalid budget scenario data",
              errors: validation.errors,
              warnings: validation.warnings,
            },
            { status: 400 },
          );
        }
      }

      const client = await pool.connect();
      try {
        // Verify ownership
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

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        if (body.name !== undefined) {
          updateFields.push(`name = $${paramIndex}`);
          updateValues.push(body.name);
          paramIndex++;
        }

        if (body.description !== undefined) {
          updateFields.push(`description = $${paramIndex}`);
          updateValues.push(body.description);
          paramIndex++;
        }

        if (body.baseMonthlyGrossIncome !== undefined) {
          updateFields.push(`base_monthly_gross_income = $${paramIndex}`);
          updateValues.push(body.baseMonthlyGrossIncome);
          paramIndex++;
        }

        if (body.baseMonthlyNetIncome !== undefined) {
          updateFields.push(`base_monthly_net_income = $${paramIndex}`);
          updateValues.push(body.baseMonthlyNetIncome);
          paramIndex++;
        }

        if (body.baseMonthlyExpenses !== undefined) {
          updateFields.push(`base_monthly_expenses = $${paramIndex}`);
          updateValues.push(body.baseMonthlyExpenses);
          paramIndex++;
        }

        if (body.customPrincipalPayment !== undefined) {
          updateFields.push(`custom_principal_payment = $${paramIndex}`);
          updateValues.push(body.customPrincipalPayment);
          paramIndex++;
        }

        if (body.principalMultiplier !== undefined) {
          updateFields.push(`principal_multiplier = $${paramIndex}`);
          updateValues.push(body.principalMultiplier);
          paramIndex++;
        }

        if (body.autoAdjustPayments !== undefined) {
          updateFields.push(`auto_adjust_payments = $${paramIndex}`);
          updateValues.push(body.autoAdjustPayments);
          paramIndex++;
        }

        if (updateFields.length === 0) {
          return NextResponse.json(
            { error: "No fields to update" },
            { status: 400 },
          );
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(params.id);

        const updateQuery = `
        UPDATE budget_scenarios 
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
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
          updated_at
      `;

        logInfo("API:BudgetScenario", "Updating budget scenario", {
          budgetScenarioId: params.id,
          fieldsUpdated: updateFields.length - 1, // Exclude updated_at
        });

        const updateResult = await client.query(updateQuery, updateValues);
        const updatedBudgetScenario = updateResult.rows[0];

        logInfo("API:BudgetScenario", "Budget scenario updated successfully", {
          budgetScenarioId: params.id,
          name: updatedBudgetScenario.name,
        });

        return NextResponse.json({
          budgetScenario: updatedBudgetScenario,
        });
      } finally {
        client.release();
      }
    } catch (error) {
      logError("API:BudgetScenario", "Error updating budget scenario", error);
      return NextResponse.json(
        { error: "Failed to update budget scenario" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/budgeting/scenarios/[id] - Delete budget scenario
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { user },
    context: { params: Promise<{ id: string }> },
  ) => {
    const params = await context.params;
    logInfo(
      "API:BudgetScenario",
      `DELETE /api/budgeting/scenarios/${params.id} called`,
    );

    try {
      logDebug("API:BudgetScenario", "User authenticated for DELETE", {
        userId: user.id,
        email: user.primaryEmail,
      });

      const client = await pool.connect();
      try {
        // Verify ownership and delete
        const deleteResult = await client.query(
          `DELETE FROM budget_scenarios bs
         USING scenarios s
         WHERE bs.scenario_id = s.id 
         AND bs.id = $1 
         AND s.user_id = $2
         RETURNING bs.id`,
          [params.id, user.id],
        );

        if (deleteResult.rows.length === 0) {
          return NextResponse.json(
            { error: "Budget scenario not found or access denied" },
            { status: 404 },
          );
        }

        logInfo("API:BudgetScenario", "Budget scenario deleted successfully", {
          budgetScenarioId: params.id,
        });

        return NextResponse.json(null, { status: 204 });
      } finally {
        client.release();
      }
    } catch (error) {
      logError("API:BudgetScenario", "Error deleting budget scenario", error);
      return NextResponse.json(
        { error: "Failed to delete budget scenario" },
        { status: 500 },
      );
    }
  },
);
