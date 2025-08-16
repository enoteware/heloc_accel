// Debug utilities for LTV and PMI calculations

export interface DebugLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: "ltv" | "pmi" | "validation" | "form" | "calculation";
  message: string;
  data?: any;
  stackTrace?: string;
}

export interface LTVDebugInfo {
  loanAmount: number | string | null | undefined;
  propertyValue: number | string | null | undefined;
  ltvRatio?: number;
  isMIPRequired?: boolean;
  suggestedMonthlyPMI?: number;
  calculationSteps: string[];
  errors?: string[];
  warnings?: string[];
}

export interface FormDebugInfo {
  formName: string;
  fieldName: string;
  fieldValue: any;
  validationErrors: string[];
  ltvInfo?: LTVDebugInfo;
  timestamp: string;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private maxLogs = 1000;
  private isEnabled = false;

  constructor() {
    // Enable debug mode in development or when explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true" ||
      (typeof window !== "undefined" &&
        window.localStorage?.getItem("debug-mode") === "true");
  }

  log(
    level: DebugLog["level"],
    category: DebugLog["category"],
    message: string,
    data?: any,
    error?: Error,
  ) {
    if (!this.isEnabled) return;

    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      stackTrace: error?.stack,
    };

    this.logs.push(log);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    this.outputToConsole(log);
  }

  private outputToConsole(log: DebugLog) {
    const prefix = `[${log.timestamp}] [${log.category.toUpperCase()}]`;
    const style = this.getConsoleStyle(log.level);

    // Format data for console output - avoid empty objects/strings that cause Next.js errors
    const formatData = (data: any) => {
      if (!data) return undefined;
      if (typeof data === "object" && Object.keys(data).length === 0)
        return undefined;
      if (typeof data === "string" && data.trim() === "") return undefined;
      return data;
    };

    const formattedData = formatData(log.data);
    const formattedStackTrace = formatData(log.stackTrace);

    if (typeof window !== "undefined" && window.console) {
      const args = [`${prefix} ${log.message}`];
      if (formattedData !== undefined) args.push(formattedData);
      if (formattedStackTrace !== undefined) args.push(formattedStackTrace);

      switch (log.level) {
        case "error":
          console.error(...args);
          break;
        case "warn":
          console.warn(...args);
          break;
        case "debug":
          console.debug(...args);
          break;
        default:
          console.log(...args);
      }
    }
  }

  private getConsoleStyle(level: DebugLog["level"]): string {
    switch (level) {
      case "error":
        return "color: red; font-weight: bold;";
      case "warn":
        return "color: orange; font-weight: bold;";
      case "debug":
        return "color: gray;";
      default:
        return "color: blue;";
    }
  }

  getLogs(
    category?: DebugLog["category"],
    level?: DebugLog["level"],
  ): DebugLog[] {
    let filteredLogs = this.logs;

    if (category) {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    return filteredLogs;
  }

  getFormattedLogs(category?: DebugLog["category"]): string {
    const logs = this.getLogs(category);
    return logs
      .map((log) => {
        const data = log.data
          ? `\nData: ${JSON.stringify(log.data, null, 2)}`
          : "";
        const stack = log.stackTrace ? `\nStack: ${log.stackTrace}` : "";
        return `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category.toUpperCase()}] ${log.message}${data}${stack}`;
      })
      .join("\n\n");
  }

  clear() {
    this.logs = [];
    if (typeof window !== "undefined" && window.console) {
      console.clear();
    }
  }

  enable() {
    this.isEnabled = true;
    if (typeof window !== "undefined") {
      window.localStorage?.setItem("debug-mode", "true");
    }
  }

  disable() {
    this.isEnabled = false;
    if (typeof window !== "undefined") {
      window.localStorage?.removeItem("debug-mode");
    }
  }

  isDebugEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const debugLogger = new DebugLogger();

// Utility functions for specific debugging scenarios
export function debugLTVCalculation(
  loanAmount: number | string | null | undefined,
  propertyValue: number | string | null | undefined,
  result?: any,
): LTVDebugInfo {
  const steps: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  steps.push(
    `Input: Loan Amount = ${loanAmount}, Property Value = ${propertyValue}`,
  );

  // Validate inputs
  if (loanAmount == null || propertyValue == null) {
    const missingFields = [];
    if (loanAmount == null) missingFields.push("loan amount");
    if (propertyValue == null) missingFields.push("property value");
    errors.push(
      `Missing required inputs: ${missingFields.join(" and ")} is null/undefined`,
    );
    steps.push("❌ Validation failed: Missing inputs");
  } else {
    const loan = Number(loanAmount);
    const value = Number(propertyValue);

    steps.push(`Converted: Loan = ${loan}, Value = ${value}`);

    if (isNaN(loan) || isNaN(value)) {
      errors.push("Invalid numeric inputs");
      steps.push("❌ Validation failed: Non-numeric inputs");
    } else if (loan < 0 || value <= 0) {
      errors.push(
        "Invalid values: loan amount negative or property value zero/negative",
      );
      steps.push("❌ Validation failed: Invalid values");
    } else {
      const ltvRatio = (loan / value) * 100;
      steps.push(
        `LTV Calculation: (${loan} / ${value}) * 100 = ${ltvRatio.toFixed(2)}%`,
      );

      if (ltvRatio > 200) {
        warnings.push(`Unusually high LTV ratio: ${ltvRatio.toFixed(2)}%`);
      }

      const debugInfo: LTVDebugInfo = {
        loanAmount,
        propertyValue,
        ltvRatio,
        isMIPRequired: ltvRatio > 80,
        calculationSteps: steps,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      // Calculate suggested PMI if required
      if (ltvRatio > 80) {
        let rate = 0;
        if (ltvRatio <= 85) rate = 0.005;
        else if (ltvRatio <= 90) rate = 0.0075;
        else if (ltvRatio <= 95) rate = 0.01;
        else rate = 0.0125;

        const suggestedMonthlyPMI = Math.round((loan * rate) / 12);
        debugInfo.suggestedMonthlyPMI = suggestedMonthlyPMI;

        steps.push(`PMI Required: LTV ${ltvRatio.toFixed(2)}% > 80%`);
        steps.push(`PMI Rate: ${(rate * 100).toFixed(2)}% annually`);
        steps.push(
          `Suggested Monthly PMI: $${loan} * ${rate} / 12 = $${suggestedMonthlyPMI}`,
        );
      } else {
        steps.push(`PMI Not Required: LTV ${ltvRatio.toFixed(2)}% ≤ 80%`);
      }

      debugLogger.log("debug", "ltv", "LTV calculation completed", debugInfo);
      return debugInfo;
    }
  }

  const debugInfo: LTVDebugInfo = {
    loanAmount,
    propertyValue,
    calculationSteps: steps,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };

  // Use warning level for missing inputs (expected on form load), error for other failures
  const logLevel =
    loanAmount == null || propertyValue == null ? "warn" : "error";
  const logMessage =
    loanAmount == null || propertyValue == null
      ? "LTV calculation failed: missing inputs"
      : "LTV calculation failed";

  debugLogger.log(logLevel, "ltv", logMessage, debugInfo);
  return debugInfo;
}

export function debugFormValidation(
  formName: string,
  fieldName: string,
  fieldValue: any,
  validationErrors: string[],
  ltvInfo?: LTVDebugInfo,
): FormDebugInfo {
  const debugInfo: FormDebugInfo = {
    formName,
    fieldName,
    fieldValue,
    validationErrors,
    ltvInfo,
    timestamp: new Date().toISOString(),
  };

  const level = validationErrors.length > 0 ? "warn" : "debug";
  debugLogger.log(
    level,
    "validation",
    `Form validation: ${formName}.${fieldName}`,
    debugInfo,
  );

  return debugInfo;
}

export function debugCalculationError(error: Error, context: any) {
  debugLogger.log(
    "error",
    "calculation",
    `Calculation error: ${error.message}`,
    context,
    error,
  );
}

// Copy-friendly debug output functions
export function copyDebugLogs(category?: DebugLog["category"]): string {
  const logs = debugLogger.getFormattedLogs(category);

  if (typeof window !== "undefined" && navigator.clipboard) {
    navigator.clipboard
      .writeText(logs)
      .then(() => {
        console.log("Debug logs copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy logs to clipboard:", err);
      });
  }

  return logs;
}

export function exportDebugData(): string {
  const data = {
    timestamp: new Date().toISOString(),
    logs: debugLogger.getLogs(),
    environment: {
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "N/A",
      url: typeof window !== "undefined" ? window.location.href : "N/A",
      nodeEnv: process.env.NODE_ENV,
    },
  };

  return JSON.stringify(data, null, 2);
}

// Global debug utilities for browser console
if (typeof window !== "undefined") {
  (window as any).debugHeloc = {
    enable: () => debugLogger.enable(),
    disable: () => debugLogger.disable(),
    clear: () => debugLogger.clear(),
    logs: (category?: string) => debugLogger.getLogs(category as any),
    copy: (category?: string) => copyDebugLogs(category as any),
    export: () => exportDebugData(),
  };
}
