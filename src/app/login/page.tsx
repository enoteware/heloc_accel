'use client'

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "../../components/design-system/Card"
import { Button } from "../../components/design-system/Button"
import { Input } from "../../components/design-system/Input"
import { Logo } from "@/components/Logo"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const callbackUrl = searchParams.get('callbackUrl') || '/calculator'
  const urlError = searchParams.get('error')
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase() === 'true'

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  // Set error from URL params
  useEffect(() => {
    if (urlError) {
      setError('Invalid email or password. Please try again.')
    }
  }, [urlError])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else if (result?.ok) {
        // Success - wait for session to update, then redirect
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    await handleLogin(email, password)
  }

  const handleQuickLogin = async (email: string, password: string) => {
    await handleLogin(email, password)
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Environment Banner */}
        <div className={`text-center p-3 rounded-lg border-2 ${
          isDemoMode 
            ? 'safe-success-light border-green-200' 
            : 'bg-purple-50 border-purple-200 text-purple-800'
        }`}>
          <p className="font-semibold text-sm">
            {isDemoMode 
              ? '🎮 DEMO MODE - Use demo credentials below' 
              : '🚀 PRODUCTION MODE'
            }
          </p>
          {isDemoMode && (
            <p className="text-xs mt-1">
              Data stored locally • No real accounts required
            </p>
          )}
        </div>

        <div className="text-center">
          <Logo className="mx-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</p>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Email:</strong> demo@example.com <strong>Password:</strong> demo123</p>
                <p><strong>Email:</strong> john@example.com <strong>Password:</strong> password123</p>
                <p><strong>Email:</strong> jane@example.com <strong>Password:</strong> password123</p>
              </div>
              <div className="mt-3 pt-2 border-t border-yellow-300">
                <p className="text-xs text-yellow-600 mb-2">Quick Demo Links:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('demo@example.com', 'demo123')}
                    className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300 transition-colors"
                    disabled={loading}
                  >
                    Demo User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('john@example.com', 'password123')}
                    className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300 transition-colors"
                    disabled={loading}
                  >
                    John Smith
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('jane@example.com', 'password123')}
                    className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300 transition-colors"
                    disabled={loading}
                  >
                    Jane Doe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Card className="mt-8 p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}