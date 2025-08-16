"use client";

import React from "react";
import EnhancedCalculatorForm from "@/components/EnhancedCalculatorForm";
import { CalculationInput } from "@/lib/types";

export default function TestValidationPage() {
  const handleSubmit = async (data: CalculationInput) => {
    console.log("Form submitted with data:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Form Validation Test
          </h1>
          <p className="text-gray-600">
            Test the new React Hook Form validation with real-time feedback
          </p>
        </div>

        <EnhancedCalculatorForm onSubmit={handleSubmit} loading={false} />
      </div>
    </div>
  );
}
