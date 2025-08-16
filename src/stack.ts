import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // storing auth tokens in cookies
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  // Configure default behavior to use credentials only
  urls: {
    signIn: "/en/handler/sign-in",
    signUp: "/en/handler/sign-up",
    afterSignIn: "/en/calculator",
    afterSignUp: "/en/calculator",
    afterSignOut: "/",
  },
});
