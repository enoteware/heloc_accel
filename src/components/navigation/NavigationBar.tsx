"use client";

import React, { useState } from "react";
import { useUser } from "@stackframe/stack";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import NavigationLink from "./NavigationLink";
import HamburgerButton from "./HamburgerButton";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import { CompactThemeToggle } from "@/components/ThemeToggle";
import {
  ToolsFlyoutMenu,
  ResourcesFlyoutMenu,
  UserFlyoutMenu,
} from "./FlyoutMenu";

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

  // Navigation variant styles using semantic tokens
  const variantStyles = {
    default: cn(
      "bg-background/95 backdrop-blur-sm border-b border-border",
      "supports-[backdrop-filter]:bg-background/60",
    ),
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Logo
                size="md"
                showText={true}
                clickable={true}
                priority={true}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </div>

            {/* Desktop Navigation - Flyout Menus */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-8">
              {/* Home Link */}
              <NavigationLink
                href="/"
                label="Home"
                icon="home"
                showIcon={false}
                className={cn(
                  "text-sm/6 font-semibold text-foreground hover:text-foreground/80",
                  "transition-colors duration-200 px-3 py-2 rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                )}
              />

              {/* Tools Flyout Menu - Only for authenticated users */}
              {isAuthenticated && <ToolsFlyoutMenu />}

              {/* Resources Flyout Menu - Always visible */}
              <ResourcesFlyoutMenu />

              {/* About Link */}
              <NavigationLink
                href="/about"
                label="About"
                showIcon={false}
                className={cn(
                  "text-sm/6 font-semibold text-foreground hover:text-foreground/80",
                  "transition-colors duration-200 px-3 py-2 rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                )}
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-x-4">
              {/* Theme Toggle - Desktop */}
              <div className="hidden md:block">
                <CompactThemeToggle />
              </div>

              {/* Language Switcher - Desktop */}
              <div className="hidden md:block">
                <SimpleLanguageSwitcher />
              </div>

              {/* Desktop Authentication */}
              <div className="hidden lg:flex lg:items-center">
                {isAuthenticated ? (
                  <UserFlyoutMenu />
                ) : (
                  <div className="flex items-center gap-x-4">
                    <NavigationLink
                      href="/handler/sign-in"
                      label="Sign In"
                      showIcon={false}
                      className={cn(
                        "text-sm/6 font-semibold text-foreground hover:text-foreground/80",
                        "transition-colors duration-200 px-3 py-2 rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                      )}
                    />
                    <NavigationLink
                      href="/handler/sign-up"
                      label="Get Started"
                      showIcon={false}
                      className={cn(
                        "rounded-md bg-primary px-3 py-2 text-sm font-semibold",
                        "text-primary-foreground shadow-sm hover:bg-primary/90",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        "transition-colors duration-200",
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
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
