import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { NavigationProvider, NavigationBar } from "@/components/navigation";
import { ThemeProvider } from "../../components/design-system/ThemeProvider";
// import EnvironmentBanner from '@/components/EnvironmentBanner'
import { CompanyProvider } from "@/contexts/CompanyContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import DebugInfo from "@/components/DebugInfo";
import LiveDebugLogger from "@/components/LiveDebugLogger";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import Footer from "@/components/Footer";
import ConsoleInterceptor from "@/components/ConsoleInterceptor";
import StorageMonitor from "@/components/StorageMonitor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HELOC Accelerator - Mortgage Payoff Calculator",
  description:
    "Calculate potential savings using HELOC acceleration strategy to pay off your mortgage faster",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
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
    <div lang={locale} className={inter.className}>
      <StackProvider app={stackServerApp}>
        <StackTheme>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <AuthProvider>
                <CompanyProvider>
                  <NavigationProvider>
                    <NavigationBar />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                    <DebugInfo />
                    <ConsoleInterceptor />
                    <StorageMonitor
                      showDetails={false}
                      className="fixed bottom-4 right-4 z-50"
                    />
                    {/* <LiveDebugLogger /> */}
                  </NavigationProvider>
                </CompanyProvider>
              </AuthProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </StackTheme>
      </StackProvider>
    </div>
  );
}
