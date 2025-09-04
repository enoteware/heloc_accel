"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global Error:", error);
    }

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to error tracking service
      // errorTracker.captureError(error, { level: 'fatal' })
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[rgb(var(--color-error-background))]">
                <svg
                  className="h-8 w-8 text-destructive"
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
              <h1 className="mt-6 text-center text-4xl font-extrabold text-foreground">
                Application Error
              </h1>
              <p className="mt-2 text-center text-lg text-foreground-secondary">
                A critical error occurred that prevented the application from
                loading properly.
              </p>
            </div>

            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "rgb(var(--color-error-background))",
                borderColor: "rgb(var(--color-error-border))",
              }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-destructive"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Critical Error
                  </h3>
                  <div className="mt-2 text-sm text-destructive">
                    <p>
                      {isDevelopment
                        ? error.message
                        : "The application encountered a critical error and cannot continue."}
                    </p>
                    {error.digest && (
                      <p className="mt-1 text-xs text-destructive">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive transition duration-200"
              >
                Try to Recover
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full flex justify-center py-3 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive transition duration-200"
              >
                Reload Application
              </button>
            </div>

            {/* Development error details */}
            {isDevelopment && (
              <details className="mt-8 p-4 bg-card border border-border rounded-lg">
                <summary className="text-sm font-medium text-foreground cursor-pointer">
                  Developer Details
                </summary>
                <div className="mt-2 text-xs text-foreground-secondary font-mono">
                  <p>
                    <strong>Error:</strong> {error.name}
                  </p>
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                  {error.stack && (
                    <div className="mt-2">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs max-h-64 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
