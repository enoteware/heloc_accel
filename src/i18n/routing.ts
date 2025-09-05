import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es"],

  // Used when no locale matches
  defaultLocale: "en",

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    // If all locales use the same pathname, a single
    // external path can be provided for all locales
    "/": "/",
    "/calculator": "/calculator",
    "/calculator/traditional": "/calculator/traditional",
    "/budgeting": "/budgeting",
    "/scenarios": "/scenarios",
    "/reports": "/reports",
    "/dashboard": "/dashboard",
    "/profile": "/profile",
    "/compare": "/compare",
    "/formulas": "/formulas",
    "/style-guide": "/style-guide",
    "/admin": "/admin",
    "/login": "/login",
    "/auth/signin": "/auth/signin",
    "/auth/signup": "/auth/signup",
    "/handler/sign-in": "/handler/sign-in",
    "/handler/sign-up": "/handler/sign-up",
    "/handler/[...stack]": "/handler/[...stack]",
    "/sign-out": "/sign-out",
    "/demo-setup": "/demo-setup",
    "/privacy": "/privacy",
    "/terms": "/terms",
    "/contact": "/contact",
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
