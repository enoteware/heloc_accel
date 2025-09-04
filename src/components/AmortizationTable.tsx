"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import {
  PaymentBadge,
  HighlightedCell,
  FlowIndicator,
  AnimatedCounter,
  HighlightLegend,
} from "./HighlightComponents";
interface SchedulePayment {
  month: number;
  helocPayment: number;
  helocBalance: number;
  helocInterest: number;
  discretionaryUsed: number;
  pmiPayment?: number;
  totalMonthlyPayment: number;
  beginningBalance?: number;
  paymentAmount?: number;
  principalPayment?: number;
  interestPayment?: number;
  endingBalance?: number;
  cumulativeInterest?: number;
  cumulativePrincipal?: number;
}

interface AmortizationTableProps {
  schedule: SchedulePayment[];
  traditionalSchedule?: any[];
  showHighlights?: boolean;
  className?: string;
}

export default function AmortizationTable({
  schedule,
  traditionalSchedule,
  showHighlights = true,
  className,
}: AmortizationTableProps) {
  const [expandedView, setExpandedView] = useState(false);
  const [highlightMode, setHighlightMode] = useState<
    "all" | "heloc" | "savings"
  >("all");

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate extra payment amount (like Excel column R)
  const getExtraPayment = (payment: SchedulePayment) => {
    // Extra payment is the discretionary income used for mortgage principal
    return payment.discretionaryUsed > 0 ? payment.discretionaryUsed : 0;
  };

  // Show first 6 months and last 3 months by default
  const displaySchedule = expandedView
    ? schedule
    : [
        ...schedule.slice(0, 6),
        ...(schedule.length > 9 ? [{ placeholder: true }] : []),
        ...schedule.slice(-3),
      ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="table" size="sm" className="text-foreground-secondary" />
          Amortization Schedule with HELOC Acceleration
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Highlight Mode Toggle */}
          <div className="flex items-center gap-1 bg-card rounded-lg p-1">
            <button
              onClick={() => setHighlightMode("all")}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                highlightMode === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            <button
              onClick={() => setHighlightMode("heloc")}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                highlightMode === "heloc"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              HELOC Only
            </button>
            <button
              onClick={() => setHighlightMode("savings")}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                highlightMode === "savings"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Savings Only
            </button>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="flex items-center gap-1 px-3 py-1.5 bg-info text-info-foreground rounded-lg hover:bg-info/90 transition-colors text-sm font-medium"
          >
            <Icon
              name={expandedView ? "chevron-up" : "chevron-down"}
              size="xs"
            />
            {expandedView ? "Show Less" : "Show All Months"}
          </button>
        </div>
      </div>

      {/* Legend */}
      {showHighlights && <HighlightLegend />}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border bg-card">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Month
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Total Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider bg-secondary/10">
                Extra Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                HELOC Interest
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-info uppercase tracking-wider bg-info-background">
                HELOC Balance
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                HELOC Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Discretionary Used
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {displaySchedule.map((payment: any, index) => {
              // Handle placeholder row for collapsed view
              if (payment.placeholder) {
                return (
                  <tr key="placeholder" className="bg-muted">
                    <td
                      colSpan={9}
                      className="px-4 py-2 text-center text-sm text-foreground-muted"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="more-horizontal" size="sm" />
                        {schedule.length - 9} months hidden
                      </div>
                    </td>
                  </tr>
                );
              }

              const extraPayment = getExtraPayment(payment);
              const shouldHighlightHeloc =
                highlightMode === "all" || highlightMode === "heloc";
              const shouldHighlightSavings =
                highlightMode === "all" || highlightMode === "savings";

              return (
                <tr key={payment.month} className="hover:bg-muted group">
                  <td className="px-4 py-2 text-sm font-medium text-foreground">
                    {payment.month}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-foreground">
                    {formatCurrency(payment.totalMonthlyPayment)}
                  </td>

                  {/* Extra Payment - Key HELOC Benefit */}
                  {shouldHighlightHeloc && extraPayment > 0 ? (
                    <HighlightedCell
                      value={formatCurrency(extraPayment)}
                      type="heloc"
                      showTooltip={true}
                      tooltipContent="Additional principal payment from HELOC strategy"
                      className="font-semibold"
                    />
                  ) : (
                    <td className="px-4 py-2 text-sm text-right text-foreground">
                      {formatCurrency(extraPayment)}
                    </td>
                  )}

                  <td className="px-4 py-2 text-sm text-right text-foreground">
                    {formatCurrency(payment.helocInterest)}
                  </td>

                  {/* HELOC Balance */}
                  {shouldHighlightHeloc && payment.helocBalance > 0 ? (
                    <HighlightedCell
                      value={formatCurrency(payment.helocBalance)}
                      type="payment"
                      className="font-medium"
                    />
                  ) : (
                    <td className="px-4 py-2 text-sm text-right text-foreground">
                      {formatCurrency(payment.helocBalance)}
                    </td>
                  )}

                  <td className="px-4 py-2 text-sm text-right text-foreground">
                    {formatCurrency(payment.helocPayment)}
                  </td>

                  <td className="px-4 py-2 text-sm text-right text-foreground">
                    {formatCurrency(payment.discretionaryUsed)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Flow Summary */}
      <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 p-4 rounded-lg border border-secondary-200">
        <h4 className="text-sm font-semibold text-secondary-800 mb-3 flex items-center gap-2">
          <Icon name="trending-up" size="sm" className="text-secondary-600" />
          HELOC Payment Flow Visualization
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FlowIndicator
              from="Monthly Income"
              to="HELOC"
              amount={formatCurrency(schedule[0]?.discretionaryUsed || 0)}
            />
            <p className="text-xs text-secondary-700 ml-4">
              Your discretionary income flows into the HELOC
            </p>
          </div>

          <div className="space-y-2">
            <FlowIndicator
              from="HELOC"
              to="Mortgage Principal"
              amount={formatCurrency(getExtraPayment(schedule[0]) || 0)}
            />
            <p className="text-xs text-secondary-700 ml-4">
              HELOC funds make extra principal payments
            </p>
          </div>
        </div>

        {/* Key Metrics with Animation */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-secondary-600 font-medium">
              Total Extra Payments
            </p>
            <p className="text-lg font-bold text-secondary-900">
              <AnimatedCounter
                value={schedule.reduce((sum, p) => sum + getExtraPayment(p), 0)}
                prefix="$"
              />
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-secondary-600 font-medium">
              Average Monthly Extra
            </p>
            <p className="text-lg font-bold text-secondary-900">
              <AnimatedCounter
                value={Math.round(
                  schedule.reduce((sum, p) => sum + getExtraPayment(p), 0) /
                    schedule.length,
                )}
                prefix="$"
              />
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-secondary-600 font-medium">
              Months Accelerated
            </p>
            <p className="text-lg font-bold text-secondary-900">
              <AnimatedCounter value={360 - schedule.length} suffix=" mo" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
