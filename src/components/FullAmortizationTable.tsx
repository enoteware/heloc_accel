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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="table" size="sm" className="text-gray-600" />
            Complete Amortization Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed month-by-month breakdown matching your Excel format
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAllColumns(!showAllColumns)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showAllColumns
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
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
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            <Icon name="info" size="xs" className="mr-1 inline" />
            {highlightPMI ? "PMI Highlighted" : "Highlight PMI"}
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="home" size="sm" className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">Mortgage Payoff</h4>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            Month {schedule.length}
          </p>
          <p className="text-sm text-blue-700">
            Total saved:{" "}
            {formatCurrency(
              amortizationData[amortizationData.length - 1]
                ?.totalInterestPaid || 0,
            )}
          </p>
        </div>

        {pmiDropOffMonth && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon
                name="trending-down"
                size="sm"
                className="text-purple-600"
              />
              <h4 className="font-semibold text-purple-900">PMI Drops Off</h4>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              Month {pmiDropOffMonth}
            </p>
            <p className="text-sm text-purple-700">
              LTV reaches 80%, saving {formatCurrency(inputs.pmiMonthly || 0)}
              /mo
            </p>
          </div>
        )}

        {helocPaidOffMonth > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="check-circle" size="sm" className="text-green-600" />
              <h4 className="font-semibold text-green-900">HELOC Paid Off</h4>
            </div>
            <p className="text-2xl font-bold text-green-900">
              Month {helocPaidOffMonth}
            </p>
            <p className="text-sm text-green-700">All HELOC balance cleared</p>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Month
              </th>

              {/* Mortgage Balance Section */}
              <th
                colSpan={3}
                className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-100"
              >
                Mortgage
              </th>

              {/* Cash Flow Section */}
              {(showAllColumns || true) && (
                <th
                  colSpan={3}
                  className="px-3 py-2 text-center text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-r border-gray-200 bg-blue-50"
                >
                  Cash Flow
                </th>
              )}

              {/* HELOC Section */}
              <th
                colSpan={5}
                className="px-3 py-2 text-center text-xs font-medium text-secondary-700 uppercase tracking-wider border-b border-r border-gray-200 bg-secondary-50"
              >
                HELOC Strategy
              </th>

              {/* Additional Details */}
              {showAllColumns && (
                <>
                  <th
                    colSpan={2}
                    className="px-3 py-2 text-center text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-r border-gray-200 bg-purple-50"
                  >
                    PMI/LTV
                  </th>
                  <th
                    colSpan={3}
                    className="px-3 py-2 text-center text-xs font-medium text-green-700 uppercase tracking-wider border-b border-gray-200 bg-green-50"
                  >
                    Totals
                  </th>
                </>
              )}
            </tr>

            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                #
              </th>

              {/* Mortgage columns */}
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Balance
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Payment
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                Principal
              </th>

              {/* Cash Flow columns */}
              {(showAllColumns || true) && (
                <>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Deposit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Expenses
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                    Net Surplus
                  </th>
                </>
              )}

              {/* HELOC columns */}
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Room
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider bg-secondary-50 whitespace-nowrap">
                Extra Pay
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Net Change
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Balance
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
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
                    <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                      {formatCurrency(row.mortgageBalance)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                      {formatCurrency(row.mortgagePayment)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-700 border-r border-gray-200 whitespace-nowrap">
                      {formatCurrency(row.principalPayment)}
                    </td>

                    {/* Cash Flow columns */}
                    {(showAllColumns || true) && (
                      <>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                          {formatCurrency(row.monthlyDeposit)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                          {formatCurrency(row.monthlyExpenses)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-medium text-blue-700 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(row.netSurplus)}
                        </td>
                      </>
                    )}

                    {/* HELOC columns */}
                    <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                      {formatCurrency(row.usableHelocRoom)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-sm text-right font-semibold whitespace-nowrap",
                        row.extraPaymentToMortgage > 0
                          ? "bg-secondary-50 text-secondary-700"
                          : "text-gray-400",
                      )}
                    >
                      {formatCurrency(row.extraPaymentToMortgage)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                      <span
                        className={cn(
                          row.netChangeInHeloc > 0
                            ? "text-red-600"
                            : row.netChangeInHeloc < 0
                              ? "text-green-600"
                              : "text-gray-400",
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
                          ? "font-medium text-blue-700"
                          : "text-gray-400",
                      )}
                    >
                      {formatCurrency(row.helocBalance)}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-700 border-r border-gray-200 whitespace-nowrap">
                      {formatCurrency(row.helocInterest)}
                    </td>

                    {/* Additional columns */}
                    {showAllColumns && (
                      <>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right whitespace-nowrap",
                            isPMIActive && highlightPMI
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "text-gray-700",
                          )}
                        >
                          {formatCurrency(row.pmiCost)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-sm text-right border-r border-gray-200 whitespace-nowrap",
                            row.ltvRatio > 80
                              ? "text-red-600"
                              : "text-green-600",
                            "font-medium",
                          )}
                        >
                          {formatPercent(row.ltvRatio)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                          {formatCurrency(row.cumulativeInterest)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">
                          {formatCurrency(row.cumulativePrincipal)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-semibold text-green-700 bg-green-50 whitespace-nowrap">
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
                        className="px-6 py-4 bg-blue-50 border-b border-blue-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Payment Breakdown
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Interest:</span>
                                <span className="font-medium">
                                  {formatCurrency(row.interestPayment)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Principal:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.principalPayment)}
                                </span>
                              </div>
                              {row.pmiCost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">PMI:</span>
                                  <span className="font-medium text-purple-700">
                                    {formatCurrency(row.pmiCost)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">
                              HELOC Details
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Available:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(row.usableHelocRoom)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium">
                                  {formatCurrency(row.helocBalance)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Interest:</span>
                                <span className="font-medium">
                                  {formatCurrency(row.helocInterest)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Progress
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  LTV Ratio:
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    row.ltvRatio > 80
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {formatPercent(row.ltvRatio)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
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
          <tfoot className="bg-gray-50">
            <tr className="font-semibold">
              <td className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                Total
              </td>
              <td
                colSpan={showAllColumns ? 15 : 11}
                className="px-3 py-3 text-sm text-right text-gray-900"
              >
                <div className="flex justify-end items-center gap-6">
                  <span>Total Interest Paid:</span>
                  <span className="text-lg text-green-700">
                    {formatCurrency(
                      amortizationData[amortizationData.length - 1]
                        ?.totalInterestPaid || 0,
                    )}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span>Months to Payoff:</span>
                  <span className="text-lg text-blue-700">
                    {schedule.length}
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Column Guide
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary-50 border border-secondary-200 rounded"></div>
            <span className="text-gray-600">
              Extra Payment (HELOC Strategy)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-50 border border-purple-200 rounded"></div>
            <span className="text-gray-600">PMI Active (LTV &gt; 80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-gray-600">Cumulative Totals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span className="text-gray-600">Milestone Month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
