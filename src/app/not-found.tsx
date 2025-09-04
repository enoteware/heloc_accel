import React from "react";
import Link from "next/link";
import { Button } from "../components/design-system/Button";

export default function NotFound() {
  const isDemoMode = false;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[rgb(var(--color-info-background))]">
            <svg
              className="h-8 w-8 text-info"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33m0 0L3 15l2.92-2.33M21 15l-2.92-2.33M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-6xl font-extrabold text-foreground">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-foreground-secondary">
            {"Sorry, we couldn't find the page you're looking for."}
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: "rgb(var(--color-info-background))",
            borderColor: "rgb(var(--color-info-border))",
          }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-info"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 text-left">
              <h3 className="text-sm font-medium text-info">Available Pages</h3>
              <div className="mt-2 text-sm text-info">
                <ul className="list-disc list-inside space-y-1">
                  <li>Home page</li>
                  <li>HELOC Calculator</li>
                  <li>Dashboard (saved scenarios)</li>
                  <li>Compare scenarios</li>
                  <li>Formulas and methodology</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button variant="primary" className="w-full">
              Go to Home Page
            </Button>
          </Link>

          <Link href="/calculator">
            <Button variant="outline" className="w-full">
              Try the Calculator
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-foreground-secondary">
            Need help? Check out our{" "}
            <Link href="/formulas" className="text-info hover:underline">
              formulas and methodology
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
