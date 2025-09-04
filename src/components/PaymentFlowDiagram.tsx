"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import { AnimatedCounter } from "./HighlightComponents";

interface PaymentFlowDiagramProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  discretionaryIncome: number;
  mortgagePayment: number;
  helocBalance: number;
  extraPayment: number;
  className?: string;
}

export default function PaymentFlowDiagram({
  monthlyIncome,
  monthlyExpenses,
  discretionaryIncome,
  mortgagePayment,
  helocBalance,
  extraPayment,
  className,
}: PaymentFlowDiagramProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={cn("bg-card p-6 rounded-lg border border-border", className)}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <Icon name="git-branch" size="sm" className="text-info" />
        HELOC Payment Flow Strategy
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Income Flow */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-info text-info-foreground text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              1
            </span>
            <h4 className="font-semibold text-foreground">Monthly Cash Flow</h4>
          </div>

          <div className="bg-card p-4 rounded-lg shadow-sm border border-info-border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-secondary">
                  Income
                </span>
                <span className="font-semibold text-success">
                  +{formatCurrency(monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-secondary">
                  Expenses
                </span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(monthlyExpenses)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Discretionary
                  </span>
                  <span className="font-bold text-info">
                    {formatCurrency(discretionaryIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-secondary/15 p-2 rounded-full">
              <Icon name="arrow-down" size="sm" className="text-secondary" />
            </div>
          </div>
        </div>

        {/* Step 2: HELOC Usage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-secondary text-secondary-foreground text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              2
            </span>
            <h4 className="font-semibold text-foreground">
              HELOC Acceleration
            </h4>
          </div>

          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="space-y-3">
              <div className="text-center mb-2">
                <p className="text-xs text-foreground-secondary uppercase tracking-wide">
                  HELOC Balance
                </p>
                <p className="text-2xl font-bold text-secondary">
                  <AnimatedCounter value={helocBalance} prefix="$" />
                </p>
              </div>

              <div className="bg-secondary/10 p-3 rounded text-center">
                <p className="text-xs text-secondary mb-1">
                  Extra Payment to Mortgage
                </p>
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(extraPayment)}
                </p>
              </div>

              <p className="text-xs text-foreground-secondary text-center">
                Discretionary income pays down HELOC monthly
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-[rgb(var(--color-success-background))] p-2 rounded-full">
              <Icon name="arrow-down" size="sm" className="text-success" />
            </div>
          </div>
        </div>

        {/* Step 3: Results */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-success text-success-foreground text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              3
            </span>
            <h4 className="font-semibold text-foreground">
              Accelerated Payoff
            </h4>
          </div>

          <div className="bg-card p-4 rounded-lg shadow-sm border border-success-border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-secondary">
                  Regular Payment
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(mortgagePayment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-secondary">
                  Extra Principal
                </span>
                <span className="font-medium text-secondary">
                  +{formatCurrency(extraPayment)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Total Payment
                  </span>
                  <span className="font-bold text-success">
                    {formatCurrency(mortgagePayment + extraPayment)}
                  </span>
                </div>
              </div>

              <div className="bg-[rgb(var(--color-success-background))] p-2 rounded text-center mt-3">
                <p className="text-xs font-semibold text-success">
                  🎯 Mortgage Paid Off Faster!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Summary */}
      <div className="mt-6 bg-card/70 backdrop-blur-sm p-4 rounded-lg border border-info-border">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="font-medium text-foreground">Income</span>
          <Icon name="arrow-right" size="xs" className="text-secondary" />
          <span className="font-medium text-secondary">HELOC</span>
          <Icon name="arrow-right" size="xs" className="text-secondary" />
          <span className="font-medium text-foreground">Extra Principal</span>
          <Icon name="arrow-right" size="xs" className="text-success" />
          <span className="font-bold text-success">Early Payoff</span>
        </div>
      </div>
    </div>
  );
}
