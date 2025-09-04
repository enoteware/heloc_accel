"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import type { CalculatorValidationInput } from "@/lib/validation";
import type { CompanySettings, Agent } from "@/lib/company-data";
import { formatPhoneNumber, getAgentFullName } from "@/lib/company-data";

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

interface PrintableReportTranslations {
  title: string;
  generated: string;
  executiveSummary: string;
  propertyMortgageDetails: string;
  propertyValue: string;
  currentBalance: string;
  interestRate: string;
  monthlyPayment: string;
  yearsSaved: string;
  interestSaved: string;
  interestReduction: string;
  financialCapacity: string;
  monthlyNetIncome: string;
  monthlyExpenses: string;
  discretionaryIncome: string;
  helocLimit: string;
  strategyComparison: string;
  traditionalMortgage: string;
  helocAcceleration: string;
  payoffTime: string;
  totalInterest: string;
  totalPayments: string;
  maxHelocUsed: string;
  implementationStrategy: string;
  monthlyPaymentPlan: string;
  keyMilestones: string;
  continueMortgagePayment: string;
  avgHelocInterest: string;
  applyDiscretionaryIncome: string;
  beginHelocDraws: string;
  peakHeloc: string;
  fullPayoff: string;
  payoffTimelineComparison: string;
  yourHelocSpecialist: string;
  mortgageAdvisor: string;
  importantDisclaimer: string;
  disclaimerText: string;
}

interface PrintableReportProps {
  results: CalculationResults;
  inputs: CalculatorValidationInput;
  generatedDate?: Date;
  companySettings?: CompanySettings | null;
  assignedAgent?: Agent | null;
  translations?: PrintableReportTranslations;
}

