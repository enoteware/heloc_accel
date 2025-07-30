'use client'

import React, { useEffect, useState } from 'react'

export default function EnvironmentBanner() {
  const nodeEnv = process.env.NODE_ENV
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Debug logging
  console.log('=== ENVIRONMENT BANNER DEBUG ===')
  console.log('Component mounted!')
  console.log('NEXT_PUBLIC_DEMO_MODE raw:', process.env.NEXT_PUBLIC_DEMO_MODE)
  console.log('NEXT_PUBLIC_DEMO_MODE type:', typeof process.env.NEXT_PUBLIC_DEMO_MODE)
  console.log('NEXT_PUBLIC_DEMO_MODE length:', process.env.NEXT_PUBLIC_DEMO_MODE?.length)
  console.log('Comparison result (=== "true"):', process.env.NEXT_PUBLIC_DEMO_MODE === 'true')
  console.log('NODE_ENV:', nodeEnv)
  console.log('isDemoMode result:', isDemoMode)
  console.log('All process.env keys:', Object.keys(process.env))
  console.log('NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')))
  console.log('================================')
  console.log('Debug info also available at window.envDebug')

  // Make debug info available globally
  if (typeof window !== 'undefined') {
    ;(window as any).envDebug = {
      nodeEnv,
      isDemoMode,
      rawDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
      allEnvKeys: Object.keys(process.env),
      nextPublicKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC'))
    }
  }

  // Don't show banner in production
  if (nodeEnv === 'production') {
    return null
  }

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50
      px-4 py-2 text-sm font-medium text-center
      border-b-2 shadow-lg
      ${isDemoMode
        ? 'bg-blue-600 text-white border-blue-800'
        : 'bg-purple-600 text-white border-purple-800'
    }`} style={{ zIndex: 9999 }}>
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