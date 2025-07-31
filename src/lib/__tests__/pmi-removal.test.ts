import { generateAmortizationSchedule, calculateHELOCAcceleration } from '../calculations'

describe('PMI Removal at 78% LTV', () => {
  describe('Traditional Mortgage', () => {
    it('should automatically remove PMI when LTV reaches 78%', () => {
      const input = {
        principal: 400000,
        annualInterestRate: 0.065,
        termInMonths: 360,
        currentBalance: 400000,
        propertyValue: 500000, // 80% LTV at start
        pmiMonthly: 200
      }

      const result = generateAmortizationSchedule(input)
      
      // Find the month where LTV reaches 78%
      let pmiRemovedMonth = -1
      let lastPmiPayment = -1
      
      for (let i = 0; i < result.schedule.length; i++) {
        const payment = result.schedule[i]
        const ltv = payment.currentLTV || 100
        
        if (payment.pmiPayment === 200) {
          lastPmiPayment = payment.month
        }
        
        if (ltv <= 78 && pmiRemovedMonth === -1 && payment.pmiPayment === 0) {
          pmiRemovedMonth = payment.month
          break
        }
      }
      
      // PMI should be removed at some point
      expect(pmiRemovedMonth).toBeGreaterThan(0)
      expect(lastPmiPayment).toBeGreaterThan(0)
      expect(pmiRemovedMonth).toBeGreaterThan(lastPmiPayment)
      
      // Verify PMI is 0 after removal
      const afterRemoval = result.schedule.find(p => p.month === pmiRemovedMonth + 1)
      expect(afterRemoval?.pmiPayment).toBe(0)
    })

    it('should not charge PMI when starting LTV is below 78%', () => {
      const input = {
        principal: 350000,
        annualInterestRate: 0.065,
        termInMonths: 360,
        currentBalance: 350000,
        propertyValue: 500000, // 70% LTV at start
        pmiMonthly: 200
      }

      const result = generateAmortizationSchedule(input)
      
      // PMI should be 0 from the start
      expect(result.schedule[0].pmiPayment).toBe(0)
      expect(result.schedule[result.schedule.length - 1].pmiPayment).toBe(0)
    })
  })

  describe('HELOC Acceleration', () => {
    it('should automatically remove PMI when LTV reaches 78% with HELOC', () => {
      const input = {
        mortgageBalance: 400000,
        mortgageRate: 0.065,
        mortgagePayment: 2530,
        helocLimit: 50000,
        helocRate: 0.0725,
        discretionaryIncome: 1000,
        propertyValue: 500000, // 80% LTV at start
        pmiMonthly: 200
      }

      const result = calculateHELOCAcceleration(input)
      
      // Find the month where LTV reaches 78%
      let pmiRemovedMonth = -1
      let foundRemoval = false
      
      for (let i = 0; i < result.schedule.length; i++) {
        const payment = result.schedule[i]
        const ltv = (payment.endingBalance / input.propertyValue) * 100
        
        if (ltv <= 78 && !foundRemoval && payment.pmiPayment === 0) {
          pmiRemovedMonth = payment.month
          foundRemoval = true
          break
        }
      }
      
      // PMI should be removed at some point (and earlier than traditional due to acceleration)
      expect(pmiRemovedMonth).toBeGreaterThan(0)
      expect(pmiRemovedMonth).toBeLessThan(result.schedule.length)
      
      // Verify PMI is consistently 0 after removal
      const afterRemovalPayments = result.schedule.filter(p => p.month > pmiRemovedMonth)
      afterRemovalPayments.forEach(payment => {
        expect(payment.pmiPayment).toBe(0)
      })
    })

    it('should show PMI savings in HELOC vs traditional comparison', () => {
      const mortgageInput = {
        principal: 400000,
        annualInterestRate: 0.065,
        termInMonths: 360,
        currentBalance: 400000,
        propertyValue: 500000,
        pmiMonthly: 200
      }

      const helocInput = {
        mortgageBalance: 400000,
        mortgageRate: 0.065,
        mortgagePayment: 2530,
        helocLimit: 50000,
        helocRate: 0.0725,
        discretionaryIncome: 1000,
        propertyValue: 500000,
        pmiMonthly: 200
      }

      const traditionalResult = generateAmortizationSchedule(mortgageInput)
      const helocResult = calculateHELOCAcceleration(helocInput)

      // Calculate total PMI paid in each scenario
      const traditionalPmiTotal = traditionalResult.schedule.reduce(
        (sum, payment) => sum + (payment.pmiPayment || 0), 0
      )
      const helocPmiTotal = helocResult.schedule.reduce(
        (sum, payment) => sum + payment.pmiPayment, 0
      )

      // HELOC should result in less total PMI paid due to faster principal reduction
      expect(helocPmiTotal).toBeLessThan(traditionalPmiTotal)
      expect(helocPmiTotal).toBeGreaterThan(0) // But should still pay some PMI initially
    })
  })
})