// Internal component that doesn't use hooks
function PrintableReportContent({
  results,
  inputs,
  generatedDate = new Date(),
  companySettings,
  assignedAgent,
  translations,
  locale = "en",
}: PrintableReportProps & { locale?: string }) {
  const t = (key: string) => {
    if (translations) {
      return (translations as any)[key] || key;
    }
    return key; // Fallback to key if no translations
  };

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} ${months !== 1 ? "months" : "month"}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    }
  };

  // Calculate monthly HELOC payment info
  const activeMonths = results.heloc.schedule.filter((m) => m.helocBalance > 0);
  const avgHelocInterest =
    activeMonths.length > 0
      ? activeMonths.reduce((sum, m) => sum + m.helocInterest, 0) /
        activeMonths.length
      : 0;

  return (
    <div className="printable-report bg-card border border-border p-8 max-w-[8.5in] mx-auto">
      {/* Header with Company Branding */}
      <header className="mb-6 border-b-2 border-border pb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {t("title")}
            </h1>
            <div className="text-sm text-foreground-secondary">
              <span>
                {t("generated")}: {formatDate(generatedDate)}
              </span>
              {inputs.scenarioName && (
                <span className="ml-3 font-medium">{inputs.scenarioName}</span>
              )}
            </div>
          </div>
          {companySettings && (
            <div className="text-right text-sm">
              <h2 className="font-bold text-foreground">
                {companySettings.companyName}
              </h2>
              <p className="text-foreground-secondary">
                {companySettings.companyPhone}
              </p>
              <p className="text-foreground-secondary">
                {companySettings.companyWebsite}
              </p>
              {companySettings.companyNmlsNumber && (
                <p className="text-xs text-muted-foreground mt-1">
                  NMLS #{companySettings.companyNmlsNumber}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-6 p-4 rounded-lg border border-info bg-info-background">
        <h2 className="text-lg font-bold text-info-foreground mb-3">
          {t("executiveSummary")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-foreground">
              {results.comparison.timeSavedYears}
            </div>
            <div className="text-xs text-foreground-secondary">
              {t("yearsSaved")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-foreground">
              {formatCurrency(results.comparison.interestSaved)}
            </div>
            <div className="text-xs text-foreground-secondary">
              {t("interestSaved")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-foreground">
              {formatPercentage(results.comparison.percentageInterestSaved)}
            </div>
            <div className="text-xs text-foreground-secondary">
              {t("interestReduction")}
            </div>
          </div>
        </div>
      </section>

      {/* Property & Loan Details */}
      <section className="mb-6 grid grid-cols-2 gap-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2 text-sm">
            {t("propertyMortgageDetails")}
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("propertyValue")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.propertyValue || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("currentBalance")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.currentMortgageBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("interestRate")}:
              </span>
              <span className="font-medium">
                {formatPercentage(inputs.currentInterestRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("monthlyPayment")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.monthlyPayment)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2 text-sm">
            {t("financialCapacity")}
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("monthlyNetIncome")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.monthlyNetIncome)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("monthlyExpenses")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("discretionaryIncome")}:
              </span>
              <span className="font-medium text-success-foreground">
                {formatCurrency(inputs.monthlyDiscretionaryIncome)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">
                {t("helocLimit")}:
              </span>
              <span className="font-medium">
                {formatCurrency(inputs.helocLimit || 0)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Comparison */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">
          {t("strategyComparison")}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center">
              <span className="w-2 h-2 bg-foreground rounded-full mr-2"></span>
              {t("traditionalMortgage")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("payoffTime")}:
                </span>
                <span className="font-medium">
                  {formatMonths(results.traditional.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("totalInterest")}:
                </span>
                <span className="font-medium">
                  {formatCurrency(results.traditional.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("totalPayments")}:
                </span>
                <span className="font-medium">
                  {formatCurrency(results.traditional.totalPayments)}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-info rounded-lg p-4 bg-info-background">
            <h3 className="font-semibold text-info-foreground mb-2 flex items-center">
              <span className="w-2 h-2 bg-info rounded-full mr-2"></span>
              {t("helocAcceleration")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("payoffTime")}:
                </span>
                <span className="font-semibold text-success-foreground">
                  {formatMonths(results.heloc.payoffMonths)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("totalInterest")}:
                </span>
                <span className="font-semibold text-success-foreground">
                  {formatCurrency(results.heloc.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("maxHelocUsed")}:
                </span>
                <span className="font-medium">
                  {formatCurrency(results.heloc.maxHelocUsed)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Recommendations */}
      <section className="mb-6 p-4 rounded-lg border border-success bg-success-background">
        <h2 className="text-lg font-bold text-success-foreground mb-3">
          {t("implementationStrategy")}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {t("monthlyPaymentPlan")}
            </h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("continueMortgagePayment")}:
                </span>
                <span className="font-medium">
                  {formatCurrency(inputs.monthlyPayment)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("avgHelocInterest")}:
                </span>
                <span className="font-medium">
                  {formatCurrency(avgHelocInterest)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-foreground-secondary">
                  {t("applyDiscretionaryIncome")}:
                </span>
                <span className="font-medium text-success-foreground">
                  {formatCurrency(inputs.monthlyDiscretionaryIncome)}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {t("keyMilestones")}
            </h4>
            <ul className="space-y-1 text-xs">
              <li className="text-foreground-secondary">
                • {t("beginHelocDraws")}
              </li>
              <li className="text-foreground-secondary">
                • {t("peakHeloc")}: {formatCurrency(results.heloc.maxHelocUsed)}
              </li>
              <li className="text-foreground-secondary">
                • {t("fullPayoff")} {formatMonths(results.heloc.payoffMonths)}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visual Timeline */}
      <section className="mb-6">
        <h3 className="font-semibold text-foreground mb-2 text-sm">
          {t("payoffTimelineComparison")}
        </h3>
        <div className="relative h-16 rounded-lg p-2 bg-muted">
          {/* Traditional timeline */}
          <div className="absolute top-2 left-2 right-2 h-5 rounded-full bg-border">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium pr-2">
              {results.traditional.payoffMonths} mo
            </div>
          </div>
          {/* HELOC timeline */}
          <div
            className="absolute bottom-2 left-2 h-5 rounded-full bg-success"
            style={{
              width: `${(results.heloc.payoffMonths / results.traditional.payoffMonths) * 100}%`,
            }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium pr-2 text-success-foreground">
              {results.heloc.payoffMonths} mo
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      {assignedAgent && (
        <section className="mt-6 mb-6 p-4 rounded-lg border border-success bg-success-background">
          <h2 className="text-lg font-bold text-success-foreground mb-3">
            {t("yourHelocSpecialist")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-foreground">
                {getAgentFullName(assignedAgent)}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {assignedAgent.title || t("mortgageAdvisor")}
              </p>
              {assignedAgent.nmlsNumber && (
                <p className="text-xs text-muted-foreground mt-1">
                  NMLS #{assignedAgent.nmlsNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground-secondary">
                {assignedAgent.email}
              </p>
              {assignedAgent.phone && (
                <p className="text-sm text-foreground-secondary">
                  Office:{" "}
                  {formatPhoneNumber(
                    assignedAgent.phone,
                    assignedAgent.phoneExtension,
                  )}
                </p>
              )}
              {assignedAgent.mobilePhone && (
                <p className="text-sm text-foreground-secondary">
                  Mobile: {formatPhoneNumber(assignedAgent.mobilePhone)}
                </p>
              )}
            </div>
          </div>
          {assignedAgent.bio && (
            <p className="mt-3 text-sm text-foreground-secondary italic">
              {assignedAgent.bio}
            </p>
          )}
          <div className="mt-4 p-3 rounded-lg bg-success-background">
            <p className="text-sm font-semibold text-success-foreground">
              Ready to get started?
            </p>
            <p className="text-sm text-success-foreground mt-1">
              Contact {assignedAgent.firstName} today to discuss how a HELOC can
              help you achieve your financial goals faster.
            </p>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <footer className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="mb-3">
          {companySettings && (
            <div className="text-center mb-2">
              <p className="font-semibold text-foreground">
                {companySettings.companyName}
              </p>
              {companySettings.companyAddress && (
                <p className="whitespace-pre-line">
                  {companySettings.companyAddress}
                </p>
              )}
              <p>
                {companySettings.companyPhone} • {companySettings.companyEmail}
              </p>
              {companySettings.companyLicenseNumber && (
                <p className="mt-1">
                  License #{companySettings.companyLicenseNumber}
                </p>
              )}
            </div>
          )}
        </div>
        <p className="font-semibold mb-1">{t("importantDisclaimer")}:</p>
        <p>{t("disclaimerText")}</p>
      </footer>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .printable-report {
            margin: 0;
            padding: 0.5in;
            font-size: 11pt;
            color: black !important;
            background: white !important;
          }

          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: letter;
            margin: 0.5in;
          }

          body {
            margin: 0;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Main component that uses hooks when available
export default function PrintableReport(props: PrintableReportProps) {
  // Always call hooks at the top level
  const t = useTranslations("printableReport");
  const locale = useLocale();

  // If translations are provided, use the content component directly
  if (props.translations) {
    return <PrintableReportContent {...props} />;
  }

  // Otherwise, use hooks to get translations

  const translations = {
    title: t("title"),
    generated: t("generated"),
    executiveSummary: t("executiveSummary"),
    propertyMortgageDetails: t("propertyMortgageDetails"),
    propertyValue: t("propertyValue"),
    currentBalance: t("currentBalance"),
    interestRate: t("interestRate"),
    monthlyPayment: t("monthlyPayment"),
    yearsSaved: t("yearsSaved"),
    interestSaved: t("interestSaved"),
    interestReduction: t("interestReduction"),
    financialCapacity: t("financialCapacity"),
    monthlyNetIncome: t("monthlyNetIncome"),
    monthlyExpenses: t("monthlyExpenses"),
    discretionaryIncome: t("discretionaryIncome"),
    helocLimit: t("helocLimit"),
    strategyComparison: t("strategyComparison"),
    traditionalMortgage: t("traditionalMortgage"),
    helocAcceleration: t("helocAcceleration"),
    payoffTime: t("payoffTime"),
    totalInterest: t("totalInterest"),
    totalPayments: t("totalPayments"),
    maxHelocUsed: t("maxHelocUsed"),
    implementationStrategy: t("implementationStrategy"),
    monthlyPaymentPlan: t("monthlyPaymentPlan"),
    keyMilestones: t("keyMilestones"),
    continueMortgagePayment: t("continueMortgagePayment"),
    avgHelocInterest: t("avgHelocInterest"),
    applyDiscretionaryIncome: t("applyDiscretionaryIncome"),
    beginHelocDraws: t("beginHelocDraws"),
    peakHeloc: t("peakHeloc"),
    fullPayoff: t("fullPayoff"),
    payoffTimelineComparison: t("payoffTimelineComparison"),
    yourHelocSpecialist: t("yourHelocSpecialist"),
    mortgageAdvisor: t("mortgageAdvisor"),
    importantDisclaimer: t("importantDisclaimer"),
    disclaimerText: t("disclaimerText"),
  };

  return (
    <PrintableReportContent
      {...props}
      translations={translations}
      locale={locale}
    />
  );
}
