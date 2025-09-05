"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  CalculatorValidationInput,
  ValidationError,
} from "@/lib/validation";
import { useDebounce } from "@/hooks/useDebounce";
import { Home, CreditCard, DollarSign, Building } from "lucide-react";
import {
  safeLTVCalculation,
  isMIPRequired,
  calculateSuggestedMonthlyPMI,
} from "@/lib/calculations";
import { useTranslations } from "next-intl";

interface LiveCalculatorFormProps {
  onCalculate: (data: CalculatorValidationInput) => void;
  onClear?: () => void;
  initialData?: Partial<CalculatorValidationInput>;
  validationErrors?: ValidationError[];
}

export default function LiveCalculatorForm({
  onCalculate,
  onClear,
  initialData = {},
  validationErrors = [],
}: LiveCalculatorFormProps) {
  const t = useTranslations("calculator");
  const [useYearsInput, setUseYearsInput] = useState(true);
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

  // Debounce the form data to avoid too many calculations
  const debouncedFormData = useDebounce(formData, 500);

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

  // Trigger calculation when debounced data changes
  useEffect(() => {
    // Only calculate if we have minimum required fields
    if (
      debouncedFormData.currentMortgageBalance > 0 &&
      debouncedFormData.currentInterestRate > 0 &&
      debouncedFormData.remainingTermMonths > 0 &&
      debouncedFormData.monthlyPayment > 0 &&
      (debouncedFormData.helocLimit ?? 0) > 0 &&
      (debouncedFormData.helocInterestRate ?? 0) > 0 &&
      (debouncedFormData.monthlyDiscretionaryIncome ?? 0) > 0
    ) {
      onCalculate(debouncedFormData);
    }
  }, [debouncedFormData, onCalculate]);

  const handleInputChange = (
    field: keyof CalculatorValidationInput,
    value: string | number,
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-calculate discretionary income
      if (field === "monthlyNetIncome" || field === "monthlyExpenses") {
        const netIncome =
          field === "monthlyNetIncome"
            ? Number(value)
            : Number(prev.monthlyNetIncome) || 0;
        const expenses =
          field === "monthlyExpenses"
            ? Number(value)
            : Number(prev.monthlyExpenses) || 0;
        newData.monthlyDiscretionaryIncome = Math.max(0, netIncome - expenses);
      }

      return newData;
    });
  };

  const getDemoScenarios = () => [
    {
      name: "Standard",
      data: {
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
        scenarioName: "Standard Demo",
        description: "Typical family scenario",
      },
    },
    {
      name: "High Income",
      data: {
        currentMortgageBalance: 750000,
        currentInterestRate: 6.0,
        remainingTermMonths: 240, // 20 years
        monthlyPayment: 5373,
        propertyValue: 1000000,
        propertyTaxMonthly: 1250,
        insuranceMonthly: 200,
        hoaFeesMonthly: 150,
        pmiMonthly: 0,
        helocLimit: 200000,
        helocInterestRate: 7.0,
        helocAvailableCredit: 180000,
        monthlyGrossIncome: 15000,
        monthlyNetIncome: 11000,
        monthlyExpenses: 6500,
        monthlyDiscretionaryIncome: 4500,
        scenarioName: "High Income Demo",
        description: "High-income household",
      },
    },
  ];

  const handlePrefillDemo = (scenarioIndex = 0) => {
    // Clear form first to ensure clean state
    setFormData({
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
    });

    // Then set demo data after a brief delay
    setTimeout(() => {
      const scenarios = getDemoScenarios();
      const demoData = scenarios[scenarioIndex].data;

      setFormData(demoData);
      // Clear any existing errors
      setErrors({});
    }, 50);
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
    // Call the onClear callback if provided to clear results
    if (onClear) {
      onClear();
    }
  };

  // External utility controls via custom events (for TOC buttons)
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      // @ts-ignore - CustomEvent detail
      const idx = (e as CustomEvent)?.detail?.index ?? 0;
      handlePrefillDemo(idx);
    };
    const handleClear = () => handleClearForm();

    window.addEventListener(
      "calculator:prefill",
      handlePrefill as EventListener,
    );
    window.addEventListener("calculator:clear", handleClear as EventListener);

    return () => {
      window.removeEventListener(
        "calculator:prefill",
        handlePrefill as EventListener,
      );
      window.removeEventListener(
        "calculator:clear",
        handleClear as EventListener,
      );
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
      </div>

      {/* Mortgage Information Section */}
      <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" />
          {t("currentMortgage")}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="currentMortgageBalance"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("balance")}
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
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="currentInterestRate"
                className="block text-sm font-medium text-foreground-secondary mb-1"
              >
                {t("interestRate")} (%)
              </label>
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
                placeholder="0"
                step="0.01"
                min="0"
                max="30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="remainingTerm"
                  className="block text-sm font-medium text-foreground-secondary"
                >
                  {t("remainingTerm")}
                </label>
                <button
                  type="button"
                  onClick={() => setUseYearsInput(!useYearsInput)}
                  className="text-xs safe-link underline"
                >
                  {useYearsInput ? t("switchToMonths") : t("switchToYears")}
                </button>
              </div>
              {useYearsInput ? (
                <>
                  <input
                    type="number"
                    id="remainingTermYears"
                    value={
                      formData.remainingTermMonths
                        ? (formData.remainingTermMonths / 12).toFixed(1)
                        : ""
                    }
                    onChange={(e) => {
                      const years = parseFloat(e.target.value) || 0;
                      handleInputChange(
                        "remainingTermMonths",
                        Math.round(years * 12),
                      );
                    }}
                    className="input-default w-full rounded-md"
                    placeholder="e.g. 25"
                    min="0.1"
                    max="40"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-foreground-muted">
                    {formData.remainingTermMonths
                      ? "= " + formData.remainingTermMonths + " months"
                      : t("enterYearsRemaining")}
                  </p>
                </>
              ) : (
                <>
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
                    placeholder="e.g. 300"
                    min="1"
                    max="480"
                  />
                  <p className="mt-1 text-xs text-foreground-muted">
                    {formData.remainingTermMonths
                      ? "= " +
                        (formData.remainingTermMonths / 12).toFixed(1) +
                        " years"
                      : "Enter months remaining"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="monthlyPayment"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("monthlyPayment")}
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
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* HELOC Information Section */}
      <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("heloc")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="helocLimit"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("helocLimit")}
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
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="helocInterestRate"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("interestRate")} (%)
            </label>
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
              placeholder="0"
              step="0.01"
              min="0"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Income and Expenses Section */}
      <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t("income")}
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="monthlyGrossIncome"
                className="block text-sm font-medium text-foreground-secondary mb-1"
              >
                {t("grossIncome")}
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
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="monthlyNetIncome"
                className="block text-sm font-medium text-foreground-secondary mb-1"
              >
                {t("netIncome")}
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
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="monthlyExpenses"
                className="block text-sm font-medium text-foreground-secondary mb-1"
              >
                {t("expenses")}
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
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="monthlyDiscretionaryIncome"
                className="block text-sm font-medium text-foreground-secondary mb-1"
              >
                {t("discretionaryIncome")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">
                  $
                </span>
                <input
                  type="number"
                  id="monthlyDiscretionaryIncome"
                  value={formData.monthlyDiscretionaryIncome || ""}
                  readOnly
                  className="w-full pl-8 pr-3 py-2 border rounded-md cursor-not-allowed text-foreground"
                  style={{
                    backgroundColor: "rgb(var(--color-info-background))",
                    borderColor: "rgb(var(--color-info-border))",
                  }}
                  placeholder="Auto-calculated"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-foreground-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                {t("netIncomeMinusExpenses")} = $
                {formData.monthlyDiscretionaryIncome?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information Section */}
      <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t("propertyInfo")} ({t("optional")})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="propertyValue"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("propertyValue")}
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
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="propertyTaxMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("propertyTax")}
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
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="insuranceMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("insurance")}
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
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hoaFeesMonthly"
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {t("hoaFees")}
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
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* LTV Analysis */}
        {ltvInfo.canCalculateLTV && (
          <div
            className="col-span-2 rounded-lg p-3 mb-2 border border-info-border"
            style={{ backgroundColor: "rgb(var(--color-info-background))" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-info">
                LTV Analysis
              </span>
              <span
                className={
                  "text-xs font-semibold px-2 py-1 rounded " +
                  (ltvInfo.isMIPRequired
                    ? "safe-warning-light"
                    : "safe-success-light")
                }
              >
                {ltvInfo.ltvRatio.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-info">
              {ltvInfo.isMIPRequired
                ? "MIP/PMI required (LTV > 80%). Suggested: " +
                  ltvInfo.suggestedMonthlyPMI +
                  "/month."
                : "MIP/PMI typically not required (LTV <= 80%)."}
            </p>
            {ltvInfo.isMIPRequired && ltvInfo.suggestedMonthlyPMI > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleInputChange("pmiMonthly", ltvInfo.suggestedMonthlyPMI);
                }}
                className="mt-2 text-xs btn-primary px-2 py-1 rounded"
              >
                {"Use Suggested: $" + ltvInfo.suggestedMonthlyPMI + "/mo"}
              </button>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="pmiMonthly"
            className={
              "block text-sm font-medium mb-1 " +
              (ltvInfo.isMIPRequired
                ? "text-warning"
                : "text-foreground-secondary")
            }
          >
            {ltvInfo.isMIPRequired ? t("pmi") + " *" : t("pmi")}
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
              className={
                "input-default w-full pl-8 rounded-md " +
                (ltvInfo.isMIPRequired ? "border-warning" : "border-input")
              }
              placeholder={
                ltvInfo.canCalculateLTV &&
                ltvInfo.isMIPRequired &&
                ltvInfo.suggestedMonthlyPMI > 0
                  ? ltvInfo.suggestedMonthlyPMI.toString()
                  : ""
              }
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {ltvInfo.canCalculateLTV
              ? ltvInfo.isMIPRequired
                ? t("requiredPMI")
                : t("optionalPMI")
              : t("privateMortgageInsurance")}
          </p>
        </div>
      </div>
    </div>
  );
}
