/**
 * Rotation animation hook for continuous rotation effects
 * Provides smooth, configurable rotation animations with direction control
 * 
 * Note: React Compiler warnings about mutations are expected for Reanimated shared values.
 */
/* eslint-disable react-compiler/react-compiler */

import { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useEffect } from 'react';
import { ANIMATION_CONSTANTS } from './constants';

interface RotationAnimationOptions {
  duration?: number;
  direction?: 'clockwise' | 'counterclockwise';
  autoStart?: boolean;
  iterations?: number; // -1 for infinite
}

export function useRotationAnimation({
  duration = 20000,
  direction = 'clockwise',
  autoStart = true,
  iterations = -1,
}: RotationAnimationOptions = {}) {
  const rotation = useSharedValue(0);

  const startAnimation = () => {
    const startValue = direction === 'clockwise' ? 0 : 1;
    const endValue = direction === 'clockwise' ? 1 : 0;
    
    rotation.value = withRepeat(
      withTiming(endValue, { duration }),
      iterations,
      false
    );
  };

  const stopAnimation = () => {
    rotation.value = 0;
  };

  const pauseAnimation = () => {
    // Note: This doesn't actually pause, but stops at current position
    // For true pause/resume, we'd need to track the current progress
    rotation.value = rotation.value;
  };

  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart, duration, direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      rotate: interpolate(rotation.value, [0, 1], [0, 360]) + 'deg'
    }]
  }));

  // Reverse rotation style (useful for counter-rotating elements)
  const reverseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{
      rotate: interpolate(rotation.value, [0, 1], [360, 0]) + 'deg'
    }]
  }));

  return {
    animatedStyle,
    reverseAnimatedStyle,
    rotation,
    start: startAnimation,
    stop: stopAnimation,
    pause: pauseAnimation,
  };
}