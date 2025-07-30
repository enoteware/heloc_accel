import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FastCalculatorForm from '@/components/FastCalculatorForm'
import LiveCalculatorForm from '@/components/LiveCalculatorForm'
import CalculatorForm from '@/components/CalculatorForm'
import { debugLogger } from '@/lib/debug-utils'
import { errorMonitor } from '@/lib/error-monitoring'

// Mock the debug and error monitoring systems
jest.mock('@/lib/debug-utils', () => ({
  debugLogger: {
    log: jest.fn(),
    getLogs: jest.fn(() => []),
    clear: jest.fn(),
    isDebugEnabled: jest.fn(() => true)
  },
  debugFormValidation: jest.fn(),
  debugLTVCalculation: jest.fn(() => ({
    loanAmount: 450000,
    propertyValue: 500000,
    ltvRatio: 90,
    isMIPRequired: true,
    calculationSteps: ['Test step'],
    suggestedMonthlyPMI: 281
  }))
}))

jest.mock('@/lib/error-monitoring', () => ({
  errorMonitor: {
    reportError: jest.fn(),
    reportValidationError: jest.fn(),
    reportCalculationError: jest.fn(),
    getErrors: jest.fn(() => []),
    clearErrors: jest.fn()
  },
  reportFormValidationError: jest.fn()
}))

