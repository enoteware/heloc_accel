"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface FinancialAceternityCardProps {
  title?: string;
  description?: string;
  theme?: 'home' | 'money' | 'success' | 'planning' | 'family';
  className?: string;
  children?: React.ReactNode;
  fallbackImage?: string;
  hoverGif?: string;
}

export default function FinancialAceternityCard({ 
  title = "Financial Success",
  description = "Achieve your homeownership and financial goals with strategic planning.",
  theme = 'success',
  className,
  children,
  fallbackImage = "https://images.unsplash.com/photo-1476842634003-7dcca8f832de?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
  hoverGif = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWlodTF3MjJ3NnJiY3Rlc2J0ZmE0c28yeWoxc3gxY2VtZzA5ejF1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/syEfLvksYQnmM/giphy.gif"
}: FinancialAceternityCardProps) {
  const [backgroundImage, setBackgroundImage] = useState(fallbackImage);
  const [loading, setLoading] = useState(true);
  const [photographer, setPhotographer] = useState('');

  useEffect(() => {
    // Fetch one stable image for this card
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/pexels/search?theme=${theme}&per_page=1&random=true`);
        const data = await response.json();
        
        if (data.success && data.data.photos.length > 0) {
          const photo = data.data.photos[0];
          setBackgroundImage(photo.src.large);
          setPhotographer(photo.photographer);
        }
      } catch (error) {
        console.error('Failed to fetch image:', error);
        // Keep fallback image
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [theme]); // Only depend on theme, not on every render

  return (
    <div className={cn("max-w-xs w-full", className)}>
      <div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          "bg-cover bg-center transition-all duration-500",
          // Always have a gradient overlay for text readability
          "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/70 before:via-black/20 before:to-transparent before:z-10",
          // Additional overlay on hover
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black hover:after:opacity-30 hover:after:z-20"
        )}
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundImage = `url(${hoverGif})`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundImage = `url(${backgroundImage})`
        }}
      >
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading image...</div>
          </div>
        )}
        
        <div className="text relative z-50">
          {children ? (
            children
          ) : (
            <>
              <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                {title}
              </h1>
              <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                {description}
              </p>
            </>
          )}
        </div>

        {/* Attribution overlay (hidden on hover) */}
        {photographer && !loading && (
          <div className="absolute bottom-1 right-1 text-xs text-white/70 bg-black/30 px-2 py-1 rounded group-hover:opacity-0 transition-opacity duration-300">
            <span>Photo by </span>
            <span className="underline">{photographer}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Preset cards for different financial themes
export function HomeAceternityCard(props: Omit<FinancialAceternityCardProps, 'theme'>) {
  return (
    <FinancialAceternityCard
      theme="home"
      title="Dream Home"
      description="Turn your homeownership dreams into reality with smart financial strategies."
      {...props}
    />
  );
}

export function MoneyAceternityCard(props: Omit<FinancialAceternityCardProps, 'theme'>) {
  return (
    <FinancialAceternityCard
      theme="money"
      title="Smart Savings"
      description="Maximize your financial potential and build wealth through strategic planning."
      {...props}
    />
  );
}

export function SuccessAceternityCard(props: Omit<FinancialAceternityCardProps, 'theme'>) {
  return (
    <FinancialAceternityCard
      theme="success"
      title="Financial Freedom"
      description="Achieve your goals faster with HELOC acceleration strategies."
      {...props}
    />
  );
}

export function PlanningAceternityCard(props: Omit<FinancialAceternityCardProps, 'theme'>) {
  return (
    <FinancialAceternityCard
      theme="planning"
      title="Strategic Planning"
      description="Professional guidance to optimize your mortgage payoff strategy."
      {...props}
    />
  );
}

export function FamilyAceternityCard(props: Omit<FinancialAceternityCardProps, 'theme'>) {
  return (
    <FinancialAceternityCard
      theme="family"
      title="Family Security"
      description="Build a secure financial future for your family and loved ones."
      {...props}
    />
  );
}