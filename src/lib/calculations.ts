// Mortgage and HELOC calculation utilities

export interface MortgageInput {
  principal: number
  annualInterestRate: number
  termInMonths: number
  currentBalance?: number
  monthlyPayment?: number
}

export interface MonthlyPayment {
  month: number
  beginningBalance: number
  paymentAmount: number
  principalPayment: number
  interestPayment: number
  endingBalance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

export interface AmortizationSchedule {
  monthlyPayment: number
  totalInterest: number
  totalPayments: number
  payoffMonths: number
  schedule: MonthlyPayment[]
}

/**
 * Calculate monthly mortgage payment using the standard formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termInMonths: number
): number {
  if (annualInterestRate === 0) {
    return principal / termInMonths
  }

  const monthlyRate = annualInterestRate / 12
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termInMonths)
  const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1

  return principal * (numerator / denominator)
}

/**
 * Generate complete amortization schedule for a traditional mortgage
 */
export function generateAmortizationSchedule(input: MortgageInput): AmortizationSchedule {
  const {
    principal,
    annualInterestRate,
    termInMonths,
    currentBalance = principal,
    monthlyPayment: providedPayment
  } = input

  const monthlyRate = annualInterestRate / 12
  const monthlyPayment = providedPayment || calculateMonthlyPayment(principal, annualInterestRate, termInMonths)

  const schedule: MonthlyPayment[] = []
  let balance = currentBalance
  let cumulativeInterest = 0
  let cumulativePrincipal = 0
  let month = 1

  while (balance > 0.01 && month <= termInMonths) {
    const interestPayment = balance * monthlyRate
    let principalPayment = monthlyPayment - interestPayment

    // Handle final payment
    if (principalPayment > balance) {
      principalPayment = balance
    }

    const actualPayment = principalPayment + interestPayment
    const endingBalance = balance - principalPayment

    cumulativeInterest += interestPayment
    cumulativePrincipal += principalPayment

    schedule.push({
      month,
      beginningBalance: balance,
      paymentAmount: actualPayment,
      principalPayment,
      interestPayment,
      endingBalance,
      cumulativeInterest,
      cumulativePrincipal
    })

    balance = endingBalance
    month++
  }

  return {
    monthlyPayment,
    totalInterest: cumulativeInterest,
    totalPayments: cumulativeInterest + cumulativePrincipal,
    payoffMonths: schedule.length,
    schedule
  }
}

/**
 * Calculate remaining balance at any point in the loan
 */
export function calculateRemainingBalance(
  principal: number,
  annualInterestRate: number,
  termInMonths: number,
  monthsPaid: number
): number {
  if (monthsPaid >= termInMonths) return 0
  if (monthsPaid <= 0) return principal

  const monthlyRate = annualInterestRate / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termInMonths)

  // Use the remaining balance formula
  const remainingMonths = termInMonths - monthsPaid
  const numerator = Math.pow(1 + monthlyRate, remainingMonths) - 1
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)

  return monthlyPayment * (numerator / denominator)
}

/**
 * Calculate how many months it would take to pay off a loan with extra payments
 */
export function calculatePayoffTimeWithExtraPayments(
  currentBalance: number,
  annualInterestRate: number,
  regularPayment: number,
  extraPayment: number = 0
): { months: number; totalInterest: number; schedule: MonthlyPayment[] } {
  const monthlyRate = annualInterestRate / 12
  const totalPayment = regularPayment + extraPayment

  const schedule: MonthlyPayment[] = []
  let balance = currentBalance
  let cumulativeInterest = 0
  let cumulativePrincipal = 0
  let month = 1

  while (balance > 0.01 && month <= 600) { // Max 50 years
    const interestPayment = balance * monthlyRate
    let principalPayment = totalPayment - interestPayment

    // Handle final payment
    if (principalPayment > balance) {
      principalPayment = balance
    }

    const actualPayment = principalPayment + interestPayment
    const endingBalance = balance - principalPayment

    cumulativeInterest += interestPayment
    cumulativePrincipal += principalPayment

    schedule.push({
      month,
      beginningBalance: balance,
      paymentAmount: actualPayment,
      principalPayment,
      interestPayment,
      endingBalance,
      cumulativeInterest,
      cumulativePrincipal
    })

    balance = endingBalance
    month++
  }

  return {
    months: schedule.length,
    totalInterest: cumulativeInterest,
    schedule
  }
}

