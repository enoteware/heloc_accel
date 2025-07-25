'use client'

import React, { useEffect, useState } from 'react'

export default function EnvironmentBanner() {
  const [mounted, setMounted] = useState(false)
  
  // Get environment variables
  const demoModeRaw = process.env.NEXT_PUBLIC_DEMO_MODE
  const nodeEnv = process.env.NODE_ENV
  
  // Proper demo mode detection - handle whitespace and variations
  const isDemoMode = demoModeRaw?.trim().toLowerCase() === 'true'

  useEffect(() => {
    setMounted(true)
    
    // Debug logging
    console.log('=== ENVIRONMENT BANNER DEBUG ===')
    console.log('Component mounted!')
    console.log('NEXT_PUBLIC_DEMO_MODE raw:', demoModeRaw)
    console.log('NEXT_PUBLIC_DEMO_MODE type:', typeof demoModeRaw)
    console.log('NEXT_PUBLIC_DEMO_MODE length:', demoModeRaw?.length)
    console.log('Comparison result (=== "true"):', demoModeRaw === 'true')
    console.log('NODE_ENV:', nodeEnv)
    console.log('isDemoMode result:', isDemoMode)
    console.log('All process.env keys:', Object.keys(process.env))
    console.log('NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')))
    console.log('================================')
    
    // Also log to window for easy debugging
    if (typeof window !== 'undefined') {
      (window as any).envDebug = {
        demoModeRaw,
        nodeEnv,
        isDemoMode,
        allEnvKeys: Object.keys(process.env),
        nextPublicKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC'))
      }
      console.log('Debug info also available at window.envDebug')
    }
  }, [demoModeRaw, nodeEnv, isDemoMode])

  // Show immediately for server-side rendering, then client-side rendering
  return (
    <div className={`w-full py-3 px-4 text-center text-sm font-medium border-b-4 ${
      isDemoMode 
        ? 'bg-green-600 text-white border-green-800' 
        : nodeEnv === 'development'
        ? 'bg-blue-600 text-white border-blue-800'
        : 'bg-purple-600 text-white border-purple-800'
    }`} style={{ zIndex: 9999 }}>
      {isDemoMode ? (
        <span>
          🎮 DEMO MODE ACTIVE - Use: demo@example.com / demo123 | 
          <span className="ml-2 opacity-90">Data stored locally, no signup needed</span>
        </span>
      ) : nodeEnv === 'development' ? (
        <span>
          🔧 DEVELOPMENT MODE - Debug enabled
        </span>
      ) : (
        <span>
          🚀 PRODUCTION MODE
        </span>
      )}
    </div>
  )
}