/**
 * Pulse animation hook for breathing/heartbeat effects
 * Provides smooth pulsing animations with customizable intensity
 * 
 * Note: React Compiler warnings about mutations are expected for Reanimated shared values.
 */
/* eslint-disable react-compiler/react-compiler */

import { useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';
import { ANIMATION_CONSTANTS } from './constants';

interface PulseAnimationOptions {
  minScale?: number;
  maxScale?: number;
  duration?: number;
  autoStart?: boolean;
  iterations?: number; // -1 for infinite
}

export function usePulseAnimation({
  minScale = 1,
  maxScale = 1.05,
  duration = 2000,
  autoStart = true,
  iterations = -1,
}: PulseAnimationOptions = {}) {
  const scale = useSharedValue(minScale);

  const startPulse = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration }),
        withTiming(minScale, { duration })
      ),
      iterations,
      false
    );
  };

  const stopPulse = () => {
    scale.value = withTiming(minScale, { duration: ANIMATION_CONSTANTS.FAST_TIMING });
  };

  const singlePulse = () => {
    scale.value = withSequence(
      withTiming(maxScale, { duration: ANIMATION_CONSTANTS.FAST_TIMING }),
      withTiming(minScale, { duration: ANIMATION_CONSTANTS.FAST_TIMING })
    );
  };

  useEffect(() => {
    if (autoStart) {
      startPulse();
    }
  }, [autoStart, minScale, maxScale, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return {
    animatedStyle,
    scale,
    start: startPulse,
    stop: stopPulse,
    pulse: singlePulse,
  };
}