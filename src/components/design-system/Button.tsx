import React from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/Icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

const buttonVariants = {
  primary:
    "btn-primary bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 border-transparent",
  secondary:
    "btn-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:bg-secondary/90 border-transparent",
  outline:
    "btn-outline bg-transparent hover:bg-muted focus:bg-muted text-foreground border-border hover:border-foreground/30",
  ghost:
    "btn-ghost bg-transparent hover:bg-muted focus:bg-muted text-muted-foreground border-transparent",
  danger:
    "btn-danger bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 border-transparent",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-body",
  lg: "px-6 py-3 text-body-lg",
  xl: "px-8 py-4 text-h6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref,
  ) => {
    const iconSize =
      size === "sm" ? "xs" : size === "lg" || size === "xl" ? "sm" : "xs";

    return (
      <button
        aria-busy={loading}
        aria-disabled={disabled || loading}
        className={cn(
          // Base styles
          "btn inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && iconPosition === "left" && (
          <Icon
            name="refresh"
            size={iconSize}
            className="animate-spin -ml-1 mr-2"
          />
        )}
        {!loading && icon && iconPosition === "left" && (
          <Icon name={icon} size={iconSize} className="-ml-1 mr-2" />
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <Icon name={icon} size={iconSize} className="ml-2 -mr-1" />
        )}
        {loading && iconPosition === "right" && (
          <Icon
            name="refresh"
            size={iconSize}
            className="animate-spin ml-2 -mr-1"
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
