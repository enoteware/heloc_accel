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
  default: "bg-neutral-100 text-neutral-800 border-neutral-200",
  primary: "bg-primary-100 text-primary-800 border-primary-200",
  secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
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
