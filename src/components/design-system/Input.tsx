import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full form-field">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="text-neutral-600 input-icon-left">{leftIcon}</div>
            </div>
          )}
          <input
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              // Base styles
              "block w-full rounded-lg border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
              "placeholder-muted-foreground",
              // Background and text colors
              "!bg-background !text-foreground",
              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-3",
              rightIcon ? "pr-10" : "pr-3",
              "py-2",
              // Error state
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive"
                : "border-input hover:border-border",
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="text-neutral-600 input-icon-right">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-body-sm text-red-600 error-message"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1 text-body-sm text-neutral-600 helper-text"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
