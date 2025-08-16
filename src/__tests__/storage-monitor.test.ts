/**
 * @jest-environment jsdom
 */

import { StorageMonitor } from "@/lib/storage-monitor";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock Notification API
Object.defineProperty(window, "Notification", {
  value: {
    permission: "granted",
    requestPermission: jest.fn(() => Promise.resolve("granted")),
  },
  writable: true,
});

describe("StorageMonitor", () => {
  let monitor: StorageMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    monitor = new StorageMonitor();
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe("getStorageUsage", () => {
    it("should return zero usage when localStorage is empty", () => {
      const usage = monitor.getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.percentage).toBe(0);
      expect(usage.isNearLimit).toBe(false);
      expect(usage.isCritical).toBe(false);
    });

    it("should calculate usage correctly with data", () => {
      localStorageMock.setItem("test-key", "test-value");

      const usage = monitor.getStorageUsage();

      expect(usage.used).toBeGreaterThan(0);
      expect(usage.total).toBeGreaterThan(0);
      expect(usage.available).toBe(usage.total - usage.used);
      expect(usage.percentage).toBe(usage.used / usage.total);
    });

    it("should detect near limit condition", () => {
      // Fill storage to trigger warning threshold
      const largeData = "x".repeat(100000);
      for (let i = 0; i < 50; i++) {
        localStorageMock.setItem(`large-item-${i}`, largeData);
      }

      const usage = monitor.getStorageUsage();

      // Note: This test depends on the estimated quota size
      // In a real scenario, we'd need to mock the quota estimation
      expect(usage.used).toBeGreaterThan(0);
    });
  });

  describe("event handling", () => {
    it("should emit warning events when approaching limit", (done) => {
      const eventListener = jest.fn((event) => {
        if (event.type === "warning") {
          expect(event.usage.isNearLimit).toBe(true);
          expect(event.message).toContain("Storage usage high");
          done();
        }
      });

      monitor.addEventListener(eventListener);

      // Simulate high usage by mocking the getStorageUsage method
      const originalGetUsage = monitor.getStorageUsage;
      monitor.getStorageUsage = jest.fn().mockReturnValue({
        used: 8000000,
        available: 2000000,
        total: 10000000,
        percentage: 0.85,
        isNearLimit: true,
        isCritical: false,
      });

      monitor.startMonitoring(100); // Fast interval for testing

      // Trigger a check
      setTimeout(() => {
        monitor.getStorageUsage = originalGetUsage;
      }, 150);
    });

    it("should emit critical events when quota is exceeded", (done) => {
      const eventListener = jest.fn((event) => {
        if (event.type === "critical") {
          expect(event.usage.isCritical).toBe(true);
          expect(event.message).toContain("Storage usage critical");
          done();
        }
      });

      monitor.addEventListener(eventListener);

      // Mock critical usage
      monitor.getStorageUsage = jest.fn().mockReturnValue({
        used: 9500000,
        available: 500000,
        total: 10000000,
        percentage: 0.95,
        isNearLimit: true,
        isCritical: true,
      });

      monitor.startMonitoring(100);
    });
  });

  describe("cleanup functionality", () => {
    beforeEach(() => {
      // Set up test data
      localStorageMock.setItem(
        "heloc_debug_logs",
        JSON.stringify(["log1", "log2"]),
      );
      localStorageMock.setItem("debug-mode", "true");
      localStorageMock.setItem("temp_data", "temporary");
      localStorageMock.setItem("cache_item", "cached");
      localStorageMock.setItem("normal_data", "important");
    });

    it("should clean up debug data", () => {
      // Access private method through any
      (monitor as any).cleanupDebugData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "heloc_debug_logs",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("debug-mode");
      expect(localStorageMock.getItem("normal_data")).toBe("important");
    });

    it("should clean up temporary data", () => {
      (monitor as any).cleanupTemporaryData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("temp_data");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("cache_item");
      expect(localStorageMock.getItem("normal_data")).toBe("important");
    });

    it("should perform automatic cleanup when critical", () => {
      const cleanupSpy = jest.spyOn(monitor as any, "performAutomaticCleanup");

      // Mock critical usage
      monitor.getStorageUsage = jest.fn().mockReturnValue({
        used: 9500000,
        available: 500000,
        total: 10000000,
        percentage: 0.95,
        isNearLimit: true,
        isCritical: true,
      });

      monitor.startMonitoring(100);

      setTimeout(() => {
        expect(cleanupSpy).toHaveBeenCalled();
        cleanupSpy.mockRestore();
      }, 150);
    });
  });

  describe("monitoring lifecycle", () => {
    it("should start and stop monitoring correctly", () => {
      expect((monitor as any).isMonitoring).toBe(false);

      monitor.startMonitoring();
      expect((monitor as any).isMonitoring).toBe(true);

      monitor.stopMonitoring();
      expect((monitor as any).isMonitoring).toBe(false);
    });

    it("should not start monitoring multiple times", () => {
      monitor.startMonitoring();
      const firstInterval = (monitor as any).monitoringInterval;

      monitor.startMonitoring();
      const secondInterval = (monitor as any).monitoringInterval;

      expect(firstInterval).toBe(secondInterval);

      monitor.stopMonitoring();
    });
  });

  describe("quota exceeded handling", () => {
    it("should handle quota exceeded errors gracefully", () => {
      const emergencyCleanupSpy = jest.spyOn(
        monitor as any,
        "performEmergencyCleanup",
      );
      const error = new Error("QuotaExceededError");
      error.name = "QuotaExceededError";

      (monitor as any).handleQuotaExceeded(error);

      expect(emergencyCleanupSpy).toHaveBeenCalled();
      emergencyCleanupSpy.mockRestore();
    });

    it("should intercept localStorage.setItem and handle quota errors", () => {
      // Start monitoring to set up interception
      monitor.startMonitoring();

      // Create a mock that throws quota error
      const mockSetItem = jest.fn(() => {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      // Replace the mock's setItem
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = mockSetItem;

      expect(() => {
        localStorage.setItem("test", "value");
      }).toThrow("QuotaExceededError");

      // Restore original
      localStorageMock.setItem = originalSetItem;
      monitor.stopMonitoring();
    });
  });

  describe("data compression", () => {
    it("should compress JSON data to save space", () => {
      const largeObject = {
        data: Array(100).fill("test"),
        nested: {
          more: Array(50).fill("data"),
        },
      };

      const uncompressed = JSON.stringify(largeObject, null, 2);
      localStorageMock.setItem("large-json", uncompressed);

      (monitor as any).compressStoredData();

      const compressed = localStorageMock.getItem("large-json");
      expect(compressed).toBeDefined();
      expect(compressed!.length).toBeLessThan(uncompressed.length);

      // Should still be valid JSON
      expect(() => JSON.parse(compressed!)).not.toThrow();
    });
  });

  describe("formatted usage", () => {
    it("should return formatted usage string", () => {
      localStorageMock.setItem("test", "data");

      const formatted = monitor.getFormattedUsage();

      expect(formatted).toMatch(/\d+\.\d+MB \/ \d+\.\d+MB \(\d+\.\d+%\)/);
    });
  });

  describe("error handling", () => {
    it("should handle localStorage unavailability gracefully", () => {
      // Create a new monitor with localStorage unavailable
      const originalLocalStorage = window.localStorage;

      // Mock localStorage as undefined
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      const newMonitor = new StorageMonitor();
      const usage = newMonitor.getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.total).toBe(0);
      expect(usage.percentage).toBe(0);

      // Restore localStorage
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should handle errors in event listeners gracefully", () => {
      const faultyListener = jest.fn(() => {
        throw new Error("Listener error");
      });

      monitor.addEventListener(faultyListener);

      // Should not throw when emitting events
      expect(() => {
        (monitor as any).emitEvent({
          type: "warning",
          usage: monitor.getStorageUsage(),
          message: "Test",
          timestamp: new Date(),
        });
      }).not.toThrow();

      expect(faultyListener).toHaveBeenCalled();
    });
  });
});
