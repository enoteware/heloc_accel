import { validateCalculatorInputs, CalculatorValidationInput } from '../validation'
import { FORM_VALIDATION_RULES } from '../form-validation'

describe('Form Validation - LTV and PMI Integration', () => {
  describe('LTV-based PMI Validation', () => {
    it('should require PMI when LTV > 80%', () => {
      const input: CalculatorValidationInput = {
        currentMortgageBalance: 450000,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 2847,
        propertyValue: 500000, // LTV = 90%
        pmiMonthly: 0, // No PMI provided
        monthlyGrossIncome: 8500,
        monthlyNetIncome: 6200,
        monthlyExpenses: 3900,
        monthlyDiscretionaryIncome: 2300
      }

      const result = validateCalculatorInputs(input)
      expect(result.isValid).toBe(false)
      
      const pmiError = result.errors.find(e => e.field === 'pmiMonthly')
      expect(pmiError).toBeDefined()
      expect(pmiError?.message).toContain('MIP/PMI is required')
      expect(pmiError?.message).toContain('90.0%')
    })

    it('should not require PMI when LTV <= 80%', () => {
      const input: CalculatorValidationInput = {
        currentMortgageBalance: 350000,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 2214,
        propertyValue: 500000, // LTV = 70%
        pmiMonthly: 0, // No PMI provided
        monthlyGrossIncome: 8500,
        monthlyNetIncome: 6200,
        monthlyExpenses: 3900,
        monthlyDiscretionaryIncome: 2300
      }

      const result = validateCalculatorInputs(input)
      
      // Should not have PMI-related errors
      const pmiError = result.errors.find(e => e.field === 'pmiMonthly')
      expect(pmiError).toBeUndefined()
    })

    it('should warn when PMI is provided but LTV <= 80%', () => {
      const input: CalculatorValidationInput = {
        currentMortgageBalance: 350000,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 2214,
        propertyValue: 500000, // LTV = 70%
        pmiMonthly: 175, // PMI provided when not needed
        monthlyGrossIncome: 8500,
        monthlyNetIncome: 6200,
        monthlyExpenses: 3900,
        monthlyDiscretionaryIncome: 2300
      }

      const result = validateCalculatorInputs(input)
      
      const pmiError = result.errors.find(e => e.field === 'pmiMonthly')
      expect(pmiError).toBeDefined()
      expect(pmiError?.message).toContain('may not be required')
      expect(pmiError?.message).toContain('70.0%')
    })

    it('should handle missing property value gracefully', () => {
      const input: CalculatorValidationInput = {
        currentMortgageBalance: 450000,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 2847,
        // propertyValue: undefined - missing
        pmiMonthly: 0,
        monthlyGrossIncome: 8500,
        monthlyNetIncome: 6200,
        monthlyExpenses: 3900,
        monthlyDiscretionaryIncome: 2300
      }

      const result = validateCalculatorInputs(input)
      
      // Should not crash and should not have LTV-based PMI errors
      const pmiError = result.errors.find(e => e.field === 'pmiMonthly' && e.message.includes('LTV'))
      expect(pmiError).toBeUndefined()
    })
  })

  describe('React Hook Form Validation Rules', () => {
    it('should validate PMI based on LTV in form rules', () => {
      const formValues = {
        currentMortgageBalance: '450,000',
        propertyValue: '500,000',
        pmiMonthly: '0'
      }

      const validationRule = FORM_VALIDATION_RULES.pmiMonthly.validate?.ltvBased
      expect(validationRule).toBeDefined()

      if (validationRule) {
        const result = validationRule('0', formValues)
        expect(typeof result).toBe('string') // Should return error message
        expect(result).toContain('typically required')
        expect(result).toContain('90.0%')
      }
    })

    it('should pass validation when PMI is provided for high LTV', () => {
      const formValues = {
        currentMortgageBalance: '450,000',
        propertyValue: '500,000',
        pmiMonthly: '281'
      }

      const validationRule = FORM_VALIDATION_RULES.pmiMonthly.validate?.ltvBased
      expect(validationRule).toBeDefined()

      if (validationRule) {
        const result = validationRule('281', formValues)
        expect(result).toBe(true) // Should pass validation
      }
    })

    it('should warn when PMI is provided for low LTV', () => {
      const formValues = {
        currentMortgageBalance: '350,000',
        propertyValue: '500,000',
        pmiMonthly: '175'
      }

      const validationRule = FORM_VALIDATION_RULES.pmiMonthly.validate?.ltvBased
      expect(validationRule).toBeDefined()

      if (validationRule) {
        const result = validationRule('175', formValues)
        expect(typeof result).toBe('string') // Should return warning message
        expect(result).toContain('may not be required')
        expect(result).toContain('70.0%')
      }
    })

    it('should handle invalid numeric inputs gracefully', () => {
      const formValues = {
        currentMortgageBalance: 'invalid',
        propertyValue: '500,000',
        pmiMonthly: '175'
      }

      const validationRule = FORM_VALIDATION_RULES.pmiMonthly.validate?.ltvBased
      expect(validationRule).toBeDefined()

      if (validationRule) {
        const result = validationRule('175', formValues)
        expect(result).toBe(true) // Should pass when LTV can't be calculated
      }
    })
  })

  describe('Edge Case Validation Scenarios', () => {
    const edgeCases = [
      {
        name: 'Exactly 80% LTV',
        loanAmount: 400000,
        propertyValue: 500000,
        pmiAmount: 0,
        shouldRequirePMI: false
      },
      {
        name: 'Just over 80% LTV',
        loanAmount: 400500,
        propertyValue: 500000,
        pmiAmount: 0,
        shouldRequirePMI: true
      },
      {
        name: 'Very high LTV (120%)',
        loanAmount: 600000,
        propertyValue: 500000,
        pmiAmount: 0,
        shouldRequirePMI: true
      },
      {
        name: 'Very low LTV (40%)',
        loanAmount: 200000,
        propertyValue: 500000,
        pmiAmount: 175,
        shouldRequirePMI: false,
        shouldWarnUnnecessary: true
      }
    ]

    edgeCases.forEach(testCase => {
      it(`should handle ${testCase.name}`, () => {
        const input: CalculatorValidationInput = {
          currentMortgageBalance: testCase.loanAmount,
          currentInterestRate: 6.5,
          remainingTermMonths: 300,
          monthlyPayment: 2000,
          propertyValue: testCase.propertyValue,
          pmiMonthly: testCase.pmiAmount,
          monthlyGrossIncome: 8500,
          monthlyNetIncome: 6200,
          monthlyExpenses: 3900,
          monthlyDiscretionaryIncome: 2300
        }

        const result = validateCalculatorInputs(input)
        const pmiError = result.errors.find(e => e.field === 'pmiMonthly')

        if (testCase.shouldRequirePMI && testCase.pmiAmount === 0) {
          expect(pmiError).toBeDefined()
          expect(pmiError?.message).toContain('required')
        } else if (testCase.shouldWarnUnnecessary && testCase.pmiAmount > 0) {
          expect(pmiError).toBeDefined()
          expect(pmiError?.message).toContain('may not be required')
        } else {
          expect(pmiError).toBeUndefined()
        }
      })
    })
  })

  describe('Performance and Stress Testing', () => {
    it('should handle large numbers without performance issues', () => {
      const startTime = Date.now()
      
      const input: CalculatorValidationInput = {
        currentMortgageBalance: 9999999,
        currentInterestRate: 6.5,
        remainingTermMonths: 300,
        monthlyPayment: 63000,
        propertyValue: 10000000,
        pmiMonthly: 0,
        monthlyGrossIncome: 100000,
        monthlyNetIncome: 75000,
        monthlyExpenses: 25000,
        monthlyDiscretionaryIncome: 50000
      }

      const result = validateCalculatorInputs(input)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
      expect(result.errors).toBeDefined()
    })

    it('should handle multiple validation calls efficiently', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 100; i++) {
        const input: CalculatorValidationInput = {
          currentMortgageBalance: 400000 + i * 1000,
          currentInterestRate: 6.5,
          remainingTermMonths: 300,
          monthlyPayment: 2500,
          propertyValue: 500000,
          pmiMonthly: i % 2 === 0 ? 0 : 200,
          monthlyGrossIncome: 8500,
          monthlyNetIncome: 6200,
          monthlyExpenses: 3900,
          monthlyDiscretionaryIncome: 2300
        }
        
        validateCalculatorInputs(input)
      }
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete 100 validations in under 1 second
    })
  })
})
