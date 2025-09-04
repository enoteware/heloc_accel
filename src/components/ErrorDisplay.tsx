"use client";

import React from "react";
import { ErrorCode } from "@/lib/errors";
import { Icon } from "@/components/Icons";

interface ErrorDisplayProps {
  error: string;
  errorDetails?: {
    errorCode?: ErrorCode;
    suggestion?: string;
    field?: string;
    technicalMessage?: string;
  };
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorDisplay({
  error,
  errorDetails,
  onDismiss,
  onRetry,
}: ErrorDisplayProps) {
  const getVariant = () => {
    switch (errorDetails?.errorCode) {
      case ErrorCode.NEGATIVE_AMORTIZATION:
      case ErrorCode.INSUFFICIENT_PAYMENT:
        return "warning" as const;
      case ErrorCode.VALIDATION_FAILED:
      case ErrorCode.INVALID_INTEREST_RATE:
      case ErrorCode.INVALID_LOAN_TERM:
        return "warning" as const;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return "info" as const;
      default:
        return "destructive" as const;
    }
  };
  const variant = getVariant();

  return (
    <div
      className={`rounded-lg p-4 mb-6 border ${
        variant === "warning"
          ? "border-warning-border bg-[rgb(var(--color-warning-background))]"
          : variant === "info"
            ? "border-info-border bg-[rgb(var(--color-info-background))]"
            : "border-destructive bg-[rgb(var(--color-error-background))]"
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {variant === "warning" && (
            <Icon name="alert" size="lg" className="text-warning" />
          )}
          {variant === "info" && (
            <Icon name="info" size="lg" className="text-info" />
          )}
          {variant === "destructive" && (
            <Icon name="x-circle" size="lg" className="text-destructive" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              variant === "warning"
                ? "text-warning"
                : variant === "info"
                  ? "text-info"
                  : "text-destructive"
            }`}
          >
            {error || "An error occurred"}
          </h3>

          {errorDetails?.suggestion && (
            <div
              className={`mt-2 text-sm ${
                variant === "warning"
                  ? "text-warning"
                  : variant === "info"
                    ? "text-info"
                    : "text-destructive"
              }`}
            >
              <p className="font-medium mb-1">What to do:</p>
              <p className="whitespace-pre-line">{errorDetails.suggestion}</p>
            </div>
          )}

          {errorDetails?.field && (
            <div
              className={`mt-2 text-xs ${
                variant === "warning"
                  ? "text-warning"
                  : variant === "info"
                    ? "text-info"
                    : "text-destructive"
              }`}
            >
              <span className="font-medium">Related field:</span>{" "}
              {errorDetails.field}
            </div>
          )}

          {process.env.NODE_ENV === "development" &&
            errorDetails?.technicalMessage && (
              <details className="mt-3">
                <summary
                  className={`text-xs cursor-pointer ${
                    variant === "warning"
                      ? "text-warning hover:underline"
                      : variant === "info"
                        ? "text-info hover:underline"
                        : "text-destructive hover:underline"
                  }`}
                >
                  Technical details
                </summary>
                <pre
                  className={`mt-1 text-xs ${
                    variant === "warning"
                      ? "text-warning"
                      : variant === "info"
                        ? "text-info"
                        : "text-destructive"
                  } overflow-x-auto`}
                >
                  {errorDetails.technicalMessage}
                </pre>
              </details>
            )}

          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`text-sm font-medium py-1 px-3 rounded transition-colors duration-200 ${
                  variant === "warning"
                    ? "bg-warning/15 text-warning hover:bg-warning/25"
                    : variant === "info"
                      ? "bg-info/15 text-info hover:bg-info/25"
                      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-sm font-medium ${
                  variant === "warning"
                    ? "text-warning hover:underline"
                    : variant === "info"
                      ? "text-info hover:underline"
                      : "text-destructive hover:underline"
                }`}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a simpler inline error for form fields
export function InlineError({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center mt-1 text-sm text-destructive ${className}`}
    >
      <Icon name="alert" size="xs" className="mr-1" />
      {message}
    </div>
  );
}
