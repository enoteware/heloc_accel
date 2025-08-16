"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import type { CalculatorValidationInput } from "@/lib/validation";

interface InputSummaryProps {
  formData: CalculatorValidationInput | null;
  className?: string;
  timestamp?: string;
}

export default function InputSummary({
  formData,
  className = "",
  timestamp,
}: InputSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = useTranslations("inputSummary");
  const locale = useLocale();

  if (!formData) return null;

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === 0) return "-";
    return new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === 0) return "-";
    return `${value.toFixed(2)}%`;
  };

  const formatMonths = (value: number | undefined) => {
    if (value === undefined || value === 0) return "-";
    const years = Math.floor(value / 12);
    const months = value % 12;
    if (years === 0) return `${months} ${t("mo")}`;
    if (months === 0) return `${years} ${t("yr")}`;
    return `${years} ${t("yr")} ${months} ${t("mo")}`;
  };

  const copyToClipboard = async () => {
    const summaryText = `${t("title")}${timestamp ? ` (${t("asOf")} ${new Date(timestamp).toLocaleTimeString()})` : ""}

${t("mortgageDetails")}:
- ${t("currentBalance")}: ${formatCurrency(formData.currentMortgageBalance)}
- ${t("interestRate")}: ${formatPercent(formData.currentInterestRate)}
- ${t("remainingTerm")}: ${formatMonths(formData.remainingTermMonths)}
- ${t("monthlyPayment")}: ${formatCurrency(formData.monthlyPayment)}

${
  formData.propertyValue
    ? `${t("propertyInformation")}:
- ${t("propertyValue")}: ${formatCurrency(formData.propertyValue)}
- ${t("loanToValue")}: ${formData.currentMortgageBalance && formData.propertyValue ? ((formData.currentMortgageBalance / formData.propertyValue) * 100).toFixed(1) + "%" : "-"}
${formData.propertyTaxMonthly ? `- ${t("propertyTax")}: ${formatCurrency(formData.propertyTaxMonthly)}/${t("mo")}` : ""}
${formData.insuranceMonthly ? `- ${t("insurance")}: ${formatCurrency(formData.insuranceMonthly)}/${t("mo")}` : ""}
${formData.hoaFeesMonthly ? `- ${t("hoaFees")}: ${formatCurrency(formData.hoaFeesMonthly)}/${t("mo")}` : ""}
${formData.pmiMonthly ? `- ${t("mipPmi")}: ${formatCurrency(formData.pmiMonthly)}/${t("mo")}` : ""}
`
    : ""
}

${t("helocDetails")}:
- ${t("creditLimit")}: ${formatCurrency(formData.helocLimit)}
- ${t("interestRate")}: ${formatPercent(formData.helocInterestRate)}
${formData.helocAvailableCredit !== undefined ? `- ${t("availableCredit")}: ${formatCurrency(formData.helocAvailableCredit)}` : ""}

${t("incomeExpenses")}:
- ${t("grossIncome")}: ${formatCurrency(formData.monthlyGrossIncome)}/${t("mo")}
- ${t("netIncome")}: ${formatCurrency(formData.monthlyNetIncome)}/${t("mo")}
- ${t("monthlyExpenses")}: ${formatCurrency(formData.monthlyExpenses)}/${t("mo")}
- ${t("discretionaryIncome")}: ${formatCurrency(formData.monthlyDiscretionaryIncome)}/${t("mo")}

${formData.scenarioName ? `${t("scenario")}: ${formData.scenarioName}` : ""}
${formData.description ? formData.description : ""}`;

    try {
      await navigator.clipboard.writeText(summaryText);

      // Visual feedback
      const button = document.getElementById("copy-summary-btn");
      if (button) {
        const originalText = button.textContent;
        button.textContent = t("copied");
        button.classList.add("bg-green-50", "text-green-600");

        setTimeout(() => {
          button.textContent = originalText || t("copySummary");
          button.classList.remove("bg-green-50", "text-green-600");
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card rounded-lg shadow-md border border-border ${className}`}
    >
      <div className="p-5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {t("title")}
          </h3>
          {timestamp && (
            <span className="text-xs text-gray-500 ml-2">
              {t("asOf")} {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Mortgage Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                    {t("mortgageDetails")}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("currentBalance")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(formData.currentMortgageBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("interestRate")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercent(formData.currentInterestRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("remainingTerm")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatMonths(formData.remainingTermMonths)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("monthlyPayment")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(formData.monthlyPayment)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                {(formData.propertyValue ||
                  formData.propertyTaxMonthly ||
                  formData.insuranceMonthly ||
                  formData.hoaFeesMonthly ||
                  formData.pmiMonthly) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                      {t("propertyInformation")}
                    </h4>
                    <div className="space-y-1.5">
                      {formData.propertyValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("propertyValue")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.propertyValue)}
                          </span>
                        </div>
                      )}
                      {formData.propertyValue &&
                        formData.currentMortgageBalance && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {t("loanToValue")}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {(
                                (formData.currentMortgageBalance /
                                  formData.propertyValue) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        )}
                      {formData.propertyTaxMonthly && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("propertyTax")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.propertyTaxMonthly)}/
                            {t("mo")}
                          </span>
                        </div>
                      )}
                      {formData.insuranceMonthly && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("insurance")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.insuranceMonthly)}/
                            {t("mo")}
                          </span>
                        </div>
                      )}
                      {formData.hoaFeesMonthly && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("hoaFees")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.hoaFeesMonthly)}/{t("mo")}
                          </span>
                        </div>
                      )}
                      {formData.pmiMonthly && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("mipPmi")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.pmiMonthly)}/{t("mo")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* HELOC Details */}
                {(formData.helocLimit || formData.helocInterestRate) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                      {t("helocDetails")}
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("creditLimit")}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(formData.helocLimit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("interestRate")}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPercent(formData.helocInterestRate)}
                        </span>
                      </div>
                      {formData.helocAvailableCredit !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {t("availableCredit")}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(formData.helocAvailableCredit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Income & Expenses */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                    {t("incomeExpenses")}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("grossIncome")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(formData.monthlyGrossIncome)}/{t("mo")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("netIncome")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(formData.monthlyNetIncome)}/{t("mo")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("monthlyExpenses")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(formData.monthlyExpenses)}/{t("mo")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">
                        {t("discretionaryIncome")}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatCurrency(formData.monthlyDiscretionaryIncome)}/
                        {t("mo")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenario Info */}
                {formData.scenarioName && (
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Scenario:{" "}
                      </span>
                      <span className="text-gray-900">
                        {formData.scenarioName}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Copy Button */}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <button
                    id="copy-summary-btn"
                    onClick={copyToClipboard}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {t("copySummary")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
