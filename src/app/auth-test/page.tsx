'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function AuthTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testCredentials = [
    { email: 'demo@example.com', password: 'demo123' },
    { email: 'john@example.com', password: 'password123' },
    { email: 'jane@example.com', password: 'password123' }
  ]

  const testLogin = async (email: string, password: string) => {
    setLoading(true)
    setResult(`Testing ${email}...`)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      setResult(`Result for ${email}: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setResult(`Error for ${email}: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Authentication Test</h1>
      
      <div className="space-y-4">
        {testCredentials.map((cred, index) => (
          <div key={index} className="border p-4 rounded">
            <button
              onClick={() => testLogin(cred.email, cred.password)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test {cred.email} / {cred.password}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2 text-gray-900">Result:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-900">
          {result || 'No tests run yet'}
        </pre>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2 text-gray-900">Environment Info:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-900">
          {JSON.stringify({
            NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
            NODE_ENV: process.env.NODE_ENV
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}