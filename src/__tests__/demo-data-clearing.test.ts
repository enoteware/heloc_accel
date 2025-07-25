/**
 * @jest-environment jsdom
 */

import { 
  getDemoScenarios, 
  saveDemoScenarios, 
  clearDemoScenarios, 
  addDemoScenario,
  deleteDemoScenario,
  getStorageInfo,
  generateSampleScenarios 
} from '@/lib/demo-storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('Demo Data Clearing Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    jest.clearAllMocks()
    // Mock console.error to prevent error logs in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks()
  })

  describe('getDemoScenarios', () => {
    it('should return empty array when no data exists', () => {
      const scenarios = getDemoScenarios()
      expect(scenarios).toEqual([])
    })

    it('should return parsed scenarios when valid data exists', () => {
      const mockScenarios = [
        {
          id: 'test-1',
          name: 'Test Scenario',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065,
          remainingTermMonths: 240,
          monthlyPayment: 1800,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4500,
          monthlyDiscretionaryIncome: 1500
        }
      ]

      localStorageMock.setItem('heloc-demo-scenarios', JSON.stringify(mockScenarios))
      
      const scenarios = getDemoScenarios()
      expect(scenarios).toEqual(mockScenarios)
    })

    it('should handle corrupted JSON data gracefully', () => {
      localStorageMock.setItem('heloc-demo-scenarios', 'invalid-json')
      
      const scenarios = getDemoScenarios()
      expect(scenarios).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('heloc-demo-scenarios')
    })

    it('should filter out invalid scenarios and save cleaned data', () => {
      const mixedData = [
        {
          id: 'valid-1',
          name: 'Valid Scenario',
          createdAt: '2024-01-01T00:00:00.000Z',
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065,
          remainingTermMonths: 240,
          monthlyPayment: 1800,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4500,
          monthlyDiscretionaryIncome: 1500
        },
        {
          // Missing required fields
          name: 'Invalid Scenario'
        },
        null,
        'invalid-object'
      ]

      localStorageMock.setItem('heloc-demo-scenarios', JSON.stringify(mixedData))
      
      const scenarios = getDemoScenarios()
      expect(scenarios).toHaveLength(1)
      expect(scenarios[0].id).toBe('valid-1')
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // Initial + cleanup save
    })

    it('should handle non-array data by clearing storage', () => {
      localStorageMock.setItem('heloc-demo-scenarios', JSON.stringify({ invalid: 'data' }))
      
      const scenarios = getDemoScenarios()
      expect(scenarios).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('heloc-demo-scenarios')
    })
  })

  describe('saveDemoScenarios', () => {
    it('should save scenarios to localStorage', () => {
      const scenarios = [
        {
          id: 'test-1',
          name: 'Test Scenario',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065,
          remainingTermMonths: 240,
          monthlyPayment: 1800,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4500,
          monthlyDiscretionaryIncome: 1500
        }
      ]

      saveDemoScenarios(scenarios)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'heloc-demo-scenarios',
        JSON.stringify(scenarios)
      )
    })

    it('should throw error when localStorage is not available', () => {
      // Mock localStorage as unavailable
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })

      expect(() => saveDemoScenarios([])).toThrow(
        'localStorage is not available in this browser. Demo data cannot be saved.'
      )

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })
    })

    it('should throw error when data size is too large', () => {
      const largeScenarios = Array(1000).fill(null).map((_, i) => ({
        id: `test-${i}`,
        name: `Test Scenario ${i}`,
        description: 'A'.repeat(10000), // Large description
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        currentMortgageBalance: 250000,
        currentInterestRate: 0.065,
        remainingTermMonths: 240,
        monthlyPayment: 1800,
        monthlyGrossIncome: 8000,
        monthlyNetIncome: 6000,
        monthlyExpenses: 4500,
        monthlyDiscretionaryIncome: 1500
      }))

      expect(() => saveDemoScenarios(largeScenarios)).toThrow(
        'Data size too large. Please reduce the number of scenarios.'
      )
    })

    it('should handle quota exceeded error', () => {
      // Temporarily override setItem to throw quota error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      expect(() => saveDemoScenarios([])).toThrow(
        'Storage quota exceeded. Please clear some data or use fewer scenarios.'
      )

      // Restore original setItem
      localStorageMock.setItem = originalSetItem
    })
  })

  describe('clearDemoScenarios', () => {
    it('should remove scenarios from localStorage', () => {
      // Add some data first
      localStorageMock.setItem('heloc-demo-scenarios', JSON.stringify([]))

      clearDemoScenarios()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('heloc-demo-scenarios')
    })

    it('should throw error when localStorage is not available', () => {
      // Mock localStorage as unavailable
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })

      expect(() => clearDemoScenarios()).toThrow(
        'localStorage is not available in this browser.'
      )

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })
    })

    it('should handle removeItem errors gracefully', () => {
      // Temporarily override removeItem to throw error
      const originalRemoveItem = localStorageMock.removeItem
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearDemoScenarios()).toThrow(
        'Failed to clear demo data. Your browser may not support localStorage or storage may be full.'
      )

      // Restore original removeItem
      localStorageMock.removeItem = originalRemoveItem
    })
  })

  describe('getStorageInfo', () => {
    it('should return storage information when available', () => {
      const scenarios = [
        {
          id: 'test-1',
          name: 'Test Scenario',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065,
          remainingTermMonths: 240,
          monthlyPayment: 1800,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4500,
          monthlyDiscretionaryIncome: 1500
        }
      ]

      localStorageMock.setItem('heloc-demo-scenarios', JSON.stringify(scenarios))

      const info = getStorageInfo()

      expect(info.available).toBe(true)
      expect(info.used).toBeGreaterThan(0)
      expect(info.error).toBeUndefined()
    })

    it('should return error when localStorage is not available', () => {
      // Mock localStorage as unavailable
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })

      const info = getStorageInfo()
      
      expect(info.available).toBe(false)
      expect(info.used).toBe(0)
      expect(info.error).toBe('localStorage is not available in this browser')

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete data lifecycle', () => {
      // Start with empty storage
      expect(getDemoScenarios()).toEqual([])
      
      // Add a scenario
      const newScenario = addDemoScenario({
        name: 'Test Scenario',
        currentMortgageBalance: 250000,
        currentInterestRate: 0.065,
        remainingTermMonths: 240,
        monthlyPayment: 1800,
        monthlyGrossIncome: 8000,
        monthlyNetIncome: 6000,
        monthlyExpenses: 4500,
        monthlyDiscretionaryIncome: 1500
      })
      
      // Verify scenario was added
      const scenarios = getDemoScenarios()
      expect(scenarios).toHaveLength(1)
      expect(scenarios[0].id).toBe(newScenario.id)
      
      // Delete the scenario
      const deleteResult = deleteDemoScenario(newScenario.id)
      expect(deleteResult).toBe(true)
      
      // Verify scenario was deleted
      expect(getDemoScenarios()).toEqual([])
      
      // Generate sample scenarios
      generateSampleScenarios()
      const sampleScenarios = getDemoScenarios()
      expect(sampleScenarios.length).toBeGreaterThan(0)
      
      // Clear all data
      clearDemoScenarios()
      expect(getDemoScenarios()).toEqual([])
    })

    it('should handle storage errors during operations', () => {
      // Mock localStorage to throw errors
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => {
        addDemoScenario({
          name: 'Test Scenario',
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065,
          remainingTermMonths: 240,
          monthlyPayment: 1800,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4500,
          monthlyDiscretionaryIncome: 1500
        })
      }).toThrow()
    })
  })
})
