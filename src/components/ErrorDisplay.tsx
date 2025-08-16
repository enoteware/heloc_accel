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
  const getErrorIcon = () => {
    switch (errorDetails?.errorCode) {
      case ErrorCode.NEGATIVE_AMORTIZATION:
      case ErrorCode.INSUFFICIENT_PAYMENT:
        return <Icon name="alert" size="lg" className="text-orange-500" />;
      case ErrorCode.VALIDATION_FAILED:
      case ErrorCode.INVALID_INTEREST_RATE:
      case ErrorCode.INVALID_LOAN_TERM:
        return <Icon name="info" size="lg" className="text-yellow-500" />;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return <Icon name="calendar" size="lg" className="text-blue-500" />;
      default:
        return <Icon name="x-circle" size="lg" className="text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorDetails?.errorCode) {
      case ErrorCode.NEGATIVE_AMORTIZATION:
      case ErrorCode.INSUFFICIENT_PAYMENT:
        return "orange";
      case ErrorCode.VALIDATION_FAILED:
      case ErrorCode.INVALID_INTEREST_RATE:
      case ErrorCode.INVALID_LOAN_TERM:
        return "yellow";
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return "blue";
      default:
        return "red";
    }
  };

  const color = getErrorColor();

  return (
    <div
      className={`bg-${color}-50 border-2 border-${color}-200 rounded-lg p-4 mb-6`}
    >
      <div className="flex">
        <div className="flex-shrink-0">{getErrorIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium text-${color}-800`}>
            {error || "An error occurred"}
          </h3>

          {errorDetails?.suggestion && (
            <div className={`mt-2 text-sm text-${color}-700`}>
              <p className="font-medium mb-1">What to do:</p>
              <p className="whitespace-pre-line">{errorDetails.suggestion}</p>
            </div>
          )}

          {errorDetails?.field && (
            <div className={`mt-2 text-xs text-${color}-600`}>
              <span className="font-medium">Related field:</span>{" "}
              {errorDetails.field}
            </div>
          )}

          {process.env.NODE_ENV === "development" &&
            errorDetails?.technicalMessage && (
              <details className="mt-3">
                <summary
                  className={`text-xs text-${color}-600 cursor-pointer hover:text-${color}-700`}
                >
                  Technical details
                </summary>
                <pre
                  className={`mt-1 text-xs text-${color}-600 overflow-x-auto`}
                >
                  {errorDetails.technicalMessage}
                </pre>
              </details>
            )}

          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`text-sm bg-${color}-100 hover:bg-${color}-200 text-${color}-800 font-medium py-1 px-3 rounded transition-colors duration-200`}
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-sm text-${color}-600 hover:text-${color}-700 font-medium`}
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
    <div className={`flex items-center mt-1 text-sm text-red-600 ${className}`}>
      <Icon name="alert" size="xs" className="mr-1" />
      {message}
    </div>
  );
}
