// Demo mode local storage utilities
// This replaces database operations when DEMO_MODE=true

export interface DemoScenario {
  id: string
  name: string
  description?: string
  currentMortgageBalance: number
  currentInterestRate: number
  remainingTermMonths: number
  monthlyPayment: number
  helocLimit?: number
  helocInterestRate?: number
  helocAvailableCredit?: number
  monthlyGrossIncome: number
  monthlyNetIncome: number
  monthlyExpenses: number
  monthlyDiscretionaryIncome: number
  propertyValue?: number
  propertyTaxMonthly?: number
  insuranceMonthly?: number
  hoaFeesMonthly?: number
  traditionalPayoffMonths?: number
  traditionalTotalInterest?: number
  helocPayoffMonths?: number
  helocTotalInterest?: number
  timeSavedMonths?: number
  interestSaved?: number
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  publicShareToken?: string
}

// Storage key prefix for demo scenarios
const STORAGE_KEY_PREFIX = 'heloc-demo-scenarios'

// Get storage key for specific user
function getStorageKey(userId?: string): string {
  if (!userId) {
    // Fallback to global storage for backward compatibility
    return STORAGE_KEY_PREFIX
  }
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

// Check if localStorage is available and working
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    // Test localStorage functionality
    const testKey = '__localStorage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

// Get storage usage information for a specific user
export function getStorageInfo(userId?: string): { used: number; available: boolean; error?: string } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: false, error: 'localStorage is not available in this browser' }
  }

  try {
    const scenarios = getDemoScenarios(userId)
    const dataSize = JSON.stringify(scenarios).length
    return { used: dataSize, available: true }
  } catch (error) {
    return { used: 0, available: false, error: 'Error accessing localStorage' }
  }
}

// Get all scenarios from localStorage for a specific user
export function getDemoScenarios(userId?: string): DemoScenario[] {
  if (typeof window === 'undefined') return []

  const storageKey = getStorageKey(userId)

  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []

    const parsed = JSON.parse(stored)

    // Validate that the parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid demo scenarios data format, clearing corrupted data')
      localStorage.removeItem(storageKey)
      return []
    }

    // Validate each scenario has required fields
    const validScenarios = parsed.filter((scenario: any) => {
      return scenario &&
             typeof scenario.id === 'string' &&
             typeof scenario.name === 'string' &&
             typeof scenario.createdAt === 'string'
    })

    // If we filtered out invalid scenarios, save the cleaned data
    if (validScenarios.length !== parsed.length) {
      console.warn(`Filtered out ${parsed.length - validScenarios.length} invalid scenarios`)
      try {
        localStorage.setItem(storageKey, JSON.stringify(validScenarios))
      } catch (saveError) {
        console.error('Error saving cleaned scenarios:', saveError)
      }
    }

    return validScenarios
  } catch (error) {
    console.error('Error reading scenarios from localStorage:', error)

    // If JSON parsing failed, the data is corrupted
    if (error instanceof SyntaxError) {
      console.warn('Corrupted demo scenarios data detected, clearing storage')
      try {
        localStorage.removeItem(storageKey)
      } catch (clearError) {
        console.error('Error clearing corrupted data:', clearError)
      }
    }

    return []
  }
}

// Save scenarios to localStorage for a specific user
export function saveDemoScenarios(scenarios: DemoScenario[], userId?: string): void {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available in this browser. Demo data cannot be saved.')
  }

  const storageKey = getStorageKey(userId)

  try {
    const dataString = JSON.stringify(scenarios)

    // Check data size before saving (rough estimate of 5MB limit)
    if (dataString.length > 5 * 1024 * 1024) {
      throw new Error('Data size too large. Please reduce the number of scenarios.')
    }

    localStorage.setItem(storageKey, dataString)
  } catch (error) {
    console.error('Error saving scenarios to localStorage:', error)

    // Check if it's a quota exceeded error
    if (error instanceof Error && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.message.includes('quota')
    )) {
      throw new Error('Storage quota exceeded. Please clear some data or use fewer scenarios.')
    }

    // Re-throw custom errors
    if (error instanceof Error && error.message.includes('Data size too large')) {
      throw error
    }

    throw new Error('Failed to save demo data. Your browser may not support localStorage.')
  }
}