// HELOC-specific interfaces and calculations

export interface HELOCInput {
  mortgageBalance: number
  mortgageRate: number
  mortgagePayment: number
  helocLimit: number
  helocRate: number
  discretionaryIncome: number
  helocAvailableCredit?: number
  propertyValue?: number
  pmiMonthly?: number
}

export interface HELOCMonthlyPayment extends MonthlyPayment {
  helocBalance: number
  helocPayment: number
  helocInterest: number
  totalMonthlyPayment: number
  discretionaryUsed: number
  pmiPayment: number
  currentEquityPercentage?: number
}

export interface HELOCCalculationResult {
  payoffMonths: number
  totalInterest: number
  totalHelocInterest: number
  totalMortgageInterest: number
  schedule: HELOCMonthlyPayment[]
  maxHelocUsed: number
  averageHelocBalance: number
}

/**
 * Calculate HELOC acceleration strategy
 * This implements the strategy where discretionary income is used to pay down the mortgage
 * using HELOC funds, then the discretionary income pays down the HELOC
 */
export function calculateHELOCAcceleration(input: HELOCInput): HELOCCalculationResult {
  const {
    mortgageBalance,
    mortgageRate,
    mortgagePayment,
    helocLimit,
    helocRate,
    discretionaryIncome,
    helocAvailableCredit = helocLimit,
    propertyValue,
    pmiMonthly = 0
  } = input

  const mortgageMonthlyRate = mortgageRate / 12
  const helocMonthlyRate = helocRate / 12

  const schedule: HELOCMonthlyPayment[] = []
  let mortgageBalanceRemaining = mortgageBalance
  let helocBalance = 0
  let month = 1
  let totalMortgageInterest = 0
  let totalHelocInterest = 0
  let maxHelocUsed = 0
  let totalHelocBalance = 0

  while (mortgageBalanceRemaining > 0.01 && month <= 600) { // Max 50 years
    const beginningMortgageBalance = mortgageBalanceRemaining
    const beginningHelocBalance = helocBalance

    // Calculate mortgage interest for this month
    const mortgageInterest = mortgageBalanceRemaining * mortgageMonthlyRate

    // Calculate HELOC interest for this month
    const helocInterest = helocBalance * helocMonthlyRate

    // Calculate PMI payment and equity percentage
    let currentPmiPayment = pmiMonthly
    let currentEquityPercentage = 0
    
    if (propertyValue && propertyValue > 0) {
      currentEquityPercentage = ((propertyValue - mortgageBalanceRemaining) / propertyValue) * 100
      // PMI is removed when equity reaches 20%
      if (currentEquityPercentage >= 20) {
        currentPmiPayment = 0
      }
    }

    // Determine how much discretionary income to use
    let discretionaryUsed = discretionaryIncome

    // Strategy: Use discretionary income to pay down mortgage principal
    // If we need more than discretionary income, use HELOC (if available)
    let mortgagePrincipalPayment = mortgagePayment - mortgageInterest
    let additionalPrincipalPayment = 0

    // Use discretionary income for additional principal payment
    if (discretionaryUsed > 0) {
      additionalPrincipalPayment = Math.min(discretionaryUsed, mortgageBalanceRemaining - mortgagePrincipalPayment)

      // If we have more discretionary income than needed to pay off mortgage
      if (discretionaryUsed > additionalPrincipalPayment) {
        // Use remaining to pay down HELOC
        const remainingDiscretionary = discretionaryUsed - additionalPrincipalPayment
        const helocPayment = Math.min(remainingDiscretionary, helocBalance)
        helocBalance -= helocPayment
        discretionaryUsed = additionalPrincipalPayment + helocPayment
      }
    }

    // If we can use HELOC to make an even larger principal payment
    const helocAvailable = helocAvailableCredit - helocBalance
    if (helocAvailable > 0 && discretionaryIncome > 0) {
      // Use HELOC to supplement the payment, but only if it makes sense
      // (i.e., mortgage rate > HELOC rate or we're close to payoff)
      if (mortgageRate >= helocRate || mortgageBalanceRemaining < helocLimit * 0.1) {
        // Use HELOC to accelerate payoff - borrow up to discretionary income amount
        const additionalHelocUse = Math.min(
          helocAvailable,
          Math.min(discretionaryIncome, mortgageBalanceRemaining - mortgagePrincipalPayment - additionalPrincipalPayment)
        )
        if (additionalHelocUse > 0) {
          helocBalance += additionalHelocUse
          additionalPrincipalPayment += additionalHelocUse
        }
      }
    }

    const totalPrincipalPayment = mortgagePrincipalPayment + additionalPrincipalPayment
    const totalMortgagePayment = mortgageInterest + totalPrincipalPayment

    // Update balances
    mortgageBalanceRemaining -= totalPrincipalPayment
    if (mortgageBalanceRemaining < 0) mortgageBalanceRemaining = 0

    // Track totals
    totalMortgageInterest += mortgageInterest
    totalHelocInterest += helocInterest
    maxHelocUsed = Math.max(maxHelocUsed, helocBalance)
    totalHelocBalance += helocBalance

    schedule.push({
      month,
      beginningBalance: beginningMortgageBalance,
      paymentAmount: totalMortgagePayment,
      principalPayment: totalPrincipalPayment,
      interestPayment: mortgageInterest,
      endingBalance: mortgageBalanceRemaining,
      cumulativeInterest: totalMortgageInterest + totalHelocInterest,
      cumulativePrincipal: mortgageBalance - mortgageBalanceRemaining,
      helocBalance: beginningHelocBalance,
      helocPayment: Math.max(0, beginningHelocBalance - helocBalance),
      helocInterest,
      totalMonthlyPayment: totalMortgagePayment + helocInterest + currentPmiPayment,
      discretionaryUsed,
      pmiPayment: currentPmiPayment,
      currentEquityPercentage
    })

    month++
  }

  return {
    payoffMonths: schedule.length,
    totalInterest: totalMortgageInterest + totalHelocInterest,
    totalHelocInterest,
    totalMortgageInterest,
    schedule,
    maxHelocUsed,
    averageHelocBalance: schedule.length > 0 ? totalHelocBalance / schedule.length : 0
  }
}

