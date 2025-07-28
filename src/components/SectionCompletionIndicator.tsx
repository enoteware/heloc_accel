import React from 'react';
import type { CalculatorValidationInput } from '@/lib/validation';

interface SectionCompletionIndicatorProps {
  formData: CalculatorValidationInput;
  requiredFields: (keyof CalculatorValidationInput)[];
  color: 'blue' | 'green' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: {
    complete: 'bg-blue-500 text-white border-blue-500',
    incomplete: 'bg-gray-100 text-gray-400 border-gray-300',
    textComplete: 'text-blue-600',
    textIncomplete: 'text-gray-500'
  },
  green: {
    complete: 'bg-green-500 text-white border-green-500',
    incomplete: 'bg-gray-100 text-gray-400 border-gray-300',
    textComplete: 'text-green-600',
    textIncomplete: 'text-gray-500'
  },
  purple: {
    complete: 'bg-purple-500 text-white border-purple-500',
    incomplete: 'bg-gray-100 text-gray-400 border-gray-300',
    textComplete: 'text-purple-600',
    textIncomplete: 'text-gray-500'
  },
  gray: {
    complete: 'bg-gray-500 text-white border-gray-500',
    incomplete: 'bg-gray-100 text-gray-400 border-gray-300',
    textComplete: 'text-gray-600',
    textIncomplete: 'text-gray-500'
  }
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

const iconSizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
};

export const SectionCompletionIndicator: React.FC<SectionCompletionIndicatorProps> = ({
  formData,
  requiredFields,
  color,
  size = 'md'
}) => {
  // Calculate completion
  const completedFields = requiredFields.filter(field => {
    const value = formData[field];
    return value && (typeof value === 'number' ? value > 0 : value.toString().trim().length > 0);
  });

  const isComplete = completedFields.length === requiredFields.length;
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
  
  const colors = colorClasses[color];
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center justify-center rounded-full border-2 transition-all duration-300 ${sizeClass} ${
        isComplete ? colors.complete : colors.incomplete
      }`}>
        {isComplete ? (
          <svg 
            className={`${iconSizeClass} animate-in fade-in duration-200`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          <div className={`rounded-full ${iconSizeClass} ${
            completedFields.length > 0 ? colors.textComplete + ' bg-current opacity-20' : ''
          }`} />
        )}
      </div>
      <span className={`text-xs font-medium transition-colors duration-200 ${
        isComplete ? colors.textComplete : colors.textIncomplete
      }`}>
        {completionPercentage}% Complete
      </span>
    </div>
  );
};