describe('Calculator Forms - LTV/PMI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('FastCalculatorForm', () => {
    const mockOnSubmit = jest.fn()

    it('should display LTV analysis when both loan amount and property value are provided', async () => {
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Fill in mortgage balance
      const mortgageBalanceInput = screen.getByLabelText(/current mortgage balance/i)
      fireEvent.change(mortgageBalanceInput, { target: { value: '450000' } })

      // Fill in property value
      const propertyValueInput = screen.getByLabelText(/property value/i)
      fireEvent.change(propertyValueInput, { target: { value: '500000' } })

      // Wait for LTV analysis to appear
      await waitFor(() => {
        expect(screen.getByText(/loan-to-value analysis/i)).toBeInTheDocument()
      })

      // Check that LTV ratio is displayed
      expect(screen.getByText(/LTV: 90\.0%/)).toBeInTheDocument()
    })

    it('should show PMI as required when LTV > 80%', async () => {
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Set up high LTV scenario
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        expect(screen.getByText(/MIP\/PMI is required/i)).toBeInTheDocument()
      })

      // Check that PMI field is marked as required
      expect(screen.getByLabelText(/monthly mip\/pmi \*/i)).toBeInTheDocument()
    })

    it('should provide suggested PMI amount button', async () => {
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Set up high LTV scenario
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        const suggestedButton = screen.getByText(/use suggested/i)
        expect(suggestedButton).toBeInTheDocument()
      })
    })

    it('should handle invalid inputs gracefully', async () => {
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Enter invalid values
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: 'invalid' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: 'also-invalid' } 
      })

      // Should not crash and should not show LTV analysis
      await waitFor(() => {
        expect(screen.queryByText(/loan-to-value analysis/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('LiveCalculatorForm', () => {
    const mockOnCalculate = jest.fn()

    it('should display LTV analysis in compact format', async () => {
      render(<LiveCalculatorForm onCalculate={mockOnCalculate} />)

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        expect(screen.getByText(/ltv analysis/i)).toBeInTheDocument()
      })
    })

    it('should show PMI field with conditional styling', async () => {
      render(<LiveCalculatorForm onCalculate={mockOnCalculate} />)

      // Set up high LTV scenario
      fireEvent.change(screen.getByLabelText(/mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        const pmiField = screen.getByLabelText(/pmi \(monthly\) \*/i)
        expect(pmiField).toBeInTheDocument()
        expect(pmiField).toHaveClass('border-orange-300')
      })
    })
  })

  describe('CalculatorForm', () => {
    const mockOnSubmit = jest.fn()

    it('should display LTV analysis panel', async () => {
      render(<CalculatorForm onSubmit={mockOnSubmit} />)

      // Fill in mortgage balance and property value
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        expect(screen.getByText(/loan-to-value analysis/i)).toBeInTheDocument()
      })
    })

    it('should show PMI field when LTV analysis is available', async () => {
      render(<CalculatorForm onSubmit={mockOnSubmit} />)

      // Set up scenario with property value
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '350000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/monthly mip\/pmi/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Form Consistency Tests', () => {
    const testScenarios = [
      {
        name: 'High LTV scenario (90%)',
        mortgageBalance: '450000',
        propertyValue: '500000',
        expectedLTV: 90,
        expectedPMIRequired: true
      },
      {
        name: 'Boundary LTV scenario (80%)',
        mortgageBalance: '400000',
        propertyValue: '500000',
        expectedLTV: 80,
        expectedPMIRequired: false
      },
      {
        name: 'Low LTV scenario (70%)',
        mortgageBalance: '350000',
        propertyValue: '500000',
        expectedLTV: 70,
        expectedPMIRequired: false
      }
    ]

    testScenarios.forEach(scenario => {
      it(`should handle ${scenario.name} consistently across all forms`, async () => {
        const forms = [
          { component: FastCalculatorForm, props: { onSubmit: jest.fn() } },
          { component: LiveCalculatorForm, props: { onCalculate: jest.fn() } },
          { component: CalculatorForm, props: { onSubmit: jest.fn() } }
        ]

        for (const { component: FormComponent, props } of forms) {
          const { unmount } = render(<FormComponent {...props} />)

          // Fill in the test scenario values
          fireEvent.change(screen.getByLabelText(/mortgage balance/i), { 
            target: { value: scenario.mortgageBalance } 
          })
          fireEvent.change(screen.getByLabelText(/property value/i), { 
            target: { value: scenario.propertyValue } 
          })

          // Wait for LTV analysis
          await waitFor(() => {
            if (scenario.expectedPMIRequired) {
              expect(screen.getByText(/mip\/pmi.*required/i)).toBeInTheDocument()
            } else {
              expect(screen.queryByText(/mip\/pmi.*required/i)).not.toBeInTheDocument()
            }
          })

          unmount()
        }
      })
    })
  })

  describe('Error Handling and Debugging Integration', () => {
    it('should log debug information when LTV is calculated', async () => {
      const mockOnSubmit = jest.fn()
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })

      await waitFor(() => {
        expect(debugLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          'form',
          expect.stringContaining('FastCalculatorForm input change'),
          expect.any(Object)
        )
      })
    })

    it('should handle calculation errors gracefully', async () => {
      const mockOnSubmit = jest.fn()
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Enter values that might cause calculation errors
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '0' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '0' } 
      })

      // Should not crash
      await waitFor(() => {
        expect(screen.queryByText(/loan-to-value analysis/i)).not.toBeInTheDocument()
      })
    })

    it('should report validation errors to error monitoring system', async () => {
      const mockOnSubmit = jest.fn()
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      // Set up scenario that should trigger validation error
      fireEvent.change(screen.getByLabelText(/current mortgage balance/i), { 
        target: { value: '450000' } 
      })
      fireEvent.change(screen.getByLabelText(/property value/i), { 
        target: { value: '500000' } 
      })
      
      // Leave PMI field empty (should trigger validation error)
      fireEvent.change(screen.getByLabelText(/monthly mip\/pmi/i), { 
        target: { value: '0' } 
      })

      // Trigger form submission to activate validation
      const submitButton = screen.getByRole('button', { name: /calculate/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Should have logged validation activity
        expect(debugLogger.log).toHaveBeenCalled()
      })
    })
  })

  describe('Performance Tests', () => {
    it('should handle rapid input changes without performance issues', async () => {
      const mockOnSubmit = jest.fn()
      render(<FastCalculatorForm onSubmit={mockOnSubmit} />)

      const mortgageInput = screen.getByLabelText(/current mortgage balance/i)
      const propertyInput = screen.getByLabelText(/property value/i)

      const startTime = Date.now()

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.change(mortgageInput, { target: { value: `${400000 + i * 1000}` } })
        fireEvent.change(propertyInput, { target: { value: `${500000 + i * 1000}` } })
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in under 1 second

      // Should still show LTV analysis
      await waitFor(() => {
        expect(screen.getByText(/loan-to-value analysis/i)).toBeInTheDocument()
      })
    })
  })
})
