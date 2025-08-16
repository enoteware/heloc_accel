"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect debug flag in URL parameters
 * Supports multiple debug flags: ?debug=true, ?debug=1, ?dev=true, etc.
 */
export function useDebugFlag(): boolean {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkDebugFlag = () => {
      const urlParams = new URLSearchParams(window.location.search);

      // Check for various debug flags
      const debugFlags = ["debug", "dev", "development", "verbose", "trace"];

      const hasDebugFlag = debugFlags.some((flag) => {
        const value = urlParams.get(flag);
        // Consider true if: ?debug=true, ?debug=1, ?debug (no value), etc.
        return (
          value === "true" || value === "1" || value === "" || value === "on"
        );
      });

      setIsDebugMode(hasDebugFlag);
    };

    // Check on mount
    checkDebugFlag();

    // Listen for URL changes (for SPAs)
    const handlePopState = () => {
      checkDebugFlag();
    };

    window.addEventListener("popstate", handlePopState);

    // Also listen for pushstate/replacestate (for programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setTimeout(checkDebugFlag, 0);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(checkDebugFlag, 0);
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return isDebugMode;
}

/**
 * Utility function to add debug flag to current URL
 */
export function addDebugFlag(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("debug", "true");
  window.history.replaceState({}, "", url.toString());
}

/**
 * Utility function to remove debug flag from current URL
 */
export function removeDebugFlag(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const debugFlags = ["debug", "dev", "development", "verbose", "trace"];

  debugFlags.forEach((flag) => {
    url.searchParams.delete(flag);
  });

  window.history.replaceState({}, "", url.toString());
}
