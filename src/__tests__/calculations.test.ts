import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateHELOCAcceleration,
  compareStrategies,
  calculateRemainingBalance,
  calculateAcceleratedPayoff,
  type MortgageInput,
  type HELOCInput,
  type AmortizationSchedule,
  type HELOCCalculationResult
} from '@/lib/calculations'

describe('Mortgage Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    test('should calculate correct payment for standard 30-year mortgage', () => {
      // Test case: $300,000 loan at 6.5% for 30 years
      const principal = 300000
      const annualRate = 0.065
      const termMonths = 360

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      // Expected payment should be around $1,896
      expect(payment).toBeCloseTo(1896.20, 2)
    })

    test('should handle zero interest rate', () => {
      const principal = 300000
      const annualRate = 0
      const termMonths = 360

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      // With 0% interest, payment should be principal / months
      expect(payment).toBeCloseTo(833.33, 2)
    })

    test('should calculate correct payment for 15-year mortgage', () => {
      const principal = 250000
      const annualRate = 0.055
      const termMonths = 180

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      // Expected payment should be around $2,042
      expect(payment).toBeCloseTo(2042.71, 2)
    })

    test('should handle high interest rates', () => {
      const principal = 100000
      const annualRate = 0.15 // 15%
      const termMonths = 360

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      expect(payment).toBeGreaterThan(1000)
      expect(payment).toBeLessThan(2000)
      expect(isFinite(payment)).toBe(true)
    })

    test('should handle very low interest rates', () => {
      const principal = 200000
      const annualRate = 0.01 // 1%
      const termMonths = 360

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      expect(payment).toBeGreaterThan(500)
      expect(payment).toBeLessThan(700)
    })

    test('should handle short loan terms', () => {
      const principal = 50000
      const annualRate = 0.06
      const termMonths = 12

      const payment = calculateMonthlyPayment(principal, annualRate, termMonths)

      expect(payment).toBeGreaterThan(4000)
      expect(payment).toBeLessThan(5000)
    })
  })

  describe('generateAmortizationSchedule', () => {
    test('should create valid schedule for standard mortgage', () => {
      const input: MortgageInput = {
        principal: 100000,
        annualInterestRate: 0.06,
        termInMonths: 120, // 10 years
        currentBalance: 100000
      }

      const schedule = generateAmortizationSchedule(input)

      expect(schedule.schedule).toHaveLength(120)
      expect(schedule.schedule[0].beginningBalance).toBe(100000)
      expect(schedule.schedule[119].endingBalance).toBeCloseTo(0, 2)
      expect(schedule.payoffMonths).toBe(120)

      // Check that cumulative principal equals original balance
      const lastPayment = schedule.schedule[119]
      expect(lastPayment.cumulativePrincipal).toBeCloseTo(100000, 2)
    })

    test('should handle partial balance (refinanced mortgage)', () => {
      const input: MortgageInput = {
        principal: 200000,
        annualInterestRate: 0.055,
        termInMonths: 360,
        currentBalance: 150000 // Partially paid down
      }

      const schedule = generateAmortizationSchedule(input)

      expect(schedule.schedule[0].beginningBalance).toBe(150000)
      expect(schedule.schedule[schedule.schedule.length - 1].endingBalance).toBeCloseTo(0, 2)

      // Should pay off faster than original term since balance is lower
      expect(schedule.payoffMonths).toBeLessThan(360)
    })

    test('should handle custom monthly payment', () => {
      const input: MortgageInput = {
        principal: 200000,
        annualInterestRate: 0.06,
        termInMonths: 360,
        currentBalance: 200000,
        monthlyPayment: 1500 // Higher than standard payment
      }

      const schedule = generateAmortizationSchedule(input)
      const standardPayment = calculateMonthlyPayment(200000, 0.06, 360)

      expect(input.monthlyPayment).toBeGreaterThan(standardPayment)
      expect(schedule.payoffMonths).toBeLessThan(360) // Should pay off faster
      expect(schedule.monthlyPayment).toBe(1500)
    })

    test('should maintain balance consistency throughout schedule', () => {
      const input: MortgageInput = {
        principal: 150000,
        annualInterestRate: 0.065,
        termInMonths: 240
      }

      const schedule = generateAmortizationSchedule(input)

      // Check balance consistency for each payment
      for (let i = 0; i < schedule.schedule.length; i++) {
        const payment = schedule.schedule[i]

        expect(payment.beginningBalance).toBeGreaterThanOrEqual(0)
        expect(payment.endingBalance).toBeGreaterThanOrEqual(0)
        expect(payment.principalPayment).toBeGreaterThanOrEqual(0)
        expect(payment.interestPayment).toBeGreaterThanOrEqual(0)

        // Ending balance should equal beginning balance minus principal payment
        expect(payment.endingBalance).toBeCloseTo(
          payment.beginningBalance - payment.principalPayment,
          2
        )

        // Payment should equal principal + interest
        expect(payment.paymentAmount).toBeCloseTo(
          payment.principalPayment + payment.interestPayment,
          2
        )
      }
    })

    test('should calculate cumulative totals correctly', () => {
      const input: MortgageInput = {
        principal: 100000,
        annualInterestRate: 0.05,
        termInMonths: 120
      }

      const schedule = generateAmortizationSchedule(input)
      const lastPayment = schedule.schedule[schedule.schedule.length - 1]

      // Cumulative principal should equal original principal
      expect(lastPayment.cumulativePrincipal).toBeCloseTo(100000, 2)

      // Total interest should match schedule total
      expect(lastPayment.cumulativeInterest).toBeCloseTo(schedule.totalInterest, 2)

      // Total payments should equal principal + interest
      expect(schedule.totalPayments).toBeCloseTo(
        lastPayment.cumulativePrincipal + lastPayment.cumulativeInterest,
        2
      )
    })
  })

  describe('calculateRemainingBalance', () => {
    test('should calculate correct remaining balance', () => {
      const principal = 200000
      const annualRate = 0.06
      const termMonths = 360
      const monthsPaid = 60 // 5 years

      const remainingBalance = calculateRemainingBalance(principal, annualRate, termMonths, monthsPaid)

      expect(remainingBalance).toBeGreaterThan(0)
      expect(remainingBalance).toBeLessThan(principal)

      // Should be around $186,000 after 5 years (adjusted for actual calculation)
      expect(remainingBalance).toBeCloseTo(186000, -3) // Within $1000
    })

    test('should return zero for fully paid loan', () => {
      const remainingBalance = calculateRemainingBalance(100000, 0.05, 120, 120)
      expect(remainingBalance).toBe(0)
    })

    test('should return full principal for zero payments', () => {
      const principal = 150000
      const remainingBalance = calculateRemainingBalance(principal, 0.06, 360, 0)
      expect(remainingBalance).toBe(principal)
    })

    test('should handle overpayment scenario', () => {
      const remainingBalance = calculateRemainingBalance(100000, 0.05, 120, 150)
      expect(remainingBalance).toBe(0)
    })
  })
})

