'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Disable automatic refetching to prevent CLIENT_FETCH_ERROR spam
      refetchOnWindowFocus={false}
      // Don't refetch session automatically
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
}