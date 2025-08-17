import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              // Base styles
              "block w-full rounded-lg border px-3 py-2 pr-10 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
              // Background and text colors - white background with black text as per style guide
              "appearance-none !bg-background !text-foreground",
              // Error state
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive"
                : "border-input hover:border-border",
              className,
            )}
            ref={ref}
            {...props}
          >
            {(options || []).map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="!bg-background !text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-body-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-body-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
