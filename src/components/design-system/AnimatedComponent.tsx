'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  useIntersectionAnimation,
  fadeInKeyframes,
  slideInUpKeyframes,
  slideInDownKeyframes,
  slideInLeftKeyframes,
  slideInRightKeyframes,
  scaleInKeyframes,
  UseAnimationOptions
} from '@/hooks/useAnimation';

export interface AnimatedComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  duration?: number;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const animationKeyframes = {
  fadeIn: fadeInKeyframes,
  slideInUp: slideInUpKeyframes,
  slideInDown: slideInDownKeyframes,
  slideInLeft: slideInLeftKeyframes,
  slideInRight: slideInRightKeyframes,
  scaleIn: scaleInKeyframes,
};

export const AnimatedComponent = forwardRef<HTMLElement, AnimatedComponentProps>(
  ({ 
    animation = 'fadeIn',
    duration = 600,
    delay = 0,
    threshold = 0.1,
    rootMargin = '0px',
    children,
    className,
    as: Component = 'div',
    ...props 
  }, ref) => {
    const keyframes = animationKeyframes[animation];
    
    const animationOptions: UseAnimationOptions & { threshold?: number; rootMargin?: string } = {
      duration,
      delay,
      threshold,
      rootMargin,
      easing: 'ease-out',
      fillMode: 'forwards',
    };

    const elementRef = useIntersectionAnimation(keyframes, animationOptions);

    // Merge refs if external ref is provided
    const mergedRef = (node: HTMLElement | null) => {
      if (elementRef) {
        (elementRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      }
    };

    return React.createElement(
      Component,
      {
        ref: mergedRef,
        className: cn('opacity-0', className),
        ...props,
      },
      children
    );
  }
);

AnimatedComponent.displayName = 'AnimatedComponent';

// Convenience components for common animations
export const FadeIn: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="fadeIn" {...props} />
);

export const SlideInUp: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="slideInUp" {...props} />
);

export const SlideInDown: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="slideInDown" {...props} />
);

export const SlideInLeft: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="slideInLeft" {...props} />
);

export const SlideInRight: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="slideInRight" {...props} />
);

export const ScaleIn: React.FC<Omit<AnimatedComponentProps, 'animation'>> = (props) => (
  <AnimatedComponent animation="scaleIn" {...props} />
);

// Staggered animation component
export interface StaggeredAnimationProps {
  children: React.ReactNode[];
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  duration?: number;
  staggerDelay?: number;
  threshold?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  animation = 'fadeIn',
  duration = 600,
  staggerDelay = 100,
  threshold = 0.1,
  className,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedComponent
          animation={animation}
          duration={duration}
          delay={index * staggerDelay}
          threshold={threshold}
          key={index}
        >
          {child}
        </AnimatedComponent>
      ))}
    </div>
  );
};
