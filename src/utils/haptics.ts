/**
 * Centralized haptic feedback utilities for wellness interactions
 * Provides consistent haptic patterns throughout the app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useCallback, useRef, useEffect } from 'react';

export type HapticType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'breatheIn'
  | 'breatheOut'
  | 'moodChange'
  | 'exercise'
  | 'meditation';

/**
 * Haptic feedback configuration for different interaction types
 */
const hapticConfigs = {
  // Basic interactions
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  // Status feedback
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  
  // UI interactions
  selection: () => Haptics.selectionAsync(),
  
  // Wellness-specific patterns
  breatheIn: async () => {
    // Gentle increasing pattern for inhale
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(200);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  breatheOut: async () => {
    // Gentle decreasing pattern for exhale
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await delay(200);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  
  moodChange: async () => {
    // Double tap pattern for mood changes
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  
  exercise: async () => {
    // Energizing pattern for starting exercises
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await delay(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  
  meditation: async () => {
    // Calming pattern for meditation
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(300);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(300);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
};

/**
 * Delay utility for haptic patterns
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main haptic feedback function
 * Only works on iOS devices with haptic capabilities
 */
export async function triggerHaptic(type: HapticType): Promise<void> {
  // Only trigger on iOS
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    const hapticFunction = hapticConfigs[type];
    if (hapticFunction) {
      await hapticFunction();
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Hook for haptic feedback with component lifecycle management
 */

export function useHaptic() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const trigger = useCallback(async (type: HapticType) => {
    if (isMounted.current) {
      await triggerHaptic(type);
    }
  }, []);

  return { trigger };
}

/**
 * Haptic feedback for button presses
 */
export function useButtonHaptic() {
  const { trigger } = useHaptic();

  return {
    onPressIn: () => trigger('light'),
    onPress: () => trigger('selection'),
  };
}

/**
 * Haptic feedback for mood selection
 */
export function useMoodHaptic() {
  const { trigger } = useHaptic();

  return {
    onMoodSelect: () => trigger('moodChange'),
    onMoodHover: () => trigger('light'),
  };
}

/**
 * Haptic feedback for exercise interactions
 */
export function useExerciseHaptic() {
  const { trigger } = useHaptic();

  return {
    onExerciseStart: () => trigger('exercise'),
    onExerciseComplete: () => trigger('success'),
    onExerciseSkip: () => trigger('warning'),
  };
}

/**
 * Haptic feedback for breathing exercises
 */
export function useBreathingHaptic() {
  const { trigger } = useHaptic();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathingPattern = useCallback((
    inhaleMs: number,
    holdMs: number,
    exhaleMs: number
  ) => {
    // Clear any existing pattern
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let phase = 0;
    const cycle = async () => {
      switch (phase) {
        case 0: // Inhale
          await trigger('breatheIn');
          phase = 1;
          break;
        case 1: // Hold
          // No haptic during hold
          phase = 2;
          break;
        case 2: // Exhale
          await trigger('breatheOut');
          phase = 0;
          break;
      }
    };

    // Start the breathing cycle
    cycle();
    intervalRef.current = setInterval(cycle, inhaleMs + holdMs + exhaleMs);
  }, [trigger]);

  const stopBreathingPattern = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBreathingPattern();
    };
  }, [stopBreathingPattern]);

  return {
    startBreathingPattern,
    stopBreathingPattern,
    triggerInhale: () => trigger('breatheIn'),
    triggerExhale: () => trigger('breatheOut'),
  };
}

/**
 * Haptic feedback patterns for different wellness states
 */
export const WellnessHaptics = {
  // Mood-related haptics
  moodImproved: async () => {
    await triggerHaptic('success');
  },
  
  moodDeclined: async () => {
    await triggerHaptic('warning');
  },
  
  // Exercise haptics
  exerciseStarted: async () => {
    await triggerHaptic('exercise');
  },
  
  exerciseCompleted: async () => {
    await triggerHaptic('success');
    await delay(200);
    await triggerHaptic('success');
  },
  
  exerciseMilestone: async () => {
    await triggerHaptic('medium');
    await delay(100);
    await triggerHaptic('heavy');
  },
  
  // Meditation haptics
  meditationBell: async () => {
    await triggerHaptic('meditation');
  },
  
  // Chat haptics
  messageReceived: async () => {
    await triggerHaptic('light');
  },
  
  messageSent: async () => {
    await triggerHaptic('selection');
  },
  
  // Crisis support haptics
  crisisButtonPressed: async () => {
    await triggerHaptic('heavy');
    await delay(100);
    await triggerHaptic('heavy');
  },
};

/**
 * Accessibility-aware haptic wrapper
 * Respects system settings for haptic feedback
 */
export function createAccessibleHaptic(hapticFn: () => Promise<void>) {
  return async () => {
    // In a real app, check accessibility settings here
    // For now, we'll always trigger haptics on iOS
    if (Platform.OS === 'ios') {
      await hapticFn();
    }
  };
}

if (__DEV__) {
  // Export for testing in development
  (global as any).WellnessHaptics = WellnessHaptics;
}