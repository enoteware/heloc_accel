/**
 * Integration tests for input validation
 * These tests verify that the validation functions work correctly
 * with various input scenarios and edge cases.
 */

import { validateCalculatorInput, type CalculatorValidationInput } from '../lib/validation'

describe('Input Validation Integration Tests', () => {
  describe('validateCalculatorInput', () => {
    test('should validate complete valid input', () => {
      const validInput: CalculatorValidationInput = {
        currentMortgageBalance: 250000,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 1800,
        propertyValue: 400000,
        propertyTaxMonthly: 500,
        insuranceMonthly: 150,
        hoaFeesMonthly: 100,
        helocLimit: 75000,
        helocInterestRate: 7.0,
        helocAvailableCredit: 75000,
        monthlyGrossIncome: 8000,
        monthlyNetIncome: 6000,
        monthlyExpenses: 4000,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Test Scenario',
        description: 'Test Description'
      }

      const result = validateCalculatorInput(validInput)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toEqual(validInput)
    })

    test('should validate minimal required input', () => {
      const minimalInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Minimal Test'
      }

      const result = validateCalculatorInput(minimalInput)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject negative mortgage balance', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: -100000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Current mortgage balance must be positive')
    })

    test('should reject invalid interest rate', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: -1.0, // Negative rate
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Interest rate must be between 0 and 30%')
    })

    test('should reject extremely high interest rate', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 35.0, // Too high
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Interest rate must be between 0 and 30%')
    })

    test('should reject invalid term length', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 0, // Invalid term
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Remaining term must be between 1 and 600 months')
    })

    test('should reject inconsistent income data', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 5000,
        monthlyNetIncome: 6000, // Net higher than gross
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Net income cannot be higher than gross income')
    })

    test('should reject inconsistent expense data', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 6000, // Expenses higher than net income
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Invalid Test'
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Monthly expenses cannot exceed net income')
    })

    test('should reject empty scenario name', () => {
      const invalidInput: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: '' // Empty name
      }

      const result = validateCalculatorInput(invalidInput)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Scenario name is required')
    })

    test('should handle HELOC validation when provided', () => {
      const inputWithHeloc: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        helocLimit: -10000, // Invalid negative HELOC limit
        helocInterestRate: 7.0,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'HELOC Test'
      }

      const result = validateCalculatorInput(inputWithHeloc)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('HELOC limit must be positive')
    })

    test('should validate HELOC available credit consistency', () => {
      const inputWithHeloc: CalculatorValidationInput = {
        currentMortgageBalance: 200000,
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        helocLimit: 50000,
        helocAvailableCredit: 60000, // More available than limit
        helocInterestRate: 7.0,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'HELOC Test'
      }

      const result = validateCalculatorInput(inputWithHeloc)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('HELOC available credit cannot exceed HELOC limit')
    })

    test('should validate property value consistency', () => {
      const inputWithProperty: CalculatorValidationInput = {
        currentMortgageBalance: 500000, // Higher than property value
        currentInterestRate: 6.0,
        remainingTermMonths: 360,
        monthlyPayment: 1500,
        propertyValue: 400000,
        monthlyGrossIncome: 7000,
        monthlyNetIncome: 5500,
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: 'Property Test'
      }

      const result = validateCalculatorInput(inputWithProperty)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Mortgage balance cannot exceed property value')
    })

    test('should accumulate multiple validation errors', () => {
      const multipleErrorsInput: CalculatorValidationInput = {
        currentMortgageBalance: -100000, // Error 1: Negative balance
        currentInterestRate: 35.0, // Error 2: Too high rate
        remainingTermMonths: 0, // Error 3: Invalid term
        monthlyPayment: -500, // Error 4: Negative payment
        monthlyGrossIncome: 5000,
        monthlyNetIncome: 6000, // Error 5: Net > Gross
        monthlyExpenses: 3500,
        monthlyDiscretionaryIncome: 2000,
        scenarioName: '' // Error 6: Empty name
      }

      const result = validateCalculatorInput(multipleErrorsInput)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(5) // Should have multiple errors
      expect(result.errors).toContain('Current mortgage balance must be positive')
      expect(result.errors).toContain('Interest rate must be between 0 and 30%')
      expect(result.errors).toContain('Remaining term must be between 1 and 600 months')
      expect(result.errors).toContain('Scenario name is required')
    })

    test('should handle edge case values correctly', () => {
      const edgeCaseInput: CalculatorValidationInput = {
        currentMortgageBalance: 1, // Minimum valid value
        currentInterestRate: 0, // Zero interest
        remainingTermMonths: 1, // Minimum term
        monthlyPayment: 1, // Minimum payment
        monthlyGrossIncome: 1,
        monthlyNetIncome: 1,
        monthlyExpenses: 0, // Zero expenses
        monthlyDiscretionaryIncome: 1,
        scenarioName: 'Edge Case Test'
      }

      const result = validateCalculatorInput(edgeCaseInput)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle maximum valid values', () => {
      const maxValueInput: CalculatorValidationInput = {
        currentMortgageBalance: 10000000, // $10M
        currentInterestRate: 30.0, // Maximum rate
        remainingTermMonths: 600, // Maximum term (50 years)
        monthlyPayment: 100000, // High payment
        propertyValue: 15000000,
        helocLimit: 2000000,
        helocInterestRate: 30.0,
        helocAvailableCredit: 2000000,
        monthlyGrossIncome: 200000,
        monthlyNetIncome: 150000,
        monthlyExpenses: 100000,
        monthlyDiscretionaryIncome: 50000,
        scenarioName: 'Maximum Values Test'
      }

      const result = validateCalculatorInput(maxValueInput)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
