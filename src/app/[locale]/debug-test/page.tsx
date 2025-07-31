'use client'

import React, { useState } from 'react'
import { useUser } from '@stackframe/stack'
import DebugPanel from '@/components/DebugPanel'
import DebugLogViewer from '@/components/DebugLogViewer'
import { networkInterceptor } from '@/lib/network-interceptor'
import { logInfo, logError, logDebug } from '@/lib/debug-logger'

export default function DebugTestPage() {
  const user = useUser()
  const [debugPanelVisible, setDebugPanelVisible] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runAuthTest = async () => {
    setLoading(true)
    logInfo('DebugTest', 'Running authentication test')
    
    try {
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      setTestResults(prev => ({ ...prev, auth: data }))
      logDebug('DebugTest', 'Auth test completed', data)
    } catch (error) {
      logError('DebugTest', 'Auth test failed', error)
      setTestResults(prev => ({ ...prev, auth: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const runStatusTest = async () => {
    setLoading(true)
    logInfo('DebugTest', 'Running system status test')
    
    try {
      const response = await fetch('/api/debug/status')
      const data = await response.json()
      setTestResults(prev => ({ ...prev, status: data }))
      logDebug('DebugTest', 'Status test completed', data)
    } catch (error) {
      logError('DebugTest', 'Status test failed', error)
      setTestResults(prev => ({ ...prev, status: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const runStackAuthTest = async () => {
    setLoading(true)
    logInfo('DebugTest', 'Running Stack Auth integration test')
    
    try {
      const response = await fetch('/api/test/stack-auth')
      const data = await response.json()
      setTestResults(prev => ({ ...prev, stackAuth: data }))
      logDebug('DebugTest', 'Stack Auth test completed', data)
    } catch (error) {
      logError('DebugTest', 'Stack Auth test failed', error)
      setTestResults(prev => ({ ...prev, stackAuth: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    await runAuthTest()
    await runStatusTest()
    await runStackAuthTest()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Tools Test Page</h1>
        
        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User (Client-Side)</h2>
          {user ? (
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.primaryEmail}</div>
              <div><strong>Display Name:</strong> {user.displayName || 'N/A'}</div>
              <div><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</div>
            </div>
          ) : (
            <p className="text-gray-600">Not logged in</p>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Tests</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAuthTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Test Auth Debug
            </button>
            <button
              onClick={runStatusTest}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Test System Status
            </button>
            <button
              onClick={runStackAuthTest}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Test Stack Auth
            </button>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {testResults.auth && (
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium">Auth Debug Results</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-50 p-3 rounded">
                    {JSON.stringify(testResults.auth, null, 2)}
                  </pre>
                </details>
              )}
              {testResults.status && (
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium">System Status Results</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-50 p-3 rounded">
                    {JSON.stringify(testResults.status, null, 2)}
                  </pre>
                </details>
              )}
              {testResults.stackAuth && (
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium">Stack Auth Test Results</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-50 p-3 rounded">
                    {JSON.stringify(testResults.stackAuth, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Debug Tools Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Debug Tools</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <h3 className="font-medium">Debug Panel</h3>
                <p className="text-sm text-gray-600">Real-time auth and system status monitoring</p>
              </div>
              <button
                onClick={() => setDebugPanelVisible(!debugPanelVisible)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                {debugPanelVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">Debug Log Viewer</h3>
              <p className="text-sm text-gray-600">View and filter application logs (button in bottom right)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">Network Interceptor</h3>
              <p className="text-sm text-gray-600">Automatically logs all API requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Tools */}
      <DebugPanel isVisible={debugPanelVisible} onToggle={() => setDebugPanelVisible(!debugPanelVisible)} />
      <DebugLogViewer />
    </div>
  )
}