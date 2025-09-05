"use client";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const session = useMemo(() => (user ? { user } : null), [user]);
  const status = user ? "authenticated" : "unauthenticated";
  const t = useTranslations("auth");

  const callbackUrl = searchParams.get("callbackUrl") || "/calculator";
  const urlError = searchParams.get("error");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Set error from URL params
  useEffect(() => {
    if (urlError) {
      setError(t("errors.invalidCredentials"));
    }
  }, [urlError, t]);

  const handleLogin = async (email: string, password: string) => {
    // Redirect to Stack Auth sign-in handler
    router.push(
      `/handler/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("errors.missingCredentials"));
      return;
    }
    await handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("signInTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-foreground-secondary">
            {t("orSignUp")}{" "}
            <Link href="/auth/signup" className="font-medium safe-link">
              {t("signUpButton")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="rounded-md p-4 border border-destructive"
              style={{ backgroundColor: "rgb(var(--color-error-background))" }}
            >
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground-secondary"
              >
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input-default"
                placeholder={t("enterEmail")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground-secondary"
              >
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 input-default"
                placeholder={t("enterPassword")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("signingIn") : t("signInButton")}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/" className="text-sm safe-link">
              {t("backToHome")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: "rgb(var(--color-primary))" }}
            ></div>
            <p className="mt-4 text-foreground-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
