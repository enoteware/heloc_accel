"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import NavigationIcon from "./NavigationIcon";
import { signOutAction } from "@/app/actions/auth";
import type { IconName } from "@/components/Icons";

interface FlyoutMenuItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: IconName;
  external?: boolean;
}

interface FlyoutMenuProps {
  trigger: React.ReactNode;
  title: string;
  items: FlyoutMenuItem[];
  footerActions?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  placement?: "bottom-start" | "bottom-end";
}

export const FlyoutMenu: React.FC<FlyoutMenuProps> = ({
  trigger,
  title,
  items,
  footerActions,
  className,
  menuClassName,
  placement = "bottom-start",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-x-1 text-sm/6 font-semibold",
          "text-foreground hover:text-foreground/80",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1",
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <NavigationIcon
          name="chevron-down"
          size="sm"
          variant="muted"
          className={cn(
            "h-5 w-5 flex-none transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden={true}
        />
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10 bg-black/20"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            ref={menuRef}
            className={cn(
              "absolute z-20 mt-3 w-screen max-w-md overflow-hidden rounded-3xl",
              "bg-background shadow-lg ring-1 ring-border",
              "dark:ring-border/50",
              placement === "bottom-end" && "right-0",
              placement === "bottom-start" && "left-0",
              menuClassName,
            )}
          >
            <div className="p-4">
              {/* Menu Title */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {items.map((item) => {
                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleItemClick}
                        className={cn(
                          "group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6",
                          "hover:bg-muted transition-colors duration-200",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 flex-none items-center justify-center rounded-lg",
                            "bg-muted group-hover:bg-background",
                            "transition-colors duration-200",
                          )}
                        >
                          <NavigationIcon
                            name={item.icon}
                            size="md"
                            variant="muted"
                            className={cn(
                              "h-6 w-6 group-hover:text-primary",
                              "transition-colors duration-200",
                            )}
                            aria-hidden={true}
                          />
                        </div>
                        <div className="flex-auto">
                          <span className="block font-semibold text-foreground">
                            {item.label}
                            <span className="absolute inset-0" />
                          </span>
                          {item.description && (
                            <p className="mt-1 text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href as any}
                      onClick={handleItemClick}
                      className={cn(
                        "group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6",
                        "hover:bg-muted transition-colors duration-200",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 flex-none items-center justify-center rounded-lg",
                          "bg-muted group-hover:bg-background",
                          "transition-colors duration-200",
                        )}
                      >
                        <NavigationIcon
                          name={item.icon}
                          size="md"
                          variant="muted"
                          className={cn(
                            "h-6 w-6 group-hover:text-primary",
                            "transition-colors duration-200",
                          )}
                          aria-hidden={true}
                        />
                      </div>
                      <div className="flex-auto">
                        <span className="block font-semibold text-foreground">
                          {item.label}
                          <span className="absolute inset-0" />
                        </span>
                        {item.description && (
                          <p className="mt-1 text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            {footerActions && (
              <div
                className={cn(
                  "grid grid-cols-2 divide-x divide-border",
                  "bg-muted/50",
                )}
              >
                {footerActions}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Specialized flyout menus for different sections
export const ToolsFlyoutMenu: React.FC<{ className?: string }> = ({
  className,
}) => {
  const user = useUser();
  const isAuthenticated = !!user;

  const toolsItems: FlyoutMenuItem[] = [
    {
      id: "calculator",
      label: "HELOC Calculator",
      description: "Calculate your mortgage acceleration strategy",
      href: "/calculator",
      icon: "calculator",
    },
    {
      id: "budgeting",
      label: "Budget Planner",
      description: "Plan your income and expenses",
      href: "/budgeting",
      icon: "dollar-sign",
    },
    {
      id: "compare",
      label: "Compare Scenarios",
      description: "Compare different financial strategies",
      href: "/compare",
      icon: "compare",
    },
    {
      id: "formulas",
      label: "Formulas Guide",
      description: "Understand the calculations behind HELOC acceleration",
      href: "/formulas",
      icon: "book",
    },
  ];

  const footerActions = (
    <>
      <Link
        href="/calculator"
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="play"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        Try Calculator
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="dashboard"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        View Dashboard
      </Link>
    </>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FlyoutMenu
      trigger="Tools"
      title="Financial Tools"
      items={toolsItems}
      footerActions={footerActions}
      className={className}
    />
  );
};

export const ResourcesFlyoutMenu: React.FC<{ className?: string }> = ({
  className,
}) => {
  const resourcesItems: FlyoutMenuItem[] = [
    {
      id: "formulas",
      label: "Calculation Formulas",
      description: "Learn about mortgage and HELOC calculations",
      href: "/formulas",
      icon: "book",
    },
    {
      id: "guides",
      label: "User Guides",
      description: "Step-by-step guides for using our tools",
      href: "/guides",
      icon: "help",
    },
    {
      id: "faq",
      label: "FAQ",
      description: "Frequently asked questions",
      href: "/faq",
      icon: "question",
    },
    {
      id: "support",
      label: "Contact Support",
      description: "Get help from our support team",
      href: "/support",
      icon: "support",
    },
  ];

  const footerActions = (
    <>
      <Link
        href={"/guides" as any}
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="book"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        View Guides
      </Link>
      <Link
        href={"/support" as any}
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="support"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        Get Support
      </Link>
    </>
  );

  return (
    <FlyoutMenu
      trigger="Resources"
      title="Help & Resources"
      items={resourcesItems}
      footerActions={footerActions}
      className={className}
    />
  );
};

export const UserFlyoutMenu: React.FC<{ className?: string }> = ({
  className,
}) => {
  const user = useUser();

  if (!user) {
    return null;
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.primaryEmail) return user.primaryEmail.split("@")[0];
    return "User";
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userItems: FlyoutMenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "View your saved scenarios and analytics",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      id: "scenarios",
      label: "My Scenarios",
      description: "Manage your saved calculations",
      href: "/scenarios",
      icon: "save",
    },
    {
      id: "profile",
      label: "Profile Settings",
      description: "Update your account information",
      href: "/profile",
      icon: "user",
    },
  ];

  const handleSignOut = async () => {
    await signOutAction();
  };

  const footerActions = (
    <>
      <Link
        href="/profile"
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="settings"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        Settings
      </Link>
      <button
        onClick={handleSignOut}
        className={cn(
          "flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold",
          "text-foreground hover:bg-muted/80 transition-colors duration-200",
        )}
      >
        <NavigationIcon
          name="logout"
          size="sm"
          variant="muted"
          className="h-5 w-5 flex-none"
          aria-hidden={true}
        />
        Sign Out
      </button>
    </>
  );

  const userTrigger = (
    <div className="flex items-center gap-x-2">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground text-sm font-medium",
        )}
      >
        {getUserInitials()}
      </div>
      <span className="hidden sm:block text-sm font-semibold">
        {getUserDisplayName()}
      </span>
    </div>
  );

  return (
    <FlyoutMenu
      trigger={userTrigger}
      title="Account"
      items={userItems}
      footerActions={footerActions}
      className={className}
      placement="bottom-end"
    />
  );
};

export default FlyoutMenu;
