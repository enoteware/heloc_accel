"use client";

import React, { useEffect } from "react";
import { Button } from "../components/design-system/Button";
import { Alert } from "../components/design-system/Alert";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Error boundary caught:", error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;re sorry for the inconvenience. Please try again or contact
            support if the problem persists.
          </p>
        </div>

        <Alert variant="danger" title="Error Details" className="text-left">
          <p className="text-sm">
            {isDevelopment
              ? error.message
              : "An unexpected error occurred while processing your request."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </Alert>

        <div className="space-y-4">
          <Button onClick={reset} variant="primary" className="w-full">
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="ghost"
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        {/* Development error details */}
        {isDevelopment && (
          <details className="mt-8 p-4 bg-gray-50 rounded-lg">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Developer Details
            </summary>
            <div className="mt-2 text-xs text-gray-600 font-mono">
              <p>
                <strong>Error:</strong> {error.name}
              </p>
              <p>
                <strong>Message:</strong> {error.message}
              </p>
              {error.stack && (
                <div className="mt-2">
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
