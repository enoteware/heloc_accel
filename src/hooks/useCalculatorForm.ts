import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import {
  FORM_VALIDATION_RULES,
  validateCrossFields,
} from "@/lib/form-validation";
import { CalculationInput } from "@/lib/types";

export interface CalculatorFormData {
  currentMortgageBalance: string;
  currentInterestRate: string;
  remainingTermMonths: string;
  monthlyPayment: string;
  helocLimit?: string;
  helocInterestRate?: string;
  helocAvailableCredit?: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  monthlyDiscretionaryIncome: string;
}

export function useCalculatorForm(defaultValues?: Partial<CalculatorFormData>) {
  const form = useForm<CalculatorFormData>({
    mode: "onChange", // Real-time validation
    criteriaMode: "all", // Show all validation errors
    defaultValues: {
      currentMortgageBalance: "",
      currentInterestRate: "",
      remainingTermMonths: "",
      monthlyPayment: "",
      helocLimit: "",
      helocInterestRate: "",
      helocAvailableCredit: "",
      monthlyIncome: "",
      monthlyExpenses: "",
      monthlyDiscretionaryIncome: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, isValidating },
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
  } = form;

  // Watch key fields for cross-validation
  const watchedValues = useWatch({
    control: form.control,
    name: [
      "monthlyIncome",
      "monthlyExpenses",
      "monthlyPayment",
      "currentMortgageBalance",
      "helocLimit",
    ],
  });

  const [
    monthlyIncome,
    monthlyExpenses,
    monthlyPayment,
    mortgageBalance,
    helocLimit,
  ] = watchedValues;

  // Auto-calculate discretionary income
  useEffect(() => {
    const income = parseFloat(monthlyIncome?.replace(/[,$]/g, "") || "0");
    const expenses = parseFloat(monthlyExpenses?.replace(/[,$]/g, "") || "0");
    const payment = parseFloat(monthlyPayment?.replace(/[,$]/g, "") || "0");

    if (income > 0 && expenses >= 0 && payment > 0) {
      const discretionary = income - expenses - payment;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.max(0, discretionary));

      setValue("monthlyDiscretionaryIncome", formatted, {
        shouldValidate: true,
      });
    }
  }, [monthlyIncome, monthlyExpenses, monthlyPayment, setValue]);

  // Cross-field validation
  useEffect(() => {
    const formValues = form.getValues();
    const crossFieldErrors = validateCrossFields(formValues);

    // Clear previous cross-field errors
    Object.keys(crossFieldErrors).forEach((field) => {
      clearErrors(field as keyof CalculatorFormData);
    });

    // Set new cross-field errors
    Object.entries(crossFieldErrors).forEach(([field, message]) => {
      setError(field as keyof CalculatorFormData, {
        type: "cross-validation",
        message,
      });
    });
  }, [watchedValues, setError, clearErrors, form]);

  // Transform form data to calculation input format
  const transformToCalculationInput = (
    data: CalculatorFormData,
  ): CalculationInput => {
    const parseNumber = (value: string): number => {
      return parseFloat(value.replace(/[,$%]/g, "")) || 0;
    };

    return {
      current_mortgage_balance: parseNumber(data.currentMortgageBalance),
      current_interest_rate: parseNumber(data.currentInterestRate) / 100, // Convert percentage to decimal
      remaining_term_months: parseNumber(data.remainingTermMonths),
      monthly_payment: parseNumber(data.monthlyPayment),
      heloc_limit: data.helocLimit ? parseNumber(data.helocLimit) : undefined,
      heloc_interest_rate: data.helocInterestRate
        ? parseNumber(data.helocInterestRate) / 100
        : undefined,
      monthly_discretionary_income: parseNumber(
        data.monthlyDiscretionaryIncome,
      ),
    };
  };

  // Enhanced submit handler
  const onSubmit = (
    callback: (data: CalculationInput) => void | Promise<void>,
  ) => {
    return handleSubmit(async (data) => {
      try {
        const calculationInput = transformToCalculationInput(data);
        await callback(calculationInput);
      } catch (error) {
        console.error("Form submission error:", error);
        // Handle submission errors
      }
    });
  };

  // Validation rules for each field
  const validationRules = {
    currentMortgageBalance: FORM_VALIDATION_RULES.currentMortgageBalance,
    currentInterestRate: FORM_VALIDATION_RULES.currentInterestRate,
    remainingTermMonths: FORM_VALIDATION_RULES.remainingTermMonths,
    monthlyPayment: FORM_VALIDATION_RULES.monthlyPayment,
    helocLimit: FORM_VALIDATION_RULES.helocLimit,
    helocInterestRate: FORM_VALIDATION_RULES.helocInterestRate,
    monthlyIncome: FORM_VALIDATION_RULES.monthlyIncome,
    monthlyExpenses: FORM_VALIDATION_RULES.monthlyExpenses,
    monthlyDiscretionaryIncome:
      FORM_VALIDATION_RULES.monthlyDiscretionaryIncome,
  };

  // Form progress calculation
  const getFormProgress = () => {
    const requiredFields = [
      "currentMortgageBalance",
      "currentInterestRate",
      "remainingTermMonths",
      "monthlyPayment",
      "monthlyIncome",
      "monthlyExpenses",
    ];

    const completedFields = requiredFields.filter((field) => {
      const value = watch(field as keyof CalculatorFormData);
      return value && value.length > 0;
    });

    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round(
        (completedFields.length / requiredFields.length) * 100,
      ),
    };
  };

  return {
    // Form methods
    register,
    handleSubmit: onSubmit,
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,

    // Form state
    errors,
    isValid,
    touchedFields,
    isValidating,

    // Validation rules
    validationRules,

    // Utilities
    transformToCalculationInput,
    getFormProgress,

    // Raw form instance for advanced usage
    form,
  };
}
