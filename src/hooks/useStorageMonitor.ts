/**
 * React hook for storage monitoring integration
 */

import { useState, useEffect, useCallback } from "react";
import {
  storageMonitor,
  StorageUsage,
  StorageEvent,
} from "@/lib/storage-monitor";

export interface UseStorageMonitorReturn {
  usage: StorageUsage;
  isMonitoring: boolean;
  events: StorageEvent[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearEvents: () => void;
  getFormattedUsage: () => string;
}

export function useStorageMonitor(): UseStorageMonitorReturn {
  const [usage, setUsage] = useState<StorageUsage>(() =>
    storageMonitor.getStorageUsage(),
  );
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [events, setEvents] = useState<StorageEvent[]>([]);

  // Handle storage events
  const handleStorageEvent = useCallback((event: StorageEvent) => {
    setUsage(event.usage);
    setEvents((prev) => [...prev.slice(-9), event]); // Keep last 10 events

    // Show user notifications for critical events
    if (event.type === "critical" || event.type === "error") {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Storage Warning", {
          body: event.message,
          icon: "/favicon.ico",
        });
      }
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (typeof window === "undefined") return;

    storageMonitor.addEventListener(handleStorageEvent);
    storageMonitor.startMonitoring();
    setIsMonitoring(true);

    // Initial usage update
    setUsage(storageMonitor.getStorageUsage());
  }, [handleStorageEvent]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    storageMonitor.removeEventListener(handleStorageEvent);
    storageMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, [handleStorageEvent]);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Get formatted usage
  const getFormattedUsage = useCallback(() => {
    return storageMonitor.getFormattedUsage();
  }, []);

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return {
    usage,
    isMonitoring,
    events,
    startMonitoring,
    stopMonitoring,
    clearEvents,
    getFormattedUsage,
  };
}
