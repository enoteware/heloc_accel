// Dummy user accounts for demo mode
// This file is client-safe and doesn't import any server-side modules

export interface DummyUser {
  id: string
  email: string
  password: string
  name: string
  firstName: string
  lastName: string
}

// These users match the DEMO_USERS defined in src/auth.ts for consistency
export const DUMMY_USERS: DummyUser[] = [
  {
    id: 'demo-user-001',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User',
    firstName: 'Demo',
    lastName: 'User'
  },
  {
    id: 'demo-user-002',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith'
  },
  {
    id: 'demo-user-003',
    email: 'jane@example.com',
    password: 'password123',
    name: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe'
  }
]

// Get dummy user account for demo mode
export function getDummyUserAccount(email: string, password: string) {
  // First, try to find exact match
  const exactMatch = DUMMY_USERS.find(user => 
    user.email === email && user.password === password
  )
  
  if (exactMatch) {
    return {
      id: exactMatch.id,
      email: exactMatch.email,
      name: exactMatch.name,
      firstName: exactMatch.firstName,
      lastName: exactMatch.lastName,
      emailVerified: true
    }
  }
  
  // If no exact match, create a user based on email hash for consistency
  const emailHash = email.toLowerCase().replace(/[^a-z0-9]/g, '')
  const userIndex = emailHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DUMMY_USERS.length
  const baseUser = DUMMY_USERS[userIndex]
  
  return {
    id: `demo-user-${emailHash.slice(0, 8)}`,
    email: email,
    name: `Demo User (${email.split('@')[0]})`,
    firstName: email.split('@')[0].split('.')[0] || 'Demo',
    lastName: email.split('@')[0].split('.')[1] || 'User',
    emailVerified: true
  }
}

// Get all dummy user accounts (for testing/admin purposes)
export function getAllDummyUsers() {
  return DUMMY_USERS.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName
  }))
}
