"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: "default" | "pills" | "underline";
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
};

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "default" | "pills" | "underline";
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = "default",
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (tab: string) => {
    if (value === undefined) {
      setInternalValue(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  const { variant } = useTabsContext();

  const variantClasses = {
    default: "border-b border-border",
    pills: "bg-muted p-1 rounded-lg",
    underline: "border-b border-border",
  };

  return (
    <div
      className={cn("flex", variantClasses[variant], className)}
      role="tablist"
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  className,
}) => {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const variantClasses = {
    default: cn(
      "px-4 py-2 text-body-sm font-medium border-b-2 transition-colors",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
      disabled && "opacity-50 cursor-not-allowed",
    ),
    pills: cn(
      "px-3 py-1.5 text-body-sm font-medium rounded-md transition-colors",
      isActive
        ? "bg-card text-primary shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-card/50",
      disabled && "opacity-50 cursor-not-allowed",
    ),
    underline: cn(
      "px-4 py-2 text-body-sm font-medium border-b-2 transition-colors",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground",
      disabled && "opacity-50 cursor-not-allowed",
    ),
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn("mt-4", className)}
    >
      {children}
    </div>
  );
};
