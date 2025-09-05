"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "heloc-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Resolve the actual theme to apply
  const resolveTheme = useCallback(
    (currentTheme: Theme): "light" | "dark" => {
      if (currentTheme === "system") {
        return getSystemTheme();
      }
      return currentTheme;
    },
    [getSystemTheme],
  );

  // Apply theme to document
  const applyTheme = (resolvedTheme: "light" | "dark") => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");
    root.removeAttribute("data-theme");

    // Apply new theme
    root.classList.add(resolvedTheme);
    root.setAttribute("data-theme", resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#1e293b" : "#ffffff",
      );
    }
  };

  // Set theme and persist to storage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn("Failed to save theme preference:", error);
      }
    }
  };

  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const currentResolved = resolveTheme(theme);
    setTheme(currentResolved === "light" ? "dark" : "light");
  };

  // Initialize theme from storage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.warn("Failed to load theme preference:", error);
    }
  }, [storageKey]);

  // Update resolved theme when theme changes or system preference changes
  useEffect(() => {
    const newResolvedTheme = resolveTheme(theme);
    setResolvedTheme(newResolvedTheme);
    applyTheme(newResolvedTheme);
  }, [theme, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const newResolvedTheme = getSystemTheme();
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Prevent flash of wrong theme on initial load
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply theme immediately on mount to prevent flash
    const initialResolvedTheme = resolveTheme(theme);
    applyTheme(initialResolvedTheme);
  }, [resolveTheme, theme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for getting theme-aware colors
export function useThemeColors() {
  const { resolvedTheme } = useTheme();

  return {
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",

    // Helper function to get CSS custom property value
    getCSSVar: (property: string) => {
      if (typeof window === "undefined") return "";
      return getComputedStyle(document.documentElement)
        .getPropertyValue(property)
        .trim();
    },

    // Common color getters
    getPrimaryColor: () => {
      if (typeof window === "undefined") return "59 130 246";
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim();
    },

    getBackgroundColor: () => {
      if (typeof window === "undefined") return "255 255 255";
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
        .trim();
    },

    getForegroundColor: () => {
      if (typeof window === "undefined") return "15 23 42";
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--color-foreground")
        .trim();
    },
  };
}

// Utility function to create theme-aware RGB color strings
export function createThemeColor(colorVar: string, opacity?: number): string {
  const opacityStr = opacity !== undefined ? ` / ${opacity}` : "";
  return `rgb(var(--color-${colorVar})${opacityStr})`;
}

// Utility function for conditional theme classes
export function themeClass(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}
