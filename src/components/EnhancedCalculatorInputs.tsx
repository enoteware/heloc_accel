import React, { useState, useEffect } from "react";
import type { CalculatorValidationInput } from "@/lib/validation";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
} from "@/lib/number-formatting";

interface EnhancedInputProps {
  field: keyof CalculatorValidationInput;
  label: string;
  description: string;
  required?: boolean;
  value: string | number;
  error?: string;
  onChange: (
    field: keyof CalculatorValidationInput,
    value: string | number,
  ) => void;
  onBlur: (field: keyof CalculatorValidationInput) => void;
  priority?: "high" | "medium" | "low";
  placeholder?: string;
  tooltip?: string;
}

const InfoIcon = ({ tooltip }: { tooltip?: string }) => (
  <div className="group relative">
    <svg
      className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
    {tooltip && (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    )}
  </div>
);

export const EnhancedCurrencyInput: React.FC<EnhancedInputProps> = ({
  field,
  label,
  description,
  required = false,
  value,
  error,
  onChange,
  onBlur,
  priority = "medium",
  placeholder = "e.g. $350,000",
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (value === 0 || value === "") {
        setDisplayValue("");
      } else {
        setDisplayValue(formatNumberWithCommas(value));
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Remove commas and convert to number for internal handling
    const numericValue = parseFormattedNumber(inputValue);
    onChange(field, numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show unformatted value during editing for better UX
    setDisplayValue(value === 0 ? "" : String(value));
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur(field);
    // Format the display value
    if (value && value !== 0) {
      setDisplayValue(formatNumberWithCommas(value));
    }
  };

  // Typography classes based on priority
  const isEmpty = !value || value === 0 || value === "";
  const labelClasses =
    priority === "high"
      ? "text-lg font-semibold text-gray-800 mb-1.5"
      : "text-sm font-medium text-gray-700 mb-1";

  const inputClasses =
    priority === "high"
      ? `text-lg font-semibold text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`
      : `text-base text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={field} className={`block ${labelClasses}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </div>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          id={field}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full pl-8 pr-3 py-3 border rounded-lg transition-all duration-200 placeholder-custom ${inputClasses} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : isEmpty
                ? "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          } focus:outline-none dark:!text-white dark:bg-neutral-800`}
          placeholder={placeholder}
          aria-describedby={error ? `${field}-error` : `${field}-description`}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
        />
      </div>
      {error && (
        <p
          id={`${field}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const EnhancedPercentageInput: React.FC<EnhancedInputProps> = ({
  field,
  label,
  description,
  required = false,
  value,
  error,
  onChange,
  onBlur,
  priority = "medium",
  placeholder = "e.g. 6.50",
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 || value === "" ? "" : String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    onChange(field, inputValue);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onBlur(field);
  };

  const isEmpty = !value || value === 0 || value === "";
  const labelClasses =
    priority === "high"
      ? "text-lg font-semibold text-gray-800 mb-1.5"
      : "text-sm font-medium text-gray-700 mb-1";

  const inputClasses =
    priority === "high"
      ? `text-lg font-semibold text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`
      : `text-base text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={field} className={`block ${labelClasses}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </div>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          id={field}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full px-3 py-3 pr-8 border rounded-lg transition-all duration-200 placeholder-custom ${inputClasses} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : isEmpty
                ? "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          } focus:outline-none dark:!text-white dark:bg-neutral-800`}
          placeholder={placeholder}
          step="0.01"
          min="0"
          max="30"
          aria-describedby={error ? `${field}-error` : `${field}-description`}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          %
        </span>
      </div>
      {error && (
        <p
          id={`${field}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const EnhancedNumberInput: React.FC<EnhancedInputProps> = ({
  field,
  label,
  description,
  required = false,
  value,
  error,
  onChange,
  onBlur,
  priority = "medium",
  placeholder = "e.g. 360",
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (value === 0 || value === "") {
        setDisplayValue("");
      } else {
        setDisplayValue(formatNumberWithCommas(value));
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    const numericValue = parseFormattedNumber(inputValue);
    onChange(field, numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : String(value));
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur(field);
    if (value && value !== 0) {
      setDisplayValue(formatNumberWithCommas(value));
    }
  };

  const isEmpty = !value || value === 0 || value === "";
  const labelClasses =
    priority === "high"
      ? "text-lg font-semibold text-gray-800 mb-1.5"
      : "text-sm font-medium text-gray-700 mb-1";

  const inputClasses =
    priority === "high"
      ? `text-lg font-semibold text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`
      : `text-base text-center ${isEmpty ? "text-gray-400" : "text-gray-900"}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={field} className={`block ${labelClasses}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </div>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <input
        type="text"
        inputMode="numeric"
        id={field}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 placeholder-custom ${inputClasses} ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : isEmpty
              ? "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
        } focus:outline-none dark:!text-white dark:bg-neutral-800`}
        placeholder={placeholder}
        aria-describedby={error ? `${field}-error` : `${field}-description`}
      />
      {error && (
        <p
          id={`${field}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {field === "remainingTermMonths" && value && Number(value) > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {Math.round((Number(value) / 12) * 10) / 10} years
        </p>
      )}
    </div>
  );
};
