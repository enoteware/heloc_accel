import React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border-neutral-300 text-primary-600 transition-all duration-200",
              "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-300 focus:ring-red-500",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "font-medium cursor-pointer",
                  error ? "text-red-700" : "text-neutral-700",
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  "text-body-sm",
                  error ? "text-red-600" : "text-neutral-500",
                )}
              >
                {description}
              </p>
            )}
            {error && <p className="text-body-sm text-red-600 mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
