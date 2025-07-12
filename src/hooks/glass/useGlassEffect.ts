import { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

// Standardized glass effect variants
export const GLASS_VARIANTS = {
  // Transparency levels
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  ULTRA: 'ultra',
  
  // Specialized effects
  OVERLAY: 'overlay',
  CARD: 'card',
  INPUT: 'input',
  MODAL: 'modal',
} as const;

export type GlassVariant = typeof GLASS_VARIANTS[keyof typeof GLASS_VARIANTS];

// Standardized blur intensities
export const GLASS_BLUR_INTENSITIES = {
  light: 40,
  medium: 60,
  heavy: 80,
  ultra: 95,
  overlay: 50,
  card: 70,
  input: 80,
  modal: 90,
} as const;

// Glass effect configuration
export interface GlassEffectConfig {
  variant?: GlassVariant;
  customIntensity?: number;
  customColors?: {
    light?: string[];
    dark?: string[];
  };
  borderEnabled?: boolean;
  shadowEnabled?: boolean;
  elevation?: number;
}

// Glass effect properties
export interface GlassEffectProps {
  intensity: number;
  tint: 'light' | 'dark' | 'default';
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
  gradientColors: string[];
}

/**
 * Hook for generating consistent glass effect properties
 */
export function useGlassEffect(config: GlassEffectConfig = {}): GlassEffectProps {
  const { isDark } = useTheme();
  
  const {
    variant = GLASS_VARIANTS.MEDIUM,
    customIntensity,
    customColors,
    borderEnabled = true,
    shadowEnabled = true,
    elevation = 2,
  } = config;

  return useMemo(() => {
    const intensity = customIntensity ?? GLASS_BLUR_INTENSITIES[variant];
    
    // Define glass colors for each variant
    const getGlassColors = () => {
      if (customColors) {
        return customColors;
      }
      
      switch (variant) {
        case GLASS_VARIANTS.LIGHT:
          return {
            light: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
            dark: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
          };
          
        case GLASS_VARIANTS.MEDIUM:
          return {
            light: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)'],
            dark: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
          };
          
        case GLASS_VARIANTS.HEAVY:
          return {
            light: ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)'],
            dark: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)'],
          };
          
        case GLASS_VARIANTS.ULTRA:
          return {
            light: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'],
            dark: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
          };
          
        case GLASS_VARIANTS.OVERLAY:
          return {
            light: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)'],
            dark: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'],
          };
          
        case GLASS_VARIANTS.CARD:
          return {
            light: [
              'rgba(255, 255, 255, 0.4)', 
              'rgba(245, 245, 245, 0.2)'  // Warm gray tint (#F5F5F5)
            ],
            dark: [
              'rgba(30, 30, 30, 0.4)',     // Dark surface (#1E1E1E)
              'rgba(18, 18, 18, 0.2)'      // Dark background (#121212)
            ],
          };
          
        case GLASS_VARIANTS.INPUT:
          return {
            light: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'],
            dark: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
          };
          
        case GLASS_VARIANTS.MODAL:
          return {
            light: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'],
            dark: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)'],
          };
          
        default:
          return {
            light: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)'],
            dark: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
          };
      }
    };
    
    const glassColors = getGlassColors();
    const currentGradientColors = (isDark ? glassColors.dark : glassColors.light) || ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
    
    // Determine tint based on theme
    const tint = isDark ? 'dark' : 'light';
    
    // Background color (primary gradient color)
    const backgroundColor = currentGradientColors[0];
    
    // Border color with theme adaptation using new color palette
    const borderColor = borderEnabled 
      ? (isDark 
        ? 'rgba(133, 193, 233, 0.15)' // Light sky blue for dark mode (#85C1E9)
        : 'rgba(74, 144, 226, 0.2)')   // Soft blue for light mode (#4A90E2)
      : 'transparent';
      
    // Shadow properties
    const shadowColor = isDark ? '#000000' : '#000000';
    const shadowOpacity = shadowEnabled 
      ? (isDark ? Math.min(0.3, elevation * 0.1) : Math.min(0.15, elevation * 0.05))
      : 0;
    const shadowRadius = elevation * 3;
    const shadowOffset = { width: 0, height: elevation * 2 };
    const androidElevation = elevation * 2;

    return {
      intensity,
      tint,
      backgroundColor,
      borderColor,
      shadowColor,
      shadowOpacity,
      shadowRadius,
      shadowOffset,
      elevation: androidElevation,
      gradientColors: currentGradientColors,
    };
  }, [variant, customIntensity, customColors, borderEnabled, shadowEnabled, elevation, isDark]);
}

/**
 * Hook for generating glass effect styles for regular View components
 */
export function useGlassStyle(config: GlassEffectConfig = {}): ViewStyle {
  const glassProps = useGlassEffect(config);
  
  return useMemo((): ViewStyle => ({
    backgroundColor: glassProps.backgroundColor,
    borderWidth: config.borderEnabled !== false ? 1 : 0,
    borderColor: glassProps.borderColor,
    shadowColor: glassProps.shadowColor,
    shadowOffset: glassProps.shadowOffset,
    shadowOpacity: glassProps.shadowOpacity,
    shadowRadius: glassProps.shadowRadius,
    elevation: glassProps.elevation,
  }), [glassProps, config.borderEnabled]);
}