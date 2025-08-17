import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  className,
  labelClassName,
  errorClassName,
  helperClassName,
}) => {
  const hasError = Boolean(error);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          className={cn(
            "block text-body-sm font-medium mb-1",
            hasError ? "text-destructive" : "text-foreground",
            labelClassName,
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">{children}</div>

      {error && (
        <p
          className={cn("mt-1 text-body-sm text-destructive", errorClassName)}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          className={cn(
            "mt-1 text-body-sm text-muted-foreground",
            helperClassName,
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <fieldset className={cn("space-y-4", className)}>
      {title && (
        <legend className="text-h5 font-semibold text-foreground">
          {title}
        </legend>
      )}
      {description && (
        <p className="text-body-sm text-muted-foreground -mt-2">
          {description}
        </p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
};

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="border-b border-border pb-4">
          {title && (
            <h3 className="text-h4 font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-body text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export interface FormActionsProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = "right",
  className,
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700",
        alignClasses[align],
        className,
      )}
    >
      {children}
    </div>
  );
};

export interface ValidationMessageProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  className,
}) => {
  const typeStyles = {
    error:
      "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    success:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    warning:
      "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  const icons = {
    error: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-2 p-3 rounded-md border text-body-sm",
        typeStyles[type],
        className,
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <span>{message}</span>
    </div>
  );
};
