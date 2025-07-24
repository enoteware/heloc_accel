/**
 * Integration tests for API endpoints
 * These tests verify the API endpoints work correctly with proper authentication,
 * validation, and database operations.
 */

import { NextRequest } from 'next/server'

// Mock the database and middleware before importing API routes
const mockQuery = jest.fn()
const mockRequireAuth = jest.fn()

jest.mock('../lib/database', () => ({
  query: mockQuery
}))

jest.mock('../lib/middleware', () => ({
  requireAuth: mockRequireAuth
}))

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token-123456789')
  }))
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}))

// Import API routes after mocking
import { GET as getScenarios, POST as createScenario } from '../app/api/scenario/route'
import { GET as getScenario, DELETE as deleteScenario } from '../app/api/scenario/[id]/route'
import { POST as shareScenario } from '../app/api/scenario/[id]/share/route'
import { GET as getSharedScenario } from '../app/api/shared/[token]/route'
import { GET as getProfile, PUT as updateProfile } from '../app/api/profile/route'
import { PUT as changePassword } from '../app/api/profile/password/route'

// Use the mocked functions directly

// Mock user for authentication
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
}

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockReturnValue(mockUser)
  })

  describe('Scenario API', () => {
    describe('GET /api/scenario', () => {
      test('should return user scenarios successfully', async () => {
        const mockScenarios = [
          {
            id: 'scenario-1',
            name: 'Test Scenario',
            description: 'Test Description',
            current_mortgage_balance: 200000,
            current_interest_rate: 0.065,
            remaining_term_months: 300,
            monthly_payment: 1500,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-01'),
            traditional_payoff_months: 300,
            heloc_payoff_months: 180,
            interest_saved: 50000
          }
        ]

        mockQuery.mockResolvedValueOnce({ rows: mockScenarios })

        const request = new NextRequest('http://localhost:3000/api/scenario')
        const response = await getScenarios(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveLength(1)
        expect(data.data[0].name).toBe('Test Scenario')
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          [mockUser.id]
        )
      })

      test('should handle authentication error', async () => {
        mockRequireAuth.mockImplementationOnce(() => {
          throw new Error('Authentication required')
        })

        const request = new NextRequest('http://localhost:3000/api/scenario')
        const response = await getScenarios(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Authentication required')
      })

      test('should handle database error', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'))

        const request = new NextRequest('http://localhost:3000/api/scenario')
        const response = await getScenarios(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Failed to load scenarios')
      })
    })

    describe('POST /api/scenario', () => {
      test('should create scenario successfully', async () => {
        const mockScenarioData = {
          name: 'New Scenario',
          description: 'New Description',
          currentMortgageBalance: 250000,
          currentInterestRate: 6.5,
          remainingTermMonths: 360,
          monthlyPayment: 1800,
          helocLimit: 60000,
          helocInterestRate: 7.0,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4000,
          monthlyDiscretionaryIncome: 2000
        }

        const mockInsertResult = {
          rows: [{
            id: 'new-scenario-id',
            name: 'New Scenario',
            created_at: new Date(),
            updated_at: new Date()
          }]
        }

        mockQuery.mockResolvedValueOnce(mockInsertResult)

        const request = new NextRequest('http://localhost:3000/api/scenario', {
          method: 'POST',
          body: JSON.stringify(mockScenarioData)
        })

        const response = await createScenario(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.success).toBe(true)
        expect(data.data.id).toBe('new-scenario-id')
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO scenarios'),
          expect.arrayContaining([mockUser.id, 'New Scenario'])
        )
      })

      test('should validate required fields', async () => {
        const invalidData = {
          name: '', // Empty name should fail validation
          currentMortgageBalance: 250000
        }

        const request = new NextRequest('http://localhost:3000/api/scenario', {
          method: 'POST',
          body: JSON.stringify(invalidData)
        })

        const response = await createScenario(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toContain('required')
      })

      test('should validate numeric fields', async () => {
        const invalidData = {
          name: 'Test Scenario',
          currentMortgageBalance: -100000, // Negative balance should fail
          currentInterestRate: 6.5,
          remainingTermMonths: 360,
          monthlyPayment: 1800
        }

        const request = new NextRequest('http://localhost:3000/api/scenario', {
          method: 'POST',
          body: JSON.stringify(invalidData)
        })

        const response = await createScenario(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toContain('must be positive')
      })
    })

    describe('GET /api/scenario/[id]', () => {
      test('should return specific scenario', async () => {
        const mockScenario = {
          id: 'scenario-1',
          name: 'Test Scenario',
          description: 'Test Description',
          current_mortgage_balance: 200000,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] })

        const response = await getScenario(
          new NextRequest('http://localhost:3000/api/scenario/scenario-1'),
          { params: Promise.resolve({ id: 'scenario-1' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.id).toBe('scenario-1')
      })

      test('should return 404 for non-existent scenario', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] })

        const response = await getScenario(
          new NextRequest('http://localhost:3000/api/scenario/non-existent'),
          { params: Promise.resolve({ id: 'non-existent' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Scenario not found or access denied')
      })
    })

    describe('DELETE /api/scenario/[id]', () => {
      test('should delete scenario successfully', async () => {
        // Mock scenario exists check
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 'scenario-1' }] })
        // Mock delete operation
        mockQuery.mockResolvedValueOnce({ rows: [] })

        const response = await deleteScenario(
          new NextRequest('http://localhost:3000/api/scenario/scenario-1', { method: 'DELETE' }),
          { params: Promise.resolve({ id: 'scenario-1' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Scenario deleted successfully')
      })

      test('should return 404 for non-existent scenario', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] })

        const response = await deleteScenario(
          new NextRequest('http://localhost:3000/api/scenario/non-existent', { method: 'DELETE' }),
          { params: Promise.resolve({ id: 'non-existent' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Scenario not found or access denied')
      })
    })
  })

  describe('Scenario Sharing API', () => {
    describe('POST /api/scenario/[id]/share', () => {
      test('should enable sharing successfully', async () => {
        const mockScenario = {
          id: 'scenario-1',
          is_public: false,
          public_share_token: null
        }

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] })
        mockQuery.mockResolvedValueOnce({ rows: [] }) // Update query

        const request = new NextRequest('http://localhost:3000/api/scenario/scenario-1/share', {
          method: 'POST',
          body: JSON.stringify({ enable: true })
        })

        const response = await shareScenario(request, { params: Promise.resolve({ id: 'scenario-1' }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.shareUrl).toContain('mock-token-123456789')
        expect(data.data.isPublic).toBe(true)
      })

      test('should disable sharing successfully', async () => {
        const mockScenario = {
          id: 'scenario-1',
          is_public: true,
          public_share_token: 'existing-token'
        }

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] })
        mockQuery.mockResolvedValueOnce({ rows: [] }) // Update query

        const request = new NextRequest('http://localhost:3000/api/scenario/scenario-1/share', {
          method: 'POST',
          body: JSON.stringify({ enable: false })
        })

        const response = await shareScenario(request, { params: Promise.resolve({ id: 'scenario-1' }) })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.isPublic).toBe(false)
      })
    })

    describe('GET /api/shared/[token]', () => {
      test('should return shared scenario successfully', async () => {
        const mockSharedScenario = {
          id: 'scenario-1',
          name: 'Shared Scenario',
          description: 'Shared Description',
          current_mortgage_balance: 200000,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          first_name: 'John',
          last_name: 'Doe'
        }

        mockQuery.mockResolvedValueOnce({ rows: [mockSharedScenario] })

        const response = await getSharedScenario(
          new NextRequest('http://localhost:3000/api/shared/valid-token'),
          { params: Promise.resolve({ token: 'valid-token' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.name).toBe('Shared Scenario')
        expect(data.data.shared_by).toBe('John Doe')
      })

      test('should return 404 for invalid token', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] })

        const response = await getSharedScenario(
          new NextRequest('http://localhost:3000/api/shared/invalid-token'),
          { params: Promise.resolve({ token: 'invalid-token' }) }
        )
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Shared scenario not found or no longer available')
      })
    })
  })

  describe('Profile API', () => {
    describe('GET /api/profile', () => {
      test('should return user profile successfully', async () => {
        const mockProfile = {
          id: 'user-123',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          last_login: new Date('2024-01-02'),
          email_verified: true
        }

        mockQuery.mockResolvedValueOnce({ rows: [mockProfile] })

        const request = new NextRequest('http://localhost:3000/api/profile')
        const response = await getProfile(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.email).toBe('test@example.com')
        expect(data.data.firstName).toBe('Test')
        expect(data.data.lastName).toBe('User')
      })
    })

    describe('PUT /api/profile', () => {
      test('should update profile successfully', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@example.com'
        }

        // Mock email uniqueness check
        mockQuery.mockResolvedValueOnce({ rows: [] })
        // Mock update operation
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'user-123',
            email: 'updated@example.com',
            first_name: 'Updated',
            last_name: 'Name',
            updated_at: new Date()
          }]
        })

        const request = new NextRequest('http://localhost:3000/api/profile', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        })

        const response = await updateProfile(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.firstName).toBe('Updated')
        expect(data.data.lastName).toBe('Name')
      })

      test('should validate email format', async () => {
        const invalidData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email'
        }

        const request = new NextRequest('http://localhost:3000/api/profile', {
          method: 'PUT',
          body: JSON.stringify(invalidData)
        })

        const response = await updateProfile(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Invalid email format')
      })

      test('should check email uniqueness', async () => {
        const updateData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'existing@example.com'
        }

        // Mock email already exists
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 'other-user' }] })

        const request = new NextRequest('http://localhost:3000/api/profile', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        })

        const response = await updateProfile(request)
        const data = await response.json()

        expect(response.status).toBe(409)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email address is already in use')
      })
    })

    describe('PUT /api/profile/password', () => {
      test('should change password successfully', async () => {
        const passwordData = {
          currentPassword: 'oldpassword123',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        }

        // Mock current user lookup
        mockQuery.mockResolvedValueOnce({
          rows: [{
            password_hash: '$2a$12$mockhashedpassword'
          }]
        })
        // Mock password update
        mockQuery.mockResolvedValueOnce({ rows: [] })

        // Mock bcrypt compare to return true for current password
        const bcrypt = require('bcryptjs')
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true).mockResolvedValueOnce(false)
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('$2a$12$newhashedpassword')

        const request = new NextRequest('http://localhost:3000/api/profile/password', {
          method: 'PUT',
          body: JSON.stringify(passwordData)
        })

        const response = await changePassword(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Password changed successfully')
      })

      test('should validate password confirmation', async () => {
        const passwordData = {
          currentPassword: 'oldpassword123',
          newPassword: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!'
        }

        const request = new NextRequest('http://localhost:3000/api/profile/password', {
          method: 'PUT',
          body: JSON.stringify(passwordData)
        })

        const response = await changePassword(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('New password and confirmation do not match')
      })

      test('should validate password strength', async () => {
        const passwordData = {
          currentPassword: 'oldpassword123',
          newPassword: 'weak', // Too weak
          confirmPassword: 'weak'
        }

        const request = new NextRequest('http://localhost:3000/api/profile/password', {
          method: 'PUT',
          body: JSON.stringify(passwordData)
        })

        const response = await changePassword(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toContain('must be at least 8 characters')
      })

      test('should verify current password', async () => {
        const passwordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        }

        // Mock current user lookup
        mockQuery.mockResolvedValueOnce({
          rows: [{
            password_hash: '$2a$12$mockhashedpassword'
          }]
        })

        // Mock bcrypt compare to return false for wrong current password
        const bcrypt = require('bcryptjs')
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false)

        const request = new NextRequest('http://localhost:3000/api/profile/password', {
          method: 'PUT',
          body: JSON.stringify(passwordData)
        })

        const response = await changePassword(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Current password is incorrect')
      })
    })
  })
})
