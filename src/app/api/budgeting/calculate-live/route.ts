import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { calculateLive } from "@/lib/budgeting/calculations";
import { validateLiveCalculationRequest } from "@/lib/budgeting/validation";
import { logInfo, logError, logDebug } from "@/lib/debug-logger";
import type { LiveCalculationRequest } from "@/types/budgeting";

// POST /api/budgeting/calculate-live - Perform real-time calculation without saving
export async function POST(request: NextRequest) {
  logInfo("API:LiveCalculation", "POST /api/budgeting/calculate-live called");

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
      logDebug("API:LiveCalculation", "User authenticated", {
        userId: user?.id,
        email: user?.primaryEmail,
      });
    } catch (error) {
      logError("API:LiveCalculation", "Stack Auth error", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: LiveCalculationRequest = await request.json();

    logDebug("API:LiveCalculation", "Live calculation request received", {
      baseIncome: body.baseIncome,
      baseExpenses: body.baseExpenses,
      scenarios: body.scenarios?.length || 0,
      monthsToProject: body.monthsToProject,
    });

    // Validate the request
    const validation = validateLiveCalculationRequest(body);
    if (!validation.isValid) {
      logError("API:LiveCalculation", "Validation failed", validation.errors);
      return NextResponse.json(
        {
          error: "Invalid calculation request",
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    // Perform the live calculation
    const startTime = Date.now();
    const result = calculateLive(body);
    const calculationTime = Date.now() - startTime;

    logInfo("API:LiveCalculation", "Live calculation completed", {
      userId: user.id,
      discretionaryIncome: result.discretionaryIncome,
      recommendedPayment: result.recommendedPrincipalPayment,
      projectedPayoff: result.projectedPayoffMonths,
      calculationTimeMs: calculationTime,
    });

    // Add rate limiting headers
    const response = NextResponse.json(result);
    response.headers.set("X-Calculation-Time", calculationTime.toString());
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", "4"); // This would be dynamic in production
    response.headers.set(
      "X-RateLimit-Reset",
      (Math.floor(Date.now() / 1000) + 60).toString(),
    );

    return response;
  } catch (error) {
    logError("API:LiveCalculation", "Error performing live calculation", error);
    return NextResponse.json(
      { error: "Failed to perform live calculation" },
      { status: 500 },
    );
  }
}

// GET /api/budgeting/calculate-live - Get calculation capabilities info
export async function GET(request: NextRequest) {
  logInfo("API:LiveCalculation", "GET /api/budgeting/calculate-live called");

  try {
    let user;
    try {
      user = await stackServerApp.getUser({ tokenStore: request });
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      capabilities: {
        maxMonthsToProject: 600, // 50 years
        maxScenarios: 20,
        supportedFrequencies: ["monthly", "quarterly", "annually", "one_time"],
        supportedIncomeTypes: [
          "raise",
          "bonus",
          "job_loss",
          "side_income",
          "investment_income",
          "overtime",
          "commission",
          "rental_income",
          "other",
        ],
        supportedExpenseCategories: [
          "housing",
          "utilities",
          "food",
          "transportation",
          "insurance",
          "debt",
          "discretionary",
          "emergency",
          "healthcare",
          "education",
          "childcare",
          "entertainment",
          "other",
        ],
        rateLimits: {
          requestsPerMinute: 5,
          requestsPerHour: 50,
          requestsPerDay: 200,
        },
        calculationLimits: {
          maxCalculationTimeMs: 5000,
          maxMortgagePrincipal: 10000000, // $10M
          maxHelocLimit: 5000000, // $5M
          maxMonthlyIncome: 1000000, // $1M
          maxMonthlyExpenses: 500000, // $500K
        },
      },
      examples: {
        basicRequest: {
          baseIncome: 6000,
          baseExpenses: 4000,
          mortgageDetails: {
            principal: 300000,
            annualInterestRate: 0.04,
            termInMonths: 360,
            monthlyPayment: 1432.25,
            propertyValue: 400000,
            pmiMonthly: 250,
          },
          scenarios: [],
          monthsToProject: 360,
          principalMultiplier: 3.0,
        },
        withScenariosRequest: {
          baseIncome: 6000,
          baseExpenses: 4000,
          mortgageDetails: {
            principal: 300000,
            annualInterestRate: 0.04,
            termInMonths: 360,
            monthlyPayment: 1432.25,
            propertyValue: 400000,
            pmiMonthly: 250,
          },
          scenarios: [
            {
              type: "income",
              amount: 500,
              startMonth: 13,
              frequency: "monthly",
            },
            {
              type: "expense",
              amount: 5000,
              startMonth: 6,
              frequency: "one_time",
            },
          ],
          monthsToProject: 360,
          principalMultiplier: 3.0,
        },
      },
    });
  } catch (error) {
    logError("API:LiveCalculation", "Error getting calculation info", error);
    return NextResponse.json(
      { error: "Failed to get calculation info" },
      { status: 500 },
    );
  }
}
