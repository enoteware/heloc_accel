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

// POST /api/scenario - Create new scenario (accepts camelCase or snake_case)
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

    // Helper to read either camelCase or snake_case
    const pick = (obj: any, camel: string, snake: string) =>
      obj?.[camel] ?? obj?.[snake];

    // Build a camelCase input for validation/sanitization
    const camelInput = {
      scenarioName: body.scenarioName ?? body.name, // used by validation
      description: body.description,
      currentMortgageBalance: pick(
        body,
        "currentMortgageBalance",
        "current_mortgage_balance",
      ),
      currentInterestRate: pick(
        body,
        "currentInterestRate",
        "current_interest_rate",
      ),
      remainingTermMonths: pick(
        body,
        "remainingTermMonths",
        "remaining_term_months",
      ),
      monthlyPayment: pick(body, "monthlyPayment", "monthly_payment"),
      helocLimit: pick(body, "helocLimit", "heloc_limit"),
      helocInterestRate: pick(body, "helocInterestRate", "heloc_interest_rate"),
      helocAvailableCredit: pick(
        body,
        "helocAvailableCredit",
        "heloc_available_credit",
      ),
      monthlyGrossIncome: pick(
        body,
        "monthlyGrossIncome",
        "monthly_gross_income",
      ),
      monthlyNetIncome: pick(body, "monthlyNetIncome", "monthly_net_income"),
      monthlyExpenses: pick(body, "monthlyExpenses", "monthly_expenses"),
      monthlyDiscretionaryIncome: pick(
        body,
        "monthlyDiscretionaryIncome",
        "monthly_discretionary_income",
      ),
      propertyValue: pick(body, "propertyValue", "property_value"),
      propertyTaxMonthly: pick(
        body,
        "propertyTaxMonthly",
        "property_tax_monthly",
      ),
      insuranceMonthly: pick(body, "insuranceMonthly", "insurance_monthly"),
      hoaFeesMonthly: pick(body, "hoaFeesMonthly", "hoa_fees_monthly"),
      traditionalPayoffMonths: pick(
        body,
        "traditionalPayoffMonths",
        "traditional_payoff_months",
      ),
      traditionalTotalInterest: pick(
        body,
        "traditionalTotalInterest",
        "traditional_total_interest",
      ),
      helocPayoffMonths: pick(body, "helocPayoffMonths", "heloc_payoff_months"),
      helocTotalInterest: pick(
        body,
        "helocTotalInterest",
        "heloc_total_interest",
      ),
      timeSavedMonths: pick(body, "timeSavedMonths", "time_saved_months"),
      interestSaved: pick(body, "interestSaved", "interest_saved"),
    };

    // Determine if we have calculator fields to validate
    const hasCalculatorInputs = [
      "currentMortgageBalance",
      "currentInterestRate",
      "remainingTermMonths",
      "monthlyPayment",
      "monthlyGrossIncome",
      "monthlyNetIncome",
      "monthlyExpenses",
      "monthlyDiscretionaryIncome",
    ].some((k) => camelInput[k as keyof typeof camelInput] !== undefined);

    if (hasCalculatorInputs) {
      const hadHelocLimit = camelInput.helocLimit !== undefined;
      const hadHelocRate = camelInput.helocInterestRate !== undefined;
      const hadHelocAvail = camelInput.helocAvailableCredit !== undefined;

      const sanitizedInputs = sanitizeCalculatorInputs(camelInput);

      // For validation, only include HELOC fields if they were actually provided
      const sanitizedForValidation: any = { ...sanitizedInputs };
      if (!(hadHelocLimit || hadHelocRate || hadHelocAvail)) {
        delete sanitizedForValidation.helocLimit;
        delete sanitizedForValidation.helocInterestRate;
        delete sanitizedForValidation.helocAvailableCredit;
      }

      const validation = validateCalculatorInputs(sanitizedForValidation);
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

      // Use sanitized inputs for DB insert where applicable
      camelInput.currentMortgageBalance =
        sanitizedInputs.currentMortgageBalance;
      camelInput.currentInterestRate = sanitizedInputs.currentInterestRate;
      camelInput.remainingTermMonths = sanitizedInputs.remainingTermMonths;
      camelInput.monthlyPayment = sanitizedInputs.monthlyPayment;
      camelInput.monthlyGrossIncome = sanitizedInputs.monthlyGrossIncome;
      camelInput.monthlyNetIncome = sanitizedInputs.monthlyNetIncome;
      camelInput.monthlyExpenses = sanitizedInputs.monthlyExpenses;
      camelInput.monthlyDiscretionaryIncome =
        sanitizedInputs.monthlyDiscretionaryIncome;
      camelInput.propertyValue = sanitizedInputs.propertyValue;
      camelInput.propertyTaxMonthly = sanitizedInputs.propertyTaxMonthly;
      camelInput.insuranceMonthly = sanitizedInputs.insuranceMonthly;
      camelInput.hoaFeesMonthly = sanitizedInputs.hoaFeesMonthly;

      // Only apply sanitized HELOC values if caller provided any HELOC fields
      if (hadHelocLimit || hadHelocRate || hadHelocAvail) {
        camelInput.helocLimit = sanitizedInputs.helocLimit;
        camelInput.helocInterestRate = sanitizedInputs.helocInterestRate;
        camelInput.helocAvailableCredit = sanitizedInputs.helocAvailableCredit;
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
          camelInput.description || "",
          camelInput.currentMortgageBalance ?? null,
          camelInput.currentInterestRate ?? null,
          camelInput.remainingTermMonths ?? null,
          camelInput.monthlyPayment ?? null,
          camelInput.helocLimit ?? null,
          camelInput.helocInterestRate ?? null,
          camelInput.helocAvailableCredit ?? null,
          camelInput.monthlyGrossIncome ?? null,
          camelInput.monthlyNetIncome ?? null,
          camelInput.monthlyExpenses ?? null,
          camelInput.monthlyDiscretionaryIncome ?? null,
          camelInput.propertyValue ?? null,
          camelInput.propertyTaxMonthly ?? null,
          camelInput.insuranceMonthly ?? null,
          camelInput.hoaFeesMonthly ?? null,
          camelInput.traditionalPayoffMonths ?? null,
          camelInput.traditionalTotalInterest ?? null,
          camelInput.helocPayoffMonths ?? null,
          camelInput.helocTotalInterest ?? null,
          camelInput.timeSavedMonths ?? null,
          camelInput.interestSaved ?? null,
        ],
      );

      const newScenario = result.rows[0];

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            scenario: {
              id: newScenario.id,
              name: newScenario.name,
              description: newScenario.description,
              created_at: newScenario.created_at,
              updated_at: newScenario.updated_at,
            },
          },
          message: "Scenario created successfully",
        },
        { status: 201 },
      );
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
