import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { ANIMATION_CONSTANTS } from './constants';

interface ButtonPressConfig {
  scaleValue?: number;
  opacityValue?: number;
  springConfig?: object;
  timingDuration?: number;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Reusable button press animation hook
 * Consolidates the common scale + opacity animation pattern
 * Used in: GlassmorphicCard, SwipeableExerciseCard, LiquidTab, ExercisePlayer
 * 
 * Note: React Compiler warnings about mutations are expected and safe for 
 * Reanimated shared values in worklet contexts.
 */
/* eslint-disable react-compiler/react-compiler */
export function useButtonPressAnimation({
  scaleValue = ANIMATION_CONSTANTS.PRESS_SCALE,
  opacityValue = ANIMATION_CONSTANTS.PRESS_OPACITY,
  springConfig = ANIMATION_CONSTANTS.SPRING_CONFIG,
  timingDuration = ANIMATION_CONSTANTS.TIMING_DURATION,
  onPress,
  disabled = false,
}: ButtonPressConfig = {}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated style for the component
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Tap gesture handler
  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(scaleValue, springConfig);
      opacity.value = withTiming(opacityValue, { duration: timingDuration });
    })
    .onEnd(() => {
      'worklet';
      if (onPress) {
        runOnJS(onPress)();
      }
      scale.value = withSpring(1, springConfig);
      opacity.value = withTiming(1, { duration: timingDuration });
    })
    .onFinalize(() => {
      'worklet';
      // Ensure reset even if gesture is cancelled
      scale.value = withSpring(1, springConfig);
      opacity.value = withTiming(1, { duration: timingDuration });
    });

  // Manual trigger functions for non-gesture use
  const pressIn = () => {
    // Note: These are safe mutations for animation values
    scale.value = withSpring(scaleValue, springConfig);
    opacity.value = withTiming(opacityValue, { duration: timingDuration });
  };

  const pressOut = () => {
    // Note: These are safe mutations for animation values
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: timingDuration });
  };

  // Aliases for backwards compatibility
  const handlePressIn = pressIn;
  const handlePressOut = pressOut;

  return {
    animatedStyle,
    tapGesture,
    pressIn,
    pressOut,
    handlePressIn,
    handlePressOut,
    // Direct access to shared values for advanced use cases
    scale,
    opacity,
  };
}