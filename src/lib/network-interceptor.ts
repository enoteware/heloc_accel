import { logInfo, logError, logDebug } from "@/lib/debug-logger";

interface NetworkLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

class NetworkInterceptor {
  private logs: NetworkLog[] = [];
  private maxLogs = 100;
  private isActive = false;
  private originalFetch?: typeof fetch;

  constructor() {
    if (typeof window !== "undefined") {
      this.install();
    }
  }

  private install() {
    if (this.isActive) return;

    this.originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      const requestId = Math.random().toString(36).substring(7);
      const startTime = Date.now();
      const url = input instanceof Request ? input.url : input.toString();
      const method =
        init?.method || (input instanceof Request ? input.method : "GET");

      // Log request
      const requestLog: NetworkLog = {
        id: requestId,
        timestamp: new Date().toISOString(),
        method,
        url,
        requestHeaders: init?.headers as Record<string, string>,
      };

      if (init?.body) {
        try {
          requestLog.requestBody =
            typeof init.body === "string" ? JSON.parse(init.body) : init.body;
        } catch {
          requestLog.requestBody = init.body;
        }
      }

      self.addLog(requestLog);
      logDebug("Network", `${method} ${url}`, {
        requestId,
        body: requestLog.requestBody,
      });

      try {
        const response = await self.originalFetch!.apply(window, [input, init]);
        const duration = Date.now() - startTime;

        // Clone response to read body
        const clonedResponse = response.clone();

        // Update log with response
        requestLog.status = response.status;
        requestLog.duration = duration;
        requestLog.responseHeaders = Object.fromEntries(
          response.headers.entries(),
        );

        // Try to parse response body
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            requestLog.responseBody = await clonedResponse.json();
          } else if (contentType?.includes("text")) {
            requestLog.responseBody = await clonedResponse.text();
          }
        } catch (error) {
          logError("Network", "Failed to parse response body", error);
        }

        self.updateLog(requestId, requestLog);

        logInfo(
          "Network",
          `${method} ${url} - ${response.status} (${duration}ms)`,
          {
            requestId,
            status: response.status,
            duration,
          },
        );

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        requestLog.duration = duration;
        requestLog.error =
          error instanceof Error ? error.message : String(error);

        self.updateLog(requestId, requestLog);

        logError("Network", `${method} ${url} - Failed (${duration}ms)`, {
          requestId,
          error: requestLog.error,
        });

        throw error;
      }
    };

    this.isActive = true;
  }

  private addLog(log: NetworkLog) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  private updateLog(id: string, updates: Partial<NetworkLog>) {
    const index = this.logs.findIndex((log) => log.id === id);
    if (index !== -1) {
      this.logs[index] = { ...this.logs[index], ...updates };
    }
  }

  public getLogs(filter?: {
    method?: string;
    status?: number;
    url?: string;
  }): NetworkLog[] {
    if (!filter) return this.logs;

    return this.logs.filter((log) => {
      if (filter.method && log.method !== filter.method) return false;
      if (filter.status && log.status !== filter.status) return false;
      if (filter.url && !log.url.includes(filter.url)) return false;
      return true;
    });
  }

  public clearLogs() {
    this.logs = [];
  }

  public uninstall() {
    if (!this.isActive || !this.originalFetch) return;

    window.fetch = this.originalFetch;
    this.isActive = false;
  }
}

// Export singleton instance
export const networkInterceptor = new NetworkInterceptor();

// Export types
export type { NetworkLog };
