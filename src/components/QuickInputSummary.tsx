"use client";

import React from "react";
import type { CalculatorValidationInput } from "@/lib/validation";

interface QuickInputSummaryProps {
  formData: CalculatorValidationInput | null;
  className?: string;
}

export default function QuickInputSummary({
  formData,
  className = "",
}: QuickInputSummaryProps) {
  if (!formData) return null;

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === 0) return "-";
    return new Intl.NumberFormat("en-US", {
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

  return (
    <div className={`bg-card rounded-lg p-4 border border-border ${className}`}>
      <h4 className="text-sm font-medium text-foreground mb-2">
        Quick Summary
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground-secondary">Balance:</span>
          <span className="font-medium">
            {formatCurrency(formData.currentMortgageBalance)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground-secondary">Rate:</span>
          <span className="font-medium">
            {formatPercent(formData.currentInterestRate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground-secondary">Payment:</span>
          <span className="font-medium">
            {formatCurrency(formData.monthlyPayment)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground-secondary">HELOC:</span>
          <span className="font-medium">
            {formatCurrency(formData.helocLimit)}
          </span>
        </div>
        <div className="flex justify-between col-span-2 pt-1 border-t border-border mt-1">
          <span className="text-foreground-secondary">Discretionary:</span>
          <span className="font-medium text-info">
            {formatCurrency(formData.monthlyDiscretionaryIncome)}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
