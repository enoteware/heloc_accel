import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export interface LogoProps {
  /** Logo variant to display */
  variant?: "default" | "white" | "dark";
  /** Size of the logo */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Whether the logo should be clickable (links to home) */
  clickable?: boolean;
  /** Priority loading for above-the-fold logos */
  priority?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
  xl: "h-24 w-auto",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export const Logo: React.FC<LogoProps> = ({
  variant = "default",
  size = "md",
  showText = false,
  className = "",
  clickable = true,
  priority = false,
}) => {
  // Determine which logo file to use based on variant
  const getLogoSrc = () => {
    // No basePath needed for Vercel deployment
    switch (variant) {
      case "white":
        return "/ha_logo_w.svg";
      case "dark":
        return "/heloc_accel.svg";
      case "default":
      default:
        return "/heloc_accel.svg";
    }
  };

  const logoElement = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Image
        src={getLogoSrc()}
        alt="HELOC Accelerator Logo"
        width={200}
        height={200}
        className={sizeClasses[size]}
        priority={priority}
      />
      {showText && (
        <span className={`font-bold text-foreground ${textSizeClasses[size]}`}>
          HELOC Accelerator
        </span>
      )}
    </div>
  );

  if (clickable) {
    // Always use root path for Vercel deployment
    return (
      <Link
        href="/"
        className="inline-flex items-center hover:opacity-80 transition-opacity duration-200"
        aria-label="HELOC Accelerator - Go to homepage"
      >
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};

export default Logo;
