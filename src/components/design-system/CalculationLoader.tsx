import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

export interface CalculationLoaderProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
  className?: string;
}

const loadingMessages = [
  "Analyzing your mortgage details...",
  "Calculating HELOC scenarios...",
  "Optimizing payment strategies...",
  "Computing interest savings...",
  "Generating your personalized report...",
];

export const CalculationLoader: React.FC<CalculationLoaderProps> = ({
  isVisible,
  title = "Calculating Your HELOC Strategy",
  description,
  progress,
  steps = loadingMessages,
  currentStep = 0,
  className,
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isVisible) return;

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % steps.length);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        className,
      )}
      style={{ backgroundColor: "rgba(var(--color-background-overlay), 0.5)" }}
    >
      <div className="bg-card border border-border text-foreground rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            <LoadingSpinner
              size="xl"
              color="primary"
              className="mx-auto mb-4"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-ping" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

        {/* Current Step Message */}
        <p className="text-foreground-secondary mb-4 min-h-[1.5rem]">
          {steps[currentMessage]}
          {dots}
        </p>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-sm text-foreground-muted mt-2">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Step Indicator */}
        {currentStep !== undefined && (
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index <= currentStep
                    ? "bg-primary"
                    : index === currentStep + 1
                      ? "bg-primary/50 animate-pulse"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full animate-pulse" />
          <div
            className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalculationLoader;
