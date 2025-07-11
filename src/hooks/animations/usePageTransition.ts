/**
 * Page transition animation hook for slide/fade transitions
 * Provides combined fade and slide animations for page transitions
 */

import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { ANIMATION_CONSTANTS } from './constants';

interface PageTransitionOptions {
  direction?: 'horizontal' | 'vertical';
  distance?: number;
  duration?: number;
  initialVisible?: boolean;
}

export function usePageTransition({
  direction = 'horizontal',
  distance = 50,
  duration = ANIMATION_CONSTANTS.SLOW_TIMING,
  initialVisible = false,
}: PageTransitionOptions = {}) {
  const fadeAnim = useSharedValue(initialVisible ? 1 : 0);
  const slideAnim = useSharedValue(initialVisible ? 0 : distance);

  const animateIn = () => {
    // eslint-disable-next-line react-compiler/react-compiler
    fadeAnim.value = withTiming(1, { duration });
     
    slideAnim.value = withTiming(0, { duration });
  };

  const animateOut = () => {
     
    fadeAnim.value = withTiming(0, { duration });
     
    slideAnim.value = withTiming(distance, { duration });
  };

  const reset = () => {
     
    fadeAnim.value = 0;
     
    slideAnim.value = distance;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateProp = direction === 'horizontal' ? 'translateX' : 'translateY';
    
    return {
      opacity: fadeAnim.value,
      transform: [
        {
          [translateProp]: slideAnim.value,
        },
      ],
    };
  });

  // Alternative style for reverse direction (slide from opposite side)
  const reverseAnimatedStyle = useAnimatedStyle(() => {
    const translateProp = direction === 'horizontal' ? 'translateX' : 'translateY';
    
    return {
      opacity: fadeAnim.value,
      transform: [
        {
          [translateProp]: -slideAnim.value,
        },
      ],
    };
  });

  return {
    animatedStyle,
    reverseAnimatedStyle,
    animateIn,
    animateOut,
    reset,
    fadeAnim,
    slideAnim,
  };
}