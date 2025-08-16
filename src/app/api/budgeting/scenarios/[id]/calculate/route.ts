import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { calculateBudgetingAcceleration } from "@/lib/budgeting/calculations";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { MortgageInput } from "@/lib/calculations";
import type {
  BudgetScenario,
  IncomeScenario,
  ExpenseScenario,
  CalculationRequest,
} from "@/types/budgeting";

// POST /api/budgeting/scenarios/[id]/calculate - Perform calculation for budget scenario
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  logInfo(
    "API:BudgetCalculation",
    `POST /api/budgeting/scenarios/${params.id}/calculate called`,
  );

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:BudgetCalculation", "User authenticated", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:BudgetCalculation", "Stack Auth error", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CalculationRequest = await request.json();
    const {
      includeScenarios,
      monthsToProject = 360,
      recalculateAll = false,
    } = body;

    logDebug("API:BudgetCalculation", "Calculation request received", {
      budgetScenarioId: params.id,
      includeScenarios: includeScenarios?.length || "all",
      monthsToProject,
      recalculateAll,
    });

    const client = await pool.connect();
    try {
      // Get budget scenario with parent scenario data
      const budgetScenarioResult = await client.query(
        `SELECT 
          bs.*,
          s.current_mortgage_balance,
          s.current_interest_rate,
          s.remaining_term_months,
          s.monthly_payment,
          s.property_value,
          s.pmi_monthly,
          s.heloc_limit,
          s.heloc_interest_rate,
          s.heloc_available_credit
        FROM budget_scenarios bs
        JOIN scenarios s ON bs.scenario_id = s.id
        WHERE bs.id = $1 AND s.user_id = $2`,
        [params.id, user.id],
      );

      if (budgetScenarioResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Budget scenario not found or access denied" },
          { status: 404 },
        );
      }

      const budgetScenarioData = budgetScenarioResult.rows[0];

      // Convert database row to BudgetScenario type
      const budgetScenario: BudgetScenario = {
        id: budgetScenarioData.id,
        scenarioId: budgetScenarioData.scenario_id,
        name: budgetScenarioData.name,
        description: budgetScenarioData.description,
        baseMonthlyGrossIncome: parseFloat(
          budgetScenarioData.base_monthly_gross_income,
        ),
        baseMonthlyNetIncome: parseFloat(
          budgetScenarioData.base_monthly_net_income,
        ),
        baseMonthlyExpenses: parseFloat(
          budgetScenarioData.base_monthly_expenses,
        ),
        baseDiscretionaryIncome: parseFloat(
          budgetScenarioData.base_discretionary_income,
        ),
        recommendedPrincipalPayment: parseFloat(
          budgetScenarioData.recommended_principal_payment,
        ),
        customPrincipalPayment: budgetScenarioData.custom_principal_payment
          ? parseFloat(budgetScenarioData.custom_principal_payment)
          : undefined,
        principalMultiplier: parseFloat(
          budgetScenarioData.principal_multiplier,
        ),
        autoAdjustPayments: budgetScenarioData.auto_adjust_payments,
        createdAt: budgetScenarioData.created_at,
        updatedAt: budgetScenarioData.updated_at,
        isActive: budgetScenarioData.is_active,
      };

      // Convert database row to MortgageInput type
      const mortgageInput: MortgageInput = {
        principal: parseFloat(budgetScenarioData.current_mortgage_balance),
        annualInterestRate: parseFloat(
          budgetScenarioData.current_interest_rate,
        ),
        termInMonths: parseInt(budgetScenarioData.remaining_term_months),
        monthlyPayment: parseFloat(budgetScenarioData.monthly_payment),
        propertyValue: budgetScenarioData.property_value
          ? parseFloat(budgetScenarioData.property_value)
          : undefined,
        pmiMonthly: budgetScenarioData.pmi_monthly
          ? parseFloat(budgetScenarioData.pmi_monthly)
          : undefined,
      };

      // HELOC input if available
      const helocInput = budgetScenarioData.heloc_limit
        ? {
            helocLimit: parseFloat(budgetScenarioData.heloc_limit),
            helocRate: parseFloat(budgetScenarioData.heloc_interest_rate),
            helocAvailableCredit: budgetScenarioData.heloc_available_credit
              ? parseFloat(budgetScenarioData.heloc_available_credit)
              : parseFloat(budgetScenarioData.heloc_limit),
          }
        : undefined;

      // Get income scenarios
      let incomeScenarioQuery = `
        SELECT * FROM income_scenarios
        WHERE budget_scenario_id = $1 AND is_active = true
      `;
      const incomeParams: any[] = [params.id];

      if (includeScenarios && includeScenarios.length > 0) {
        incomeScenarioQuery += ` AND id = ANY($2::uuid[])`;
        incomeParams.push(includeScenarios);
      }

      const incomeScenarioResult = await client.query(
        incomeScenarioQuery,
        incomeParams,
      );
      const incomeScenarios: IncomeScenario[] = incomeScenarioResult.rows.map(
        (row) => ({
          id: row.id,
          budgetScenarioId: row.budget_scenario_id,
          name: row.name,
          description: row.description,
          scenarioType: row.scenario_type,
          amount: parseFloat(row.amount),
          startMonth: parseInt(row.start_month),
          endMonth: row.end_month ? parseInt(row.end_month) : undefined,
          frequency: row.frequency,
          isActive: row.is_active,
          isRecurring: row.is_recurring,
          taxRate: parseFloat(row.tax_rate),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
      );

      // Get expense scenarios
      let expenseScenarioQuery = `
        SELECT * FROM expense_scenarios
        WHERE budget_scenario_id = $1 AND is_active = true
      `;
      const expenseParams: any[] = [params.id];

      if (includeScenarios && includeScenarios.length > 0) {
        expenseScenarioQuery += ` AND id = ANY($2::uuid[])`;
        expenseParams.push(includeScenarios);
      }

      const expenseScenarioResult = await client.query(
        expenseScenarioQuery,
        expenseParams,
      );
      const expenseScenarios: ExpenseScenario[] =
        expenseScenarioResult.rows.map((row) => ({
          id: row.id,
          budgetScenarioId: row.budget_scenario_id,
          name: row.name,
          description: row.description,
          category: row.category,
          subcategory: row.subcategory,
          amount: parseFloat(row.amount),
          startMonth: parseInt(row.start_month),
          endMonth: row.end_month ? parseInt(row.end_month) : undefined,
          frequency: row.frequency,
          isActive: row.is_active,
          isRecurring: row.is_recurring,
          isEssential: row.is_essential,
          priorityLevel: parseInt(row.priority_level),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

      logInfo("API:BudgetCalculation", "Starting calculation", {
        budgetScenarioId: params.id,
        incomeScenarios: incomeScenarios.length,
        expenseScenarios: expenseScenarios.length,
        monthsToProject,
      });

      // Perform the calculation
      const calculationResult = calculateBudgetingAcceleration(
        budgetScenario,
        mortgageInput,
        helocInput,
        incomeScenarios,
        expenseScenarios,
        monthsToProject,
      );

      // Store calculation results if requested
      if (recalculateAll) {
        // Clear existing results
        await client.query(
          "DELETE FROM budget_calculation_results WHERE budget_scenario_id = $1",
          [params.id],
        );

        // Insert new results in batches
        const batchSize = 100;
        for (
          let i = 0;
          i < calculationResult.monthlyResults.length;
          i += batchSize
        ) {
          const batch = calculationResult.monthlyResults.slice(
            i,
            i + batchSize,
          );

          const insertQuery = `
            INSERT INTO budget_calculation_results (
              budget_scenario_id, month_number, monthly_gross_income, monthly_net_income,
              monthly_expenses, discretionary_income, recommended_principal_payment,
              actual_principal_payment, beginning_mortgage_balance, ending_mortgage_balance,
              mortgage_payment, mortgage_interest, mortgage_principal, beginning_heloc_balance,
              ending_heloc_balance, heloc_payment, heloc_interest, heloc_principal,
              pmi_payment, current_ltv, pmi_eliminated, cumulative_interest_paid,
              cumulative_principal_paid, cumulative_interest_saved, cumulative_time_saved_months,
              total_monthly_outflow, remaining_cash_flow, cash_flow_stress_ratio
            ) VALUES ${batch
              .map(
                (_, index) =>
                  `($${index * 28 + 1}, $${index * 28 + 2}, $${index * 28 + 3}, $${index * 28 + 4}, 
               $${index * 28 + 5}, $${index * 28 + 6}, $${index * 28 + 7}, $${index * 28 + 8}, 
               $${index * 28 + 9}, $${index * 28 + 10}, $${index * 28 + 11}, $${index * 28 + 12}, 
               $${index * 28 + 13}, $${index * 28 + 14}, $${index * 28 + 15}, $${index * 28 + 16}, 
               $${index * 28 + 17}, $${index * 28 + 18}, $${index * 28 + 19}, $${index * 28 + 20}, 
               $${index * 28 + 21}, $${index * 28 + 22}, $${index * 28 + 23}, $${index * 28 + 24}, 
               $${index * 28 + 25}, $${index * 28 + 26}, $${index * 28 + 27}, $${index * 28 + 28})`,
              )
              .join(", ")}`;

          const values = batch.flatMap((result) => [
            params.id,
            result.monthNumber,
            result.monthlyGrossIncome,
            result.monthlyNetIncome,
            result.monthlyExpenses,
            result.discretionaryIncome,
            result.recommendedPrincipalPayment,
            result.actualPrincipalPayment,
            result.beginningMortgageBalance,
            result.endingMortgageBalance,
            result.mortgagePayment,
            result.mortgageInterest,
            result.mortgagePrincipal,
            result.beginningHelocBalance,
            result.endingHelocBalance,
            result.helocPayment,
            result.helocInterest,
            result.helocPrincipal,
            result.pmiPayment,
            result.currentLtv,
            result.pmiEliminated,
            result.cumulativeInterestPaid,
            result.cumulativePrincipalPaid,
            result.cumulativeInterestSaved,
            result.cumulativeTimeSavedMonths,
            result.totalMonthlyOutflow,
            result.remainingCashFlow,
            result.cashFlowStressRatio,
          ]);

          await client.query(insertQuery, values);
        }

        logInfo("API:BudgetCalculation", "Calculation results stored", {
          budgetScenarioId: params.id,
          monthlyResults: calculationResult.monthlyResults.length,
        });
      }

      logInfo("API:BudgetCalculation", "Calculation completed successfully", {
        budgetScenarioId: params.id,
        payoffMonths: calculationResult.summary.budgetingPayoffMonths,
        monthsSaved: calculationResult.summary.monthsSaved,
        interestSaved: calculationResult.summary.totalInterestSaved,
      });

      return NextResponse.json({
        calculationId: `calc-${params.id}-${Date.now()}`,
        budgetScenarioId: params.id,
        summary: calculationResult.summary,
        monthlyResults: calculationResult.monthlyResults,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logError("API:BudgetCalculation", "Error performing calculation", error);
    return NextResponse.json(
      { error: "Failed to perform calculation" },
      { status: 500 },
    );
  }
}
