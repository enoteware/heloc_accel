// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { expect } from "@jest/globals";
import matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);
const { toHaveNoViolations } = require("jest-axe");
expect.extend(toHaveNoViolations);

// Mock next-intl to avoid ESM parsing in Jest and simplify i18n usage in tests
jest.mock("next-intl", () => {
  return {
    useTranslations: () => (key) => key,
    useFormatter: () => ({ number: (v) => v, dateTime: (d) => String(d) }),
    NextIntlClientProvider: ({ children }) => children,
  };
});

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Minimal polyfill for Response.json used by NextResponse.json in route handlers
if (typeof Response === "function" && typeof Response.json !== "function") {
  Response.json = (data, init) => {
    const headers = new Headers(init && init.headers ? init.headers : {});
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new Response(JSON.stringify(data), { ...(init || {}), headers });
  };
}

// Node polyfills for TextEncoder/TextDecoder (used by pg and others)
try {
  const { TextEncoder, TextDecoder } = require("util");
  if (!global.TextEncoder) global.TextEncoder = TextEncoder;
  if (!global.TextDecoder) global.TextDecoder = TextDecoder;
} catch (_) {}

// Mock fetch for API tests
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock window.location for navigation tests
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock navigator.clipboard for copy functionality tests
if (!navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve("")),
    },
    writable: true,
    configurable: true,
  });
}

// Mock ResizeObserver for chart components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js server helpers used by route handlers
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => {
      const headers = new Headers({ "content-type": "application/json" });
      return new Response(JSON.stringify(data), {
        status: (init && init.status) || 200,
        headers,
      });
    },
  },
  NextRequest: Request,
}));

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock fetch API globals for Next.js server components
global.Request = jest.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || "GET",
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(""),
}));

global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  status: init?.status || 200,
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  text: jest.fn().mockResolvedValue(body || ""),
}));

global.Headers = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(() => [].entries()),
}));
