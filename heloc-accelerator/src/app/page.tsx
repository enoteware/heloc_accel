export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-200">
            Get Started - Calculate Your Savings
          </button>
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
