'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface FieldConfig {
  rules?: ValidationRule;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

export interface FieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormState {
  [fieldName: string]: FieldState;
}

export interface UseFormValidationReturn {
  values: { [key: string]: any };
  errors: { [key: string]: string | null };
  touched: { [key: string]: boolean };
  dirty: { [key: string]: boolean };
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string | null) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string, value?: any) => string | null;
  validateForm: () => boolean;
  handleChange: (name: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (name: string) => () => void;
  handleSubmit: (onSubmit: (values: any) => void | Promise<void>) => (event: React.FormEvent) => Promise<void>;
  reset: (initialValues?: { [key: string]: any }) => void;
  setSubmitting: (submitting: boolean) => void;
}

const validateValue = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }

  if (value === undefined || value === null || value === '') {
    return null; // Don't validate empty optional fields
  }

  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
    return `Must be at least ${rules.min}`;
  }

  if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
    return `Must be no more than ${rules.max}`;
  }

  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (rules.email && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email address';
    }
  }

  if (rules.phone && typeof value === 'string') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Invalid phone number';
    }
  }

  if (rules.url && typeof value === 'string') {
    try {
      new URL(value);
    } catch {
      return 'Invalid URL';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const useFormValidation = (
  initialValues: { [key: string]: any } = {},
  config: FormConfig = {}
): UseFormValidationReturn => {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
        dirty: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        dirty: true,
      },
    }));
  }, []);

  const setError = useCallback((name: string, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, []);

  const setTouched = useCallback((name: string, touched: boolean) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
      },
    }));
  }, []);

  const validateField = useCallback((name: string, value?: any): string | null => {
    const fieldConfig = config[name];
    if (!fieldConfig?.rules) return null;

    const fieldValue = value !== undefined ? value : formState[name]?.value;
    return validateValue(fieldValue, fieldConfig.rules);
  }, [config, formState]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFormState = { ...formState };

    Object.keys(config).forEach(name => {
      const error = validateField(name);
      if (error) {
        isValid = false;
      }
      if (newFormState[name]) {
        newFormState[name] = {
          ...newFormState[name],
          error,
          touched: true,
        };
      }
    });

    setFormState(newFormState);
    return isValid;
  }, [config, formState, validateField]);

  const handleChange = useCallback((name: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.type === 'checkbox' 
        ? (event.target as HTMLInputElement).checked 
        : event.target.value;

      setValue(name, value);

      const fieldConfig = config[name];
      if (fieldConfig?.validateOnChange) {
        const error = validateField(name, value);
        setError(name, error);
      }
    };
  }, [setValue, setError, validateField, config]);

  const handleBlur = useCallback((name: string) => {
    return () => {
      setTouched(name, true);

      const fieldConfig = config[name];
      if (fieldConfig?.validateOnBlur) {
        const error = validateField(name);
        setError(name, error);
      }
    };
  }, [setTouched, setError, validateField, config]);

  const handleSubmit = useCallback((onSubmit: (values: any) => void | Promise<void>) => {
    return async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);

      try {
        const isValid = validateForm();
        if (isValid) {
          const values: { [key: string]: any } = {};
          Object.keys(formState).forEach(key => {
            values[key] = formState[key].value;
          });
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [formState, validateForm]);

  const reset = useCallback((newInitialValues?: { [key: string]: any }) => {
    const valuesToUse = newInitialValues || initialValues;
    const newState: FormState = {};
    
    Object.keys(valuesToUse).forEach(key => {
      newState[key] = {
        value: valuesToUse[key],
        error: null,
        touched: false,
        dirty: false,
      };
    });

    setFormState(newState);
    setIsSubmitting(false);
  }, [initialValues]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // Computed values
  const values = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].value;
    return acc;
  }, {} as { [key: string]: any });

  const errors = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].error;
    return acc;
  }, {} as { [key: string]: string | null });

  const touched = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].touched;
    return acc;
  }, {} as { [key: string]: boolean });

  const dirty = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].dirty;
    return acc;
  }, {} as { [key: string]: boolean });

  const isValid = Object.values(formState).every(field => !field.error);

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setSubmitting,
  };
};
