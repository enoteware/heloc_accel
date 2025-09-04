"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import { PaymentBadge } from "./HighlightComponents";
import { exportAmortizationToCSV } from "@/lib/export-utils";

interface AmortizationRow {
  month: number;
  mortgageBalance: number;
  mortgagePayment: number;
  principalPayment: number;
  interestPayment: number;
  monthlyDeposit: number;
  monthlyExpenses: number;
  netSurplus: number;
  usableHelocRoom: number;
  extraPaymentToMortgage: number;
  netChangeInHeloc: number;
  helocBalance: number;
  helocInterest: number;
  endingHelocBalance: number;
  pmiCost: number;
  ltvRatio: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  totalInterestPaid: number;
}

interface FullAmortizationTableProps {
  schedule: any[];
  inputs: {
    propertyValue: number;
    monthlyNetIncome: number;
    monthlyExpenses: number;
    discretionaryIncome: number;
    helocLimit: number;
    helocRate: number;
    pmiMonthly?: number;
  };
  className?: string;
}

export default function FullAmortizationTable({
  schedule,
  inputs,
  className,
}: FullAmortizationTableProps) {
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [highlightPMI, setHighlightPMI] = useState(true);

  // Format currency
  const formatCurrency = (amount: number, showCents = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Process schedule into full amortization data
  const amortizationData = useMemo(() => {
    return schedule.map((payment, index) => {
      const ltvRatio =
        inputs.propertyValue > 0
          ? (payment.beginningBalance / inputs.propertyValue) * 100
          : 0;

      // PMI drops off when LTV reaches 80%
      const pmiCost = ltvRatio > 80 ? inputs.pmiMonthly || 0 : 0;

      // Calculate net surplus (income - expenses - mortgage payment - PMI)
      const netSurplus =
        inputs.monthlyNetIncome -
        inputs.monthlyExpenses -
        payment.paymentAmount -
        pmiCost;

      // Usable HELOC room
      const usableHelocRoom = Math.max(
        0,
        inputs.helocLimit - payment.helocBalance,
      );

      // Extra payment to mortgage (from HELOC strategy)
      const extraPayment = payment.discretionaryUsed || 0;

      // Net change in HELOC (draws minus payments)
      const previousHeloc = index > 0 ? schedule[index - 1].helocBalance : 0;
      const netChangeHeloc = payment.helocBalance - previousHeloc;

      return {
        month: payment.month,
        mortgageBalance: payment.beginningBalance,
        mortgagePayment: payment.paymentAmount,
        principalPayment: payment.principalPayment,
        interestPayment: payment.interestPayment,
        monthlyDeposit: inputs.monthlyNetIncome,
        monthlyExpenses: inputs.monthlyExpenses,
        netSurplus,
        usableHelocRoom,
        extraPaymentToMortgage: extraPayment,
        netChangeInHeloc: netChangeHeloc,
        helocBalance: payment.helocBalance,
        helocInterest: payment.helocInterest,
        endingHelocBalance: payment.helocBalance,
        pmiCost,
        ltvRatio,
        cumulativeInterest: payment.cumulativeInterest,
        cumulativePrincipal: payment.cumulativePrincipal,
        totalInterestPaid: payment.cumulativeInterest,
      };
    });
  }, [schedule, inputs]);

  // Find key milestones
  const pmiDropOffMonth = amortizationData.find(
    (row) => row.ltvRatio <= 80,
  )?.month;
  const helocPaidOffMonth =
    amortizationData.findIndex(
      (row, idx) =>
        idx > 0 &&
        amortizationData[idx - 1].helocBalance > 0 &&
        row.helocBalance === 0,
    ) + 1;

  const toggleRow = (month: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedRows(newExpanded);
  };

  // Column groups for organization
  const columnGroups = {
    basic: ["month", "mortgageBalance", "mortgagePayment"],
    cashFlow: ["monthlyDeposit", "monthlyExpenses", "netSurplus"],
    heloc: [
      "usableHelocRoom",
      "extraPaymentToMortgage",
      "netChangeInHeloc",
      "helocBalance",
      "helocInterest",
    ],
    mortgage: ["principalPayment", "interestPayment", "pmiCost", "ltvRatio"],
    totals: ["cumulativeInterest", "cumulativePrincipal", "totalInterestPaid"],
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon
              name="table"
              size="sm"
              className="text-foreground-secondary"
            />
            Complete Amortization Schedule
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed month-by-month breakdown matching your Excel format
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAllColumns(!showAllColumns)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showAllColumns
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-card text-muted-foreground hover:bg-card/80",
            )}
          >
            <Icon
              name={showAllColumns ? "eye" : "eye-off"}
              size="xs"
              className="mr-1 inline"
            />
            {showAllColumns ? "Show Essential" : "Show All Columns"}
          </button>

          <button
            onClick={() => setHighlightPMI(!highlightPMI)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              highlightPMI
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-card text-muted-foreground hover:bg-card/80",
            )}
          >
            <Icon name="info" size="xs" className="mr-1 inline" />
            {highlightPMI ? "PMI Highlighted" : "Highlight PMI"}
          </button>

          <button
            className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
            onClick={() => {
              exportAmortizationToCSV(schedule, inputs);
            }}
          >
            <Icon name="download" size="xs" className="mr-1 inline" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Key Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg border border-info-border"
          style={{ backgroundColor: "rgb(var(--color-info-background))" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="home" size="sm" className="text-info" />
            <h4 className="font-semibold text-info">Mortgage Payoff</h4>
          </div>
          <p className="text-2xl font-bold text-info">
            Month {schedule.length}
          </p>
          <p className="text-sm text-info">
            Total saved:{" "}
            {formatCurrency(
              amortizationData[amortizationData.length - 1]
                ?.totalInterestPaid || 0,
            )}
          </p>
        </div>

        {pmiDropOffMonth && (
          <div
            className="p-4 rounded-lg border border-border"
            style={{
              backgroundColor: "rgb(var(--color-accent-foreground))",
              opacity: 0.1,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name="trending-down" size="sm" className="text-accent" />
              <h4 className="font-semibold text-accent">PMI Drops Off</h4>
            </div>
            <p className="text-2xl font-bold text-accent">
              Month {pmiDropOffMonth}
            </p>
            <p className="text-sm text-accent">
              LTV reaches 80%, saving {formatCurrency(inputs.pmiMonthly || 0)}
              /mo
            </p>
          </div>
        )}

        {helocPaidOffMonth > 0 && (
          <div
            className="p-4 rounded-lg border border-success-border"
            style={{ backgroundColor: "rgb(var(--color-success-background))" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name="check-circle" size="sm" className="text-success" />
              <h4 className="font-semibold text-success">HELOC Paid Off</h4>
            </div>
            <p className="text-2xl font-bold text-success">
              Month {helocPaidOffMonth}
            </p>
            <p className="text-sm text-success">All HELOC balance cleared</p>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="min-w-full divide-y divide-border bg-card">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-10 bg-muted px-3 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider border-r border-border">
                Month
              </th>

              {/* Mortgage Balance Section */}
              <th
                colSpan={3}
                className="px-3 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider border-b border-r border-border bg-muted"
              >
                Mortgage
              </th>

              {/* Cash Flow Section */}
              {(showAllColumns || true) && (
                <th
                  colSpan={3}
                  className="px-3 py-2 text-center text-xs font-medium text-info uppercase tracking-wider border-b border-r border-info-border bg-info-background"
                >
                  Cash Flow
                </th>
              )}

              {/* HELOC Section */}
              <th
                colSpan={5}
                className="px-3 py-2 text-center text-xs font-medium text-secondary uppercase tracking-wider border-b border-r border-border bg-secondary/10"
              >
                HELOC Strategy
              </th>

              {/* Additional Details */}
              {showAllColumns && (
                <>
                  <th
                    colSpan={2}
                    className="px-3 py-2 text-center text-xs font-medium text-accent uppercase tracking-wider border-b border-r border-border bg-accent/10"
                  >
                    PMI/LTV
                  </th>
                  <th
                    colSpan={3}
                    className="px-3 py-2 text-center text-xs font-medium text-success uppercase tracking-wider border-b border-border bg-[rgb(var(--color-success-background))]"
                  >
                    Totals
                  </th>
                </>
              )}
            </tr>

            <tr className="bg-muted">
              <th className="sticky left-0 z-10 bg-muted px-3 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider border-r border-border">
                #
              </th>

              {/* Mortgage columns */}
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                Balance
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                Payment
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider border-r border-border whitespace-nowrap">
                Principal
              </th>

              {/* Cash Flow columns */}
              {(showAllColumns || true) && (
                <>
                  <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                    Deposit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                    Expenses
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-info uppercase tracking-wider border-r border-border whitespace-nowrap">
                    Net Surplus
                  </th>
                </>
              )}

              {/* HELOC columns */}
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                Room
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider bg-secondary/10 whitespace-nowrap">
                Extra Pay
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                Net Change
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                Balance
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider border-r border-border whitespace-nowrap">
                Interest
              </th>

              {/* Additional columns */}
              {showAllColumns && (
                <>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    PMI
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                    LTV %
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Interest
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Principal
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider bg-green-50 whitespace-nowrap">
                    Total Int
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {amortizationData.map((row, index) => {
              const isExpanded = expandedRows.has(row.month);
              const isPMIActive = row.pmiCost > 0;
              const isHelocActive = row.helocBalance > 0;
              const isMilestoneMonth =
                row.month === pmiDropOffMonth ||
                row.month === helocPaidOffMonth;

              return (
                <React.Fragment key={row.month}>
                  <tr
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer",
                      isMilestoneMonth && "bg-yellow-50",
                      isExpanded && "bg-blue-50",
                    )}
                    onClick={() => toggleRow(row.month)}
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                      {row.month}
                      {isMilestoneMonth && (
                        <span className="ml-1 text-yellow-600">
                          <Icon name="star" size="xs" className="inline" />
                        </span>
                      )}
                    </td>

                    {/* Mortgage columns */}
                    <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                      {formatCurrency(row.mortgageBalance)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                      {formatCurrency(row.mortgagePayment)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-foreground border-r border-border whitespace-nowrap">
                      {formatCurrency(row.principalPayment)}
                    </td>

                    {/* Cash Flow columns */}
                    {(showAllColumns || true) && (
                      <>
                        <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                          {formatCurrency(row.monthlyDeposit)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                          {formatCurrency(row.monthlyExpenses)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-medium text-info border-r border-border whitespace-nowrap">
                          {formatCurrency(row.netSurplus)}
                        </td>
                      </>
                    )}

                    {/* HELOC columns */}
                    <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                      {formatCurrency(row.usableHelocRoom)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-sm text-right font-semibold whitespace-nowrap",
                        row.extraPaymentToMortgage > 0
                          ? "bg-secondary/10 text-secondary"
                          : "text-foreground-muted",
                      )}
                    >
                      {formatCurrency(row.extraPaymentToMortgage)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                      <span
                        className={cn(
                          row.netChangeInHeloc > 0
                            ? "text-destructive"
                            : row.netChangeInHeloc < 0
                              ? "text-success"
                              : "text-foreground-muted",
                        )}
                      >
                        {row.netChangeInHeloc > 0 ? "+" : ""}
                        {formatCurrency(Math.abs(row.netChangeInHeloc))}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-sm text-right whitespace-nowrap",
                        isHelocActive
                          ? "font-medium text-info"
                          : "text-foreground-muted",
                      )}
                    >
                      {formatCurrency(row.helocBalance)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-foreground border-r border-border whitespace-nowrap">
                      {formatCurrency(row.helocInterest)}
                    </td>

                    {/* Additional columns */}
                    {showAllColumns && (
                      <>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right whitespace-nowrap",
                            isPMIActive && highlightPMI
                              ? "bg-accent/10 text-accent font-medium"
                              : "text-foreground",
                          )}
                        >
                          {formatCurrency(row.pmiCost)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right border-r border-border whitespace-nowrap",
                            row.ltvRatio > 80
                              ? "text-destructive"
                              : "text-success",
                            "font-medium",
                          )}
                        >
                          {formatPercent(row.ltvRatio)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                          {formatCurrency(row.cumulativeInterest)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-foreground whitespace-nowrap">
                          {formatCurrency(row.cumulativePrincipal)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-semibold text-success bg-[rgb(var(--color-success-background))] whitespace-nowrap">
                          {formatCurrency(row.totalInterestPaid)}
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Expanded row details */}
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={showAllColumns ? 16 : 12}
                        className="px-6 py-4 border-b border-info-border"
                        style={{
                          backgroundColor: "rgb(var(--color-info-background))",
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h5 className="font-semibold text-foreground mb-2">
                              Payment Breakdown
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Interest:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.interestPayment)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Principal:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.principalPayment)}
                                </span>
                              </div>
                              {row.pmiCost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-foreground-secondary">
                                    PMI:
                                  </span>
                                  <span className="font-medium text-accent">
                                    {formatCurrency(row.pmiCost)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-foreground mb-2">
                              HELOC Details
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Available:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.usableHelocRoom)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Used:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.helocBalance)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Interest:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.helocInterest)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-foreground mb-2">
                              Progress
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  LTV Ratio:
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    row.ltvRatio > 80
                                      ? "text-destructive"
                                      : "text-success",
                                  )}
                                >
                                  {formatPercent(row.ltvRatio)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">
                                  Total Interest:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.totalInterestPaid)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Summary Footer */}
          <tfoot className="bg-muted">
            <tr className="font-semibold">
              <td className="sticky left-0 z-10 bg-muted px-3 py-3 text-sm text-foreground border-r border-border">
                Total
              </td>
              <td
                colSpan={showAllColumns ? 15 : 11}
                className="px-3 py-3 text-sm text-right text-foreground"
              >
                <div className="flex justify-end items-center gap-6">
                  <span>Total Interest Paid:</span>
                  <span className="text-lg text-success">
                    {formatCurrency(
                      amortizationData[amortizationData.length - 1]
                        ?.totalInterestPaid || 0,
                    )}
                  </span>
                  <span className="text-foreground-muted">|</span>
                  <span>Months to Payoff:</span>
                  <span className="text-lg text-info">{schedule.length}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table Legend */}
      <div className="bg-card border border-border p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Column Guide
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary/10 border border-border rounded"></div>
            <span className="text-foreground-secondary">
              Extra Payment (HELOC Strategy)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/10 border border-border rounded"></div>
            <span className="text-foreground-secondary">
              PMI Active (LTV &gt; 80%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[rgb(var(--color-success-background))] border border-success-border rounded"></div>
            <span className="text-foreground-secondary">Cumulative Totals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[rgb(var(--color-warning-background))] border border-warning-border rounded"></div>
            <span className="text-foreground-secondary">Milestone Month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
