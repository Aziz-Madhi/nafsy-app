import { useSharedValue, useAnimatedStyle, withSpring, withTiming, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import { ANIMATION_CONSTANTS } from './constants';

interface ScaleAnimationConfig {
  initialScale?: number;
  springConfig?: WithSpringConfig;
  timingConfig?: WithTimingConfig;
  useSpring?: boolean; // Whether to use spring or timing animation
}

/**
 * Reusable scale animation hook
 * Provides scale animations with spring or timing curves
 * Used across multiple components for emphasis and feedback
 */
export function useScaleAnimation({
  initialScale = 1,
  springConfig = ANIMATION_CONSTANTS.SPRING_CONFIG,
  timingConfig = { duration: ANIMATION_CONSTANTS.TIMING_DURATION },
  useSpring = true,
}: ScaleAnimationConfig = {}) {
  const scale = useSharedValue(initialScale);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Scale to a specific value
  const scaleTo = (targetScale: number, customConfig?: WithSpringConfig | WithTimingConfig) => {
    if (useSpring) {
      // eslint-disable-next-line react-compiler/react-compiler
      scale.value = withSpring(targetScale, customConfig || springConfig);
    } else {
       
      scale.value = withTiming(targetScale, customConfig || timingConfig);
    }
  };

  // Scale in (enlarge)
  const scaleIn = (targetScale = ANIMATION_CONSTANTS.LARGE_SCALE, customConfig?: WithSpringConfig | WithTimingConfig) => {
    scaleTo(targetScale, customConfig);
  };

  // Scale out (shrink)
  const scaleOut = (targetScale = ANIMATION_CONSTANTS.SMALL_SCALE, customConfig?: WithSpringConfig | WithTimingConfig) => {
    scaleTo(targetScale, customConfig);
  };

  // Reset to original scale
  const resetScale = (customConfig?: WithSpringConfig | WithTimingConfig) => {
    scaleTo(1, customConfig);
  };

  // Pulse animation (scale up then back down)
  const pulse = (pulseScale = ANIMATION_CONSTANTS.LARGE_SCALE, customConfig?: WithSpringConfig | WithTimingConfig) => {
    if (useSpring) {
       
      scale.value = withSpring(pulseScale, customConfig || springConfig, () => {
        'worklet';
         
        scale.value = withSpring(1, customConfig || springConfig);
      });
    } else {
       
      scale.value = withTiming(pulseScale, customConfig || timingConfig, () => {
        'worklet';
         
        scale.value = withTiming(1, customConfig || timingConfig);
      });
    }
  };

  // Set scale instantly without animation
  const setScale = (value: number) => {
     
    scale.value = value;
  };

  return {
    animatedStyle,
    scaleTo,
    scaleIn,
    scaleOut,
    resetScale,
    pulse,
    setScale,
    // Direct access to shared value for advanced use cases
    scale,
  };
}