'use client'

import React, { useState } from 'react'
import { useUser } from '@stackframe/stack'
import { useRouter } from 'next/navigation'

export default function TestSavePage() {
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scenarioName, setScenarioName] = useState('Test Scenario ' + Date.now())

  const testDirectSave = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('=== STARTING DIRECT SAVE TEST ===')
      console.log('Current user:', user ? { id: user.id, email: user.primaryEmail } : 'Not logged in')
      
      const response = await fetch('/api/test/save-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          scenarioName: scenarioName,
          description: 'Testing save functionality'
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult(data)
    } catch (error) {
      console.error('Test failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testApiEndpoint = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('=== TESTING API ENDPOINTS ===')
      
      // Test auth endpoint
      const authResponse = await fetch('/api/debug/auth')
      const authData = await authResponse.json()
      console.log('Auth status:', authData)
      
      // Test database
      const dbResponse = await fetch('/api/test/db')
      const dbData = await dbResponse.json()
      console.log('Database status:', dbData)
      
      // Test scenarios GET
      const scenariosResponse = await fetch('/api/scenarios', {
        credentials: 'include'
      })
      console.log('Scenarios GET status:', scenariosResponse.status)
      const scenariosData = await scenariosResponse.json()
      console.log('Scenarios data:', scenariosData)
      
      setResult({
        auth: authData,
        database: dbData,
        scenarios: {
          status: scenariosResponse.status,
          data: scenariosData
        }
      })
    } catch (error) {
      console.error('API test failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Save Functionality Test Page</h1>
        
        {/* User Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Logged In:</strong> Yes ✅</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.primaryEmail}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">❌ Not logged in</p>
              <button
                onClick={() => router.push('/en/handler/sign-in')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Scenario Name:</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter scenario name"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testDirectSave}
              disabled={loading || !user}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Save Scenario
            </button>
            
            <button
              onClick={testApiEndpoint}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test All APIs
            </button>
            
            <button
              onClick={() => router.push('/en/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to Debug:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're logged in (check user status above)</li>
            <li>Open browser console (F12) before testing</li>
            <li>Click "Test Save Scenario" to test the save functionality</li>
            <li>Check console logs for detailed information</li>
            <li>Check server logs in the terminal for backend details</li>
            <li>After saving, go to dashboard to see if scenario appears</li>
          </ol>
        </div>
      </div>
    </div>
  )
}