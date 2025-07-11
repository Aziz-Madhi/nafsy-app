import React, { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { ANIMATION_CONSTANTS } from './constants';

interface TypingDotsConfig {
  dotCount?: number;
  duration?: number;
  delay?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

/**
 * Reusable typing dots animation hook
 * Creates a staggered opacity animation for typing indicators
 * Used in: TypingIndicator, FloatingChatMode
 */
export function useTypingDotsAnimation({
  dotCount = 3,
  duration = ANIMATION_CONSTANTS.TYPING_DOT_DURATION,
  delay = ANIMATION_CONSTANTS.TYPING_DOT_DELAY,
  minOpacity = 0.3,
  maxOpacity = 1,
}: TypingDotsConfig = {}) {
  // Create shared values for each dot at the top level
  const dot1Opacity = useSharedValue(minOpacity);
  const dot2Opacity = useSharedValue(minOpacity);
  const dot3Opacity = useSharedValue(minOpacity);
  
  // Create array of opacities based on dotCount
  const dotOpacities = React.useMemo(() => {
    const opacities = [dot1Opacity, dot2Opacity, dot3Opacity];
    return opacities.slice(0, dotCount);
  }, [dot1Opacity, dot2Opacity, dot3Opacity, dotCount]);

  // Start animation
  const startAnimation = React.useCallback(() => {
    dotOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(
        index * delay,
        withRepeat(
          withSequence(
            withTiming(maxOpacity, { duration: duration / 2 }),
            withTiming(minOpacity, { duration: duration / 2 })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        )
      );
    });
  }, [dotOpacities, delay, maxOpacity, minOpacity, duration]);

  // Stop animation
  const stopAnimation = React.useCallback(() => {
    dotOpacities.forEach((opacity) => {
      opacity.value = withTiming(minOpacity, { duration: 200 });
    });
  }, [dotOpacities, minOpacity]);

  // Create animated styles for each dot at the top level
  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));
  
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));
  
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  // Create dotStyles array based on dotCount
  const dotStyles = React.useMemo(() => {
    const styles = [dot1Style, dot2Style, dot3Style];
    return styles.slice(0, dotCount);
  }, [dot1Style, dot2Style, dot3Style, dotCount]);

  return {
    dotStyles,
    startAnimation,
    stopAnimation,
    // Direct access to shared values for advanced customization
    dotOpacities,
  };
}

/**
 * Auto-starting version of typing dots animation
 * Automatically starts/stops based on the visible prop
 */
export function useAutoTypingDotsAnimation(
  visible: boolean,
  config?: TypingDotsConfig
) {
  const animation = useTypingDotsAnimation(config);

  useEffect(() => {
    if (visible) {
      animation.startAnimation();
    } else {
      animation.stopAnimation();
    }
    
    // Cleanup on unmount
    return () => {
      animation.stopAnimation();
    };
  }, [visible, animation]);

  return animation;
}