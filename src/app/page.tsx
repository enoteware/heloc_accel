'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Logo from '@/components/Logo'

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Removed automatic redirect to allow users to see the homepage

  const handleGetStarted = () => {
    if (isDemoMode || session) {
      router.push('/calculator')
    } else {
      router.push('/login?callbackUrl=/calculator')
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Logo
              size="xl"
              showText={false}
              clickable={false}
              priority={true}
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            HELOC Accelerator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how a Home Equity Line of Credit (HELOC) can accelerate your mortgage payoff 
            and potentially save you thousands in interest payments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Traditional Mortgage
            </h2>
            <p className="text-gray-600 mb-6">
              Continue with your current mortgage payment schedule and see how long it takes to pay off.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Payoff:</span>
                <span className="font-semibold">30 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-semibold">$200,000+</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              HELOC Strategy
            </h2>
            <p className="text-gray-600 mb-6">
              Use a HELOC to accelerate your mortgage payoff and potentially save years and thousands in interest.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Payoff:</span>
                <span className="font-semibold text-green-600">7-10 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-semibold text-green-600">$50,000-80,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-200"
            >
              Get Started - Calculate Your Savings
            </button>
            <div>
              <button
                onClick={() => router.push('/formulas')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg text-sm transition duration-200 ml-4"
              >
                📊 View Formulas & Logic
              </button>
            </div>
          </div>
          {!isDemoMode && !session && (
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the HELOC calculator and save your scenarios
            </p>
          )}
          {isDemoMode && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">Demo Mode Active</h3>
              </div>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>✅ No sign-up required</strong> - Jump straight into the calculator</p>
                <p><strong>💾 Data stored locally</strong> - Your scenarios are saved in your browser</p>
                <p><strong>🔄 Full functionality</strong> - All features work exactly like the production version</p>
                <p><strong>📊 Sample data included</strong> - Pre-loaded scenarios to explore</p>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">Demo Credentials (if needed):</p>
                <div className="text-xs text-green-700 font-mono space-y-1">
                  <p><span className="font-semibold">Email:</span> demo@helocaccel.com</p>
                  <p><span className="font-semibold">Password:</span> DemoUser123!</p>
                  <p className="text-green-600 italic">Note: Authentication is bypassed in demo mode</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Input Your Data</h3>
              <p className="text-gray-600">
                Enter your current mortgage details, income, and expenses.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">See the Analysis</h3>
              <p className="text-gray-600">
                Compare traditional vs HELOC strategy side by side.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Make Informed Decisions</h3>
              <p className="text-gray-600">
                Use the insights to decide if HELOC acceleration is right for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
