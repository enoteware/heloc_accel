'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Logo from '@/components/Logo'
import { Icon } from '@/components/Icons'
import { Button } from '@/components/design-system/Button'

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" role="main">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16" role="banner">
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
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover how a Home Equity Line of Credit (HELOC) can accelerate your mortgage payoff 
            and potentially save you thousands in interest payments.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto comparison-cards" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="sr-only">Mortgage Strategy Comparison</h2>
          <article className="bg-white rounded-lg shadow-lg p-8 traditional-mortgage-card">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Traditional Mortgage
            </h3>
            <p className="text-gray-700 mb-6">
              Continue with your current mortgage payment schedule and see how long it takes to pay off.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium" style={{color: '#1f2937'}}>Estimated Payoff:</span>
                <span className="font-semibold">30 years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium" style={{color: '#1f2937'}}>Total Interest:</span>
                <span className="font-semibold">$200,000+</span>
              </div>
            </div>
          </article>

          <article className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-200 heloc-strategy-card">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              HELOC Strategy
            </h3>
            <p className="text-gray-700 mb-6">
              Use a HELOC to accelerate your mortgage payoff and potentially save years and thousands in interest.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium" style={{color: '#1f2937'}}>Estimated Payoff:</span>
                <span className="font-semibold text-green-600">7-10 years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium" style={{color: '#1f2937'}}>Total Interest:</span>
                <span className="font-semibold text-green-600">$50,000-80,000</span>
              </div>
            </div>
          </article>
        </section>

        <div className="text-center mt-16">
          <div className="space-y-4">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="xl"
              icon="calculator"
              className="get-started-button"
              aria-label="Get started with HELOC calculator"
            >
              Get Started - Calculate Your Savings
            </Button>
            <div>
              <Button
                onClick={() => router.push('/formulas')}
                variant="secondary"
                size="md"
                icon="chart"
                className="ml-4 view-formulas-button"
                aria-label="View calculation formulas and logic"
              >
                View Formulas & Logic
              </Button>
            </div>
          </div>
          {!isDemoMode && !session && (
            <p className="mt-2 text-sm text-gray-700">
              Sign in to access the HELOC calculator and save your scenarios
            </p>
          )}
          {isDemoMode && (
            <aside className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto demo-mode-info" role="complementary" aria-labelledby="demo-mode-heading">
              <div className="flex items-center mb-2">
                <Icon name="info" size="sm" className="text-green-600 mr-2" aria-hidden="true" />
                <h3 id="demo-mode-heading" className="text-lg font-semibold text-green-800">Demo Mode Active</h3>
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
            </aside>
          )}
        </div>

        <section className="mt-16 bg-white rounded-lg shadow-lg p-8 how-it-works-section" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <ol className="grid md:grid-cols-3 gap-8 steps-list" role="list">
            <li className="text-center step-item" role="listitem">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Input Your Data</h3>
              <p className="text-gray-700">
                Enter your current mortgage details, income, and expenses.
              </p>
            </li>
            <li className="text-center step-item" role="listitem">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">See the Analysis</h3>
              <p className="text-gray-700">
                Compare traditional vs HELOC strategy side by side.
              </p>
            </li>
            <li className="text-center step-item" role="listitem">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Make Informed Decisions</h3>
              <p className="text-gray-700">
                Use the insights to decide if HELOC acceleration is right for you.
              </p>
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}
