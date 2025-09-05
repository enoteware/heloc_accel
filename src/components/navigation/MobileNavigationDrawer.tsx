"use client";

import React, { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import NavigationLink from "./NavigationLink";
import NavigationIcon from "./NavigationIcon";
import { signOutAction } from "@/app/actions/auth";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import { CompactThemeToggle } from "@/components/ThemeToggle";

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const user = useUser();
  const session = user ? { user } : null;
  const router = useRouter();

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus trap management
  useEffect(() => {
    if (isOpen) {
      const drawer = document.getElementById("mobile-navigation-menu");
      const focusableElements = drawer?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    onClose();
    await signOutAction();
  };

  const handleLinkClick = () => {
    onClose();
  };

  // Get user display info
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.primaryEmail) return user.primaryEmail.split("@")[0];
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40",
          "transition-opacity duration-300",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        id="mobile-navigation-menu"
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw]",
          "bg-background shadow-xl border-l border-border",
          "z-50 transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4",
            "border-b border-border bg-background",
          )}
        >
          <h2 className="text-h6 font-semibold text-foreground">Navigation</h2>
          <div className="flex items-center space-x-2">
            <CompactThemeToggle />
            <SimpleLanguageSwitcher />
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
              aria-label="Close navigation menu"
            >
              <NavigationIcon name="x" size="md" aria-hidden={true} />
            </button>
          </div>
        </div>

        {/* User info (if authenticated) */}
        {session?.user && (
          <div className={cn("p-4 border-b border-border bg-muted/30")}>
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  "bg-primary text-primary-foreground text-sm font-medium",
                )}
              >
                {getUserInitials()}
              </div>
              <div>
                <p className="text-body font-medium text-foreground">
                  {getUserDisplayName()}
                </p>
                {user?.primaryEmail && (
                  <p className="text-body-sm text-muted-foreground">
                    {user.primaryEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavigationLink
            href="/"
            label="Home"
            icon="home"
            variant="default"
            className={cn(
              "w-full justify-start px-3 py-3 rounded-lg",
              "text-foreground hover:bg-muted/80 transition-colors duration-200",
            )}
            onClick={handleLinkClick}
          />

          {session?.user && (
            <>
              <NavigationLink
                href="/calculator"
                label="Calculator"
                icon="calculator"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/budgeting"
                label="Budgeting"
                icon="dollar-sign"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/dashboard"
                label="Dashboard"
                icon="dashboard"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/scenarios"
                label="Scenarios"
                icon="save"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/compare"
                label="Compare"
                icon="compare"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/profile"
                label="Profile"
                icon="user"
                variant="default"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-lg",
                  "text-foreground hover:bg-muted/80 transition-colors duration-200",
                )}
                onClick={handleLinkClick}
              />
            </>
          )}

          {/* Resources Section */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
              Resources
            </h3>
            <NavigationLink
              href="/formulas"
              label="Formulas"
              icon="book"
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-3 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                "transition-colors duration-200",
              )}
              onClick={handleLinkClick}
            />
            <NavigationLink
              href="/guides"
              label="Guides"
              icon="help"
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-3 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                "transition-colors duration-200",
              )}
              onClick={handleLinkClick}
            />
            <NavigationLink
              href="/support"
              label="Support"
              icon="support"
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-3 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                "transition-colors duration-200",
              )}
              onClick={handleLinkClick}
            />
          </div>
        </nav>

        {/* Footer Actions */}
        <div className={cn("p-4 border-t border-border bg-muted/30 space-y-2")}>
          {session?.user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "flex items-center space-x-2 w-full px-3 py-2 rounded-lg",
                "text-destructive hover:bg-destructive/10",
                "focus:outline-none focus:ring-2 focus:ring-destructive/20",
                "transition-colors duration-200",
              )}
            >
              <NavigationIcon
                name="logout"
                size="md"
                variant="error"
                aria-hidden={true}
              />
              <span className="text-body font-medium">Sign Out</span>
            </button>
          ) : (
            <NavigationLink
              href="/handler/sign-in"
              label="Sign In"
              icon="login"
              variant="primary"
              className={cn(
                "w-full justify-center px-4 py-3 rounded-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-colors duration-200",
              )}
              onClick={handleLinkClick}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNavigationDrawer;
