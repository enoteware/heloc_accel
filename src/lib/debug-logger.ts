// Debug Logger for HELOC Accelerator
// Stores debug logs in memory (server) and localStorage (client)

export interface DebugLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: string;
  message: string;
  data?: any;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private maxLogs = 1000;
  private isClient = typeof window !== "undefined";
  private storageKey = "heloc_debug_logs";

  constructor() {
    if (this.isClient) {
      this.loadFromStorage();
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    if (!this.isClient) return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load debug logs from storage:", error);
    }
  }

  private saveToStorage(): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.logs.slice(-this.maxLogs)),
      );
    } catch (error) {
      console.error("Failed to save debug logs to storage:", error);
    }
  }

  log(
    level: DebugLog["level"],
    category: string,
    message: string,
    data?: any,
  ): void {
    const log: DebugLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      userId: this.isClient ? this.getUserId() : undefined,
      sessionId: this.isClient ? this.getSessionId() : undefined,
    };

    // Add stack trace for errors
    if (level === "error" && data instanceof Error) {
      log.stack = data.stack;
    }

    this.logs.push(log);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to storage on client
    if (this.isClient) {
      this.saveToStorage();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[consoleMethod](`[${category}] ${message}`, data);
    }
  }

  info(category: string, message: string, data?: any): void {
    this.log("info", category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log("warn", category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log("error", category, message, data);
  }

  debug(category: string, message: string, data?: any): void {
    this.log("debug", category, message, data);
  }

  getLogs(filters?: {
    level?: DebugLog["level"];
    category?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): DebugLog[] {
    let filteredLogs = [...this.logs];

    if (filters?.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }

    if (filters?.category) {
      filteredLogs = filteredLogs.filter(
        (log) => log.category === filters.category,
      );
    }

    if (filters?.startTime) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= filters.startTime!,
      );
    }

    if (filters?.endTime) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp <= filters.endTime!,
      );
    }

    // Sort by timestamp descending (newest first)
    filteredLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  clear(): void {
    this.logs = [];
    if (this.isClient) {
      localStorage.removeItem(this.storageKey);
    }
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private sanitizeData(data: any): any {
    try {
      // Remove sensitive data
      const sanitized = JSON.parse(JSON.stringify(data));
      this.removeSensitiveFields(sanitized);
      return sanitized;
    } catch (error) {
      return { error: "Failed to sanitize data", originalType: typeof data };
    }
  }

  private removeSensitiveFields(obj: any): void {
    if (!obj || typeof obj !== "object") return;

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "api_key",
      "authorization",
    ];

    for (const key in obj) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        obj[key] = "[REDACTED]";
      } else if (typeof obj[key] === "object") {
        this.removeSensitiveFields(obj[key]);
      }
    }
  }

  private getUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // Check for Stack Auth user
      const stackUser = (window as any).__STACK_USER__;
      if (stackUser?.id) return stackUser.id;

      // Check for user in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.email;
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private getSessionId(): string {
    // Get or create session ID
    const key = "heloc_session_id";
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Convenience functions
export const logInfo = (category: string, message: string, data?: any) =>
  debugLogger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) =>
  debugLogger.warn(category, message, data);

export const logError = (category: string, message: string, data?: any) =>
  debugLogger.error(category, message, data);

export const logDebug = (category: string, message: string, data?: any) =>
  debugLogger.debug(category, message, data);
