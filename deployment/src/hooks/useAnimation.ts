'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterations?: number | 'infinite';
}

export interface AnimationControls {
  play: () => void;
  pause: () => void;
  cancel: () => void;
  finish: () => void;
  reverse: () => void;
  isPlaying: boolean;
  isFinished: boolean;
}

export function useAnimation(
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: UseAnimationOptions = {}
): [React.RefObject<HTMLElement>, AnimationControls] {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const controls: AnimationControls = {
    play: () => {
      if (animationRef.current) {
        animationRef.current.play();
        setIsPlaying(true);
        setIsFinished(false);
      }
    },
    pause: () => {
      if (animationRef.current) {
        animationRef.current.pause();
        setIsPlaying(false);
      }
    },
    cancel: () => {
      if (animationRef.current) {
        animationRef.current.cancel();
        setIsPlaying(false);
        setIsFinished(false);
      }
    },
    finish: () => {
      if (animationRef.current) {
        animationRef.current.finish();
        setIsPlaying(false);
        setIsFinished(true);
      }
    },
    reverse: () => {
      if (animationRef.current) {
        animationRef.current.reverse();
      }
    },
    isPlaying,
    isFinished,
  };

  useEffect(() => {
    if (!elementRef.current) return;

    const animationOptions: KeyframeAnimationOptions = {
      duration: options.duration || 300,
      delay: options.delay || 0,
      easing: options.easing || 'ease-out',
      fill: options.fillMode || 'forwards',
      iterations: options.iterations === 'infinite' ? Infinity : (options.iterations || 1),
    };

    animationRef.current = elementRef.current.animate(keyframes, animationOptions);

    const animation = animationRef.current;

    const handleFinish = () => {
      setIsPlaying(false);
      setIsFinished(true);
    };

    const handleCancel = () => {
      setIsPlaying(false);
      setIsFinished(false);
    };

    animation.addEventListener('finish', handleFinish);
    animation.addEventListener('cancel', handleCancel);

    // Pause by default
    animation.pause();

    return () => {
      animation.removeEventListener('finish', handleFinish);
      animation.removeEventListener('cancel', handleCancel);
      animation.cancel();
    };
  }, [keyframes, options.duration, options.delay, options.easing, options.fillMode, options.iterations]);

  return [elementRef, controls];
}

export function useIntersectionAnimation(
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: UseAnimationOptions & { threshold?: number; rootMargin?: string } = {}
): React.RefObject<HTMLElement> {
  const [elementRef, controls] = useAnimation(keyframes, options);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!elementRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            controls.play();
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, controls, hasAnimated, options.threshold, options.rootMargin]);

  return elementRef;
}

export function useStaggeredAnimation(
  count: number,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: UseAnimationOptions & { staggerDelay?: number } = {}
): [React.RefObject<HTMLElement>[], () => void] {
  const elementRefs = useRef<(HTMLElement | null)[]>(Array(count).fill(null));
  const animationsRef = useRef<Animation[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const refs = Array.from({ length: count }, (_, index) => ({
    current: elementRefs.current[index],
  })) as React.RefObject<HTMLElement>[];

  const playAll = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    const staggerDelay = options.staggerDelay || 100;

    elementRefs.current.forEach((element, index) => {
      if (!element) return;

      const animationOptions: KeyframeAnimationOptions = {
        duration: options.duration || 300,
        delay: (options.delay || 0) + (index * staggerDelay),
        easing: options.easing || 'ease-out',
        fill: options.fillMode || 'forwards',
        iterations: options.iterations === 'infinite' ? Infinity : (options.iterations || 1),
      };

      const animation = element.animate(keyframes, animationOptions);
      animationsRef.current[index] = animation;

      if (index === elementRefs.current.length - 1) {
        animation.addEventListener('finish', () => {
          setIsPlaying(false);
        });
      }
    });
  };

  useEffect(() => {
    return () => {
      animationsRef.current.forEach((animation) => {
        if (animation) {
          animation.cancel();
        }
      });
    };
  }, []);

  return [refs, playAll];
}

// Predefined animation keyframes
export const fadeInKeyframes: Keyframe[] = [
  { opacity: 0 },
  { opacity: 1 },
];

export const slideInUpKeyframes: Keyframe[] = [
  { transform: 'translateY(100%)', opacity: 0 },
  { transform: 'translateY(0)', opacity: 1 },
];

export const slideInDownKeyframes: Keyframe[] = [
  { transform: 'translateY(-100%)', opacity: 0 },
  { transform: 'translateY(0)', opacity: 1 },
];

export const slideInLeftKeyframes: Keyframe[] = [
  { transform: 'translateX(-100%)', opacity: 0 },
  { transform: 'translateX(0)', opacity: 1 },
];

export const slideInRightKeyframes: Keyframe[] = [
  { transform: 'translateX(100%)', opacity: 0 },
  { transform: 'translateX(0)', opacity: 1 },
];

export const scaleInKeyframes: Keyframe[] = [
  { transform: 'scale(0.8)', opacity: 0 },
  { transform: 'scale(1)', opacity: 1 },
];

export const bounceKeyframes: Keyframe[] = [
  { transform: 'translateY(0)' },
  { transform: 'translateY(-30px)' },
  { transform: 'translateY(0)' },
  { transform: 'translateY(-15px)' },
  { transform: 'translateY(0)' },
];

export const pulseKeyframes: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.05)' },
  { transform: 'scale(1)' },
];
