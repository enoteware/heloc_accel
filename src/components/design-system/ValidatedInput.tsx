import React from "react";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface ValidatedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
  loading?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
}

export const ValidatedInput = React.forwardRef<
  HTMLInputElement,
  ValidatedInputProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      success = false,
      loading = false,
      required,
      onChange,
      onBlur,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const getStateIcon = () => {
      if (loading) {
        return (
          <svg
            className="animate-spin h-4 w-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      }

      if (hasError) {
        return (
          <svg
            className="h-4 w-4 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      }

      if (success) {
        return (
          <svg
            className="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      }

      return rightIcon;
    };

    const stateIcon = getStateIcon();

    return (
      <FormField
        label={label}
        error={error}
        helperText={helperText}
        required={required}
      >
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-neutral-400 dark:text-neutral-500">
                {leftIcon}
              </div>
            </div>
          )}

          <input
            id={inputId}
            className={cn(
              // Base styles
              "block w-full rounded-lg border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
              "placeholder-neutral-400 dark:placeholder-neutral-500",
              "bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100",

              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-3",
              stateIcon ? "pr-10" : "pr-3",
              "py-2",

              // State-based styling
              hasError
                ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                : success
                  ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20"
                  : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",

              className,
            )}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {stateIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {stateIcon}
            </div>
          )}
        </div>
      </FormField>
    );
  },
);

ValidatedInput.displayName = "ValidatedInput";

export interface ValidatedTextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  error?: string | null;
  helperText?: string;
  success?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
}

export const ValidatedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ValidatedTextareaProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      success = false,
      resize = "vertical",
      required,
      onChange,
      onBlur,
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <FormField
        label={label}
        error={error}
        helperText={helperText}
        required={required}
      >
        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            "block w-full rounded-lg border px-3 py-2 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
            "placeholder-neutral-400 dark:placeholder-neutral-500",
            "bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100",

            // Resize behavior
            resizeClasses[resize],

            // State-based styling
            hasError
              ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
              : success
                ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",

            className,
          )}
          ref={ref}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          {...props}
        />
      </FormField>
    );
  },
);

ValidatedTextarea.displayName = "ValidatedTextarea";
