'use client'

import React from 'react'

export default function LoginDemoBanner() {
  const nodeEnv = process.env.NODE_ENV
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Don't show banner in production
  if (nodeEnv === 'production') {
    return null
  }

  return (
    <div className={`
      w-full px-4 py-3 text-sm font-medium text-center
      border-b-2 shadow-sm mb-6
      ${isDemoMode
        ? 'bg-blue-600 text-white border-blue-800'
        : 'bg-purple-600 text-white border-purple-800'
    }`}>
      {isDemoMode ? (
        <span>
          🎮 DEMO MODE ACTIVE - Use: demo@example.com / demo123456 |
          <span className="ml-2 opacity-90">Data stored locally, no signup needed</span>
        </span>
      ) : nodeEnv === 'development' ? (
        <span>
          🔧 DEVELOPMENT MODE - Debug enabled
        </span>
      ) : (
        <span>
          ⚠️ NON-PRODUCTION ENVIRONMENT
        </span>
      )}
    </div>
  )
}
