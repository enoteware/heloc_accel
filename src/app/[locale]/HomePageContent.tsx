"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import PexelsImage from "@/components/PexelsImage";
import {
  StableMoneyCard,
  StablePlanningCard,
  StableSuccessCard,
  HeroHighlight,
  Highlight,
} from "@/components/design-system";
import { motion } from "framer-motion";

export default function HomePageContent() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Hero Highlight */}
      <HeroHighlight className="flex items-center justify-center pt-16 md:pt-20">
        <div className="container mx-auto px-4">
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
            className="text-center"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t("pages.homeHero.title")}{" "}
              <Highlight className="text-white">
                {t("pages.homeHero.highlight")}
              </Highlight>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto"
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
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all transform hover:scale-105"
              >
                {t("calculator.getStarted")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </HeroHighlight>

      <div className="container mx-auto px-4 py-4">
        {/* Feature Grid with Aceternity Cards */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-8">
            Transform Your Financial Future
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            <StableMoneyCard
              title="Calculate Savings"
              description="See exactly how much time and money you can save with HELOC acceleration"
            />
            <StablePlanningCard
              title="Strategic Planning"
              description="Get detailed month-by-month strategies for optimal HELOC utilization"
            />
            <StableSuccessCard
              title="Achieve Freedom"
              description="Pay off your mortgage faster and achieve financial freedom sooner"
            />
          </div>
        </div>

        {/* Aceternity Demo Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              ✨ Enhanced with Aceternity UI
            </h3>
            <p className="text-muted-foreground mb-6">
              Experience interactive cards with dynamic backgrounds and hover
              effects throughout the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
