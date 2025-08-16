"use client";

import React, { useState } from "react";
import PrintableReport from "./PrintableReport";
import { generatePDFFromComponent } from "@/lib/pdf-generator";
import { generateReportFilename } from "@/lib/print-utils";
import { renderToString } from "react-dom/server";
import type { CalculatorValidationInput } from "@/lib/validation";
import { Icon } from "@/components/Icons";
import { useConfetti } from "@/hooks/useConfetti";
import InputSummary from "./InputSummary";
import { useCompany } from "@/contexts/CompanyContext";
import { useTranslations, useLocale } from "next-intl";
import PexelsImage from "./PexelsImage";
import AmortizationTable from "./AmortizationTable";
import { PaymentBadge, FlowIndicator } from "./HighlightComponents";
import PaymentFlowDiagram from "./PaymentFlowDiagram";
import ComparisonHighlight from "./ComparisonHighlight";
import FullAmortizationTable from "./FullAmortizationTable";

interface CalculationResults {
  traditional: {
    payoffMonths: number;
    totalInterest: number;
    monthlyPayment: number;
    totalPayments: number;
  };
  heloc: {
    payoffMonths: number;
    totalInterest: number;
    totalMortgageInterest: number;
    totalHelocInterest: number;
    maxHelocUsed: number;
    averageHelocBalance: number;
    schedule: Array<{
      month: number;
      helocPayment: number;
      helocBalance: number;
      helocInterest: number;
      discretionaryUsed: number;
      pmiPayment?: number;
      totalMonthlyPayment: number;
    }>;
  };
  comparison: {
    timeSavedMonths: number;
    timeSavedYears: number;
    interestSaved: number;
    percentageInterestSaved: number;
    monthlyPaymentDifference: number;
  };
}

interface ResultsDisplayProps {
  results: CalculationResults;
  inputs?: CalculatorValidationInput;
  onSaveScenario?: () => void;
  onNewCalculation?: () => void;
}

