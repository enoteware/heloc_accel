"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface StableAceternityCardProps {
  title?: string;
  description?: string;
  theme?: "home" | "money" | "success" | "planning" | "family";
  className?: string;
  children?: React.ReactNode;
}

// Curated theme-specific images that make sense
const THEME_IMAGES = {
  home: {
    background:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    hover:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  },
  money: {
    background:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    hover:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1200&q=80",
  },
  success: {
    background:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    hover:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
  },
  planning: {
    background:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    hover:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  },
  family: {
    background:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    hover:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1200&q=80",
  },
};

const THEME_DEFAULTS = {
  home: {
    title: "Dream Home",
    description:
      "Turn your homeownership dreams into reality with smart financial strategies.",
  },
  money: {
    title: "Smart Savings",
    description:
      "Maximize your financial potential and build wealth through strategic planning.",
  },
  success: {
    title: "Financial Freedom",
    description:
      "Achieve your goals faster with HELOC acceleration strategies.",
  },
  planning: {
    title: "Strategic Planning",
    description:
      "Professional guidance to optimize your mortgage payoff strategy.",
  },
  family: {
    title: "Family Security",
    description:
      "Build a secure financial future for your family and loved ones.",
  },
};

export default function StableAceternityCard({
  title,
  description,
  theme = "success",
  className,
  children,
}: StableAceternityCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const themeData = THEME_IMAGES[theme];
  const defaults = THEME_DEFAULTS[theme];

  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div className={cn("max-w-xs w-full", className)}>
      <div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          "bg-cover bg-center transition-all duration-500",
          // Always have a gradient overlay for text readability
          "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/70 before:via-black/20 before:to-transparent before:z-10",
          // Additional overlay on hover
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black hover:after:opacity-30 hover:after:z-20",
        )}
        style={{
          backgroundImage: `url(${isHovered ? themeData.hover : themeData.background})`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text relative z-50">
          {children ? (
            children
          ) : (
            <>
              <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                {displayTitle}
              </h1>
              <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                {displayDescription}
              </p>
            </>
          )}
        </div>

        {/* Theme indicator */}
        <div className="absolute top-2 right-2 text-xs text-white/90 bg-black/50 px-2 py-1 rounded capitalize z-50 backdrop-blur-sm">
          {theme}
        </div>
      </div>
    </div>
  );
}

// Preset components for easy use
export function StableHomeCard(
  props: Omit<StableAceternityCardProps, "theme">,
) {
  return <StableAceternityCard theme="home" {...props} />;
}

export function StableMoneyCard(
  props: Omit<StableAceternityCardProps, "theme">,
) {
  return <StableAceternityCard theme="money" {...props} />;
}

export function StableSuccessCard(
  props: Omit<StableAceternityCardProps, "theme">,
) {
  return <StableAceternityCard theme="success" {...props} />;
}

export function StablePlanningCard(
  props: Omit<StableAceternityCardProps, "theme">,
) {
  return <StableAceternityCard theme="planning" {...props} />;
}

export function StableFamilyCard(
  props: Omit<StableAceternityCardProps, "theme">,
) {
  return <StableAceternityCard theme="family" {...props} />;
}
