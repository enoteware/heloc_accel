/**
 * Comprehensive logging system for the HELOC Accelerator application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  apiKey?: string;
}

class Logger {
  private config: LoggerConfig;
  private requestId: string | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const levelName = LogLevel[level];

    let formatted = `[${timestamp}] ${levelName}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }

    if (error) {
      formatted += ` | Error: ${error.name}: ${error.message}`;
      if (error.stack) {
        formatted += `\nStack: ${error.stack}`;
      }
    }

    return formatted;
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey || ""}`,
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error("Failed to send log to remote endpoint:", error);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId: this.requestId || undefined,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.formatLogEntry(entry);

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted);
          break;
      }
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.sendToRemote(entry).catch(() => {
        // Silent fail for remote logging
      });
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Structured logging methods
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ): void {
    this.info("HTTP Request", {
      method,
      url,
      statusCode,
      duration,
      userId,
    });
  }

  logAuthentication(
    event: "login" | "logout" | "register" | "failed_login",
    userId?: string,
    ip?: string,
  ): void {
    this.info(`Authentication: ${event}`, {
      event,
      userId,
      ip,
    });
  }

  logCalculation(
    userId: string,
    calculationType: string,
    duration: number,
  ): void {
    this.info("Calculation performed", {
      userId,
      calculationType,
      duration,
    });
  }

  logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high",
    details: Record<string, any>,
  ): void {
    const level =
      severity === "high"
        ? LogLevel.ERROR
        : severity === "medium"
          ? LogLevel.WARN
          : LogLevel.INFO;

    this.log(level, `Security Event: ${event}`, {
      severity,
      ...details,
    });
  }

  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    this.info("Performance metric", {
      operation,
      duration,
      ...metadata,
    });
  }

  logDatabaseQuery(query: string, duration: number, rowCount?: number): void {
    this.debug("Database query", {
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
      rowCount,
    });
  }

  logError(error: Error, context?: Record<string, any>): void {
    this.error("Unhandled error", error, context);
  }
}

// Create logger instances for different environments
const createLogger = (): Logger => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  const config: LoggerConfig = {
    level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
    enableConsole: true,
    enableFile: false, // Could be implemented with file system writes
    enableRemote: isProduction,
    remoteEndpoint: process.env.LOG_ENDPOINT,
    apiKey: process.env.LOG_API_KEY,
  };

  return new Logger(config);
};

// Export singleton logger instance
export const logger = createLogger();

// Request logging middleware helper
export function createRequestLogger() {
  return {
    start: (requestId: string) => {
      logger.setRequestId(requestId);
      return Date.now();
    },

    end: (
      startTime: number,
      method: string,
      url: string,
      statusCode: number,
      userId?: string,
    ) => {
      const duration = Date.now() - startTime;
      logger.logRequest(method, url, statusCode, duration, userId);
    },
  };
}

// Error boundary logger
export function logErrorBoundary(error: Error, errorInfo: any): void {
  logger.error("React Error Boundary", error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(operation: string): void {
    this.measurements.set(operation, Date.now());
  }

  static end(operation: string, metadata?: Record<string, any>): void {
    const startTime = this.measurements.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.logPerformance(operation, duration, metadata);
      this.measurements.delete(operation);
    }
  }

  static measure<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>,
  ): T {
    const startTime = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - startTime;
      logger.logPerformance(operation, duration, metadata);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(operation, duration, { ...metadata, error: true });
      throw error;
    }
  }

  static async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      logger.logPerformance(operation, duration, metadata);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(operation, duration, { ...metadata, error: true });
      throw error;
    }
  }
}

// Application metrics
export class MetricsCollector {
  private static counters: Map<string, number> = new Map();
  private static gauges: Map<string, number> = new Map();

  static incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  static setGauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }

  static getMetrics(): Record<string, any> {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      timestamp: new Date().toISOString(),
    };
  }

  static logMetrics(): void {
    const metrics = this.getMetrics();
    logger.info("Application metrics", metrics);
  }
}

// Health check logging
export function logHealthCheck(
  service: string,
  status: "healthy" | "unhealthy",
  details?: Record<string, any>,
): void {
  if (status === "healthy") {
    logger.info(`Health check: ${service} is ${status}`, details);
  } else {
    logger.error(`Health check: ${service} is ${status}`, undefined, details);
  }
}
