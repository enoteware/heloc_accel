'use client'

// NextAuth has been replaced with Stack Auth
// This component is kept for compatibility but no longer wraps with SessionProvider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}