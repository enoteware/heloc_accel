"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // If your Stack Auth workspace exposes a hosted reset page, set NEXT_PUBLIC_STACK_URL
  const stackUiBase = process.env.NEXT_PUBLIC_STACK_URL || "";
  const hostedResetUrl = stackUiBase
    ? `${stackUiBase.replace(/\/$/, "")}/forgot-password`
    : "";

  return (
    <div className="min-h-screen bg-card text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-semibold">Reset your password</h2>
          <p className="mt-2 text-sm opacity-80">
            Enter your email and we&apos;ll send you reset instructions.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-4 text-sm">
              <p>
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive an email with password reset instructions.
              </p>
              {hostedResetUrl ? (
                <p>
                  You can also open the hosted reset page:{" "}
                  <a
                    className="text-primary underline"
                    href={hostedResetUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Reset Password
                  </a>
                </p>
              ) : null}
              <div className="pt-2">
                <Link
                  className="text-primary underline"
                  href="/handler/sign-in"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <label className="block text-sm font-medium" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                className="w-full mt-2 rounded-md px-4 py-2 bg-primary text-primary-foreground"
              >
                Send reset link
              </button>
              {hostedResetUrl ? (
                <p className="text-xs opacity-70">
                  Or use the hosted page:{" "}
                  <a
                    className="text-primary underline"
                    href={hostedResetUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Reset Password
                  </a>
                </p>
              ) : null}
              <div className="pt-2">
                <Link
                  className="text-primary underline text-sm"
                  href="/handler/sign-in"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
