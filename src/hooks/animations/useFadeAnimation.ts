import { useSharedValue, useAnimatedStyle, withTiming, WithTimingConfig } from 'react-native-reanimated';
import { ANIMATION_CONSTANTS } from './constants';

interface FadeAnimationConfig {
  duration?: number;
  initialOpacity?: number;
  timingConfig?: WithTimingConfig;
}

/**
 * Reusable fade animation hook
 * Provides fade in/out animations with customizable duration
 * Used in: ExercisePlayer, FloatingChatMode
 */
export function useFadeAnimation({
  duration = ANIMATION_CONSTANTS.FADE_DURATION,
  initialOpacity = 0,
  timingConfig,
}: FadeAnimationConfig = {}) {
  const opacity = useSharedValue(initialOpacity);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Fade in animation
  const fadeIn = (customDuration?: number, toOpacity = 1) => {
    // eslint-disable-next-line react-compiler/react-compiler
    opacity.value = withTiming(
      toOpacity, 
      { 
        duration: customDuration ?? duration,
        ...timingConfig 
      }
    );
  };

  // Fade out animation
  const fadeOut = (customDuration?: number, toOpacity = 0) => {
     
    opacity.value = withTiming(
      toOpacity, 
      { 
        duration: customDuration ?? duration,
        ...timingConfig 
      }
    );
  };

  // Toggle fade (fade in if currently faded out, fade out if visible)
  const toggleFade = (customDuration?: number) => {
    const targetOpacity = opacity.value < 0.5 ? 1 : 0;
     
    opacity.value = withTiming(
      targetOpacity, 
      { 
        duration: customDuration ?? duration,
        ...timingConfig 
      }
    );
  };

  // Set opacity instantly without animation
  const setOpacity = (value: number) => {
     
    opacity.value = value;
  };

  return {
    animatedStyle,
    fadeIn,
    fadeOut,
    toggleFade,
    setOpacity,
    // Direct access to shared value for advanced use cases
    opacity,
  };
}