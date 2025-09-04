"use client";

import React from "react";
import Link from "next/link";
import {
  AceternityCard,
  AceternityCardDemo,
  FinancialAceternityCard,
  HomeAceternityCard,
  MoneyAceternityCard,
  SuccessAceternityCard,
  PlanningAceternityCard,
  FamilyAceternityCard,
  StableAceternityCard,
  StableHomeCard,
  StableMoneyCard,
  StableSuccessCard,
  StablePlanningCard,
  StableFamilyCard,
} from "@/components/design-system";

export default function AceternityDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Aceternity UI Cards Demo
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Interactive cards with background overlays and hover effects,
            integrated with Pexels API for dynamic financial imagery.
          </p>
        </div>

        {/* Original Aceternity Card */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Original Aceternity Card
          </h2>
          <div className="flex justify-center">
            <AceternityCardDemo />
          </div>
        </section>

        {/* Stable Financial Cards - No Loops */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Stable Financial Cards (Curated Images)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
            <StableHomeCard />
            <StableMoneyCard />
            <StableSuccessCard />
            <StablePlanningCard />
            <StableFamilyCard />
          </div>
          <p className="text-center text-foreground-secondary mt-4 text-sm">
            ✨ These cards use curated Unsplash images with stable hover effects
            - no endless loops!
          </p>
        </section>

        {/* Dynamic Pexels Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Dynamic Pexels Cards (Live API)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
            <HomeAceternityCard />
            <MoneyAceternityCard />
            <SuccessAceternityCard />
            <PlanningAceternityCard />
            <FamilyAceternityCard />
          </div>
          <p className="text-center text-foreground-secondary mt-4 text-sm">
            🔄 These cards fetch live images from Pexels API (may have loading
            states)
          </p>
        </section>

        {/* Custom Content Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Custom Content Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <FinancialAceternityCard
              theme="money"
              title="HELOC Calculator"
              description="Calculate your potential savings with our advanced HELOC acceleration tool."
            >
              <div className="space-y-4">
                <h1 className="font-bold text-2xl text-primary-foreground relative drop-shadow-md">
                  💰 HELOC Calculator
                </h1>
                <p className="font-normal text-sm text-primary-foreground relative drop-shadow-md">
                  See how much you can save with HELOC acceleration
                </p>
                <button className="btn btn-primary">Start Calculating</button>
              </div>
            </FinancialAceternityCard>

            <FinancialAceternityCard theme="success" className="max-w-sm">
              <div className="space-y-4">
                <h1 className="font-bold text-2xl text-primary-foreground relative drop-shadow-md">
                  🏆 Success Stories
                </h1>
                <p className="font-normal text-sm text-primary-foreground relative drop-shadow-md">
                  Join thousands who&apos;ve paid off their mortgage faster
                </p>
                <div className="flex space-x-2">
                  <div className="badge badge-success">5-8 Years Saved</div>
                  <div className="badge badge-primary">$50K+ Saved</div>
                </div>
              </div>
            </FinancialAceternityCard>

            <FinancialAceternityCard
              theme="planning"
              title="Expert Consultation"
              description="Get personalized advice from HELOC specialists and mortgage professionals."
            />
          </div>
        </section>

        {/* Integration Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            HELOC Application Integration
          </h2>
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              How to Use in Your Components
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-foreground mb-3">
                  Basic Usage:
                </h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {`import { HomeAceternityCard } from '@/components/design-system'

<HomeAceternityCard
  title="Your Dream Home"
  description="Custom description here"
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">
                  Custom Content:
                </h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {`<FinancialAceternityCard theme="success">
  <div className="space-y-4">
    <h1 className="font-bold text-2xl text-primary-foreground">
      Custom Title
    </h1>
    <button className="btn btn-primary">
      Action Button
    </button>
  </div>
</FinancialAceternityCard>`}
                </pre>
              </div>
            </div>

            <div className="mt-8 p-4 bg-info-background rounded-lg">
              <h4 className="font-medium text-info-foreground mb-2">
                ✨ Features:
              </h4>
              <ul className="text-sm text-info-foreground space-y-1">
                <li>• Dynamic Pexels API integration for background images</li>
                <li>
                  • 5 pre-configured financial themes (home, money, success,
                  planning, family)
                </li>
                <li>• Hover effects with animated GIF overlays</li>
                <li>• Proper photo attribution with photographer credits</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• TypeScript support with full type safety</li>
                <li>• Loading states and error handling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
