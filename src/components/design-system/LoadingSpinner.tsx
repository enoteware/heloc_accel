import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "bounce";
  className?: string;
  color?: "primary" | "secondary" | "white" | "current";
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  white: "text-white",
  current: "text-current",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  className,
  color = "current",
}) => {
  const baseClasses = cn(
    "animate-spin",
    sizeClasses[size],
    colorClasses[color],
    className,
  );

  if (variant === "default") {
    return (
      <svg
        className={baseClasses}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        <div
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses[size],
            colorClasses[color] === "text-current"
              ? "bg-current"
              : `bg-${color}`,
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses[size],
            colorClasses[color] === "text-current"
              ? "bg-current"
              : `bg-${color}`,
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses[size],
            colorClasses[color] === "text-current"
              ? "bg-current"
              : `bg-${color}`,
          )}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color] === "text-current" ? "bg-current" : `bg-${color}`,
          className,
        )}
      />
    );
  }

  if (variant === "bounce") {
    return (
      <div
        className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color] === "text-current" ? "bg-current" : `bg-${color}`,
          className,
        )}
      />
    );
  }

  return null;
};

export default LoadingSpinner;
