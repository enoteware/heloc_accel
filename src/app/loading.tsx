import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-primary-200 mx-auto"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading HELOC Accelerator
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your financial tools...
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Demo mode indicator */}
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Demo Mode
          </div>
        )}
      </div>
    </div>
  )
}
