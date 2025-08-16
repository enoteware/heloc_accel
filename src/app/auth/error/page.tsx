"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
      default:
        return "An error occurred during authentication.";
    }
  };

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
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        {/* Demo Mode Information */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  Demo Mode Active
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Don&apos;t worry! In demo mode, authentication is optional.
                  You can access all features without signing in.
                </p>
                <div className="bg-white rounded border border-green-200 p-3 mb-3">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Demo Credentials:
                  </p>
                  <div className="text-xs text-green-700 font-mono space-y-1">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      demo@helocaccel.com
                    </p>
                    <p>
                      <span className="font-semibold">Password:</span>{" "}
                      DemoUser123!
                    </p>
                  </div>
                </div>
                <div className="text-xs text-green-700">
                  <p className="font-medium mb-1">💡 Demo Options:</p>
                  <ul className="space-y-1">
                    <li>• Skip login entirely and use the calculator</li>
                    <li>• Try the demo credentials above</li>
                    <li>• All features work without authentication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isDemoMode && (
            <Link
              href="/calculator"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Skip Login - Go to Calculator
            </Link>
          )}

          <Link
            href="/auth/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Signing In Again
          </Link>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Error Details for Debugging */}
        {error && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>Error Code:</strong> {error}
            </p>
            {isDemoMode && (
              <p className="text-xs text-gray-500 mt-1">
                <strong>Demo Mode:</strong> Authentication errors are expected
                and can be ignored
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
