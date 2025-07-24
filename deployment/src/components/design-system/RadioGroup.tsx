import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    name, 
    options, 
    value, 
    defaultValue, 
    onChange, 
    label, 
    error, 
    className,
    orientation = 'vertical',
    ...props 
  }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');

    const handleChange = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
    };

    const currentValue = value !== undefined ? value : selectedValue;

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {label && (
          <legend className="block text-body-sm font-medium text-neutral-700 mb-2">
            {label}
          </legend>
        )}
        <div className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex space-x-4 space-y-0'
        )}>
          {options.map((option) => {
            const radioId = `${name}-${option.value}`;
            const isSelected = currentValue === option.value;
            
            return (
              <div key={option.value} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={radioId}
                    name={name}
                    type="radio"
                    value={option.value}
                    checked={isSelected}
                    disabled={option.disabled}
                    onChange={() => handleChange(option.value)}
                    className={cn(
                      'h-4 w-4 border-neutral-300 text-primary-600 transition-all duration-200',
                      'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      error && 'border-red-300 focus:ring-red-500'
                    )}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={radioId}
                    className={cn(
                      'font-medium cursor-pointer',
                      option.disabled && 'cursor-not-allowed opacity-50',
                      error ? 'text-red-700' : 'text-neutral-700'
                    )}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className={cn(
                      'text-body-sm',
                      option.disabled && 'opacity-50',
                      error ? 'text-red-600' : 'text-neutral-500'
                    )}>
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {error && (
          <p className="mt-2 text-body-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
