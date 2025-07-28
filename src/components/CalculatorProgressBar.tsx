import React from 'react';
import type { CalculatorValidationInput } from '@/lib/validation';

// Checkbox component for section completion
const SectionCheckbox: React.FC<{ isComplete: boolean; color: string }> = ({ isComplete, color }) => (
  <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300 ${
    isComplete 
      ? `bg-white border-current ${color} shadow-sm` 
      : 'bg-gray-100 border-gray-300'
  }`}>
    {isComplete && (
      <svg 
        className={`w-3 h-3 ${color} animate-in fade-in duration-200`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
          clipRule="evenodd" 
        />
      </svg>
    )}
  </div>
);

interface ProgressBarProps {
  formData: CalculatorValidationInput;
}

export const CalculatorProgressBar: React.FC<ProgressBarProps> = ({ formData }) => {
  // Define required fields and their sections
  const requiredFields = {
    mortgageInfo: [
      'currentMortgageBalance',
      'currentInterestRate',
      'remainingTermMonths',
      'monthlyPayment'
    ],
    helocInfo: [
      'helocLimit',
      'helocInterestRate'
    ],
    incomeExpenses: [
      'monthlyGrossIncome',
      'monthlyNetIncome',
      'monthlyExpenses',
      'monthlyDiscretionaryIncome'
    ]
  };

  // Calculate completion for each section
  const calculateSectionProgress = (fields: string[]) => {
    const completed = fields.filter(field => {
      const value = formData[field as keyof CalculatorValidationInput];
      return value && (typeof value === 'number' ? value > 0 : value.trim().length > 0);
    }).length;
    return (completed / fields.length) * 100;
  };

  const mortgageProgress = calculateSectionProgress(requiredFields.mortgageInfo);
  const helocProgress = calculateSectionProgress(requiredFields.helocInfo);
  const incomeProgress = calculateSectionProgress(requiredFields.incomeExpenses);

  // Calculate overall progress (weighted by section importance)
  const overallProgress = (mortgageProgress * 0.4 + helocProgress * 0.3 + incomeProgress * 0.3);

  const sections = [
    {
      name: 'Mortgage Info',
      progress: mortgageProgress,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      checkColor: 'text-blue-600',
      isComplete: mortgageProgress === 100
    },
    {
      name: 'HELOC Info',
      progress: helocProgress,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      checkColor: 'text-green-600',
      isComplete: helocProgress === 100
    },
    {
      name: 'Income & Expenses',
      progress: incomeProgress,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      checkColor: 'text-purple-600',
      isComplete: incomeProgress === 100
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Form Completion</h4>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(overallProgress)}%
        </span>
      </div>
      
      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Section Progress Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {sections.map((section, index) => (
          <div key={index} className="text-center">
            <div className={`w-full ${section.lightColor} rounded-full h-1.5 mb-2`}>
              <div 
                className={`${section.color} h-1.5 rounded-full transition-all duration-300 ease-in-out`}
                style={{ width: `${section.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <SectionCheckbox isComplete={section.isComplete} color={section.checkColor} />
              <div className={`font-medium transition-colors duration-200 ${
                section.isComplete ? section.checkColor : 'text-gray-600'
              }`}>
                {section.name}
              </div>
            </div>
            <div className={`transition-colors duration-200 ${
              section.isComplete ? section.checkColor : 'text-gray-500'
            }`}>
              {Math.round(section.progress)}%
            </div>
          </div>
        ))}
      </div>

      {/* Helpful Message */}
      {overallProgress < 100 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          {overallProgress < 50 
            ? "Fill in the required fields to get started" 
            : "You're almost ready to calculate your HELOC strategy!"
          }
        </div>
      )}
    </div>
  );
};