export default function ResultsDisplay({
  results,
  inputs,
  onSaveScenario,
  onNewCalculation,
}: ResultsDisplayProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { triggerConfetti } = useConfetti();
  const { companySettings, assignedAgent } = useCompany();
  const tResults = useTranslations("results");
  const tPrintable = useTranslations("printableReport");
  const locale = useLocale();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} months`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Summary - Only on larger screens */}
      {inputs && (
        <div className="hidden lg:block">
          <InputSummary formData={inputs} className="max-w-2xl mx-auto" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Saved Card */}
        <div className="bg-card p-6 rounded-lg border border-border relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <PaymentBadge
              amount="HELOC"
              type="heloc"
              showIcon={false}
              className="text-xs"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                {tResults("timeSaved")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {results.comparison.timeSavedYears} {tResults("years")}
              </p>
              <p className="text-sm text-muted-foreground">
                ({results.comparison.timeSavedMonths} {tResults("months")})
              </p>
            </div>
            <div className="p-3 bg-card rounded-full border border-border">
              <Icon name="calendar" size="lg" className="text-primary" />
            </div>
          </div>
        </div>

        {/* Interest Saved Card */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                {tResults("totalInterestSaved")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(results.comparison.interestSaved)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatPercentage(results.comparison.percentageInterestSaved)}{" "}
                savings
              </p>
            </div>
            <div className="p-3 bg-card rounded-full border border-border">
              <Icon name="dollar" size="lg" className="text-primary" />
            </div>
          </div>
        </div>

        {/* Max HELOC Used Card */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                {tResults("maxHelocUsed")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(results.heloc.maxHelocUsed)}
              </p>
              <p className="text-sm text-muted-foreground">
                {tResults("peakUtilization")}
              </p>
            </div>
            <div className="p-3 bg-card rounded-full border border-border">
              <Icon name="bar-chart" size="lg" className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-card border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {tResults("strategyComparison")}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Traditional Strategy */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-card rounded-lg mr-3 border border-border">
                <Icon name="home" size="sm" className="text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">
                {tResults("traditionalMortgage")}
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("payoffTime")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatMonths(results.traditional.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("monthlyPayment")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.traditional.monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("totalInterest")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.traditional.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("totalPayments")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.traditional.totalPayments)}
                </span>
              </div>
            </div>
          </div>

          {/* HELOC Strategy */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-card rounded-lg mr-3 border border-border">
                <Icon name="trending-up" size="sm" className="text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">
                {tResults("helocAcceleration")}
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("payoffTime")}:
                </span>
                <span className="text-sm font-medium text-primary">
                  {formatMonths(results.heloc.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("totalInterest")}:
                </span>
                <span className="text-sm font-medium text-primary">
                  {formatCurrency(results.heloc.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("mortgageInterest")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.heloc.totalMortgageInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("helocInterest")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.heloc.totalHelocInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {tResults("avgHelocBalance")}:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(results.heloc.averageHelocBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Comparison with Highlighting */}
      <ComparisonHighlight
        data={{
          traditional: {
            monthlyPayment: results.traditional.monthlyPayment,
            totalInterest: results.traditional.totalInterest,
            payoffMonths: results.traditional.payoffMonths,
            totalPayments: results.traditional.totalPayments,
          },
          heloc: {
            avgMonthlyPayment:
              results.heloc.schedule.length > 0
                ? results.heloc.schedule.reduce(
                    (sum, p) => sum + p.totalMonthlyPayment,
                    0,
                  ) / results.heloc.schedule.length
                : 0,
            totalInterest: results.heloc.totalInterest,
            payoffMonths: results.heloc.payoffMonths,
            maxHelocUsed: results.heloc.maxHelocUsed,
          },
          savings: {
            timeSavedMonths: results.comparison.timeSavedMonths,
            interestSaved: results.comparison.interestSaved,
            percentageSaved: results.comparison.percentageInterestSaved,
          },
        }}
      />

      {/* Payment Flow Diagram */}
      {inputs && (
        <PaymentFlowDiagram
          monthlyIncome={inputs.monthlyNetIncome}
          monthlyExpenses={inputs.monthlyExpenses}
          discretionaryIncome={inputs.monthlyDiscretionaryIncome}
          mortgagePayment={results.traditional.monthlyPayment}
          helocBalance={results.heloc.averageHelocBalance}
          extraPayment={results.heloc.schedule[0]?.discretionaryUsed || 0}
        />
      )}

      {/* Detailed Amortization Schedule with Highlighting */}
      <AmortizationTable
        schedule={results.heloc.schedule}
        showHighlights={true}
      />

      {/* Full Excel-Style Amortization Table */}
      {inputs && (
        <FullAmortizationTable
          schedule={results.heloc.schedule}
          inputs={{
            propertyValue: inputs.propertyValue || 0,
            monthlyNetIncome: inputs.monthlyNetIncome,
            monthlyExpenses: inputs.monthlyExpenses,
            discretionaryIncome: inputs.monthlyDiscretionaryIncome,
            helocLimit: inputs.helocLimit || 0,
            helocRate: inputs.helocInterestRate || 0,
            pmiMonthly: inputs.pmiMonthly,
          }}
        />
      )}

      {/* Monthly HELOC Payment Strategy */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <Icon name="trending-up" size="sm" className="text-blue-600 mr-2" />
            {tResults("monthlyHelocPaymentStrategy")}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {tResults("monthlyHelocPaymentDescription")}
          </p>
        </div>

        <div className="p-6">
          {(() => {
            // Find key months for HELOC payment timing
            const helocSchedule = results.heloc.schedule || [];
            const firstHelocDrawMonth = helocSchedule.find(
              (m) => m.helocBalance > 0,
            );
            const maxHelocMonth = helocSchedule.reduce(
              (max, current) =>
                current.helocBalance > max.helocBalance ? current : max,
              helocSchedule[0] || {
                month: 1,
                helocBalance: 0,
                helocPayment: 0,
                helocInterest: 0,
                discretionaryUsed: 0,
                totalMonthlyPayment: 0,
              },
            );
            const firstPaydownMonth = helocSchedule.find(
              (m) => m.helocPayment > 0,
            );

            // Calculate average payments
            const activeMonths = helocSchedule.filter(
              (m) => m.helocBalance > 0,
            );
            const avgHelocInterest =
              activeMonths.length > 0
                ? activeMonths.reduce((sum, m) => sum + m.helocInterest, 0) /
                  activeMonths.length
                : 0;
            const avgDiscretionaryUsed =
              helocSchedule.length > 0
                ? helocSchedule.reduce(
                    (sum, m) => sum + m.discretionaryUsed,
                    0,
                  ) / helocSchedule.length
                : 0;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="safe-badge-info text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        STEP 1
                      </span>
                      {tResults("initialHelocDraw")}
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>
                          Month {firstHelocDrawMonth?.month || 1}:
                        </strong>{" "}
                        {tResults("startUsingHeloc")}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">
                            {tResults("initialDrawAmount")}:
                          </span>
                          <span className="font-medium text-blue-900">
                            {formatCurrency(
                              firstHelocDrawMonth?.helocBalance || 0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">
                            {tResults("monthlyDiscretionaryIncome")}:
                          </span>
                          <span className="font-medium text-blue-900">
                            {formatCurrency(avgDiscretionaryUsed)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="safe-badge-success text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        STEP 2
                      </span>
                      {tResults("monthlyHelocPayments")}
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">
                            {tResults("averageMonthlyHelocInterest")}:
                          </span>
                          <span className="font-medium text-green-900">
                            {formatCurrency(avgHelocInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">
                            {tResults("discretionaryIncomeForPaydown")}:
                          </span>
                          <span className="font-medium text-green-900">
                            {formatCurrency(avgDiscretionaryUsed)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-green-200 pt-2">
                          <span className="text-green-700 font-medium">
                            {tResults("netMonthlyHelocReduction")}:
                          </span>
                          <span className="font-semibold text-green-900">
                            {formatCurrency(
                              Math.max(
                                0,
                                avgDiscretionaryUsed - avgHelocInterest,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                        TIMING
                      </span>
                      {tResults("keyMilestones")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tResults("peakHelocUsage")}
                          </p>
                          <p className="text-xs text-gray-600">
                            Month {maxHelocMonth.month}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-purple-900">
                            {formatCurrency(maxHelocMonth.helocBalance)}
                          </p>
                        </div>
                      </div>

                      {firstPaydownMonth && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tResults("firstHelocPaydown")}
                            </p>
                            <p className="text-xs text-gray-600">
                              Month {firstPaydownMonth.month}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-900">
                              -{formatCurrency(firstPaydownMonth.helocPayment)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tResults("fullPayoff")}
                          </p>
                          <p className="text-xs text-gray-600">
                            Month {results.heloc.payoffMonths}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-900">
                            {tResults("debtFree")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                      <Icon
                        name="info"
                        size="xs"
                        className="text-orange-600 mr-1"
                      />
                      {tResults("paymentStrategyTip")}
                    </h5>
                    <p className="text-xs text-orange-700">
                      {tResults("paymentStrategyDescription")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onSaveScenario && (
          <button
            onClick={async () => {
              setIsSaving(true);
              setSaveError(null);
              setSaveSuccess(false);

              try {
                const response = await fetch("/api/scenarios", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    inputs,
                    results,
                  }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || "Failed to save scenario");
                }

                setSaveSuccess(true);
                triggerConfetti({ type: "success" });

                // Call the parent callback if provided
                if (onSaveScenario) {
                  onSaveScenario();
                }

                // Clear success message after 3 seconds
                setTimeout(() => setSaveSuccess(false), 3000);
              } catch (error) {
                console.error("Error saving scenario:", error);
                setSaveError(
                  error instanceof Error
                    ? error.message
                    : "Failed to save scenario",
                );
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="save" size="sm" />
                <span>Save Scenario</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={async () => {
            if (inputs) {
              try {
                // Prepare translations for PDF generation
                const pdfTranslations = {
                  title: tPrintable("title"),
                  generated: tPrintable("generated"),
                  executiveSummary: tPrintable("executiveSummary"),
                  propertyMortgageDetails: tPrintable(
                    "propertyMortgageDetails",
                  ),
                  propertyValue: tPrintable("propertyValue"),
                  currentBalance: tPrintable("currentBalance"),
                  interestRate: tPrintable("interestRate"),
                  monthlyPayment: tPrintable("monthlyPayment"),
                  yearsSaved: tPrintable("yearsSaved"),
                  interestSaved: tPrintable("interestSaved"),
                  interestReduction: tPrintable("interestReduction"),
                  financialCapacity: tPrintable("financialCapacity"),
                  monthlyNetIncome: tPrintable("monthlyNetIncome"),
                  monthlyExpenses: tPrintable("monthlyExpenses"),
                  discretionaryIncome: tPrintable("discretionaryIncome"),
                  helocLimit: tPrintable("helocLimit"),
                  strategyComparison: tPrintable("strategyComparison"),
                  traditionalMortgage: tPrintable("traditionalMortgage"),
                  helocAcceleration: tPrintable("helocAcceleration"),
                  payoffTime: tPrintable("payoffTime"),
                  totalInterest: tPrintable("totalInterest"),
                  totalPayments: tPrintable("totalPayments"),
                  maxHelocUsed: tPrintable("maxHelocUsed"),
                  implementationStrategy: tPrintable("implementationStrategy"),
                  monthlyPaymentPlan: tPrintable("monthlyPaymentPlan"),
                  keyMilestones: tPrintable("keyMilestones"),
                  continueMortgagePayment: tPrintable(
                    "continueMortgagePayment",
                  ),
                  avgHelocInterest: tPrintable("avgHelocInterest"),
                  applyDiscretionaryIncome: tPrintable(
                    "applyDiscretionaryIncome",
                  ),
                  beginHelocDraws: tPrintable("beginHelocDraws"),
                  peakHeloc: tPrintable("peakHeloc"),
                  fullPayoff: tPrintable("fullPayoff"),
                  payoffTimelineComparison: tPrintable(
                    "payoffTimelineComparison",
                  ),
                  yourHelocSpecialist: tPrintable("yourHelocSpecialist"),
                  mortgageAdvisor: tPrintable("mortgageAdvisor"),
                  importantDisclaimer: tPrintable("importantDisclaimer"),
                  disclaimerText: tPrintable("disclaimerText"),
                };

                // Render the report component to HTML string
                const reportHTML = renderToString(
                  <PrintableReport
                    results={results}
                    inputs={inputs}
                    companySettings={companySettings}
                    assignedAgent={assignedAgent}
                    translations={pdfTranslations}
                  />,
                );

                // Generate filename
                const filename = generateReportFilename(inputs.scenarioName);

                // Generate and download PDF
                await generatePDFFromComponent(reportHTML, filename);
              } catch (error) {
                console.error("Error generating PDF:", error);
                alert("Failed to generate PDF. Please try again.");
              }
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <Icon name="print" size="sm" />
          <span>{tResults("printReport")}</span>
        </button>

        {onNewCalculation && (
          <button
            onClick={onNewCalculation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="calculator" size="sm" />
            <span>New Calculation</span>
          </button>
        )}

        <button
          onClick={() => triggerConfetti({ type: "celebration" })}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>🎉</span>
          <span>Celebrate Savings!</span>
        </button>
      </div>

      {/* Key Insights with Success Image */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="info" size="sm" className="text-blue-600 mr-2" />
              Key Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">
                    {tResults("strategyEffectiveness")}:
                  </span>{" "}
                  {tResults("strategyEffectivenessDescription", {
                    amount: formatCurrency(results.comparison.interestSaved),
                  })}
                </p>

                <p className="text-gray-700">
                  <span className="font-medium">{tResults("timeSaved")}:</span>{" "}
                  {tResults("timeSavingsDescription", {
                    years: results.comparison.timeSavedYears,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">
                    {tResults("helocUtilization")}:
                  </span>{" "}
                  {tResults("helocUtilizationDescription", {
                    amount: formatCurrency(results.heloc.maxHelocUsed),
                  })}
                </p>

                <p className="text-gray-700">
                  <span className="font-medium">
                    {tResults("interestReduction")}:
                  </span>{" "}
                  {tResults("interestReductionDescription", {
                    percentage: formatPercentage(
                      results.comparison.percentageInterestSaved,
                    ),
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <PexelsImage
              theme="success"
              orientation="square"
              size="medium"
              className="rounded-lg shadow-md w-48 h-48"
              width={200}
              height={200}
              showAttribution={false}
            />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon name="alert" size="sm" className="text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {tResults("importantDisclaimer")}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{tResults("disclaimerText")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages for Save */}
      {(saveSuccess || saveError) && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <Icon
                  name="check-circle"
                  size="sm"
                  className="text-green-600 mr-2"
                />
                <p className="text-green-800 font-medium">
                  Scenario saved successfully!
                </p>
              </div>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <Icon name="x-circle" size="sm" className="text-red-600 mr-2" />
                <p className="text-red-800">{saveError}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
