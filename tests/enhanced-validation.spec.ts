import { test, expect } from '@playwright/test'

test.describe('Enhanced Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004/test-validation')
    await page.waitForLoadState('networkidle')
  })

  test('should show form progress indicator', async ({ page }) => {
    // Check that progress indicator is visible
    await expect(page.locator('text=Form Progress')).toBeVisible()
    await expect(page.locator('text=0/6 fields')).toBeVisible()
    
    // Progress bar should be at 0%
    const progressBar = page.locator('[role="progressbar"]')
    await expect(progressBar).toBeVisible()
  })

  test('should show real-time validation errors', async ({ page }) => {
    // Test mortgage balance validation
    const mortgageInput = page.locator('input[name="currentMortgageBalance"]')
    await mortgageInput.fill('500')
    await mortgageInput.blur()
    
    // Should show minimum balance error
    await expect(page.locator('text=Minimum balance is $1,000')).toBeVisible()
    
    // Should show error icon
    await expect(page.locator('svg.text-red-500')).toBeVisible()
  })

  test('should show success indicators for valid inputs', async ({ page }) => {
    // Fill valid mortgage balance
    const mortgageInput = page.locator('input[name="currentMortgageBalance"]')
    await mortgageInput.fill('350000')
    await mortgageInput.blur()
    
    // Should show success icon
    await expect(page.locator('svg.text-green-500')).toBeVisible()
    
    // Should not show error message
    await expect(page.locator('text=Minimum balance')).not.toBeVisible()
  })

  test('should validate interest rate format', async ({ page }) => {
    const rateInput = page.locator('input[name="currentInterestRate"]')
    
    // Test invalid rate
    await rateInput.fill('50')
    await rateInput.blur()
    await expect(page.locator('text=This rate seems very high')).toBeVisible()
    
    // Test valid rate
    await rateInput.fill('6.5')
    await rateInput.blur()
    await expect(page.locator('svg.text-green-500')).toBeVisible()
  })

  test('should auto-calculate discretionary income', async ({ page }) => {
    // Fill income and expenses
    await page.locator('input[name="monthlyIncome"]').fill('8500')
    await page.locator('input[name="monthlyExpenses"]').fill('3900')
    await page.locator('input[name="monthlyPayment"]').fill('2347')
    
    // Wait for auto-calculation
    await page.waitForTimeout(500)
    
    // Check that discretionary income is calculated
    const discretionaryInput = page.locator('input[name="monthlyDiscretionaryIncome"]')
    await expect(discretionaryInput).toHaveValue('$2,253')
  })

  test('should show cross-field validation warnings', async ({ page }) => {
    // Fill mortgage balance
    await page.locator('input[name="currentMortgageBalance"]').fill('300000')
    
    // Fill HELOC limit that's too high relative to mortgage
    await page.locator('input[name="helocLimit"]').fill('400000')
    await page.locator('input[name="helocLimit"]').blur()
    
    // Should show warning about high HELOC limit
    await expect(page.locator('text=HELOC limit seems high relative to mortgage balance')).toBeVisible()
  })

  test('should update form progress as fields are completed', async ({ page }) => {
    // Initially 0/6 fields
    await expect(page.locator('text=0/6 fields')).toBeVisible()
    
    // Fill first required field
    await page.locator('input[name="currentMortgageBalance"]').fill('350000')
    await page.waitForTimeout(300)
    await expect(page.locator('text=1/6 fields')).toBeVisible()
    
    // Fill second required field
    await page.locator('input[name="currentInterestRate"]').fill('6.5')
    await page.waitForTimeout(300)
    await expect(page.locator('text=2/6 fields')).toBeVisible()
  })

  test('should show validation hints for empty fields', async ({ page }) => {
    // Check that hints are shown for empty fields
    await expect(page.locator('text=Enter your current mortgage principal balance')).toBeVisible()
    await expect(page.locator('text=Enter as percentage (e.g., 6.5 for 6.5%)')).toBeVisible()
  })

  test('should enable submit button only when form is valid', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    
    // Initially disabled
    await expect(submitButton).toBeDisabled()
    
    // Fill all required fields with valid data
    await page.locator('input[name="currentMortgageBalance"]').fill('350000')
    await page.locator('input[name="currentInterestRate"]').fill('6.5')
    await page.locator('input[name="remainingTermMonths"]').fill('300')
    await page.locator('input[name="monthlyPayment"]').fill('2347')
    await page.locator('input[name="monthlyIncome"]').fill('8500')
    await page.locator('input[name="monthlyExpenses"]').fill('3900')
    
    // Wait for validation
    await page.waitForTimeout(500)
    
    // Should be enabled now
    await expect(submitButton).toBeEnabled()
  })

  test('should prefill demo data correctly', async ({ page }) => {
    // Click demo data button
    await page.locator('button:has-text("Demo Data")').click()
    
    // Check that fields are filled
    await expect(page.locator('input[name="currentMortgageBalance"]')).toHaveValue('$350,000')
    await expect(page.locator('input[name="currentInterestRate"]')).toHaveValue('6.5%')
    await expect(page.locator('input[name="remainingTermMonths"]')).toHaveValue('300')
    await expect(page.locator('input[name="monthlyPayment"]')).toHaveValue('$2,347')
    
    // Submit button should be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('should clear form correctly', async ({ page }) => {
    // Fill some data first
    await page.locator('input[name="currentMortgageBalance"]').fill('350000')
    await page.locator('input[name="currentInterestRate"]').fill('6.5')
    
    // Click clear button
    await page.locator('button:has-text("Clear Form")').click()
    
    // Check that fields are cleared
    await expect(page.locator('input[name="currentMortgageBalance"]')).toHaveValue('')
    await expect(page.locator('input[name="currentInterestRate"]')).toHaveValue('')
    
    // Progress should be back to 0
    await expect(page.locator('text=0/6 fields')).toBeVisible()
  })

  test('should format currency inputs correctly', async ({ page }) => {
    const mortgageInput = page.locator('input[name="currentMortgageBalance"]')
    
    // Type a number
    await mortgageInput.fill('350000')
    await mortgageInput.blur()
    
    // Should be formatted as currency
    await expect(mortgageInput).toHaveValue('$350,000')
  })

  test('should format percentage inputs correctly', async ({ page }) => {
    const rateInput = page.locator('input[name="currentInterestRate"]')

    // Type a number
    await rateInput.fill('6.5')
    await rateInput.blur()

    // Should be formatted as percentage
    await expect(rateInput).toHaveValue('6.5%')
  })

  test('should show contextual help tooltips', async ({ page }) => {
    // Check that help buttons are visible
    const helpButtons = page.locator('button[aria-label*="Help for"]')
    await expect(helpButtons.first()).toBeVisible()

    // Hover over mortgage balance help button
    const mortgageHelpButton = page.locator('button[aria-label="Help for Current Mortgage Balance *"]')
    await mortgageHelpButton.hover()

    // Should show tooltip with helpful content
    await expect(page.locator('text=Current Mortgage Balance')).toBeVisible()
    await expect(page.locator('text=Enter the remaining principal balance')).toBeVisible()
  })

  test('should show different tooltip content for different fields', async ({ page }) => {
    // Test interest rate tooltip
    const rateHelpButton = page.locator('button[aria-label="Help for Current Interest Rate *"]')
    await rateHelpButton.hover()

    await expect(page.locator('text=Your mortgage\'s annual interest rate')).toBeVisible()
    await expect(page.locator('text=Enter as percentage')).toBeVisible()

    // Move away and test another field
    await page.locator('h1').hover() // Move away from tooltip
    await page.waitForTimeout(300)

    // Test monthly payment tooltip
    const paymentHelpButton = page.locator('button[aria-label="Help for Monthly Payment (P&I) *"]')
    await paymentHelpButton.hover()

    await expect(page.locator('text=principal and interest payment only')).toBeVisible()
    await expect(page.locator('text=Do NOT include taxes, insurance')).toBeVisible()
  })
})
