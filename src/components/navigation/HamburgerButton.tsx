"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  className,
  "aria-label": ariaLabel = "Toggle navigation menu",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center p-2 rounded-lg",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted",
        "transition-all duration-200",
        // Ensure minimum 44px touch target
        "min-h-[44px] min-w-[44px]",
        className,
      )}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <span className="sr-only">{ariaLabel}</span>

      {/* Hamburger icon with animated transformation */}
      <div className="relative w-6 h-6">
        {/* Top line */}
        <span
          className={cn(
            "absolute left-0 top-1 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
            isOpen ? "rotate-45 translate-y-2" : "rotate-0 translate-y-0",
          )}
        />

        {/* Middle line */}
        <span
          className={cn(
            "absolute left-0 top-2.5 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
            isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100",
          )}
        />

        {/* Bottom line */}
        <span
          className={cn(
            "absolute left-0 top-4 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
            isOpen ? "-rotate-45 -translate-y-2" : "rotate-0 translate-y-0",
          )}
        />
      </div>
    </button>
  );
};

export default HamburgerButton;
