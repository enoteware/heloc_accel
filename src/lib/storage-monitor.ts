/**
 * Storage Quota Monitoring System
 *
 * Prevents QuotaExceededError cascades by monitoring localStorage usage
 * and implementing intelligent cleanup strategies.
 */

export interface StorageUsage {
  used: number;
  available: number;
  total: number;
  percentage: number;
  isNearLimit: boolean;
  isCritical: boolean;
}

export interface StorageEvent {
  type: "warning" | "critical" | "cleanup" | "error";
  usage: StorageUsage;
  message: string;
  timestamp: Date;
}

export type StorageEventListener = (event: StorageEvent) => void;

class StorageMonitor {
  private readonly WARNING_THRESHOLD = 0.8; // 80%
  private readonly CRITICAL_THRESHOLD = 0.9; // 90%
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB default estimate

  private listeners: StorageEventListener[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastUsage: StorageUsage | null = null;

  constructor() {
    // Don't auto-start monitoring in constructor to allow for proper testing setup
  }

  /**
   * Get current storage usage information
   */
  getStorageUsage(): StorageUsage {
    if (typeof window === "undefined" || !window.localStorage) {
      return {
        used: 0,
        available: 0,
        total: 0,
        percentage: 0,
        isNearLimit: false,
        isCritical: false,
      };
    }

    try {
      // Calculate used storage by measuring all localStorage data
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          used += key.length + value.length;
        }
      }

      // Estimate total available storage
      const total = this.estimateStorageQuota();
      const available = Math.max(0, total - used);
      const percentage = total > 0 ? used / total : 0;

      const usage: StorageUsage = {
        used,
        available,
        total,
        percentage,
        isNearLimit: percentage >= this.WARNING_THRESHOLD,
        isCritical: percentage >= this.CRITICAL_THRESHOLD,
      };

      return usage;
    } catch (error) {
      console.error("Error calculating storage usage:", error);
      return {
        used: 0,
        available: 0,
        total: 0,
        percentage: 0,
        isNearLimit: false,
        isCritical: false,
      };
    }
  }

  /**
   * Estimate localStorage quota using binary search
   */
  private estimateStorageQuota(): number {
    if (typeof window === "undefined" || !window.localStorage) {
      return 0;
    }

    try {
      // Try to use the Storage API if available
      if ("storage" in navigator && "estimate" in navigator.storage) {
        navigator.storage
          .estimate()
          .then((estimate) => {
            if (estimate.quota) {
              return estimate.quota;
            }
          })
          .catch(() => {
            // Fallback to binary search
          });
      }

      // Fallback: Use binary search to estimate quota
      const testKey = "__storage_quota_test__";
      let low = 0;
      let high = 50 * 1024 * 1024; // Start with 50MB
      let maxSize = this.MAX_STORAGE_SIZE;

      try {
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const testData = "x".repeat(mid);

          try {
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            maxSize = mid;
            low = mid + 1;
          } catch (e) {
            high = mid - 1;
          }
        }
      } catch (error) {
        // If we can't test, use default
      }

      return maxSize;
    } catch (error) {
      return this.MAX_STORAGE_SIZE;
    }
  }

  /**
   * Start monitoring storage usage
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring || typeof window === "undefined") {
      return;
    }

    this.isMonitoring = true;

    // Initial check
    this.checkUsage();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkUsage();
    }, intervalMs);

    // Monitor storage events
    this.setupStorageEventListeners();
  }

  /**
   * Stop monitoring storage usage
   */
  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check current usage and emit events if needed
   */
  private checkUsage(): void {
    const usage = this.getStorageUsage();

    // Only emit events if usage has changed significantly
    if (
      this.lastUsage &&
      Math.abs(usage.percentage - this.lastUsage.percentage) < 0.01
    ) {
      return;
    }

    this.lastUsage = usage;

    if (usage.isCritical) {
      this.emitEvent({
        type: "critical",
        usage,
        message: `Storage usage critical: ${(usage.percentage * 100).toFixed(1)}%. Automatic cleanup will be triggered.`,
        timestamp: new Date(),
      });

      // Trigger automatic cleanup
      this.performAutomaticCleanup();
    } else if (usage.isNearLimit) {
      this.emitEvent({
        type: "warning",
        usage,
        message: `Storage usage high: ${(usage.percentage * 100).toFixed(1)}%. Consider clearing old data.`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Set up storage event listeners
   */
  private setupStorageEventListeners(): void {
    if (typeof window === "undefined" || !window.localStorage) return;

    // Listen for storage events from other tabs
    window.addEventListener("storage", () => {
      this.checkUsage();
    });

    // Intercept localStorage.setItem to monitor writes (only if not already intercepted)
    if (!localStorage.setItem.toString().includes("originalSetItem")) {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = (key: string, value: string) => {
        try {
          originalSetItem.call(localStorage, key, value);
          // Check usage after successful write
          setTimeout(() => this.checkUsage(), 0);
        } catch (error) {
          if (error instanceof Error && error.name === "QuotaExceededError") {
            this.handleQuotaExceeded(error);
          }
          throw error;
        }
      };
    }
  }

  /**
   * Handle quota exceeded errors
   */
  private handleQuotaExceeded(error: Error): void {
    const usage = this.getStorageUsage();

    this.emitEvent({
      type: "error",
      usage,
      message: "Storage quota exceeded. Attempting cleanup...",
      timestamp: new Date(),
    });

    // Attempt emergency cleanup
    this.performEmergencyCleanup();
  }

  /**
   * Perform automatic cleanup when approaching limits
   */
  private performAutomaticCleanup(): void {
    if (typeof window === "undefined") return;

    try {
      // Remove debug logs first
      this.cleanupDebugData();

      // Remove old temporary data
      this.cleanupTemporaryData();

      // Compress remaining data if possible
      this.compressStoredData();

      const usage = this.getStorageUsage();
      this.emitEvent({
        type: "cleanup",
        usage,
        message: `Automatic cleanup completed. Storage usage now: ${(usage.percentage * 100).toFixed(1)}%`,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error during automatic cleanup:", error);
    }
  }

  /**
   * Perform emergency cleanup when quota is exceeded
   */
  private performEmergencyCleanup(): void {
    if (typeof window === "undefined") return;

    try {
      // More aggressive cleanup
      this.cleanupDebugData();
      this.cleanupTemporaryData();
      this.cleanupOldScenarios();

      const usage = this.getStorageUsage();
      console.log(
        `Emergency cleanup completed. Storage usage: ${(usage.percentage * 100).toFixed(1)}%`,
      );
    } catch (error) {
      console.error("Error during emergency cleanup:", error);
    }
  }

  /**
   * Clean up debug and logging data
   */
  private cleanupDebugData(): void {
    const debugKeys = [
      "heloc_debug_logs",
      "debug-mode",
      "__localStorage_test__",
      "heloc_session_id",
    ];

    debugKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
  }

  /**
   * Clean up temporary data
   */
  private cleanupTemporaryData(): void {
    const tempKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("temp_") ||
          key.includes("cache_") ||
          key.includes("_tmp"))
      ) {
        tempKeys.push(key);
      }
    }

    tempKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
  }

  /**
   * Clean up old scenarios (keep only recent ones)
   */
  private cleanupOldScenarios(): void {
    // This would be implemented based on the actual scenario storage structure
    // For now, we'll implement a generic cleanup for large data items

    const largeItems: Array<{ key: string; size: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        const size = key.length + value.length;

        if (size > 10000) {
          // Items larger than 10KB
          largeItems.push({ key, size });
        }
      }
    }

    // Sort by size and remove largest items first
    largeItems.sort((a, b) => b.size - a.size);

    // Remove up to 50% of large items
    const itemsToRemove = Math.ceil(largeItems.length * 0.5);
    for (let i = 0; i < itemsToRemove; i++) {
      try {
        localStorage.removeItem(largeItems[i].key);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }

  /**
   * Compress stored data using simple JSON compression
   */
  private compressStoredData(): void {
    // Simple compression by removing unnecessary whitespace from JSON data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value && value.length > 1000) {
            // Try to parse and re-stringify to remove whitespace
            const parsed = JSON.parse(value);
            const compressed = JSON.stringify(parsed);

            if (compressed.length < value.length) {
              localStorage.setItem(key, compressed);
            }
          }
        } catch (error) {
          // Not JSON data, skip compression
        }
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: StorageEventListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: StorageEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Emit storage event to all listeners
   */
  private emitEvent(event: StorageEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in storage event listener:", error);
      }
    });
  }

  /**
   * Get formatted storage usage for display
   */
  getFormattedUsage(): string {
    const usage = this.getStorageUsage();
    const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
    const totalMB = (usage.total / (1024 * 1024)).toFixed(2);
    const percentage = (usage.percentage * 100).toFixed(1);

    return `${usedMB}MB / ${totalMB}MB (${percentage}%)`;
  }
}

// Export singleton instance
export const storageMonitor = new StorageMonitor();

// Auto-start monitoring for the singleton instance
if (typeof window !== "undefined") {
  storageMonitor.startMonitoring();
}

// Export class for testing
export { StorageMonitor };
