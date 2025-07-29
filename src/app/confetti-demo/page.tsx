'use client'

import React, { useEffect } from 'react'
import { useConfetti } from '@/hooks/useConfetti'

export default function ConfettiDemo() {
  const { triggerConfetti } = useConfetti()
  
  // Direct test function
  const testDirectConfetti = () => {
    console.log('Testing direct confetti call...')
    // Dynamic import for client-side only
    import('canvas-confetti').then((module) => {
      const confetti = module.default
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          HELOC Accelerator Confetti Demo 🎉
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Test Different Confetti Animations
          </h2>

          <p className="text-gray-600 mb-6">
            These confetti animations are triggered automatically when you achieve significant savings in the HELOC calculator.
          </p>

          <div className="mb-6">
            <button
              onClick={testDirectConfetti}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md w-full"
            >
              Test Direct Confetti (Debug)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => triggerConfetti({ type: 'success' })}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-md"
            >
              Success Confetti
              <span className="block text-sm mt-1 opacity-90">($10k-$25k savings)</span>
            </button>

            <button
              onClick={() => triggerConfetti({ type: 'savings' })}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-md"
            >
              Savings Confetti
              <span className="block text-sm mt-1 opacity-90">($25k-$50k savings)</span>
            </button>

            <button
              onClick={() => triggerConfetti({ type: 'celebration' })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-md"
            >
              Celebration Confetti
              <span className="block text-sm mt-1 opacity-90">($50k+ savings)</span>
            </button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Automatic Triggers
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Live calculator updates trigger confetti when savings thresholds are met</li>
              <li>• Results page includes a &quot;Celebrate Savings!&quot; button</li>
              <li>• Confetti respects user&apos;s reduced motion preferences</li>
              <li>• Different animations based on savings amount</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Try it out:</strong> Click any button above to see the confetti animation. 
              The animations use your app&apos;s color scheme and are optimized for performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}