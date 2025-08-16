"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import { PaymentBadge, AnimatedCounter } from "./HighlightComponents";

interface ComparisonData {
  traditional: {
    monthlyPayment: number;
    totalInterest: number;
    payoffMonths: number;
    totalPayments: number;
  };
  heloc: {
    avgMonthlyPayment: number;
    totalInterest: number;
    payoffMonths: number;
    maxHelocUsed: number;
  };
  savings: {
    timeSavedMonths: number;
    interestSaved: number;
    percentageSaved: number;
  };
}

interface ComparisonHighlightProps {
  data: ComparisonData;
  className?: string;
}

export default function ComparisonHighlight({
  data,
  className,
}: ComparisonHighlightProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} mo`;
    if (remainingMonths === 0) return `${years} yr`;
    return `${years} yr ${remainingMonths} mo`;
  };

  return (
    <div
      className={cn("bg-white rounded-lg shadow-lg overflow-hidden", className)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-secondary-50 p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Icon name="git-branch" size="sm" className="text-secondary-600" />
          Side-by-Side Strategy Comparison
        </h3>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        {/* Traditional Column */}
        <div className="p-6 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-700">
              Traditional Mortgage
            </h4>
            <PaymentBadge
              amount="Standard"
              type="traditional"
              showIcon={false}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Monthly Payment
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(data.traditional.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Extra Payment
                  </p>
                  <p className="text-lg font-semibold text-gray-400 mt-1">$0</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Interest Paid
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data.traditional.totalInterest)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Time to Payoff
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatMonths(data.traditional.payoffMonths)}
              </p>
              <p className="text-sm text-gray-600">
                ({data.traditional.payoffMonths} months)
              </p>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <Icon name="x-circle" size="sm" />
                <span className="text-sm">No acceleration strategy</span>
              </div>
            </div>
          </div>
        </div>

        {/* HELOC Column */}
        <div className="p-6 bg-secondary-50/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-secondary-800">
              HELOC Acceleration
            </h4>
            <PaymentBadge amount="Optimized" type="heloc" showIcon={false} />
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-secondary-200 relative">
              <div className="absolute -top-2 -right-2">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  SAVE {Math.round(data.savings.percentageSaved)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide">
                    Monthly Payment
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(data.traditional.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Extra Payment
                  </p>
                  <p className="text-lg font-semibold text-secondary-700 mt-1">
                    <AnimatedCounter
                      value={Math.round(
                        data.heloc.avgMonthlyPayment -
                          data.traditional.monthlyPayment,
                      )}
                      prefix="+"
                      suffix="$"
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <p className="text-xs text-secondary-600 uppercase tracking-wide">
                Total Interest Paid
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                <AnimatedCounter value={data.heloc.totalInterest} prefix="$" />
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">
                -{formatCurrency(data.savings.interestSaved)} saved!
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <p className="text-xs text-secondary-600 uppercase tracking-wide">
                Time to Payoff
              </p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatMonths(data.heloc.payoffMonths)}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {data.savings.timeSavedMonths} months faster!
              </p>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-secondary-600">
                <Icon name="check-circle" size="sm" />
                <span className="text-sm font-medium">
                  Smart acceleration active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <p className="text-sm font-medium opacity-90">
              By choosing HELOC Acceleration, you save:
            </p>
            <p className="text-2xl font-bold">
              <AnimatedCounter value={data.savings.interestSaved} prefix="$" />{" "}
              & {data.savings.timeSavedMonths} months
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            <Icon name="trending-down" size="sm" className="text-white" />
            <span className="text-white font-medium">
              {Math.round(data.savings.percentageSaved)}% less interest
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
