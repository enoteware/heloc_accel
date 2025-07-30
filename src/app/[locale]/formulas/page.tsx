'use client'

import { useRouter } from 'next/navigation'
import { Card, Button } from '@/components/design-system'

export default function FormulasPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8" aria-label="Page navigation">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
            aria-label="Go back to previous page"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </nav>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            HELOC Acceleration Formulas & Logic
          </h1>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto">
            Understanding the mathematical formulas and strategic logic behind HELOC acceleration calculations
          </p>
        </header>

        <main className="space-y-8" role="main">
          {/* Traditional Mortgage Calculations */}
          <Card variant="elevated" padding="none" className="p-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Traditional Mortgage Calculations</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Monthly Payment Formula</h3>
                <div className="bg-primary-100 p-4 rounded-lg font-mono text-sm mb-3 text-primary-900">
                  M = P × [r(1+r)^n] / [(1+r)^n - 1]
                </div>
                <div className="text-primary-900">
                  <p className="mb-2"><strong>Where:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>M</strong> = Monthly payment amount</li>
                    <li><strong>P</strong> = Principal loan amount</li>
                    <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
                    <li><strong>n</strong> = Total number of payments (years × 12)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Monthly Payment Breakdown</h3>
                <div className="bg-primary-100 p-4 rounded-lg space-y-2 text-sm text-primary-900">
                  <div className="font-mono">Interest Payment = Beginning Balance × Monthly Rate</div>
                  <div className="font-mono">Principal Payment = Monthly Payment - Interest Payment</div>
                  <div className="font-mono">Ending Balance = Beginning Balance - Principal Payment</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Remaining Balance Formula</h3>
                <div className="bg-primary-100 p-4 rounded-lg font-mono text-sm mb-3 text-primary-900">
                  RB = M × [(1+r)^(n-p) - 1] / [r × (1+r)^(n-p)]
                </div>
                <div className="text-primary-900">
                  <p className="mb-2"><strong>Where:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>RB</strong> = Remaining balance</li>
                    <li><strong>p</strong> = Number of payments already made</li>
                    <li><strong>n-p</strong> = Remaining number of payments</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* HELOC Acceleration Strategy */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">HELOC Acceleration Strategy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Core Strategy Logic</h3>
                <div className="text-primary-900 space-y-3">
                  <p>The HELOC acceleration strategy works by leveraging the difference between mortgage and HELOC interest rates, combined with disciplined use of discretionary income:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li><strong>Chunking Strategy:</strong> Use HELOC funds to make large principal payments on the mortgage</li>
                    <li><strong>Income Redirect:</strong> Direct all discretionary income to pay down the HELOC balance</li>
                    <li><strong>Interest Arbitrage:</strong> Benefit from the typically lower HELOC rate compared to mortgage rate</li>
                    <li><strong>Accelerated Payoff:</strong> Reduce total interest paid through faster principal reduction</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Monthly Calculation Process</h3>
                <div className="bg-primary-100 p-4 rounded-lg space-y-2 text-sm text-primary-900">
                  <div className="font-bold">Step 1: Calculate Interest Payments</div>
                  <div className="font-mono ml-4">Mortgage Interest = Mortgage Balance × (Mortgage Rate ÷ 12)</div>
                  <div className="font-mono ml-4">HELOC Interest = HELOC Balance × (HELOC Rate ÷ 12)</div>
                  
                  <div className="font-bold mt-4">Step 2: Determine Principal Strategy</div>
                  <div className="font-mono ml-4">Base Principal = Regular Payment - Mortgage Interest</div>
                  <div className="font-mono ml-4">Additional Principal = min(Discretionary Income, Remaining Balance)</div>
                  
                  <div className="font-bold mt-4">Step 3: HELOC Utilization Decision</div>
                  <div className="text-xs ml-4 text-primary-700">
                    Use HELOC when: Mortgage Rate ≥ HELOC Rate OR Mortgage Balance &lt; 10% of HELOC Limit
                  </div>
                  
                  <div className="font-bold mt-4">Step 4: Update Balances</div>
                  <div className="font-mono ml-4">New Mortgage Balance = Old Balance - Total Principal Payment</div>
                  <div className="font-mono ml-4">New HELOC Balance = Old Balance + HELOC Used - HELOC Payments</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Key Performance Metrics</h3>
                <div className="bg-primary-100 p-4 rounded-lg space-y-2 text-sm text-primary-900">
                  <div className="font-mono">Total Interest Saved = Traditional Total Interest - HELOC Total Interest</div>
                  <div className="font-mono">Time Saved = Traditional Payoff Months - HELOC Payoff Months</div>
                  <div className="font-mono">Interest Savings % = (Interest Saved ÷ Traditional Interest) × 100</div>
                  <div className="font-mono">Max HELOC Used = Maximum HELOC balance during strategy</div>
                  <div className="font-mono">Average HELOC Balance = Sum of Monthly Balances ÷ Number of Months</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Implementation Details */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Implementation Logic</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Decision Tree for HELOC Usage</h3>
                <div className="bg-primary-100 p-4 rounded-lg">
                  <div className="font-mono text-sm space-y-2 text-primary-900">
                    <div>IF (discretionary_income &gt; 0) THEN</div>
                    <div className="ml-4">use_for_additional_principal = min(discretionary_income, remaining_mortgage)</div>
                    <div className="ml-4">IF (remaining_discretionary &gt; 0) THEN</div>
                    <div className="ml-8">pay_down_heloc = min(remaining_discretionary, heloc_balance)</div>
                    <div>END IF</div>
                    <div className="mt-4">IF (heloc_available &gt; 0 AND strategy_beneficial) THEN</div>
                    <div className="ml-4">additional_heloc_use = min(heloc_available, optimal_amount)</div>
                    <div>END IF</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Strategy Beneficial Conditions</h3>
                <div className="text-primary-900 space-y-2">
                  <p>The algorithm determines HELOC usage is beneficial when:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Rate Advantage:</strong> Mortgage rate ≥ HELOC rate</li>
                    <li><strong>Near Payoff:</strong> Mortgage balance &lt; 10% of HELOC limit</li>
                    <li><strong>Available Credit:</strong> HELOC has available credit remaining</li>
                    <li><strong>Positive Cash Flow:</strong> Discretionary income can service HELOC payments</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Safety Limits</h3>
                <div className="bg-coral-50 border border-coral-200 p-4 rounded-lg">
                  <div className="text-coral-800 space-y-2">
                    <p><strong>Maximum Iterations:</strong> 600 months (50 years) to prevent infinite loops</p>
                    <p><strong>Minimum Balance:</strong> $0.01 threshold to handle floating-point precision</p>
                    <p><strong>Credit Limit:</strong> Never exceed available HELOC credit limit</p>
                    <p><strong>Payment Validation:</strong> Ensure principal payments don&apos;t exceed remaining balance</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Comparison Analysis */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Comparison Analysis</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Key Comparison Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary-100">
                        <th className="text-left p-3 font-semibold text-primary-900">Metric</th>
                        <th className="text-left p-3 font-semibold text-primary-900">Formula</th>
                        <th className="text-left p-3 font-semibold text-primary-900">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200">
                      <tr>
                        <td className="p-3 font-mono text-primary-900">Time Saved</td>
                        <td className="p-3 font-mono text-xs text-primary-900">Traditional Months - HELOC Months</td>
                        <td className="p-3 text-primary-900">Months earlier payoff is achieved</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-primary-900">Interest Saved</td>
                        <td className="p-3 font-mono text-xs text-primary-900">Traditional Interest - HELOC Interest</td>
                        <td className="p-3 text-primary-900">Total dollar amount saved in interest</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-primary-900">Savings %</td>
                        <td className="p-3 font-mono text-xs text-primary-900">(Interest Saved ÷ Traditional) × 100</td>
                        <td className="p-3 text-primary-900">Percentage reduction in total interest</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-primary-900">Payment Difference</td>
                        <td className="p-3 font-mono text-xs text-primary-900">Avg HELOC Payment - Traditional Payment</td>
                        <td className="p-3 text-primary-900">Average monthly payment difference</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Risk Considerations</h3>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="text-amber-800 space-y-2">
                    <p><strong>Variable Rate Risk:</strong> HELOC rates can fluctuate, affecting strategy effectiveness</p>
                    <p><strong>Credit Access Risk:</strong> HELOC credit lines can be frozen or reduced</p>
                    <p><strong>Discipline Risk:</strong> Strategy requires consistent discretionary income allocation</p>
                    <p><strong>Market Risk:</strong> Property value changes can affect HELOC availability</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mathematical Assumptions */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Mathematical Assumptions</h2>
            
            <div className="text-primary-900 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Calculation Assumptions</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Interest is calculated monthly and compounds monthly</li>
                  <li>Payments are made at the end of each month</li>
                  <li>Interest rates remain constant throughout the calculation period</li>
                  <li>Discretionary income remains consistent month to month</li>
                  <li>No additional fees or closing costs are factored into calculations</li>
                  <li>HELOC credit remains available throughout the strategy period</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Precision Handling</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Balances are considered paid off when they reach $0.01 or less</li>
                  <li>Final payments are adjusted to pay exact remaining balance</li>
                  <li>All monetary values are calculated using standard floating-point arithmetic</li>
                  <li>Results are typically rounded to the nearest cent for display</li>
                </ul>
              </div>
            </div>
          </Card>
        </main>

        <div className="mt-12 text-center">
          <p className="text-primary-800">
            These calculations are for educational purposes. Consult with a financial advisor before implementing any debt payoff strategy.
          </p>
        </div>
      </div>
    </div>
  )
}
