"use client";

import React, { useState } from "react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { Button } from "@/components/design-system/Button";
import { Icon } from "@/components/Icons";

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "switch";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = "button",
  size = "md",
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "switch") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabel && (
          <span className="text-sm text-foreground-secondary">Theme</span>
        )}
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          role="switch"
          aria-checked={theme === "dark"}
          aria-label="Toggle theme"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
              theme === "dark" ? "translate-x-6" : "translate-x-1"
            }`}
          />
          <Icon
            name={theme === "dark" ? "moon" : "sun"}
            size="xs"
            className={`absolute text-primary-foreground ${
              theme === "dark" ? "left-1.5" : "right-1.5"
            }`}
          />
        </button>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Icon
            name={
              theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"
            }
            size="sm"
          />
          {showLabel && (
            <span className="capitalize">
              {theme === "system" ? "Auto" : theme}
            </span>
          )}
          <Icon name="chevron-down" size="xs" />
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-lg border border-border bg-surface shadow-lg">
              <div className="py-1">
                {(["light", "dark", "system"] as Theme[]).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => {
                      setTheme(themeOption);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2 px-3 py-2 text-sm transition-colors hover:bg-surface-hover ${
                      theme === themeOption
                        ? "bg-surface-active text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <Icon
                      name={
                        themeOption === "dark"
                          ? "moon"
                          : themeOption === "light"
                            ? "sun"
                            : "monitor"
                      }
                      size="sm"
                    />
                    <span className="capitalize">
                      {themeOption === "system" ? "Auto" : themeOption}
                    </span>
                    {theme === themeOption && (
                      <Icon name="check" size="xs" className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={`flex items-center space-x-2 ${className}`}
      aria-label="Toggle theme"
    >
      <Icon
        name={theme === "dark" ? "moon" : "sun"}
        size="sm"
        className="transition-transform duration-200"
      />
      {showLabel && (
        <span className="capitalize">
          {theme === "system" ? "Auto" : theme}
        </span>
      )}
    </Button>
  );
}

// Compact theme toggle for navigation bars
export function CompactThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-md p-2 text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${className}`}
      aria-label="Toggle theme"
    >
      <Icon
        name={theme === "dark" ? "moon" : "sun"}
        size="sm"
        className="transition-transform duration-200"
      />
    </button>
  );
}

// Theme status indicator (useful for debugging)
export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-surface border border-border p-2 text-xs text-foreground-secondary shadow-lg">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
    </div>
  );
}

export default ThemeToggle;
