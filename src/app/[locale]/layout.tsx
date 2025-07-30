import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { NavigationProvider, NavigationBar } from '@/components/navigation'
import { ThemeProvider } from '../../components/design-system/ThemeProvider'
import EnvironmentBanner from '@/components/EnvironmentBanner'
import { CompanyProvider } from '@/contexts/CompanyContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher'
import DebugInfo from '@/components/DebugInfo'
import LiveDebugLogger from '@/components/LiveDebugLogger'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HELOC Accelerator - Mortgage Payoff Calculator',
  description: 'Calculate potential savings using HELOC acceleration strategy to pay off your mortgage faster',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <CompanyProvider>
                <NavigationProvider>
                  <EnvironmentBanner />
                  <NavigationBar />
                  <div className="fixed top-4 right-4 z-50">
                    <SimpleLanguageSwitcher />
                  </div>
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <DebugInfo />
                  <LiveDebugLogger />
                </NavigationProvider>
              </CompanyProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}