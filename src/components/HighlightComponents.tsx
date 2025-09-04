import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icons";

// Type definitions for highlighting
export type HighlightType =
  | "heloc"
  | "traditional"
  | "savings"
  | "payment"
  | "neutral";

interface HighlightConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon?: string;
  pulseAnimation?: boolean;
}

const highlightConfigs: Record<HighlightType, HighlightConfig> = {
  heloc: {
    bgColor: "bg-secondary",
    textColor: "text-secondary-foreground",
    borderColor: "border-secondary",
    icon: "trending-up",
    pulseAnimation: true,
  },
  traditional: {
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border",
  },
  savings: {
    bgColor: "bg-success",
    textColor: "text-success-foreground",
    borderColor: "border-success",
    icon: "dollar",
  },
  payment: {
    bgColor: "bg-info",
    textColor: "text-info-foreground",
    borderColor: "border-info",
    icon: "arrow-right",
  },
  neutral: {
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border",
  },
};

// Payment Badge Component
interface PaymentBadgeProps {
  amount: number | string;
  type: HighlightType;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function PaymentBadge({
  amount,
  type,
  label,
  showIcon = true,
  className,
}: PaymentBadgeProps) {
  const config = highlightConfigs[type];

  const containerClass =
    type === "savings"
      ? "badge-success"
      : type === "payment"
        ? "badge-info"
        : type === "heloc"
          ? "badge-secondary"
          : type === "neutral" || type === "traditional"
            ? "badge-default"
            : "badge-default";

  return (
    <div
      className={cn(
        "badge-md gap-1.5",
        containerClass,
        config.pulseAnimation && "animate-pulse-subtle",
        className,
      )}
    >
      {showIcon && config.icon && <Icon name={config.icon as any} size="xs" />}
      {label && <span className="text-xs font-medium">{label}:</span>}
      <span className="font-semibold">{amount}</span>
    </div>
  );
}

// Highlighted Table Cell Component
interface HighlightedCellProps {
  value: string | number;
  type: HighlightType;
  showTooltip?: boolean;
  tooltipContent?: string;
  className?: string;
  children?: React.ReactNode;
}

export function HighlightedCell({
  value,
  type,
  showTooltip = false,
  tooltipContent,
  className,
  children,
}: HighlightedCellProps) {
  const config = highlightConfigs[type];

  return (
    <td
      className={cn(
        "relative px-4 py-2 text-sm",
        config.bgColor,
        config.textColor,
        "font-medium",
        type === "heloc" && "font-semibold",
        className,
      )}
    >
      {children || value}
      {showTooltip && tooltipContent && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-popover text-popover-foreground text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltipContent}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-popover"></div>
            </div>
          </div>
        </div>
      )}
    </td>
  );
}

// Flow Indicator Component
interface FlowIndicatorProps {
  from: string;
  to: string;
  amount: string;
  className?: string;
}

export function FlowIndicator({
  from,
  to,
  amount,
  className,
}: FlowIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="font-medium text-foreground">{from}</span>
      <div className="flex items-center gap-1 text-secondary-foreground">
        <Icon name="arrow-right" size="xs" />
        <span className="font-semibold">{amount}</span>
        <Icon name="arrow-right" size="xs" />
      </div>
      <span className="font-medium text-foreground">{to}</span>
    </div>
  );
}

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2000,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(value * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Highlight Legend Component
export function HighlightLegend() {
  return (
    <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-xs">
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-3 h-3 rounded-full border",
            highlightConfigs.heloc.bgColor,
            highlightConfigs.heloc.borderColor,
          )}
        ></div>
        <span className="text-muted-foreground">HELOC Acceleration</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-3 h-3 rounded-full border",
            highlightConfigs.traditional.bgColor,
            highlightConfigs.traditional.borderColor,
          )}
        ></div>
        <span className="text-muted-foreground">Traditional Payment</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-3 h-3 rounded-full border",
            highlightConfigs.savings.bgColor,
            highlightConfigs.savings.borderColor,
          )}
        ></div>
        <span className="text-muted-foreground">Savings/Benefits</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-3 h-3 rounded-full border",
            highlightConfigs.payment.bgColor,
            highlightConfigs.payment.borderColor,
          )}
        ></div>
        <span className="text-muted-foreground">Payment Flow</span>
      </div>
    </div>
  );
}

// Add subtle pulse animation to tailwind
export const pulseAnimationStyles = `
  @keyframes pulse-subtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse-subtle {
    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;
