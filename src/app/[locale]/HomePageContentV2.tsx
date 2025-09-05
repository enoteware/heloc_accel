"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icons";

export default function HomePageContent() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full pt-16 md:pt-20 pb-12 md:pb-16">
        {/* Dot pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgb(var(--color-border)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
              transition={{ duration: 0.5, delay: 0.25 }}
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
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Feature Grid */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Transform Your Financial Future
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how HELOC acceleration can help you achieve your
              financial goals faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Calculate Savings",
                desc: "See exactly how much time and money you can save with HELOC acceleration",
                gradient: "from-blue-900/80 to-blue-600/40",
                icon: "calculator" as const,
              },
              {
                title: "Strategic Planning",
                desc: "Get detailed month-by-month strategies for optimal HELOC utilization",
                gradient: "from-green-900/80 to-green-600/40",
                icon: "target" as const,
              },
              {
                title: "Achieve Freedom",
                desc: "Pay off your mortgage faster and achieve financial freedom sooner",
                gradient: "from-purple-900/80 to-purple-600/40",
                icon: "zap" as const,
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                className="w-full"
              >
                <div
                  className={`group w-full overflow-hidden relative h-80 rounded-xl shadow-lg border border-border bg-gradient-to-t ${card.gradient} p-5`}
                >
                  {/* Icon badge */}
                  <div className="absolute top-5 left-5 z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <Icon
                        name={card.icon}
                        size="xl"
                        variant="default"
                        className="text-white drop-shadow"
                      />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end">
                    <h3 className="font-bold text-2xl text-white drop-shadow-lg">
                      {card.title}
                    </h3>
                    <p className="text-base text-gray-100 mt-3 drop-shadow-md">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Why Choose HELOC Acceleration?
              </h3>
              <p className="text-muted-foreground text-lg">
                Smart homeowners are using this strategy to save thousands
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Save Money",
                  desc: "Potentially save thousands in mortgage interest payments",
                  icon: "dollar-sign" as const,
                },
                {
                  title: "Pay Off Faster",
                  desc: "Reduce your mortgage term by years, not months",
                  icon: "timer" as const,
                },
                {
                  title: "Build Equity",
                  desc: "Leverage your home's equity to accelerate wealth building",
                  icon: "trending-up" as const,
                },
              ].map((b) => (
                <div key={b.title} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                    <Icon name={b.icon} size="xl" variant="primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">
                    {b.title}
                  </h4>
                  <p className="text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border rounded-xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Saving?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use our free calculator to see how much you could save with HELOC
              acceleration. No signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {t("calculator.getStarted")}
              </Link>
              <Link
                href="/budgeting"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg border border-border bg-background text-foreground hover:bg-surface transition-all duration-200 hover:scale-105"
              >
                Explore Budgeting Tool
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
