import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const badgeVariants = {
  default: "safe-badge-neutral",
  primary: "safe-badge-primary",
  secondary: "safe-badge-secondary",
  success: "safe-badge-success",
  warning: "safe-badge-warning",
  danger: "safe-badge-danger",
  info: "safe-badge-neutral",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-body-sm",
  lg: "px-3 py-1.5 text-body",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          badgeVariants[variant],
          badgeSizes[size],
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";
