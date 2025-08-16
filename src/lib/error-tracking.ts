/**
 * Error tracking and monitoring utilities
 */

import { logger } from "./logger";

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  fingerprint: string;
  severity: "low" | "medium" | "high" | "critical";
  tags: string[];
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: "debug" | "info" | "warning" | "error";
  data?: Record<string, any>;
}

class ErrorTracker {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private context: ErrorContext = {};

  /**
   * Set global context for error tracking
   */
  setContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, "timestamp">): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Generate a fingerprint for error grouping
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    const key = `${error.name}:${error.message}:${context.component || "unknown"}`;
    return btoa(key)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: Error,
    context: ErrorContext,
  ): "low" | "medium" | "high" | "critical" {
    // Critical errors
    if (
      error.name === "SecurityError" ||
      error.message.includes("authentication") ||
      error.message.includes("authorization")
    ) {
      return "critical";
    }

    // High severity errors
    if (
      error.name === "TypeError" ||
      error.name === "ReferenceError" ||
      error.message.includes("database") ||
      error.message.includes("payment")
    ) {
      return "high";
    }

    // Medium severity errors
    if (
      error.name === "ValidationError" ||
      error.message.includes("network") ||
      error.message.includes("timeout")
    ) {
      return "medium";
    }

    // Default to low severity
    return "low";
  }

  /**
   * Generate tags for error categorization
   */
  private generateTags(error: Error, context: ErrorContext): string[] {
    const tags: string[] = [];

    // Error type tags
    tags.push(`error.type:${error.name}`);

    // Environment tags
    if (process.env.NODE_ENV) {
      tags.push(`env:${process.env.NODE_ENV}`);
    }

    // Component tags
    if (context.component) {
      tags.push(`component:${context.component}`);
    }

    // Action tags
    if (context.action) {
      tags.push(`action:${context.action}`);
    }

    // User tags
    if (context.userId) {
      tags.push("user:authenticated");
    } else {
      tags.push("user:anonymous");
    }

    // Browser/client tags
    if (context.userAgent) {
      if (context.userAgent.includes("Mobile")) {
        tags.push("device:mobile");
      } else {
        tags.push("device:desktop");
      }
    }

    return tags;
  }

  /**
   * Capture and report an error
   */
  captureError(
    error: Error,
    additionalContext?: Partial<ErrorContext>,
  ): string {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullContext: ErrorContext = {
      ...this.context,
      ...additionalContext,
      timestamp: new Date().toISOString(),
    };

    const errorReport: ErrorReport = {
      id: errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: fullContext,
      fingerprint: this.generateFingerprint(error, fullContext),
      severity: this.determineSeverity(error, fullContext),
      tags: this.generateTags(error, fullContext),
      breadcrumbs: [...this.breadcrumbs],
    };

    // Log the error
    logger.error("Error captured", error, {
      errorId,
      fingerprint: errorReport.fingerprint,
      severity: errorReport.severity,
      tags: errorReport.tags,
      context: fullContext,
    });

    // Send to external error tracking service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService(errorReport).catch((sendError) => {
        logger.error("Failed to send error to external service", sendError);
      });
    }

    return errorId;
  }

  /**
   * Send error report to external service (e.g., Sentry, Bugsnag)
   */
  private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    const endpoint = process.env.ERROR_TRACKING_ENDPOINT;
    const apiKey = process.env.ERROR_TRACKING_API_KEY;

    if (!endpoint || !apiKey) {
      return;
    }

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      // Don't throw here to avoid infinite error loops
      console.error("Failed to send error report:", error);
    }
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(
    message: string,
    level: "debug" | "info" | "warning" | "error" = "info",
    context?: Partial<ErrorContext>,
  ): void {
    this.addBreadcrumb({
      category: "message",
      message,
      level,
      data: context,
    });

    logger.info("Message captured", {
      message,
      level,
      context: { ...this.context, ...context },
    });
  }

  /**
   * Clear breadcrumbs and context
   */
  clear(): void {
    this.breadcrumbs = [];
    this.context = {};
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

/**
 * React Error Boundary integration
 */
export function captureErrorBoundary(error: Error, errorInfo: any): string {
  return errorTracker.captureError(error, {
    component: "ErrorBoundary",
    action: "render",
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
}

/**
 * API error handler
 */
export function captureAPIError(
  error: Error,
  request: Request,
  context?: Partial<ErrorContext>,
): string {
  return errorTracker.captureError(error, {
    url: request.url,
    action: "api_request",
    metadata: {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    },
    ...context,
  });
}

/**
 * Database error handler
 */
export function captureDatabaseError(
  error: Error,
  query: string,
  params?: any[],
): string {
  return errorTracker.captureError(error, {
    component: "database",
    action: "query",
    metadata: {
      query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
      paramCount: params?.length || 0,
    },
  });
}

/**
 * Authentication error handler
 */
export function captureAuthError(
  error: Error,
  action: string,
  userId?: string,
): string {
  return errorTracker.captureError(error, {
    component: "auth",
    action,
    userId,
    metadata: {
      authAction: action,
    },
  });
}

/**
 * Calculation error handler
 */
export function captureCalculationError(
  error: Error,
  calculationType: string,
  inputs?: any,
): string {
  return errorTracker.captureError(error, {
    component: "calculator",
    action: "calculate",
    metadata: {
      calculationType,
      inputKeys: inputs ? Object.keys(inputs) : [],
    },
  });
}

/**
 * Performance monitoring integration
 */
export function trackPerformanceIssue(
  metric: string,
  value: number,
  threshold: number,
): void {
  if (value > threshold) {
    errorTracker.captureMessage(
      `Performance threshold exceeded: ${metric}`,
      "warning",
      {
        component: "performance",
        action: "monitor",
        metadata: {
          metric,
          value,
          threshold,
          exceedBy: value - threshold,
        },
      },
    );
  }
}

/**
 * User action tracking
 */
export function trackUserAction(
  action: string,
  userId?: string,
  metadata?: Record<string, any>,
): void {
  errorTracker.addBreadcrumb({
    category: "user",
    message: `User action: ${action}`,
    level: "info",
    data: {
      action,
      userId,
      ...metadata,
    },
  });
}

/**
 * Navigation tracking
 */
export function trackNavigation(
  from: string,
  to: string,
  userId?: string,
): void {
  errorTracker.addBreadcrumb({
    category: "navigation",
    message: `Navigation: ${from} → ${to}`,
    level: "info",
    data: {
      from,
      to,
      userId,
    },
  });
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      errorTracker.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: "global",
          action: "unhandled_rejection",
        },
      );
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      errorTracker.captureError(event.error || new Error(event.message), {
        component: "global",
        action: "global_error",
        url: event.filename,
        metadata: {
          line: event.lineno,
          column: event.colno,
        },
      });
    });
  }

  // Handle Node.js unhandled rejections
  if (typeof process !== "undefined") {
    process.on("unhandledRejection", (reason, promise) => {
      errorTracker.captureError(
        reason instanceof Error ? reason : new Error(String(reason)),
        {
          component: "global",
          action: "unhandled_rejection",
        },
      );
    });

    process.on("uncaughtException", (error) => {
      errorTracker.captureError(error, {
        component: "global",
        action: "uncaught_exception",
      });
    });
  }
}
