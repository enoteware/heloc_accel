import { logError, logWarn, logInfo } from "./debug-logger";
import { isDebugFeatureEnabled } from "./debug-config";

/**
 * Intercepts console methods to capture logs in our debug logger
 * Only runs when debug mode is enabled
 */
export function setupConsoleInterceptor() {
  if (typeof window === "undefined") return;

  // Only intercept console in debug mode
  if (!isDebugFeatureEnabled("consoleInterceptor")) return;

  // Store original console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
  };

  // Override console.error
  console.error = function (...args: any[]) {
    // Call original console.error
    originalConsole.error.apply(console, args);

    // Log to our debug logger
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");

    logError("Console", message, { args });
  };

  // Override console.warn
  console.warn = function (...args: any[]) {
    // Call original console.warn
    originalConsole.warn.apply(console, args);

    // Log to our debug logger
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");

    logWarn("Console", message, { args });
  };

  // Capture unhandled errors
  window.addEventListener("error", (event) => {
    logError("Console", `Unhandled error: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || event.error?.toString(),
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError("Console", `Unhandled promise rejection: ${event.reason}`, {
      reason: event.reason,
      promise: event.promise,
    });
  });

  // Log that console interceptor is active
  logInfo(
    "Console",
    "Console interceptor initialized - capturing console errors and warnings",
  );
}
