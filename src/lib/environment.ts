/**
 * Environment Configuration
 * Centralized environment detection and configuration
 */

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG === "true",
  VERCEL_ENV: process.env.VERCEL_ENV,
} as const;

export const isDevelopment = ENV.NODE_ENV === "development";
export const isProduction = ENV.NODE_ENV === "production";
export const isTest = ENV.NODE_ENV === "test";

// Vercel environment detection
export const isVercelProduction = ENV.VERCEL_ENV === "production";
export const isVercelPreview = ENV.VERCEL_ENV === "preview";
export const isVercelDevelopment = ENV.VERCEL_ENV === "development";

// Debug mode detection
export const isDebugMode = () => {
  // Never enable debug in production unless explicitly set
  if (isProduction && !ENV.NEXT_PUBLIC_DEBUG) {
    return false;
  }

  // Check URL parameters (client-side only)
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get("debug");

    if (debugParam === "true") return true;
    if (debugParam === "false") return false;
  }

  // Check localStorage (client-side only)
  if (typeof window !== "undefined") {
    const persistentDebug = localStorage.getItem("debug-mode");
    if (persistentDebug === "true") return true;
    if (persistentDebug === "false") return false;
  }

  // Default: enabled in development, disabled in production
  return isDevelopment;
};

// Performance monitoring
export const shouldEnablePerformanceMonitoring = () => {
  return isDebugMode() && (isDevelopment || isVercelPreview);
};

// Console logging
export const shouldEnableConsoleLogging = () => {
  return isDebugMode();
};

// Network logging
export const shouldEnableNetworkLogging = () => {
  return isDebugMode() && isDevelopment;
};

// Bundle analysis
export const shouldAnalyzeBundle = () => {
  return process.env.ANALYZE === "true";
};

// Feature flags
export const FEATURES = {
  DEBUG_PANEL: isDebugMode(),
  DEBUG_LOG_VIEWER: isDebugMode(),
  CONSOLE_INTERCEPTOR: isDebugMode() && isDevelopment,
  FORM_DEBUG_CONSOLE: isDebugMode(),
  PERFORMANCE_MONITORING: shouldEnablePerformanceMonitoring(),
  NETWORK_LOGGING: shouldEnableNetworkLogging(),
  ERROR_BOUNDARY_DETAILS: isDevelopment || isDebugMode(),
} as const;

// API URLs
export const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return `${baseUrl}/${path}`.replace(/\/+/g, "/").replace(/\/$/, "");
};

// Database URLs
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
};

// Logging configuration
export const LOG_CONFIG = {
  level: isProduction ? "error" : "debug",
  enableConsole: shouldEnableConsoleLogging(),
  enableFile: isProduction,
  maxLogs: isDevelopment ? 1000 : 100,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Component render time (ms)
  COMPONENT_RENDER: isDevelopment ? 16 : 50,
  // API response time (ms)
  API_RESPONSE: isDevelopment ? 1000 : 3000,
  // Bundle size (KB)
  BUNDLE_SIZE: isDevelopment ? 1000 : 500,
  // Memory usage (MB)
  MEMORY_USAGE: isDevelopment ? 100 : 50,
} as const;

// Error reporting
export const ERROR_REPORTING = {
  enabled: isProduction,
  sampleRate: isProduction ? 0.1 : 1.0,
  includeStackTrace: !isProduction,
  includeBreadcrumbs: !isProduction,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  // Static assets cache duration (seconds)
  STATIC_ASSETS: isProduction ? 31536000 : 0, // 1 year in prod, no cache in dev
  // API response cache duration (seconds)
  API_RESPONSES: isProduction ? 300 : 0, // 5 minutes in prod, no cache in dev
  // Page cache duration (seconds)
  PAGES: isProduction ? 3600 : 0, // 1 hour in prod, no cache in dev
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP_ENABLED: isProduction,
  // HTTPS enforcement
  FORCE_HTTPS: isProduction,
  // Secure cookies
  SECURE_COOKIES: isProduction,
  // CSRF protection
  CSRF_ENABLED: isProduction,
} as const;

// Development helpers
export const DEV_HELPERS = {
  // Hot reload
  HOT_RELOAD: isDevelopment,
  // Source maps
  SOURCE_MAPS: isDevelopment || isVercelPreview,
  // React strict mode
  STRICT_MODE: isDevelopment,
  // Prop types checking
  PROP_TYPES: isDevelopment,
} as const;

// Export environment info for debugging
export const getEnvironmentInfo = () => ({
  NODE_ENV: ENV.NODE_ENV,
  VERCEL_ENV: ENV.VERCEL_ENV,
  DEBUG_MODE: isDebugMode(),
  FEATURES,
  LOG_CONFIG,
  PERFORMANCE_THRESHOLDS,
  timestamp: new Date().toISOString(),
});
