import { CredentialSignIn, CredentialSignUp } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Handler(props: {
  params: Promise<{ stack?: string[] }>;
}) {
  // Extract the route from the URL to determine which component to show
  const params = await props.params;
  const route = params?.stack?.[0] || "sign-in";

  // If already authenticated, immediately send user to calculator (no flash of auth form)
  try {
    const user = await stackServerApp.getUser();
    if (user) {
      // Use locale-aware path via middleware; '/calculator' will be localized
      redirect("/calculator");
    }
  } catch {
    // Ignore and show form if we can't determine user on the server
  }

  // Common wrapper styling for full-page layout
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">
              {route === "sign-up"
                ? "Create your account"
                : "Sign in to your account"}
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              {route === "sign-up" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/en/handler/sign-in"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  {"Don't have an account?"}{" "}
                  <Link
                    href="/en/handler/sign-up"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="bg-card py-8 px-6 shadow rounded-lg text-foreground border border-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Route to appropriate component
  switch (route) {
    case "sign-up":
      return (
        <PageWrapper>
          <CredentialSignUp />
        </PageWrapper>
      );
    case "sign-in":
    default:
      return (
        <PageWrapper>
          <CredentialSignIn />
        </PageWrapper>
      );
  }
}
