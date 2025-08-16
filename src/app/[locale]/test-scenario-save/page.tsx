"use client";

import { useState } from "react";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/design-system/Button";

export default function TestScenarioSave() {
  const user = useUser({ or: "redirect" });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const testSave = async () => {
    setStatus("Testing scenario save...");
    setError("");

    try {
      // Test data matching the calculator structure
      const testPayload = {
        inputs: {
          scenarioName: `Test Scenario - ${new Date().toISOString()}`,
          description: "This is a test scenario to debug saving",
          currentMortgageBalance: 300000,
          currentInterestRate: 6.5,
          remainingTermMonths: 360,
          monthlyPayment: 1896.2,
          helocLimit: 50000,
          helocInterestRate: 8.5,
          helocAvailableCredit: 50000,
          monthlyGrossIncome: 10000,
          monthlyNetIncome: 7500,
          monthlyExpenses: 4000,
          monthlyDiscretionaryIncome: 3500,
          propertyValue: 400000,
          propertyTaxMonthly: 333,
          insuranceMonthly: 150,
          hoaFeesMonthly: 0,
          pmiMonthly: 0,
        },
        results: {
          traditional: {
            payoffMonths: 360,
            totalInterest: 382632,
            monthlyPayment: 1896.2,
            totalPayments: 682632,
            schedule: [],
          },
          heloc: {
            payoffMonths: 240,
            totalInterest: 250000,
            totalMortgageInterest: 200000,
            totalHelocInterest: 50000,
            maxHelocUsed: 45000,
            averageHelocBalance: 25000,
            schedule: [],
          },
          comparison: {
            timeSavedMonths: 120,
            timeSavedYears: 10,
            interestSaved: 132632,
            percentageInterestSaved: 34.65,
            monthlyPaymentDifference: 0,
          },
        },
      };

      setStatus("Sending request to /api/scenarios...");

      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed with status ${response.status}`);
      }

      setStatus(
        `Success! Scenario saved with ID: ${data.scenarioId || data.id}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Scenario Save</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Logged in as:</p>
          <p className="font-semibold">
            {user?.displayName || user?.primaryEmail}
          </p>
          <p className="text-xs text-gray-500">User ID: {user?.id}</p>
        </div>

        <Button onClick={testSave} variant="primary" className="mb-4">
          Test Save Scenario
        </Button>

        {status && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold">Status:</p>
            <p>{status}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
