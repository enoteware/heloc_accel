import { VALIDATION_RULES } from './validation'
import { calculateLTV, isMIPRequired } from './calculations'

// React Hook Form validation rules that leverage existing validation constants
export const FORM_VALIDATION_RULES = {
  currentMortgageBalance: {
    required: 'Mortgage balance is required',
    min: {
      value: VALIDATION_RULES.mortgageBalance.min,
      message: `Minimum balance is $${VALIDATION_RULES.mortgageBalance.min.toLocaleString()}`
    },
    max: {
      value: VALIDATION_RULES.mortgageBalance.max,
      message: `Maximum balance is $${VALIDATION_RULES.mortgageBalance.max.toLocaleString()}`
    },
    validate: {
      realistic: (value: string) => {
        const numValue = parseFloat(value.replace(/[,$]/g, ''))
        if (isNaN(numValue)) return 'Please enter a valid number'
        if (numValue < 50000) return 'This seems low for a mortgage balance. Please verify.'
        if (numValue > 2000000) return 'This is a very high mortgage balance. Please verify.'
        return true
      },
      positive: (value: string) => {
        const numValue = parseFloat(value.replace(/[,$]/g, ''))
        return numValue > 0 || 'Mortgage balance must be positive'
      }
    }
  },

  currentInterestRate: {
    required: 'Interest rate is required',
    min: {
      value: VALIDATION_RULES.interestRate.min * 100, // Convert to percentage
      message: `Minimum rate is ${(VALIDATION_RULES.interestRate.min * 100).toFixed(1)}%`
    },
    max: {
      value: VALIDATION_RULES.interestRate.max * 100, // Convert to percentage  
      message: `Maximum rate is ${(VALIDATION_RULES.interestRate.max * 100).toFixed(1)}%`
    },
    validate: {
      realistic: (value: string) => {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return 'Please enter a valid interest rate'
        if (numValue < 2) return 'This rate seems very low. Please verify.'
        if (numValue > 15) return 'This rate seems very high. Please verify.'
        return true
      }
    }
  },

  remainingTermMonths: {
    required: 'Remaining term is required',
    min: {
      value: VALIDATION_RULES.termMonths.min,
      message: `Minimum term is ${VALIDATION_RULES.termMonths.min} months`
    },
    max: {
      value: VALIDATION_RULES.termMonths.max,
      message: `Maximum term is ${VALIDATION_RULES.termMonths.max} months`
    },
    validate: {
      wholeNumber: (value: string) => {
        const numValue = parseFloat(value)
        return Number.isInteger(numValue) || 'Term must be a whole number of months'
      }
    }
  },

  monthlyPayment: {
    required: 'Monthly payment is required',
    min: {
      value: VALIDATION_RULES.monthlyPayment.min,
      message: `Minimum payment is $${VALIDATION_RULES.monthlyPayment.min}`
    },
    max: {
      value: VALIDATION_RULES.monthlyPayment.max,
      message: `Maximum payment is $${VALIDATION_RULES.monthlyPayment.max.toLocaleString()}`
    },
    validate: {
      reasonable: (value: string, formValues: any) => {
        const payment = parseFloat(value.replace(/[,$]/g, ''))
        const balance = parseFloat(formValues.currentMortgageBalance?.replace(/[,$]/g, '') || '0')
        
        if (isNaN(payment)) return 'Please enter a valid payment amount'
        if (balance > 0 && payment < balance * 0.002) {
          return 'Payment seems very low relative to balance. Please verify.'
        }
        return true
      }
    }
  },

  helocLimit: {
    min: {
      value: VALIDATION_RULES.helocLimit.min,
      message: `Minimum HELOC limit is $${VALIDATION_RULES.helocLimit.min.toLocaleString()}`
    },
    max: {
      value: VALIDATION_RULES.helocLimit.max,
      message: `Maximum HELOC limit is $${VALIDATION_RULES.helocLimit.max.toLocaleString()}`
    },
    validate: {
      reasonable: (value: string, formValues: any) => {
        if (!value) return true // Optional field
        
        const helocLimit = parseFloat(value.replace(/[,$]/g, ''))
        const mortgageBalance = parseFloat(formValues.currentMortgageBalance?.replace(/[,$]/g, '') || '0')
        
        if (isNaN(helocLimit)) return 'Please enter a valid HELOC limit'
        
        // Typical HELOC limits are 80% of home value, warn if seems high relative to mortgage
        if (mortgageBalance > 0 && helocLimit > mortgageBalance * 1.2) {
          return 'HELOC limit seems high relative to mortgage balance. Please verify.'
        }
        return true
      }
    }
  },

  helocInterestRate: {
    min: {
      value: VALIDATION_RULES.interestRate.min * 100,
      message: `Minimum HELOC rate is ${(VALIDATION_RULES.interestRate.min * 100).toFixed(1)}%`
    },
    max: {
      value: VALIDATION_RULES.interestRate.max * 100,
      message: `Maximum HELOC rate is ${(VALIDATION_RULES.interestRate.max * 100).toFixed(1)}%`
    },
    validate: {
      reasonable: (value: string, formValues: any) => {
        if (!value) return true // Optional field
        
        const helocRate = parseFloat(value)
        const mortgageRate = parseFloat(formValues.currentInterestRate || '0')
        
        if (isNaN(helocRate)) return 'Please enter a valid HELOC rate'
        
        // HELOC rates are typically higher than mortgage rates
        if (mortgageRate > 0 && helocRate < mortgageRate - 2) {
          return 'HELOC rate is typically higher than mortgage rate. Please verify.'
        }
        return true
      }
    }
  },

  monthlyIncome: {
    required: 'Monthly income is required',
    min: {
      value: VALIDATION_RULES.income.min,
      message: `Minimum income is $${VALIDATION_RULES.income.min.toLocaleString()}`
    },
    max: {
      value: VALIDATION_RULES.income.max,
      message: `Maximum income is $${VALIDATION_RULES.income.max.toLocaleString()}`
    }
  },

  monthlyExpenses: {
    required: 'Monthly expenses are required',
    min: {
      value: VALIDATION_RULES.expenses.min,
      message: 'Expenses cannot be negative'
    },
    max: {
      value: VALIDATION_RULES.expenses.max,
      message: `Maximum expenses is $${VALIDATION_RULES.expenses.max.toLocaleString()}`
    },
    validate: {
      reasonable: (value: string, formValues: any) => {
        const expenses = parseFloat(value.replace(/[,$]/g, ''))
        const income = parseFloat(formValues.monthlyIncome?.replace(/[,$]/g, '') || '0')
        
        if (isNaN(expenses)) return 'Please enter valid expenses'
        
        if (income > 0 && expenses >= income) {
          return 'Expenses should be less than income for HELOC acceleration to work'
        }
        return true
      }
    }
  },

  monthlyDiscretionaryIncome: {
    min: {
      value: 0,
      message: 'Discretionary income cannot be negative'
    },
    validate: {
      calculated: (value: string, formValues: any) => {
        const discretionary = parseFloat(value.replace(/[,$]/g, '') || '0')
        const income = parseFloat(formValues.monthlyIncome?.replace(/[,$]/g, '') || '0')
        const expenses = parseFloat(formValues.monthlyExpenses?.replace(/[,$]/g, '') || '0')
        const payment = parseFloat(formValues.monthlyPayment?.replace(/[,$]/g, '') || '0')
        
        const calculated = income - expenses - payment
        
        if (Math.abs(discretionary - calculated) > 10) {
          return `Discretionary income should be approximately $${calculated.toFixed(0)} (Income - Expenses - Mortgage Payment)`
        }
        return true
      }
    }
  },

  pmiMonthly: {
    min: {
      value: VALIDATION_RULES.pmiMonthly.min,
      message: `Minimum MIP/PMI is $${VALIDATION_RULES.pmiMonthly.min}`
    },
    max: {
      value: VALIDATION_RULES.pmiMonthly.max,
      message: `Maximum MIP/PMI is $${VALIDATION_RULES.pmiMonthly.max.toLocaleString()}`
    },
    validate: {
      ltvBased: (value: string, formValues: any) => {
        if (!value) return true // Optional field when not required

        const pmi = parseFloat(value.replace(/[,$]/g, ''))
        const mortgageBalance = parseFloat(formValues.currentMortgageBalance?.replace(/[,$]/g, '') || '0')
        const propertyValue = parseFloat(formValues.propertyValue?.replace(/[,$]/g, '') || '0')

        if (isNaN(pmi)) return 'Please enter a valid MIP/PMI amount'

        // If we have both mortgage balance and property value, validate based on LTV
        if (mortgageBalance > 0 && propertyValue > 0) {
          try {
            const ltvRatio = calculateLTV(mortgageBalance, propertyValue)

            // If LTV > 80% and no PMI provided, suggest it's required
            if (isMIPRequired(ltvRatio) && pmi === 0) {
              return `MIP/PMI is typically required when LTV exceeds 80% (current LTV: ${ltvRatio.toFixed(1)}%)`
            }

            // If LTV <= 80% and PMI is provided, suggest it may not be needed
            if (!isMIPRequired(ltvRatio) && pmi > 0) {
              return `MIP/PMI may not be required when LTV is ${ltvRatio.toFixed(1)}% (≤80%)`
            }
          } catch (error) {
            // LTV calculation failed, skip LTV-based validation
            console.warn('LTV calculation failed during form validation:', error)
          }
        }

        return true
      }
    }
  }
}

