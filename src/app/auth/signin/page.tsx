'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DemoAccountsInfo from '@/components/DemoAccountsInfo'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/calculator'
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const fillDemoCredentials = () => {
    setEmail('demo@helocaccel.com')
    setPassword('DemoUser123!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo Mode Credentials */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Demo Mode - Test Credentials</h3>
                <div className="bg-white rounded border border-green-200 p-3 mb-3">
                  <div className="text-sm text-green-700 font-mono space-y-1">
                    <p><span className="font-semibold">Email:</span> demo@helocaccel.com</p>
                    <p><span className="font-semibold">Password:</span> DemoUser123!</p>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="mt-2 text-xs safe-success-light hover:bg-green-200 px-3 py-1 rounded transition duration-200"
                  >
                    Fill Demo Credentials
                  </button>
                </div>
                <div className="text-xs text-green-700">
                  <p className="font-medium mb-1">💡 Demo Mode Features:</p>
                  <ul className="space-y-1">
                    <li>• Authentication is bypassed (login optional)</li>
                    <li>• All calculator features available</li>
                    <li>• Data stored locally in browser</li>
                    <li>• No account creation required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {isDemoMode && <DemoAccountsInfo />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            {isDemoMode && (
              <p className="mt-2 text-xs text-center text-green-600">
                Demo Mode: Sign-in is optional - you can access the calculator directly
              </p>
            )}
          </div>

          <div className="text-center space-y-2">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
            {isDemoMode && (
              <div>
                <Link href="/calculator" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Skip Login - Go to Calculator →
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sign in...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}