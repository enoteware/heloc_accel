"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";

export default function HomePageContent() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[24rem] md:h-[28rem] w-full flex items-center justify-center pt-16 md:pt-20 pb-16">
        {/* Dot pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(var(--color-border)) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t("pages.homeHero.title")}{" "}
              <span className="relative inline-block pb-1 px-1 rounded-lg bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-500 dark:to-blue-700 text-white dark:text-slate-900">
                {t("pages.homeHero.highlight")}
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {t("pages.homeHero.subtitle")}{" "}
              <span className="font-semibold text-primary">
                {t("pages.homeHero.saveMoney")}
              </span>{" "}
              {t("pages.homeHero.connector")}{" "}
              <span className="font-semibold text-primary">
                {t("pages.homeHero.achieveFreedom")}
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10"
            >
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {t("calculator.getStarted")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transform Your Financial Future
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how HELOC acceleration can help you achieve your
              financial goals faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="max-w-xs w-full"
            >
              <div className="group w-full cursor-pointer overflow-hidden relative h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-border bg-gradient-to-t from-blue-900/80 to-blue-600/40">
                <div className="text relative z-50">
                  <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                    Calculate Savings
                  </h1>
                  <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                    See exactly how much time and money you can save with HELOC
                    acceleration
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="max-w-xs w-full"
            >
              <div className="group w-full cursor-pointer overflow-hidden relative h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-border bg-gradient-to-t from-green-900/80 to-green-600/40">
                <div className="text relative z-50">
                  <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                    Strategic Planning
                  </h1>
                  <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                    Get detailed month-by-month strategies for optimal HELOC
                    utilization
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="max-w-xs w-full"
            >
              <div className="group w-full cursor-pointer overflow-hidden relative h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-border bg-gradient-to-t from-purple-900/80 to-purple-600/40">
                <div className="text relative z-50">
                  <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                    Achieve Freedom
                  </h1>
                  <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                    Pay off your mortgage faster and achieve financial freedom
                    sooner
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why Choose HELOC Acceleration?
              </h3>
              <p className="text-muted-foreground text-lg">
                Smart homeowners are using this strategy to save thousands
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Save Money
                </h4>
                <p className="text-muted-foreground">
                  Potentially save thousands in mortgage interest payments
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Pay Off Faster
                </h4>
                <p className="text-muted-foreground">
                  Reduce your mortgage term by years, not months
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Build Equity
                </h4>
                <p className="text-muted-foreground">
                  Leverage your home's equity to accelerate wealth building
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border rounded-xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Saving?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use our free calculator to see how much you could save with HELOC
              acceleration. No signup required - get your personalized analysis
              in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Try Calculator Now
              </Link>
              <Link
                href="/budgeting"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg border border-border bg-background text-foreground hover:bg-surface transition-all duration-200 hover:scale-105"
              >
                Explore Budgeting Tool
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
