"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NavigationIcon from "./NavigationIcon";

export interface NavigationLinkProps {
  href: string;
  label: string;
  icon?: string;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  external?: boolean;
  showIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
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
  onClick,
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const baseClasses = cn(
    "flex items-center space-x-2 px-3 py-2 rounded-lg text-body font-medium transition-all duration-200",
    "hover:bg-muted hover:text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "dark:hover:bg-muted dark:hover:text-foreground",
    isActive
      ? cn("bg-card text-primary border border-border", activeClassName)
      : "text-foreground",
    className,
  );

  const content = (
    <>
      {icon && showIcon && (
        <NavigationIcon
          name={icon}
          size={iconSize}
          aria-hidden={true}
          className={cn(
            "flex-shrink-0",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
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
