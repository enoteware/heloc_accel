'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import DemoAccountsInfo from '@/components/DemoAccountsInfo'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status || 'loading'
  const t = useTranslations('auth')
  
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
      setError(t('errors.invalidCredentials'))
    }
  }, [urlError, t])

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
        setError(t('errors.invalidCredentials'))
      } else if (result?.ok) {
        // Success - wait for session to update, then redirect
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(t('errors.unexpectedError'))
      }
    } catch (err) {
      setError(t('errors.signInError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError(t('errors.missingCredentials'))
      return
    }
    await handleLogin(email, password)
  }

  const fillDemoCredentials = () => {
    setEmail('demo@example.com')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('signInTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('orSignUp')}{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              {t('signUpButton')}
            </Link>
          </p>
        </div>

        {isDemoMode && (
          <div className="space-y-4">
            <DemoAccountsInfo />
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('signInWithDemo')}
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
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
                placeholder={t('enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
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
                placeholder={t('enterPassword')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('signingIn') : t('signInButton')}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              {t('backToHome')}
            </Link>
            {isDemoMode && (
              <div>
                <Link href="/calculator" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  {t('skipLogin')}
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