describe('HELOC Calculations', () => {
  describe('calculateHELOCAcceleration', () => {
    test('should reduce payoff time with discretionary income', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.075, // Higher than HELOC rate to trigger HELOC usage
        mortgagePayment: 1500,
        helocLimit: 50000,
        helocRate: 0.065, // Lower than mortgage rate
        discretionaryIncome: 1000
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.payoffMonths).toBeLessThan(360) // Should be less than 30 years
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.schedule.length).toBe(result.payoffMonths)
      expect(result.maxHelocUsed).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBeLessThanOrEqual(input.helocLimit)
    })

    test('should handle scenario with no discretionary income', () => {
      const input: HELOCInput = {
        mortgageBalance: 150000,
        mortgageRate: 0.06,
        mortgagePayment: 1200,
        helocLimit: 30000,
        helocRate: 0.07,
        discretionaryIncome: 0
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBe(0) // No HELOC should be used without discretionary income
    })

    test('should handle high discretionary income scenario', () => {
      const input: HELOCInput = {
        mortgageBalance: 300000,
        mortgageRate: 0.075, // Higher than HELOC rate
        mortgagePayment: 2000,
        helocLimit: 100000,
        helocRate: 0.065, // Lower than mortgage rate
        discretionaryIncome: 3000 // High discretionary income
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.payoffMonths).toBeLessThan(180) // Should pay off much faster
      expect(result.maxHelocUsed).toBeGreaterThan(0)
    })

    test('should handle HELOC rate higher than mortgage rate', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.055, // Lower mortgage rate
        mortgagePayment: 1400,
        helocLimit: 50000,
        helocRate: 0.085, // Higher HELOC rate
        discretionaryIncome: 800
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.totalInterest).toBeGreaterThan(0)
      // Should still provide some benefit due to discretionary income acceleration
    })

    test('should handle limited HELOC availability', () => {
      const input: HELOCInput = {
        mortgageBalance: 400000,
        mortgageRate: 0.065,
        mortgagePayment: 2500,
        helocLimit: 10000, // Very limited HELOC
        helocRate: 0.075,
        discretionaryIncome: 1500
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBeLessThanOrEqual(10000)
    })

    test('should maintain balance consistency in HELOC schedule', () => {
      const input: HELOCInput = {
        mortgageBalance: 250000,
        mortgageRate: 0.06,
        mortgagePayment: 1800,
        helocLimit: 60000,
        helocRate: 0.07,
        discretionaryIncome: 1200
      }

      const result = calculateHELOCAcceleration(input)

      // Check balance consistency for each payment
      for (let i = 0; i < Math.min(result.schedule.length, 12); i++) { // Check first year
        const payment = result.schedule[i]

        expect(payment.beginningBalance).toBeGreaterThanOrEqual(0)
        expect(payment.endingBalance).toBeGreaterThanOrEqual(0)
        expect(payment.helocBalance).toBeGreaterThanOrEqual(0)
        expect(payment.helocBalance).toBeLessThanOrEqual(input.helocLimit)
        expect(payment.principalPayment).toBeGreaterThanOrEqual(0)
        expect(payment.interestPayment).toBeGreaterThanOrEqual(0)
        expect(payment.helocInterest).toBeGreaterThanOrEqual(0)
        expect(payment.totalMonthlyPayment).toBeGreaterThan(0)
      }
    })

    test('should calculate average HELOC balance correctly', () => {
      const input: HELOCInput = {
        mortgageBalance: 180000,
        mortgageRate: 0.075, // Higher than HELOC rate to trigger usage
        mortgagePayment: 1400,
        helocLimit: 40000,
        helocRate: 0.065, // Lower than mortgage rate
        discretionaryIncome: 900
      }

      const result = calculateHELOCAcceleration(input)

      // The average should be calculated correctly
      expect(result.averageHelocBalance).toBeGreaterThanOrEqual(0)
      expect(result.averageHelocBalance).toBeLessThanOrEqual(result.maxHelocUsed)

      // If HELOC was used, average should be greater than 0
      if (result.maxHelocUsed > 0) {
        expect(result.averageHelocBalance).toBeGreaterThan(0)
      }
    })
  })

  describe('compareStrategies', () => {
    test('should show HELOC benefits when advantageous', () => {
      const mortgageInput: MortgageInput = {
        principal: 200000,
        annualInterestRate: 0.065,
        termInMonths: 300,
        currentBalance: 200000,
        monthlyPayment: 1500
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: 1500,
        helocLimit: 50000,
        helocRate: 0.075,
        discretionaryIncome: 1000
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      expect(comparison.traditional.payoffMonths).toBeGreaterThan(0)
      expect(comparison.heloc.payoffMonths).toBeGreaterThan(0)
      expect(comparison.comparison.timeSavedMonths).toBeGreaterThanOrEqual(0)
      expect(comparison.comparison.interestSaved).toBeGreaterThanOrEqual(0)

      // HELOC should generally pay off faster with discretionary income
      expect(comparison.heloc.payoffMonths).toBeLessThanOrEqual(comparison.traditional.payoffMonths)
    })

    test('should handle scenario where HELOC provides minimal benefit', () => {
      const mortgageInput: MortgageInput = {
        principal: 100000,
        annualInterestRate: 0.04, // Very low mortgage rate
        termInMonths: 180,
        currentBalance: 100000
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 100000,
        mortgageRate: 0.04,
        mortgagePayment: calculateMonthlyPayment(100000, 0.04, 180),
        helocLimit: 20000,
        helocRate: 0.09, // Much higher HELOC rate
        discretionaryIncome: 200 // Low discretionary income
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      expect(comparison.traditional.payoffMonths).toBeGreaterThan(0)
      expect(comparison.heloc.payoffMonths).toBeGreaterThan(0)

      // Benefits should be minimal or none
      expect(comparison.comparison.timeSavedMonths).toBeGreaterThanOrEqual(0)
    })

    test('should calculate percentage savings correctly', () => {
      const mortgageInput: MortgageInput = {
        principal: 300000,
        annualInterestRate: 0.065,
        termInMonths: 360,
        currentBalance: 300000
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 300000,
        mortgageRate: 0.065,
        mortgagePayment: calculateMonthlyPayment(300000, 0.065, 360),
        helocLimit: 75000,
        helocRate: 0.075,
        discretionaryIncome: 1500
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      if (comparison.comparison.interestSaved > 0) {
        const expectedPercentage = (comparison.comparison.interestSaved / comparison.traditional.totalInterest) * 100
        expect(comparison.comparison.percentageInterestSaved).toBeCloseTo(expectedPercentage, 1)
      }
    })

    test('should handle equal mortgage and HELOC rates', () => {
      const rate = 0.065
      const mortgageInput: MortgageInput = {
        principal: 250000,
        annualInterestRate: rate,
        termInMonths: 300,
        currentBalance: 250000
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 250000,
        mortgageRate: rate,
        mortgagePayment: calculateMonthlyPayment(250000, rate, 300),
        helocLimit: 60000,
        helocRate: rate, // Same rate
        discretionaryIncome: 1000
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      expect(comparison.traditional.payoffMonths).toBeGreaterThan(0)
      expect(comparison.heloc.payoffMonths).toBeGreaterThan(0)

      // Should still provide benefit due to discretionary income acceleration
      expect(comparison.comparison.timeSavedMonths).toBeGreaterThan(0)
    })
  })
})

describe('Edge Cases and Boundary Conditions', () => {
  describe('Extreme Values', () => {
    test('should handle very small loan amounts', () => {
      const payment = calculateMonthlyPayment(1000, 0.05, 12)
      expect(payment).toBeGreaterThan(0)
      expect(payment).toBeLessThan(1000)
      expect(isFinite(payment)).toBe(true)
    })

    test('should handle very large loan amounts', () => {
      const payment = calculateMonthlyPayment(10000000, 0.06, 360) // $10M loan
      expect(payment).toBeGreaterThan(50000)
      expect(isFinite(payment)).toBe(true)
    })

    test('should handle very high interest rates', () => {
      const payment = calculateMonthlyPayment(100000, 0.25, 360) // 25% rate
      expect(payment).toBeGreaterThan(2000)
      expect(isFinite(payment)).toBe(true)
    })

    test('should handle very low interest rates', () => {
      const payment = calculateMonthlyPayment(200000, 0.001, 360) // 0.1% rate
      expect(payment).toBeGreaterThan(550)
      expect(payment).toBeLessThan(600)
      expect(isFinite(payment)).toBe(true)
    })

    test('should handle short loan terms', () => {
      const schedule = generateAmortizationSchedule({
        principal: 50000,
        annualInterestRate: 0.06,
        termInMonths: 12
      })

      expect(schedule.schedule).toHaveLength(12)
      expect(schedule.schedule[11].endingBalance).toBeCloseTo(0, 2)
    })

    test('should handle very long loan terms', () => {
      const schedule = generateAmortizationSchedule({
        principal: 200000,
        annualInterestRate: 0.05,
        termInMonths: 600 // 50 years
      })

      expect(schedule.schedule.length).toBeLessThanOrEqual(600)
      expect(schedule.schedule[schedule.schedule.length - 1].endingBalance).toBeCloseTo(0, 2)
    })
  })

  describe('Mathematical Edge Cases', () => {
    test('should handle rounding precision correctly', () => {
      const input: MortgageInput = {
        principal: 199999.99,
        annualInterestRate: 0.065001,
        termInMonths: 359
      }

      const schedule = generateAmortizationSchedule(input)
      const lastPayment = schedule.schedule[schedule.schedule.length - 1]

      expect(lastPayment.endingBalance).toBeCloseTo(0, 2)
      expect(lastPayment.cumulativePrincipal).toBeCloseTo(input.principal, 2)
    })

    test('should handle near-zero balances correctly', () => {
      const input: MortgageInput = {
        principal: 100000,
        annualInterestRate: 0.06,
        termInMonths: 360,
        currentBalance: 0.50 // Very small remaining balance
      }

      const schedule = generateAmortizationSchedule(input)

      expect(schedule.schedule.length).toBe(1)
      expect(schedule.schedule[0].endingBalance).toBeCloseTo(0, 2)
    })

    test('should prevent infinite loops with invalid inputs', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: 100, // Payment too small to cover interest
        helocLimit: 50000,
        helocRate: 0.075,
        discretionaryIncome: 0
      }

      const result = calculateHELOCAcceleration(input)

      // Should complete within reasonable time (max 600 months)
      expect(result.payoffMonths).toBeLessThanOrEqual(600)
    })
  })

  describe('HELOC Edge Cases', () => {
    test('should handle HELOC limit equal to mortgage balance', () => {
      const mortgageBalance = 150000
      const input: HELOCInput = {
        mortgageBalance,
        mortgageRate: 0.065,
        mortgagePayment: 1200,
        helocLimit: mortgageBalance, // HELOC limit equals mortgage
        helocRate: 0.075,
        discretionaryIncome: 800
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBeLessThanOrEqual(mortgageBalance)
    })

    test('should handle HELOC limit much larger than mortgage', () => {
      const input: HELOCInput = {
        mortgageBalance: 100000,
        mortgageRate: 0.065,
        mortgagePayment: 800,
        helocLimit: 500000, // Very large HELOC
        helocRate: 0.075,
        discretionaryIncome: 1000
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBeLessThan(input.helocLimit)
    })

    test('should handle very small HELOC limit', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: 1500,
        helocLimit: 1000, // Very small HELOC
        helocRate: 0.075,
        discretionaryIncome: 800
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBeLessThanOrEqual(1000)
    })

    test('should handle zero HELOC limit', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: 1500,
        helocLimit: 0, // No HELOC available
        helocRate: 0.075,
        discretionaryIncome: 800
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.maxHelocUsed).toBe(0)
      expect(result.totalHelocInterest).toBe(0)
    })

    test('should handle very high discretionary income', () => {
      const input: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: 1500,
        helocLimit: 50000,
        helocRate: 0.075,
        discretionaryIncome: 10000 // Very high discretionary income
      }

      const result = calculateHELOCAcceleration(input)

      expect(result.payoffMonths).toBeGreaterThan(0)
      expect(result.payoffMonths).toBeLessThan(60) // Should pay off very quickly
    })
  })

  describe('Comparison Edge Cases', () => {
    test('should handle identical mortgage and HELOC scenarios', () => {
      const mortgageInput: MortgageInput = {
        principal: 200000,
        annualInterestRate: 0.065,
        termInMonths: 360,
        currentBalance: 200000
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 200000,
        mortgageRate: 0.065,
        mortgagePayment: calculateMonthlyPayment(200000, 0.065, 360),
        helocLimit: 0, // No HELOC
        helocRate: 0.065,
        discretionaryIncome: 0 // No extra income
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      // Should be nearly identical
      expect(comparison.comparison.timeSavedMonths).toBeCloseTo(0, 0)
      expect(comparison.comparison.interestSaved).toBeCloseTo(0, 0)
    })

    test('should handle scenario where HELOC is disadvantageous', () => {
      const mortgageInput: MortgageInput = {
        principal: 150000,
        annualInterestRate: 0.03, // Very low mortgage rate
        termInMonths: 180,
        currentBalance: 150000
      }

      const helocInput: HELOCInput = {
        mortgageBalance: 150000,
        mortgageRate: 0.03,
        mortgagePayment: calculateMonthlyPayment(150000, 0.03, 180),
        helocLimit: 30000,
        helocRate: 0.12, // Very high HELOC rate
        discretionaryIncome: 300
      }

      const comparison = compareStrategies(mortgageInput, helocInput)

      // HELOC might not provide benefits or could be worse
      expect(comparison.traditional.payoffMonths).toBeGreaterThan(0)
      expect(comparison.heloc.payoffMonths).toBeGreaterThan(0)
    })
  })

  describe('Input Validation Edge Cases', () => {
    test('should handle negative values gracefully', () => {
      // These should not crash, though results may not be meaningful
      expect(() => {
        calculateMonthlyPayment(-100000, 0.05, 360)
      }).not.toThrow()

      expect(() => {
        calculateMonthlyPayment(100000, -0.05, 360)
      }).not.toThrow()
    })

    test('should handle zero term gracefully', () => {
      expect(() => {
        calculateMonthlyPayment(100000, 0.05, 0)
      }).not.toThrow()
    })

    test('should handle very large numbers', () => {
      const payment = calculateMonthlyPayment(Number.MAX_SAFE_INTEGER / 1000, 0.05, 360)
      expect(isFinite(payment)).toBe(true)
    })
  })
})