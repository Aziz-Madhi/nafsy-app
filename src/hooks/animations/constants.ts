/**
 * Animation constants used across the app
 * Centralized configuration for consistent animations
 */

export const ANIMATION_CONSTANTS = {
  // Button press animations
  PRESS_SCALE: 0.98,
  PRESS_OPACITY: 0.8,
  
  // Spring configurations
  SPRING_CONFIG: { 
    tension: 300, 
    friction: 25 
  },
  GENTLE_SPRING: {
    tension: 200,
    friction: 20
  },
  
  // Timing durations
  TIMING_DURATION: 100,
  FADE_DURATION: 500,
  FAST_TIMING: 150,
  SLOW_TIMING: 300,
  
  // Gesture thresholds
  SWIPE_THRESHOLD: 60,
  TAP_THRESHOLD: 10,
  
  // Typing animation
  TYPING_DOT_DURATION: 400,
  TYPING_DOT_DELAY: 200,
  
  // Common scales
  SMALL_SCALE: 0.95,
  MEDIUM_SCALE: 0.98,
  LARGE_SCALE: 1.02,
  
  // Haptic feedback types
  HAPTIC_LIGHT: 'Light' as const,
  HAPTIC_MEDIUM: 'Medium' as const,
  HAPTIC_HEAVY: 'Heavy' as const,
} as const;