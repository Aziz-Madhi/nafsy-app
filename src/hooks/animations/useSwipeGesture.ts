import { useCallback } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { ANIMATION_CONSTANTS } from './constants';

interface SwipeGestureConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
  hapticType?: 'Light' | 'Medium' | 'Heavy';
  springConfig?: object;
  scale?: boolean;
  scaleValue?: number;
  returnToCenter?: boolean;
  disabled?: boolean;
}

/**
 * Reusable swipe gesture hook with haptic feedback
 * Handles swipe gestures in all directions with animation
 * Used in: SwipeableExerciseCard, LiquidTab
 */
export function useSwipeGesture({
  threshold = ANIMATION_CONSTANTS.SWIPE_THRESHOLD,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  hapticFeedback = true,
  hapticType = ANIMATION_CONSTANTS.HAPTIC_MEDIUM,
  springConfig = ANIMATION_CONSTANTS.SPRING_CONFIG,
  scale = true,
  scaleValue = ANIMATION_CONSTANTS.LARGE_SCALE,
  returnToCenter = true,
  disabled = false,
}: SwipeGestureConfig) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleShared = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated style for the swipeable element
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        ...(scale ? [{ scale: scaleShared.value }] : []),
      ],
      opacity: opacity.value,
    };
  });

  // Trigger haptic feedback
  const triggerHaptic = useCallback(() => {
    if (hapticFeedback) {
      const hapticMap = {
        Light: Haptics.ImpactFeedbackStyle.Light,
        Medium: Haptics.ImpactFeedbackStyle.Medium,
        Heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(hapticMap[hapticType]);
    }
  }, [hapticFeedback, hapticType]);

  // Reset position
  const resetPosition = () => {
    if (returnToCenter) {
       
      translateX.value = withSpring(0, springConfig);
       
      translateY.value = withSpring(0, springConfig);
    }
    if (scale) {
       
      scaleShared.value = withSpring(1, springConfig);
    }
     
    opacity.value = withTiming(1);
  };

  // Pan gesture
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      'worklet';
      const { translationX, translationY } = event;
      
      // Update translation
      // eslint-disable-next-line react-compiler/react-compiler
      translateX.value = translationX;
       
      translateY.value = translationY;
      
      // Update scale if enabled and within threshold
      if (scale) {
        const distance = Math.sqrt(translationX * translationX + translationY * translationY);
        if (distance > threshold / 2) {
          scaleShared.value = withSpring(scaleValue, springConfig);
        } else {
          scaleShared.value = withSpring(1, springConfig);
        }
      }
    })
    .onEnd((event) => {
      'worklet';
      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Determine swipe direction based on distance and velocity
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      
      let actionTriggered = false;
      
      // Horizontal swipes (prioritize if more horizontal than vertical)
      if (absX > absY && absX > threshold) {
        if (translationX > 0 && onSwipeRight) {
          runOnJS(triggerHaptic)();
          runOnJS(onSwipeRight)();
          actionTriggered = true;
        } else if (translationX < 0 && onSwipeLeft) {
          runOnJS(triggerHaptic)();
          runOnJS(onSwipeLeft)();
          actionTriggered = true;
        }
      }
      // Vertical swipes
      else if (absY > threshold) {
        if (translationY > 0 && onSwipeDown) {
          runOnJS(triggerHaptic)();
          runOnJS(onSwipeDown)();
          actionTriggered = true;
        } else if (translationY < 0 && onSwipeUp) {
          runOnJS(triggerHaptic)();
          runOnJS(onSwipeUp)();
          actionTriggered = true;
        }
      }
      
      // Check velocity-based swipes if no distance-based swipe triggered
      if (!actionTriggered) {
        if (Math.abs(velocityX) > 500) {
          if (velocityX > 0 && onSwipeRight) {
            runOnJS(triggerHaptic)();
            runOnJS(onSwipeRight)();
          } else if (velocityX < 0 && onSwipeLeft) {
            runOnJS(triggerHaptic)();
            runOnJS(onSwipeLeft)();
          }
        } else if (Math.abs(velocityY) > 500) {
          if (velocityY > 0 && onSwipeDown) {
            runOnJS(triggerHaptic)();
            runOnJS(onSwipeDown)();
          } else if (velocityY < 0 && onSwipeUp) {
            runOnJS(triggerHaptic)();
            runOnJS(onSwipeUp)();
          }
        }
      }
      
      // Reset position
      resetPosition();
    });

  return {
    animatedStyle,
    panGesture,
    resetPosition: () => runOnJS(resetPosition)(),
    // Direct access to shared values for advanced use cases
    translateX,
    translateY,
    scale: scaleShared,
    opacity,
  };
}