import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { NavigationProvider, NavigationBar } from '@/components/navigation'
import { ThemeProvider } from '../components/design-system/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HELOC Accelerator - Mortgage Payoff Calculator',
  description: 'Calculate potential savings using HELOC acceleration strategy to pay off your mortgage faster',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationProvider>
              <NavigationBar />
              <main className="min-h-screen">
                {children}
              </main>
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
