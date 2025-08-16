import React from "react";
import { Tooltip } from "../design-system/Tooltip";
import {
  CurrencyInput,
  PercentageInput,
  NumericInput,
  FormInput,
} from "./FormInput";

interface FormFieldWithTooltipProps {
  name: string;
  register: any;
  errors: any;
  rules?: any;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
  type?: "currency" | "percentage" | "numeric" | "text";
}

// Contextual help content for different fields
const FIELD_HELP_CONTENT: Record<string, string> = {
  currentMortgageBalance: `
    <div class="space-y-2">
      <p><strong>Current Mortgage Balance</strong></p>
      <p>Enter the remaining principal balance on your mortgage (not the original loan amount).</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Check your latest mortgage statement</li>
        <li>This is different from your home's current value</li>
        <li>Should be between $1,000 and $10,000,000</li>
      </ul>
    </div>
  `,
  currentInterestRate: `
    <div class="space-y-2">
      <p><strong>Current Interest Rate</strong></p>
      <p>Your mortgage's annual interest rate as a percentage.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Found on your mortgage statement or loan documents</li>
        <li>Enter as percentage (e.g., 6.5 for 6.5%)</li>
        <li>Fixed rates stay the same; ARM rates may vary</li>
      </ul>
    </div>
  `,
  remainingTermMonths: `
    <div class="space-y-2">
      <p><strong>Remaining Term</strong></p>
      <p>Number of months left on your mortgage.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Check your mortgage statement for "remaining term"</li>
        <li>For a 30-year loan taken 5 years ago: 300 months</li>
        <li>Must be between 12 and 480 months</li>
      </ul>
    </div>
  `,
  monthlyPayment: `
    <div class="space-y-2">
      <p><strong>Monthly Payment (P&I)</strong></p>
      <p>Your current monthly principal and interest payment only.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Do NOT include taxes, insurance, or HOA fees</li>
        <li>Found on your mortgage statement as "P&I"</li>
        <li>This is what goes toward paying down your loan</li>
      </ul>
    </div>
  `,
  helocLimit: `
    <div class="space-y-2">
      <p><strong>HELOC Credit Limit</strong></p>
      <p>The maximum amount you can borrow on your HELOC.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Usually 80-90% of home value minus mortgage balance</li>
        <li>Check your HELOC agreement or statement</li>
        <li>Leave blank if you don't have a HELOC yet</li>
      </ul>
    </div>
  `,
  helocInterestRate: `
    <div class="space-y-2">
      <p><strong>HELOC Interest Rate</strong></p>
      <p>The current interest rate on your HELOC.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Usually variable and tied to prime rate</li>
        <li>Typically higher than mortgage rates</li>
        <li>Check your HELOC statement for current rate</li>
      </ul>
    </div>
  `,
  monthlyIncome: `
    <div class="space-y-2">
      <p><strong>Monthly Gross Income</strong></p>
      <p>Your total monthly income before taxes and deductions.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Include salary, bonuses, rental income, etc.</li>
        <li>Use gross amount (before taxes)</li>
        <li>Be conservative with variable income</li>
      </ul>
    </div>
  `,
  monthlyExpenses: `
    <div class="space-y-2">
      <p><strong>Monthly Expenses</strong></p>
      <p>All your monthly expenses EXCEPT your mortgage payment.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Include: utilities, food, car payments, insurance</li>
        <li>Include: credit cards, other loans, subscriptions</li>
        <li>Do NOT include your mortgage payment</li>
      </ul>
    </div>
  `,
  monthlyDiscretionaryIncome: `
    <div class="space-y-2">
      <p><strong>Discretionary Income</strong></p>
      <p>Money available for HELOC acceleration after all expenses.</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Calculated as: Income - Expenses - Mortgage Payment</li>
        <li>This amount will be used to pay down your mortgage faster</li>
        <li>Higher amounts = faster payoff</li>
      </ul>
    </div>
  `,
};

export function FormFieldWithTooltip({
  name,
  type = "text",
  tooltip,
  label,
  ...props
}: FormFieldWithTooltipProps) {
  const helpContent = tooltip || FIELD_HELP_CONTENT[name] || "";

  const renderInput = () => {
    switch (type) {
      case "currency":
        return <CurrencyInput name={name} label={label} {...props} />;
      case "percentage":
        return <PercentageInput name={name} label={label} {...props} />;
      case "numeric":
        return <NumericInput name={name} label={label} {...props} />;
      default:
        return <FormInput name={name} label={label} {...props} />;
    }
  };

  if (!helpContent) {
    return renderInput();
  }

  return (
    <div className="relative">
      {renderInput()}
      <Tooltip
        content={<div dangerouslySetInnerHTML={{ __html: helpContent }} />}
        placement="top"
        className="absolute top-0 right-0 mt-1 mr-1"
      >
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 rounded-full border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
          aria-label={`Help for ${label || name}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}

// Export individual field components with tooltips
export function CurrencyFieldWithTooltip(props: FormFieldWithTooltipProps) {
  return <FormFieldWithTooltip {...props} type="currency" />;
}

export function PercentageFieldWithTooltip(props: FormFieldWithTooltipProps) {
  return <FormFieldWithTooltip {...props} type="percentage" />;
}

export function NumericFieldWithTooltip(props: FormFieldWithTooltipProps) {
  return <FormFieldWithTooltip {...props} type="numeric" />;
}
