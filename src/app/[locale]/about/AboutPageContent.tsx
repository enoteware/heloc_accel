"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

export default function AboutPageContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative w-full pt-16 md:pt-20 pb-12 md:pb-16">
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
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              About
              <span className="ml-3 inline-block pb-1 px-2 rounded-lg bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-500 dark:to-blue-700 text-white dark:text-slate-900">
                HELOC Accelerator
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We help homeowners understand and apply HELOC acceleration with
              transparent math, practical tools, and a focus on long-term
              financial wellness.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-body text-foreground-secondary max-w-3xl">
              Empower every homeowner with clear guidance and modern tools to
              pay off debt faster, save on interest, and build equity
              confidently.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="border border-border rounded-lg p-6 bg-background">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Transparent Math
                </h3>
                <p className="text-foreground-secondary">
                  No black boxes. We show the assumptions, formulas, and the
                  month-by-month impact.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-background">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Practical Tools
                </h3>
                <p className="text-foreground-secondary">
                  Purpose-built calculators, budgeting, and scenario planning
                  you can actually use.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-background">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  User‑First Privacy
                </h3>
                <p className="text-foreground-secondary">
                  You control your data. We design for security and minimal
                  collection by default.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* What is HELOC Acceleration */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                  What is HELOC Acceleration?
                </h2>
                <p className="text-foreground-secondary mb-4">
                  It’s a debt payoff strategy that leverages a Home Equity Line
                  of Credit (HELOC) to reduce average daily mortgage balance,
                  thereby lowering interest and shortening payoff time.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground-secondary">
                  <li>
                    Use cash flow to cycle through a lower‑interest HELOC.
                  </li>
                  <li>
                    Target chunks to minimize interest on your primary loan.
                  </li>
                  <li>Track progress with month‑by‑month projections.</li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-6 bg-background">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Try it with your numbers
                </h3>
                <p className="text-foreground-secondary mb-4">
                  Our calculator shows time saved, interest avoided, and cash
                  flow impacts—no signup required.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
                  >
                    Open Calculator
                  </Link>
                  <Link
                    href="/budgeting"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-border bg-background text-foreground hover:bg-surface transition-all duration-200"
                  >
                    Explore Budgeting
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Principles */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Product Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Clarity over complexity",
                  body: "We explain trade‑offs, assumptions, and outcomes in plain language.",
                },
                {
                  title: "Speed with accuracy",
                  body: "Fast interactions with calculations grounded in sound finance.",
                },
                {
                  title: "Secure by default",
                  body: "Minimize data retention and protect what you choose to share.",
                },
                {
                  title: "Inclusive by design",
                  body: "Accessible UI, readable typography, and strong contrast in all themes.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="border border-border rounded-lg p-6 bg-background"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-foreground-secondary">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Built With */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Built for Reliability
            </h2>
            <p className="text-foreground-secondary max-w-3xl">
              HELOC Accelerator is crafted with modern tooling (Next.js,
              TypeScript, Tailwind, Next‑Intl, and Playwright/Jest) and a
              component‑driven design system for consistency, speed, and
              accessibility.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border rounded-xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to see your potential savings?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Run the free calculator and compare strategies side‑by‑side. Your
              path to financial freedom can start today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Try Calculator Now
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg border border-border bg-background text-foreground hover:bg-surface transition-all duration-200 hover:scale-105"
              >
                Compare Strategies
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
