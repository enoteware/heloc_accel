import React from 'react';
import { cn } from '@/lib/utils';
import { useFormValidation, FormConfig, UseFormValidationReturn } from '@/hooks/useFormValidation';

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  children: React.ReactNode | ((form: UseFormValidationReturn) => React.ReactNode);
  initialValues?: { [key: string]: any };
  validationConfig?: FormConfig;
  onSubmit: (values: { [key: string]: any }) => void | Promise<void>;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  initialValues = {},
  validationConfig = {},
  onSubmit,
  className,
  ...props
}) => {
  const form = useFormValidation(initialValues, validationConfig);

  return (
    <form
      className={cn('space-y-6', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      {...props}
    >
      {typeof children === 'function' ? children(form) : children}
    </form>
  );
};

// Higher-order component for form fields
export interface WithFormFieldProps {
  name: string;
  form: UseFormValidationReturn;
}

export function withFormField<T extends object>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = React.forwardRef<any, T & WithFormFieldProps>((props, ref) => {
    const { name, form, ...componentProps } = props;
    
    return (
      <Component
        ref={ref}
        value={form.values[name] || ''}
        error={form.touched[name] ? form.errors[name] : null}
        onChange={form.handleChange(name)}
        onBlur={form.handleBlur(name)}
        {...(componentProps as T)}
      />
    );
  });
  
  WrappedComponent.displayName = `WithFormField(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

// Form context for easier form state access
export const FormContext = React.createContext<UseFormValidationReturn | null>(null);

export const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export interface FormProviderProps {
  children: React.ReactNode;
  form: UseFormValidationReturn;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, form }) => {
  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
};

// Form field wrapper that automatically connects to form context
export interface ConnectedFieldProps {
  name: string;
  children: (fieldProps: {
    value: any;
    error: string | null;
    onChange: (event: React.ChangeEvent<any>) => void;
    onBlur: () => void;
  }) => React.ReactNode;
}

export const ConnectedField: React.FC<ConnectedFieldProps> = ({ name, children }) => {
  const form = useFormContext();
  
  return (
    <>
      {children({
        value: form.values[name] || '',
        error: form.touched[name] ? form.errors[name] : null,
        onChange: form.handleChange(name),
        onBlur: form.handleBlur(name),
      })}
    </>
  );
};

// Form summary component
export interface FormSummaryProps {
  className?: string;
}

export const FormSummary: React.FC<FormSummaryProps> = ({ className }) => {
  const form = useFormContext();
  
  const errorCount = Object.values(form.errors).filter(Boolean).length;
  const touchedCount = Object.values(form.touched).filter(Boolean).length;
  const totalFields = Object.keys(form.values).length;

  if (errorCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-body-sm font-medium text-red-800 dark:text-red-200">
            Please fix the following errors:
          </h3>
          <div className="mt-2 text-body-sm text-red-700 dark:text-red-300">
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(form.errors).map(([field, error]) => 
                error && form.touched[field] ? (
                  <li key={field}>
                    <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {error}
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form progress indicator
export interface FormProgressProps {
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({ className }) => {
  const form = useFormContext();
  
  const totalFields = Object.keys(form.values).length;
  const completedFields = Object.entries(form.values).filter(([key, value]) => {
    return value !== '' && value !== null && value !== undefined && !form.errors[key];
  }).length;
  
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-body-sm text-neutral-600 dark:text-neutral-400 mb-2">
        <span>Form Progress</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
