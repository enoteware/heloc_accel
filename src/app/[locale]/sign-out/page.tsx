"use client";

import { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        if (user) {
          // Sign out the user using Stack Auth's client-side method
          await user.signOut();
        }

        // Redirect to home page after sign out
        router.push("/");
      } catch (error) {
        console.error("Sign out error:", error);
        // Even if there's an error, redirect to home
        router.push("/");
      }
    };

    performSignOut();
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Signing out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we sign you out.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  );
}
