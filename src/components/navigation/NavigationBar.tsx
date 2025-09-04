"use client";

import React, { useState } from "react";
import { useUser } from "@stackframe/stack";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import NavigationLink from "./NavigationLink";
import UserMenu from "./UserMenu";
import HamburgerButton from "./HamburgerButton";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import { CompactThemeToggle } from "@/components/ThemeToggle";

export interface NavigationBarProps {
  className?: string;
  variant?: "default" | "transparent" | "solid";
  showOnAuthPages?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  className,
  variant = "default",
  showOnAuthPages = false,
}) => {
  const user = useUser();
  const session = user ? { user } : null;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navigation on auth pages unless explicitly requested
  const isAuthPage =
    pathname.startsWith("/auth/") || pathname.includes("/handler/");
  if (isAuthPage && !showOnAuthPages) {
    return null;
  }

  // Determine if user is authenticated
  const isAuthenticated = !!session?.user;

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation variant styles
  const variantStyles = {
    default: "bg-background/95 backdrop-blur-sm border-b border-border",
    transparent: "bg-transparent",
    solid: "bg-background border-b border-border",
  };

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-30 transition-all duration-200",
          variantStyles[variant],
          className,
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo
                size="md"
                showText={true}
                clickable={true}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Always show home */}
              <NavigationLink
                href="/"
                label="Home"
                icon="home"
                className="hidden lg:flex"
              />

              {/* Authenticated user links */}
              {isAuthenticated && (
                <>
                  <NavigationLink
                    href="/calculator"
                    label="Calculator"
                    icon="calculator"
                  />
                  <NavigationLink
                    href="/budgeting"
                    label="Budgeting"
                    icon="dollar-sign"
                  />
                  <NavigationLink
                    href="/dashboard"
                    label="Dashboard"
                    icon="dashboard"
                  />
                  <NavigationLink
                    href="/scenarios"
                    label="Scenarios"
                    icon="save"
                  />
                  <NavigationLink
                    href="/compare"
                    label="Compare"
                    icon="compare"
                    className="hidden lg:flex"
                  />
                </>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <div className="hidden md:block">
                <CompactThemeToggle />
              </div>

              {/* Language Switcher */}
              <div className="hidden md:block">
                <SimpleLanguageSwitcher />
              </div>

              {/* Desktop User Menu or Sign In */}
              <div className="hidden md:flex items-center">
                {user ? (
                  <UserMenu />
                ) : (
                  <NavigationLink
                    href="/handler/sign-in"
                    label="Sign In"
                    icon="login"
                    className="btn-primary"
                  />
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <HamburgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={handleMobileMenuToggle}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      />
    </>
  );
};

export default NavigationBar;
