import {
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

/**
 * Create a progress animation helper
 * Replaces: Animated.timing for progress bars/rings
 */
export const useProgressAnimation = (
  initialProgress: number = 0,
  duration: number = 1000
) => {
  const progress = useSharedValue(initialProgress);

  const animateProgress = (toValue: number, callback?: () => void) => {
    progress.value = withTiming(toValue, { duration }, callback ? runOnJS(callback) : undefined);
  };

  // Helper for stroke-dashoffset calculation (for SVG progress rings)
  const getStrokeDashoffset = (circumference: number) => {
    'worklet';
    return circumference - (circumference * progress.value) / 100;
  };

  return { progress, animateProgress, getStrokeDashoffset };
};