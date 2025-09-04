"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { Select } from "@/components/design-system/Select";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Icon } from "@/components/Icons";

interface BudgetFormProps {
  type: "income" | "expense";
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function BudgetForm({
  type,
  onSubmit,
  loading = false,
}: BudgetFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    category: "other", // for expenses
    is_primary: false, // for income
    is_fixed: true, // for expenses
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Demo data for testing
  const getDemoData = () => {
    if (type === "income") {
      const incomeExamples = [
        { name: "Primary Job", amount: "8500", frequency: "monthly" },
        { name: "Side Business", amount: "1200", frequency: "monthly" },
        { name: "Rental Income", amount: "2000", frequency: "monthly" },
        { name: "Freelance Work", amount: "800", frequency: "monthly" },
      ];
      const randomIncome =
        incomeExamples[Math.floor(Math.random() * incomeExamples.length)];
      return {
        ...randomIncome,
        category: "other",
        is_primary: randomIncome.name === "Primary Job",
        is_fixed: true,
      };
    } else {
      const expenseExamples = [
        { name: "Mortgage Payment", amount: "2347", category: "housing" },
        { name: "Car Payment", amount: "450", category: "transportation" },
        { name: "Groceries", amount: "800", category: "food" },
        { name: "Utilities", amount: "250", category: "utilities" },
        { name: "Insurance", amount: "300", category: "insurance" },
        { name: "Gym Membership", amount: "80", category: "entertainment" },
      ];
      const randomExpense =
        expenseExamples[Math.floor(Math.random() * expenseExamples.length)];
      return {
        ...randomExpense,
        frequency: "monthly",
        is_primary: false,
        is_fixed: ["Mortgage Payment", "Car Payment", "Insurance"].includes(
          randomExpense.name,
        ),
      };
    }
  };

  const handleFillDemo = () => {
    setFormData(getDemoData());
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = `${type === "income" ? "Income source" : "Expense"} name is required`;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      ...(type === "income"
        ? {
            scenarioType: "salary", // Default to salary for now
            startMonth: 1, // Default to month 1
            is_primary: formData.is_primary,
          }
        : {
            category: formData.category,
            startMonth: 1, // Default to month 1
            is_fixed: formData.is_fixed,
          }),
    };

    try {
      await onSubmit(submitData);
      // Reset form on success
      setFormData({
        name: "",
        amount: "",
        frequency: "monthly",
        category: "other",
        is_primary: false,
        is_fixed: true,
      });
      setErrors({});
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  };

  const frequencyOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" },
  ];

  const expenseCategories = [
    { value: "housing", label: "Housing" },
    { value: "transportation", label: "Transportation" },
    { value: "food", label: "Food & Dining" },
    { value: "utilities", label: "Utilities" },
    { value: "insurance", label: "Insurance" },
    { value: "debt", label: "Debt Payments" },
    { value: "entertainment", label: "Entertainment" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Icon
              name={type === "income" ? "plus-circle" : "minus-circle"}
              size="sm"
              className={type === "income" ? "text-green-500" : "text-red-500"}
            />
            <span>Add {type === "income" ? "Income Source" : "Expense"}</span>
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillDemo}
            className="text-xs"
          >
            <Icon name="zap" size="xs" className="mr-1" />
            Fill Demo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <Input
            label={type === "income" ? "Income Source Name" : "Expense Name"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={
              type === "income"
                ? "e.g., Primary Job, Side Business, Rental Income"
                : "e.g., Mortgage, Groceries, Car Payment"
            }
            error={errors.name}
            required
          />

          {/* Amount Field */}
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            error={errors.amount}
            leftIcon="dollar-sign"
            required
          />

          {/* Frequency Field */}
          <Select
            label="Frequency"
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
            options={frequencyOptions}
          />

          {/* Type-specific fields */}
          {type === "income" ? (
            <Checkbox
              label="Primary income source"
              checked={formData.is_primary}
              onChange={(e) =>
                setFormData({ ...formData, is_primary: e.target.checked })
              }
              description="Check if this is your main source of income"
            />
          ) : (
            <>
              {/* Expense Category */}
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={expenseCategories}
              />

              {/* Fixed vs Variable */}
              <Checkbox
                label="Fixed expense"
                checked={formData.is_fixed}
                onChange={(e) =>
                  setFormData({ ...formData, is_fixed: e.target.checked })
                }
                description="Check if this expense amount stays the same each month"
              />
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !formData.name || !formData.amount}
            className="w-full"
            variant="primary"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Icon name="plus" size="sm" />
                <span>
                  Add {type === "income" ? "Income Source" : "Expense"}
                </span>
              </div>
            )}
          </Button>
        </form>

        {/* Helper Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {type === "income" ? "Income Tips:" : "Expense Tips:"}
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {type === "income" ? (
              <>
                <li>
                  • Include all sources: salary, freelance, investments, etc.
                </li>
                <li>• Use gross (before tax) amounts for salary</li>
                <li>• Mark your main job as "primary income source"</li>
              </>
            ) : (
              <>
                <li>• Include all regular expenses, even small ones</li>
                <li>• Fixed expenses stay the same (rent, insurance)</li>
                <li>• Variable expenses change monthly (groceries, gas)</li>
                <li>
                  • Don't forget annual expenses (insurance, subscriptions)
                </li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
