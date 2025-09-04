"use client";

import React, { useState, useMemo, useEffect } from "react";
import type {
  CalculatorValidationInput,
  ValidationError,
} from "@/lib/validation";
import { Icon } from "@/components/Icons";
import {
  safeLTVCalculation,
  isMIPRequired,
  calculateSuggestedMonthlyPMI,
} from "@/lib/calculations";
import { FieldError } from "@/components/ValidationErrorDisplay";
import { formatWithCommas } from "@/lib/format-utils";

interface CalculatorFormProps {
  onSubmit: (data: CalculatorValidationInput) => void;
  loading?: boolean;
  initialData?: Partial<CalculatorValidationInput>;
  validationErrors?: ValidationError[];
}

export default function CalculatorForm({
  onSubmit,
  loading = false,
  initialData = {},
  validationErrors = [],
}: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculatorValidationInput>({
    currentMortgageBalance: initialData.currentMortgageBalance || 0,
    currentInterestRate: initialData.currentInterestRate || 0,
    remainingTermMonths: initialData.remainingTermMonths || 0,
    monthlyPayment: initialData.monthlyPayment || 0,
    propertyValue: initialData.propertyValue,
    propertyTaxMonthly: initialData.propertyTaxMonthly,
    insuranceMonthly: initialData.insuranceMonthly,
    hoaFeesMonthly: initialData.hoaFeesMonthly,
    pmiMonthly: initialData.pmiMonthly,
    helocLimit: initialData.helocLimit || 0,
    helocInterestRate: initialData.helocInterestRate || 0,
    helocAvailableCredit: initialData.helocAvailableCredit,
    monthlyGrossIncome: initialData.monthlyGrossIncome || 0,
    monthlyNetIncome: initialData.monthlyNetIncome || 0,
    monthlyExpenses: initialData.monthlyExpenses || 0,
    monthlyDiscretionaryIncome: initialData.monthlyDiscretionaryIncome || 0,
    scenarioName: initialData.scenarioName,
    description: initialData.description,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update errors when validation errors are passed from parent
  useEffect(() => {
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
    }
  }, [validationErrors]);

  // Calculate LTV ratio and determine if MIP/PMI is required
  const ltvInfo = useMemo(() => {
    const ltvResult = safeLTVCalculation(
      formData.currentMortgageBalance,
      formData.propertyValue,
    );

    if (!ltvResult.success || !ltvResult.canCalculate) {
      return {
        ltvRatio: 0,
        isMIPRequired: false,
        suggestedMonthlyPMI: 0,
        canCalculateLTV: false,
        error: ltvResult.error,
      };
    }

    const mipRequired = isMIPRequired(ltvResult.ltvRatio);
    const suggestedMonthlyPMI = calculateSuggestedMonthlyPMI(
      Number(formData.currentMortgageBalance) || 0,
      ltvResult.ltvRatio,
    );

    return {
      ltvRatio: ltvResult.ltvRatio,
      isMIPRequired: mipRequired,
      suggestedMonthlyPMI,
      canCalculateLTV: true,
      error: undefined,
    };
  }, [formData.currentMortgageBalance, formData.propertyValue]);

  const handleInputChange = (
    field: keyof CalculatorValidationInput,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Automatically update PMI when LTV changes
  useEffect(() => {
    if (ltvInfo.canCalculateLTV) {
      // If LTV is 78% or below, automatically set PMI to 0
      if (
        ltvInfo.ltvRatio <= 78 &&
        formData.pmiMonthly &&
        formData.pmiMonthly > 0
      ) {
        setFormData((prev) => ({
          ...prev,
          pmiMonthly: 0,
        }));
      }
    }
  }, [ltvInfo.ltvRatio, ltvInfo.canCalculateLTV]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    onSubmit(formData);
  };

  const handlePrefillDemo = () => {
    const demoData: CalculatorValidationInput = {
      currentMortgageBalance: 350000,
      currentInterestRate: 6.5,
      remainingTermMonths: 300, // 25 years
      monthlyPayment: 2347,
      propertyValue: 500000,
      propertyTaxMonthly: 583,
      insuranceMonthly: 125,
      hoaFeesMonthly: 0,
      pmiMonthly: 175,
      helocLimit: 100000,
      helocInterestRate: 7.25,
      helocAvailableCredit: 100000,
      monthlyGrossIncome: 8500,
      monthlyNetIncome: 6200,
      monthlyExpenses: 3900,
      monthlyDiscretionaryIncome: 2300,
      scenarioName: "Demo Scenario",
      description: "Sample data for testing the HELOC acceleration strategy",
    };

    setFormData(demoData);
    setErrors({});
  };

  const handleClearForm = () => {
    const emptyData: CalculatorValidationInput = {
      currentMortgageBalance: 0,
      currentInterestRate: 0,
      remainingTermMonths: 0,
      monthlyPayment: 0,
      propertyValue: undefined,
      propertyTaxMonthly: undefined,
      insuranceMonthly: undefined,
      hoaFeesMonthly: undefined,
      pmiMonthly: undefined,
      helocLimit: 0,
      helocInterestRate: 0,
      helocAvailableCredit: undefined,
      monthlyGrossIncome: 0,
      monthlyNetIncome: 0,
      monthlyExpenses: 0,
      monthlyDiscretionaryIncome: 0,
      scenarioName: undefined,
      description: undefined,
    };

    setFormData(emptyData);
    setErrors({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mortgage Information Section */}
      <div className="bg-card border border-border p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Icon name="home" size="sm" />
          Current Mortgage Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="currentMortgageBalance"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Current Mortgage Balance *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="currentMortgageBalance"
                value={formData.currentMortgageBalance || ""}
                onChange={(e) =>
                  handleInputChange(
                    "currentMortgageBalance",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.currentMortgageBalance && (
              <p className="mt-1 text-sm text-destructive">
                {errors.currentMortgageBalance}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="currentInterestRate"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Current Interest Rate * (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="currentInterestRate"
                value={formData.currentInterestRate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "currentInterestRate",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full rounded-md"
                placeholder=""
                step="0.01"
                min="0"
                max="30"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                %
              </span>
            </div>
            {errors.currentInterestRate && (
              <p className="mt-1 text-sm text-destructive">
                {errors.currentInterestRate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="remainingTermMonths"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Remaining Term (months) *
            </label>
            <input
              type="number"
              id="remainingTermMonths"
              value={formData.remainingTermMonths || ""}
              onChange={(e) =>
                handleInputChange(
                  "remainingTermMonths",
                  parseInt(e.target.value) || 0,
                )
              }
              className="input-default w-full rounded-md"
              placeholder=""
              min="1"
              max="480"
              required
            />
            {errors.remainingTermMonths && (
              <p className="mt-1 text-sm text-destructive">
                {errors.remainingTermMonths}
              </p>
            )}
            <p className="mt-1 text-xs text-foreground-secondary">
              {formData.remainingTermMonths
                ? `${Math.round((formData.remainingTermMonths / 12) * 10) / 10} years`
                : ""}
            </p>
          </div>

          <div>
            <label
              htmlFor="monthlyPayment"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Current Monthly Payment *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="monthlyPayment"
                value={formData.monthlyPayment || ""}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyPayment",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.monthlyPayment && (
              <p className="mt-1 text-sm text-destructive">
                {errors.monthlyPayment}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* HELOC Information Section */}
      <div className="bg-card border border-border p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Icon name="credit-card" size="sm" />
          HELOC Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="helocLimit"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              HELOC Credit Limit *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="helocLimit"
                value={formData.helocLimit || ""}
                onChange={(e) =>
                  handleInputChange(
                    "helocLimit",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.helocLimit && (
              <p className="mt-1 text-sm text-destructive">
                {errors.helocLimit}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="helocInterestRate"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              HELOC Interest Rate * (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="helocInterestRate"
                value={formData.helocInterestRate || ""}
                onChange={(e) =>
                  handleInputChange(
                    "helocInterestRate",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full rounded-md"
                placeholder=""
                step="0.01"
                min="0"
                max="30"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                %
              </span>
            </div>
            {errors.helocInterestRate && (
              <p className="mt-1 text-sm text-destructive">
                {errors.helocInterestRate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Income and Expenses Section */}
      <div className="bg-card border border-border p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Icon name="dollar" size="sm" />
          Monthly Income & Expenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="monthlyGrossIncome"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Gross Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="monthlyGrossIncome"
                value={formData.monthlyGrossIncome || ""}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyGrossIncome",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.monthlyGrossIncome && (
              <p className="mt-1 text-sm text-destructive">
                {errors.monthlyGrossIncome}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyNetIncome"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Net Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="monthlyNetIncome"
                value={formData.monthlyNetIncome || ""}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyNetIncome",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.monthlyNetIncome && (
              <p className="mt-1 text-sm text-destructive">
                {errors.monthlyNetIncome}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyExpenses"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Expenses *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="monthlyExpenses"
                value={formData.monthlyExpenses || ""}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyExpenses",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.monthlyExpenses && (
              <p className="mt-1 text-sm text-destructive">
                {errors.monthlyExpenses}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyDiscretionaryIncome"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Discretionary Income *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="monthlyDiscretionaryIncome"
                value={formData.monthlyDiscretionaryIncome || ""}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyDiscretionaryIncome",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
                required
              />
            </div>
            {errors.monthlyDiscretionaryIncome && (
              <p className="mt-1 text-sm text-destructive">
                {errors.monthlyDiscretionaryIncome}
              </p>
            )}
            <p className="mt-1 text-xs text-foreground-secondary">
              Available for HELOC acceleration strategy
            </p>
          </div>
        </div>
      </div>

      {/* Optional Property Information Section */}
      <div className="bg-card border border-border p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Icon name="building" size="sm" />
          Property Information (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="propertyValue"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Original Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="propertyValue"
                value={formData.propertyValue || ""}
                onChange={(e) =>
                  handleInputChange(
                    "propertyValue",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="propertyTaxMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Property Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="propertyTaxMonthly"
                value={formData.propertyTaxMonthly || ""}
                onChange={(e) =>
                  handleInputChange(
                    "propertyTaxMonthly",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="insuranceMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="insuranceMonthly"
                value={formData.insuranceMonthly || ""}
                onChange={(e) =>
                  handleInputChange(
                    "insuranceMonthly",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hoaFeesMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              Monthly HOA Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                $
              </span>
              <input
                type="number"
                id="hoaFeesMonthly"
                value={formData.hoaFeesMonthly || ""}
                onChange={(e) =>
                  handleInputChange(
                    "hoaFeesMonthly",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="input-default w-full pl-8 rounded-md"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* LTV Analysis */}
        {ltvInfo.canCalculateLTV && (
          <div className="mt-4 bg-info-background border border-info rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-info-foreground">
                Loan-to-Value Analysis
              </h4>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  ltvInfo.isMIPRequired
                    ? "bg-warning text-warning-foreground"
                    : "bg-success text-success-foreground"
                }`}
              >
                LTV: {ltvInfo.ltvRatio.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-info-foreground mb-2">
              {ltvInfo.ltvRatio > 80
                ? `MIP/PMI is required when LTV exceeds 80%. Suggested: ${formatWithCommas(ltvInfo.suggestedMonthlyPMI)}/month.`
                : ltvInfo.ltvRatio > 78
                  ? "MIP/PMI may still be required (LTV between 78-80%). Check with your lender."
                  : "MIP/PMI is automatically removed when LTV reaches 78% or below."}
            </p>
            {ltvInfo.isMIPRequired && ltvInfo.suggestedMonthlyPMI > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleInputChange("pmiMonthly", ltvInfo.suggestedMonthlyPMI);
                }}
                className="btn btn-primary"
              >
                Use Suggested: ${formatWithCommas(ltvInfo.suggestedMonthlyPMI)}
                /mo
              </button>
            )}
          </div>
        )}

        {/* Conditional PMI Field */}
        <div className="mt-4">
          <label
            htmlFor="pmiMonthly"
            className={`block text-sm font-medium mb-1 ${
              ltvInfo.isMIPRequired
                ? "text-warning-foreground"
                : "text-foreground-secondary"
            }`}
          >
            {ltvInfo.isMIPRequired ? "Monthly MIP/PMI *" : "Monthly MIP/PMI"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="number"
              id="pmiMonthly"
              value={formData.pmiMonthly || ""}
              onChange={(e) =>
                handleInputChange("pmiMonthly", parseFloat(e.target.value) || 0)
              }
              className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background ${
                ltvInfo.isMIPRequired ? "border-destructive" : "border-input"
              }`}
              placeholder={
                ltvInfo.canCalculateLTV &&
                ltvInfo.isMIPRequired &&
                ltvInfo.suggestedMonthlyPMI > 0
                  ? formatWithCommas(ltvInfo.suggestedMonthlyPMI)
                  : ""
              }
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {ltvInfo.canCalculateLTV
              ? ltvInfo.isMIPRequired
                ? "Required: Private Mortgage Insurance"
                : "Optional: Private Mortgage Insurance (if still paying)"
              : "Private Mortgage Insurance (if applicable)"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Prefill Demo Button */}
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="btn btn-success"
        >
          <Icon name="file-text" size="sm" />
          <span>Fill Demo Data</span>
        </button>

        {/* Clear Form Button */}
        <button
          type="button"
          onClick={handleClearForm}
          className="btn btn-secondary"
        >
          <Icon name="x" size="sm" />
          <span>Clear Form</span>
        </button>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <Icon name="refresh" size="sm" className="animate-spin" />
          ) : (
            <Icon name="calculator" size="sm" />
          )}
          <span>{loading ? "Calculating..." : "Calculate HELOC Strategy"}</span>
        </button>
      </div>
    </form>
  );
}
