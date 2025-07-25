import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-neutral-400">{leftIcon}</div>
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50',
              'placeholder-neutral-400 dark:placeholder-neutral-500',
              // Background and text colors with higher specificity
              'bg-white dark:bg-neutral-800',
              '!text-neutral-900 dark:!text-neutral-100',
              // Padding adjustments for icons
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              'py-2',
              // Error state
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 hover:border-neutral-400',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-neutral-400">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-body-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-body-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
