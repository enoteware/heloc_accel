import React from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/Icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 border-transparent focus:ring-primary/40",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:bg-secondary/90 border-transparent focus:ring-secondary/40",
  outline:
    "bg-transparent hover:bg-muted focus:bg-muted text-foreground border-border hover:border-primary focus:ring-primary/40",
  ghost:
    "bg-transparent hover:bg-muted focus:bg-muted text-muted-foreground hover:text-foreground focus:text-foreground border-transparent focus:ring-primary/40",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 border-transparent focus:ring-destructive/40",
  success:
    "bg-success text-success-foreground hover:bg-success/90 focus:bg-success/90 border-transparent focus:ring-success/40",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-body-sm h-9", // 36px height
  md: "px-4 py-2 text-body h-10", // 40px height
  lg: "px-6 py-3 text-body-lg h-12", // 48px height
  xl: "px-8 py-4 text-h6 h-14", // 56px height
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
          // Base styles with brand alignment
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
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
          <Icon name="refresh" size={iconSize} className="animate-spin" />
        )}
        {!loading && icon && iconPosition === "left" && (
          <Icon name={icon} size={iconSize} />
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <Icon name={icon} size={iconSize} />
        )}
        {loading && iconPosition === "right" && (
          <Icon name="refresh" size={iconSize} className="animate-spin" />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
