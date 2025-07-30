import React from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icons'

// Type definitions for highlighting
export type HighlightType = 'heloc' | 'traditional' | 'savings' | 'payment' | 'neutral'

interface HighlightConfig {
  bgColor: string
  textColor: string
  borderColor: string
  icon?: string
  pulseAnimation?: boolean
}

const highlightConfigs: Record<HighlightType, HighlightConfig> = {
  heloc: {
    bgColor: 'bg-secondary-50',
    textColor: 'text-secondary-700',
    borderColor: 'border-secondary-200',
    icon: 'trending-up',
    pulseAnimation: true
  },
  traditional: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200'
  },
  savings: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: 'dollar'
  },
  payment: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: 'arrow-right'
  },
  neutral: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  }
}

// Payment Badge Component
interface PaymentBadgeProps {
  amount: number | string
  type: HighlightType
  label?: string
  showIcon?: boolean
  className?: string
}

export function PaymentBadge({ 
  amount, 
  type, 
  label, 
  showIcon = true,
  className 
}: PaymentBadgeProps) {
  const config = highlightConfigs[type]
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
      config.bgColor,
      config.textColor,
      config.borderColor,
      config.pulseAnimation && 'animate-pulse-subtle',
      className
    )}>
      {showIcon && config.icon && (
        <Icon name={config.icon as any} size="xs" />
      )}
      {label && <span className="text-xs font-medium">{label}:</span>}
      <span className="font-semibold">{amount}</span>
    </div>
  )
}

// Highlighted Table Cell Component
interface HighlightedCellProps {
  value: string | number
  type: HighlightType
  showTooltip?: boolean
  tooltipContent?: string
  className?: string
  children?: React.ReactNode
}

export function HighlightedCell({ 
  value, 
  type, 
  showTooltip = false,
  tooltipContent,
  className,
  children
}: HighlightedCellProps) {
  const config = highlightConfigs[type]
  
  return (
    <td className={cn(
      'relative px-4 py-2 text-sm',
      config.bgColor,
      config.textColor,
      'font-medium',
      type === 'heloc' && 'font-semibold',
      className
    )}>
      {children || value}
      {showTooltip && tooltipContent && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltipContent}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </td>
  )
}

// Flow Indicator Component
interface FlowIndicatorProps {
  from: string
  to: string
  amount: string
  className?: string
}

export function FlowIndicator({ from, to, amount, className }: FlowIndicatorProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-sm',
      className
    )}>
      <span className="font-medium text-gray-700">{from}</span>
      <div className="flex items-center gap-1 text-secondary-600">
        <Icon name="arrow-right" size="xs" />
        <span className="font-semibold">{amount}</span>
        <Icon name="arrow-right" size="xs" />
      </div>
      <span className="font-medium text-gray-700">{to}</span>
    </div>
  )
}

// Animated Counter Component
interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '',
  duration = 2000,
  className 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  
  React.useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration
    
    const updateValue = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(value * easeOutQuart)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }
    
    requestAnimationFrame(updateValue)
  }, [value, duration])
  
  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// Highlight Legend Component
export function HighlightLegend() {
  return (
    <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg text-xs">
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'w-3 h-3 rounded-full border',
          highlightConfigs.heloc.bgColor,
          highlightConfigs.heloc.borderColor
        )}></div>
        <span className="text-gray-600">HELOC Acceleration</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'w-3 h-3 rounded-full border',
          highlightConfigs.traditional.bgColor,
          highlightConfigs.traditional.borderColor
        )}></div>
        <span className="text-gray-600">Traditional Payment</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'w-3 h-3 rounded-full border',
          highlightConfigs.savings.bgColor,
          highlightConfigs.savings.borderColor
        )}></div>
        <span className="text-gray-600">Savings/Benefits</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'w-3 h-3 rounded-full border',
          highlightConfigs.payment.bgColor,
          highlightConfigs.payment.borderColor
        )}></div>
        <span className="text-gray-600">Payment Flow</span>
      </div>
    </div>
  )
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
`