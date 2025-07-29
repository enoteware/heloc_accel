/**
 * Hook for runtime contrast validation
 * 
 * Provides utilities to validate color combinations and ensure
 * accessibility compliance in React components.
 */

import { useCallback, useMemo } from 'react';
import { 
  validateContrast, 
  getSafeTextColors,
  assertSafeContrast,
  validateTailwindCombination,
  type ContrastResult 
} from '@/lib/contrast-validation';
import type { 
  AllColors, 
  SafeTextColor, 
  UseContrastValidationReturn,
  ContrastValidationResult 
} from '@/types/contrast';

export function useContrastValidation(): UseContrastValidationReturn {
  const validateCombination = useCallback((
    background: string, 
    textColor: string
  ): ContrastValidationResult => {
    const result = validateContrast(textColor, background);
    const tailwindResult = validateTailwindCombination(`bg-${background} text-${textColor}`);
    
    return {
      isValid: result.isAccessible && tailwindResult.isValid,
      ratio: result.ratio,
      level: result.level,
      errors: [
        ...(result.recommendation ? [result.recommendation] : []),
        ...tailwindResult.issues
      ],
      suggestions: tailwindResult.suggestions
    };
  }, []);

  const getSafeColors = useCallback(<T extends AllColors>(
    backgroundColor: T
  ): SafeTextColor<T>[] => {
    return getSafeTextColors(backgroundColor as any) as SafeTextColor<T>[];
  }, []);

  const assertSafe = useCallback((
    background: string, 
    textColor: string, 
    context?: string
  ): void => {
    assertSafeContrast(textColor, background, context);
  }, []);

  return {
    validateCombination,
    getSafeTextColors: getSafeColors,
    assertSafe
  };
}

/**
 * Hook for component-level contrast validation
 */
export function useComponentContrastValidation(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const { validateCombination, assertSafe } = useContrastValidation();

  const validateProps = useCallback((props: {
    backgroundColor?: string;
    textColor?: string;
    className?: string;
  }) => {
    if (!enabled) return;

    const { backgroundColor, textColor, className } = props;

    // Validate explicit color props
    if (backgroundColor && textColor) {
      try {
        assertSafe(backgroundColor, textColor, componentName);
      } catch (error) {
        console.error(`[${componentName}] Contrast validation failed:`, error);
      }
    }

    // Validate className combinations
    if (className) {
      const result = validateTailwindCombination(className);
      if (!result.isValid) {
        console.warn(`[${componentName}] Potential contrast issues in className:`, {
          issues: result.issues,
          suggestions: result.suggestions,
          className
        });
      }
    }
  }, [componentName, enabled, assertSafe]);

  return { validateProps };
}

/**
 * Hook for form field contrast validation
 */
export function useFormFieldContrastValidation() {
  const { validateCombination } = useContrastValidation();

  const validateFieldState = useCallback((
    hasError: boolean,
    isDisabled: boolean,
    customColors?: { background?: string; text?: string }
  ) => {
    if (customColors?.background && customColors?.text) {
      const result = validateCombination(customColors.background, customColors.text);
      
      if (!result.isValid) {
        console.warn('Form field contrast validation failed:', {
          state: { hasError, isDisabled },
          result,
          colors: customColors
        });
      }
      
      return result;
    }

    // Validate default states
    if (hasError) {
      // Error state: red border with white background
      return validateCombination('white', 'neutral-900');
    }
    
    if (isDisabled) {
      // Disabled state: gray background with gray text
      return validateCombination('neutral-100', 'neutral-600');
    }

    // Default state: white background with dark text
    return validateCombination('white', 'neutral-900');
  }, [validateCombination]);

  return { validateFieldState };
}

/**
 * Development-only hook for debugging contrast issues
 */
export function useContrastDebugger(enabled: boolean = process.env.NODE_ENV === 'development') {
  const debugInfo = useMemo(() => {
    if (!enabled) return null;

    return {
      // Common problematic combinations to watch for
      dangerousCombinations: [
        { bg: 'bg-white', text: 'text-white', issue: 'White on white - completely invisible' },
        { bg: 'bg-neutral-50', text: 'text-white', issue: 'White on light gray - very poor contrast' },
        { bg: 'bg-neutral-100', text: 'text-neutral-100', issue: 'Same color text and background' },
        { bg: 'bg-neutral-900', text: 'text-neutral-900', issue: 'Same dark color - invisible' },
        { bg: 'bg-black', text: 'text-black', issue: 'Black on black - completely invisible' },
      ],
      
      // Safe alternatives
      safeAlternatives: {
        lightBg: ['text-neutral-700', 'text-neutral-800', 'text-neutral-900'],
        darkBg: ['text-white', 'text-neutral-50', 'text-neutral-100'],
        primaryBg: ['text-white', 'text-primary-900'],
        secondaryBg: ['text-white', 'text-secondary-900']
      }
    };
  }, [enabled]);

  const logContrastIssue = useCallback((
    className: string, 
    context?: string
  ) => {
    if (!enabled) return;

    const result = validateTailwindCombination(className);
    if (!result.isValid) {
      console.group(`🔍 Contrast Issue ${context ? `in ${context}` : ''}`);
      console.warn('className:', className);
      console.warn('Issues:', result.issues);
      console.info('Suggestions:', result.suggestions);
      console.groupEnd();
    }
  }, [enabled]);

  return {
    debugInfo,
    logContrastIssue,
    enabled
  };
}