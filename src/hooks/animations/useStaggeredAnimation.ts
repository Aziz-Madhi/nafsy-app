import { useCallback } from 'react';
import { ANIMATION_CONSTANTS } from './constants';

export interface StaggeredAnimationOptions {
  itemCount: number;
  delay?: number;
  duration?: number;
  initialValue?: number;
  finalValue?: number;
  trigger?: boolean;
}

export function useStaggeredAnimation({
  itemCount,
  delay = 150,
  duration = ANIMATION_CONSTANTS.FADE_DURATION,
  initialValue = 0,
  finalValue = 1,
  trigger = true,
}: StaggeredAnimationOptions) {
  // Return helper functions for manual animation
  const getStaggeredDelay = useCallback((index: number) => index * delay, [delay]);
  
  const getAnimationConfig = useCallback(() => ({
    duration,
    initialValue,
    finalValue,
  }), [duration, initialValue, finalValue]);

  // Return utility functions for staggered animations
  return {
    getStaggeredDelay,
    getAnimationConfig,
    itemCount,
    trigger,
  };
}