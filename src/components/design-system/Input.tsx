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
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-foreground-secondary mb-1"
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
              <div className="text-muted-foreground">{leftIcon}</div>
            </div>
          )}
          <input
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              // Base styles with brand alignment
              "block w-full rounded-md border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
              "placeholder:text-muted-foreground",
              // Background and text colors using semantic tokens
              "bg-background text-foreground",
              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-3",
              rightIcon ? "pr-10" : "pr-3",
              "py-3", // 12px padding - brand standard
              // Error state
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border hover:border-border-secondary",
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
              <div className="text-muted-foreground">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-body-sm text-destructive"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-body-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
