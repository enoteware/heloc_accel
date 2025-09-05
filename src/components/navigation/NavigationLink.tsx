"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NavigationIcon from "./NavigationIcon";
import type { IconName } from "@/components/Icons";

export interface NavigationLinkProps {
  href: string;
  label: string;
  icon?: IconName;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  external?: boolean;
  showIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline";
  onClick?: () => void;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  label,
  icon,
  className,
  activeClassName,
  children,
  external = false,
  showIcon = true,
  iconSize = "md",
  variant = "default",
  onClick,
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  // Check if this is a flyout menu item based on className
  const isFlyoutItem = className?.includes("group relative flex");

  // Variant styles using semantic tokens
  const variantStyles = {
    default: cn(
      "text-foreground hover:text-foreground/80 hover:bg-muted/50",
      "focus:outline-none focus:ring-2 focus:ring-primary/20",
    ),
    primary: cn(
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    ),
    secondary: cn(
      "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2",
    ),
    ghost: cn(
      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      "focus:outline-none focus:ring-2 focus:ring-primary/20",
    ),
    outline: cn(
      "border border-border text-foreground hover:bg-muted/50",
      "focus:outline-none focus:ring-2 focus:ring-primary/20",
    ),
  };

  const baseClasses = isFlyoutItem
    ? className // Use provided flyout menu classes as-is
    : cn(
        "flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-all duration-200",
        // Active state styles using semantic tokens
        isActive &&
          cn(
            "bg-muted text-primary border border-border shadow-sm",
            activeClassName,
          ),
        // Apply variant styles only if not active
        !isActive && variantStyles[variant],
        className,
      );

  const content = isFlyoutItem ? (
    // Flyout menu item content structure (preserve existing structure)
    children || (
      <>
        <div
          className={cn(
            "flex h-11 w-11 flex-none items-center justify-center rounded-lg",
            "bg-muted group-hover:bg-background transition-colors duration-200",
          )}
        >
          {icon && showIcon && (
            <NavigationIcon
              name={icon}
              size={iconSize}
              variant="muted"
              className={cn(
                "h-6 w-6 group-hover:text-primary transition-colors duration-200",
              )}
              aria-hidden={true}
            />
          )}
        </div>
        <div className="flex-auto">
          <span className="block font-semibold text-foreground">
            {label}
            <span className="absolute inset-0" />
          </span>
        </div>
      </>
    )
  ) : (
    // Regular navigation link content
    <>
      {icon && showIcon && (
        <NavigationIcon
          name={icon}
          size={iconSize}
          variant={isActive ? "primary" : "muted"}
          className="flex-shrink-0"
          aria-hidden={true}
        />
      )}
      <span className="truncate">{children || label}</span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (opens in new tab)`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href as any}
      className={baseClasses}
      aria-label={label}
      onClick={onClick}
    >
      {content}
    </Link>
  );
};

export default NavigationLink;