// Add a new scenario for a specific user
export function addDemoScenario(scenario: Omit<DemoScenario, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): DemoScenario {
  const scenarios = getDemoScenarios(userId)
  const newScenario: DemoScenario = {
    ...scenario,
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  scenarios.push(newScenario)
  saveDemoScenarios(scenarios, userId)
  return newScenario
}

// Get a specific scenario by ID for a specific user
export function getDemoScenario(id: string, userId?: string): DemoScenario | null {
  const scenarios = getDemoScenarios(userId)
  return scenarios.find(s => s.id === id) || null
}

// Update a scenario for a specific user
export function updateDemoScenario(id: string, updates: Partial<DemoScenario>, userId?: string): DemoScenario | null {
  const scenarios = getDemoScenarios(userId)
  const index = scenarios.findIndex(s => s.id === id)

  if (index === -1) return null

  scenarios[index] = {
    ...scenarios[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveDemoScenarios(scenarios, userId)
  return scenarios[index]
}

// Delete a scenario for a specific user
export function deleteDemoScenario(id: string, userId?: string): boolean {
  const scenarios = getDemoScenarios(userId)
  const filteredScenarios = scenarios.filter(s => s.id !== id)

  if (filteredScenarios.length === scenarios.length) {
    return false // Scenario not found
  }

  saveDemoScenarios(filteredScenarios, userId)
  return true
}

// Clear all scenarios for a specific user (for demo reset)
export function clearDemoScenarios(userId?: string): void {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available in this browser.')
  }

  const storageKey = getStorageKey(userId)

  try {
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing scenarios from localStorage:', error)
    throw new Error('Failed to clear demo data. Your browser may not support localStorage or storage may be full.')
  }
}

// Generate sample scenarios for demo for a specific user
export function generateSampleScenarios(userId?: string): void {
  const sampleScenarios: Omit<DemoScenario, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: "Primary Residence",
      description: "Main home mortgage acceleration analysis",
      currentMortgageBalance: 250000,
      currentInterestRate: 0.065,
      remainingTermMonths: 240,
      monthlyPayment: 1800,
      helocLimit: 100000,
      helocInterestRate: 0.045,
      helocAvailableCredit: 100000,
      monthlyGrossIncome: 8000,
      monthlyNetIncome: 6000,
      monthlyExpenses: 4500,
      monthlyDiscretionaryIncome: 1500,
      propertyValue: 400000,
      propertyTaxMonthly: 400,
      insuranceMonthly: 150,
      hoaFeesMonthly: 100,
      traditionalPayoffMonths: 240,
      traditionalTotalInterest: 182000,
      helocPayoffMonths: 156,
      helocTotalInterest: 98000,
      timeSavedMonths: 84,
      interestSaved: 84000
    },
    {
      name: "Investment Property",
      description: "Rental property HELOC strategy",
      currentMortgageBalance: 180000,
      currentInterestRate: 0.055,
      remainingTermMonths: 180,
      monthlyPayment: 1450,
      helocLimit: 75000,
      helocInterestRate: 0.05,
      helocAvailableCredit: 75000,
      monthlyGrossIncome: 8000,
      monthlyNetIncome: 6000,
      monthlyExpenses: 4000,
      monthlyDiscretionaryIncome: 2000,
      propertyValue: 300000,
      propertyTaxMonthly: 300,
      insuranceMonthly: 125,
      traditionalPayoffMonths: 180,
      traditionalTotalInterest: 81000,
      helocPayoffMonths: 108,
      helocTotalInterest: 45000,
      timeSavedMonths: 72,
      interestSaved: 36000
    }
  ]

  // Only add samples if no scenarios exist for this user
  const existing = getDemoScenarios(userId)
  if (existing.length === 0) {
    sampleScenarios.forEach(scenario => addDemoScenario(scenario, userId))
  }
}
