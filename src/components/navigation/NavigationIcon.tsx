import React from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/Icons";

export interface NavigationIconProps {
  name: IconName;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?:
    | "default"
    | "muted"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

const iconSizes = {
  sm: "h-4 w-4", // 16px
  md: "h-5 w-5", // 20px
  lg: "h-6 w-6", // 24px
};

// Semantic color variants using Tailwind v4 CSS custom properties
const variantClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

export const NavigationIcon: React.FC<NavigationIconProps> = ({
  name,
  size = "md",
  variant = "default",
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = false,
  ...props
}) => {
  return (
    <Icon
      name={name}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
      className={cn(
        iconSizes[size],
        variantClasses[variant],
        "transition-colors duration-200", // Smooth transitions for light/dark mode
        className,
      )}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
};

export default NavigationIcon;
