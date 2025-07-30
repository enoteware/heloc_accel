'use client'

import React, { useState } from 'react'

// Component for displaying demo account information in development mode
// These accounts match the actual DEMO_USERS defined in src/auth.ts

const WORKING_DEMO_ACCOUNTS = [
  {
    id: "demo-user-001",
    email: "demo@example.com",
    name: "Demo User",
    password: "demo123",
  },
  {
    id: "demo-user-002",
    email: "john@example.com",
    name: "John Smith",
    password: "password123",
  },
  {
    id: "demo-user-003",
    email: "jane@example.com",
    name: "Jane Doe",
    password: "password123",
  },
]

export default function DemoAccountsInfo() {
  const [showAccounts, setShowAccounts] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Demo Mode Active</h3>
          <p className="text-sm text-blue-700 mb-3">
            You&apos;re using the HELOC Accelerator in demo mode. Each user account maintains separate data storage.
          </p>
          
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            {showAccounts ? 'Hide' : 'Show'} Available Demo Accounts
          </button>

          {showAccounts && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-blue-800">Available Demo Accounts:</h4>
              <div className="grid grid-cols-1 gap-3">
                {WORKING_DEMO_ACCOUNTS.map((user) => (
                  <div key={user.id} className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-gray-600 font-mono text-xs mt-1">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">Password: {user.password}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> These are the actual working demo accounts. Each account stores data separately in your browser.
                  You can switch between accounts to see isolated data storage in action.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