/**
 * Compare traditional mortgage vs HELOC acceleration strategy
 */
export function compareStrategies(
  mortgageInput: MortgageInput,
  helocInput: HELOCInput
): {
  traditional: AmortizationSchedule
  heloc: HELOCCalculationResult
  comparison: {
    timeSavedMonths: number
    interestSaved: number
    percentageInterestSaved: number
    monthlyPaymentDifference: number
  }
} {
  const traditional = generateAmortizationSchedule(mortgageInput)
  const heloc = calculateHELOCAcceleration(helocInput)

  const timeSavedMonths = traditional.payoffMonths - heloc.payoffMonths
  const interestSaved = traditional.totalInterest - heloc.totalInterest
  const percentageInterestSaved = (interestSaved / traditional.totalInterest) * 100

  // Calculate average monthly payment difference
  const traditionalAvgPayment = traditional.monthlyPayment
  const helocAvgPayment = heloc.schedule.length > 0
    ? heloc.schedule.reduce((sum, payment) => sum + payment.totalMonthlyPayment, 0) / heloc.schedule.length
    : 0

  return {
    traditional,
    heloc,
    comparison: {
      timeSavedMonths,
      interestSaved,
      percentageInterestSaved,
      monthlyPaymentDifference: helocAvgPayment - traditionalAvgPayment
    }
  }
}