export const ANIMATION_CONSTANTS = {
  // Durations
  FAST_DURATION: 150,
  DEFAULT_DURATION: 300,
  SLOW_DURATION: 500,
  FADE_DURATION: 300,
  
  // Scale values
  DEFAULT_SCALE: 1,
  LARGE_SCALE: 1.05,
  SMALL_SCALE: 0.95,
  PULSE_SCALE: 1.1,
  
  // Opacity values
  HIDDEN_OPACITY: 0,
  VISIBLE_OPACITY: 1,
  SEMI_TRANSPARENT: 0.7,
  
  // Spring configurations
  SPRING_CONFIG: {
    mass: 0.8,
    damping: 15,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  // Timing configurations
  TIMING_CONFIG: {
    duration: 300,
    easing: 'easeInOut' as const,
  },
} as const;