// Helper function to get validation hints for users
export function getValidationHint(fieldName: string): string {
  const hints: Record<string, string> = {
    currentMortgageBalance: 'Enter your current mortgage principal balance',
    currentInterestRate: 'Enter as percentage (e.g., 6.5 for 6.5%)',
    remainingTermMonths: 'Number of months remaining on your mortgage',
    monthlyPayment: 'Your current monthly mortgage payment (P&I)',
    helocLimit: 'Maximum credit line available (optional)',
    helocInterestRate: 'HELOC interest rate as percentage (optional)',
    monthlyIncome: 'Your total monthly gross income',
    monthlyExpenses: 'All monthly expenses except mortgage payment',
    monthlyDiscretionaryIncome: 'Income minus expenses minus mortgage payment',
    pmiMonthly: 'Monthly MIP/PMI payment (required when LTV > 80%)',
    propertyValue: 'Current estimated value of your property'
  }
  
  return hints[fieldName] || ''
}

// Cross-field validation rules
export function validateCrossFields(formValues: any) {
  const errors: Record<string, string> = {}
  
  const income = parseFloat(formValues.monthlyIncome?.replace(/[,$]/g, '') || '0')
  const expenses = parseFloat(formValues.monthlyExpenses?.replace(/[,$]/g, '') || '0')
  const payment = parseFloat(formValues.monthlyPayment?.replace(/[,$]/g, '') || '0')
  const discretionary = parseFloat(formValues.monthlyDiscretionaryIncome?.replace(/[,$]/g, '') || '0')
  
  // Check if discretionary income calculation makes sense
  const calculatedDiscretionary = income - expenses - payment
  if (Math.abs(discretionary - calculatedDiscretionary) > 50) {
    errors.monthlyDiscretionaryIncome = `Should be approximately $${calculatedDiscretionary.toFixed(0)}`
  }
  
  // Check debt-to-income ratio
  const totalDebt = payment + expenses
  if (income > 0 && (totalDebt / income) > 0.5) {
    errors.monthlyExpenses = 'Total debt payments exceed 50% of income - this may limit HELOC options'
  }
  
  return errors
}
