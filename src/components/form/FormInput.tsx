import React from 'react'
import { 
  UseFormRegister, 
  FieldErrors, 
  FieldValues, 
  Path,
  get
} from 'react-hook-form'
import { ValidatedInput, ValidatedInputProps } from '@/components/design-system/ValidatedInput'
import { getValidationHint } from '@/lib/form-validation'

interface FormInputProps<T extends FieldValues> extends Omit<ValidatedInputProps, 'error' | 'helperText' | 'success'> {
  name: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  rules?: any
  showHints?: boolean
  formatValue?: (value: string) => string
  parseValue?: (value: string) => string
}

export function FormInput<T extends FieldValues>({
  name,
  register,
  errors,
  rules,
  showHints = true,
  formatValue,
  parseValue,
  onChange,
  onBlur,
  ...props
}: FormInputProps<T>) {
  const error = get(errors, name)
  const errorMessage = error?.message || error?.type
  
  // Determine validation state
  const hasError = Boolean(error)
  const isSuccess = !hasError && Boolean(props.value) && String(props.value).length > 0
  
  // Get validation hint if no error and hints are enabled
  const hint = showHints && !hasError ? getValidationHint(name) : undefined
  
  // Register the input with React Hook Form
  const registration = register(name, rules)
  
  // Handle value formatting for display
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value
    
    // Apply parsing if provided (e.g., remove formatting for storage)
    if (parseValue) {
      value = parseValue(value)
    }
    
    // Update the event value for React Hook Form
    event.target.value = value
    
    // Call React Hook Form's onChange
    registration.onChange(event)
    
    // Call custom onChange if provided
    if (onChange) {
      onChange(event)
    }
  }
  
  // Handle blur events
  const handleBlur = () => {
    // Call custom onBlur if provided
    if (onBlur) {
      onBlur()
    }
  }
  
  return (
    <ValidatedInput
      {...props}
      name={registration.name}
      ref={registration.ref}
      onChange={handleChange}
      onBlur={handleBlur}
      error={errorMessage}
      helperText={hint}
      success={isSuccess}
      aria-invalid={hasError}
    />
  )
}

// Specialized input for currency values
export function CurrencyInput<T extends FieldValues>(props: FormInputProps<T>) {
  const formatCurrency = (value: string): string => {
    const num = parseFloat(value.replace(/[,$]/g, ''))
    if (isNaN(num)) return value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }
  
  const parseCurrency = (value: string): string => {
    return value.replace(/[,$]/g, '')
  }
  
  return (
    <FormInput
      {...props}
      formatValue={formatCurrency}
      parseValue={parseCurrency}
      inputMode="numeric"
      placeholder="$0"
    />
  )
}

// Specialized input for percentage values
export function PercentageInput<T extends FieldValues>(props: FormInputProps<T>) {
  const formatPercentage = (value: string): string => {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return `${num}%`
  }
  
  const parsePercentage = (value: string): string => {
    return value.replace(/%/g, '')
  }
  
  return (
    <FormInput
      {...props}
      formatValue={formatPercentage}
      parseValue={parsePercentage}
      inputMode="decimal"
      placeholder="0.0%"
    />
  )
}

// Specialized input for numeric values
export function NumericInput<T extends FieldValues>(props: FormInputProps<T>) {
  const parseNumeric = (value: string): string => {
    // Allow only numbers, decimal points, and negative signs
    return value.replace(/[^0-9.-]/g, '')
  }
  
  return (
    <FormInput
      {...props}
      parseValue={parseNumeric}
      inputMode="numeric"
      type="number"
    />
  )
}

// Input with real-time validation feedback
export function ValidatingInput<T extends FieldValues>({
  name,
  register,
  errors,
  rules,
  trigger,
  ...props
}: FormInputProps<T> & { trigger?: (name: Path<T>) => Promise<boolean> }) {
  const [isValidating, setIsValidating] = React.useState(false)
  
  const handleBlur = async () => {
    if (trigger) {
      setIsValidating(true)
      await trigger(name)
      setIsValidating(false)
    }
  }
  
  return (
    <FormInput
      {...props}
      name={name}
      register={register}
      errors={errors}
      rules={rules}
      onBlur={handleBlur}
      loading={isValidating}
    />
  )
}
