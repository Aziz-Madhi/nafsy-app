// Glass effect hooks and utilities
export {
  useGlassEffect,
  useGlassStyle,
  GLASS_VARIANTS,
  GLASS_BLUR_INTENSITIES,
  type GlassVariant,
  type GlassEffectConfig,
  type GlassEffectProps,
} from './useGlassEffect';

// Glass effect constants for common overlay patterns
export const GLASS_OVERLAY_COLORS = {
  // Action overlays
  FAVORITE: {
    light: ['rgba(255, 107, 157, 0.3)', 'rgba(255, 107, 157, 0.1)'],
    dark: ['rgba(255, 107, 157, 0.2)', 'rgba(255, 107, 157, 0.05)'],
  },
  SUCCESS: {
    light: ['rgba(74, 222, 128, 0.3)', 'rgba(74, 222, 128, 0.1)'],
    dark: ['rgba(74, 222, 128, 0.2)', 'rgba(74, 222, 128, 0.05)'],
  },
  WARNING: {
    light: ['rgba(251, 191, 36, 0.3)', 'rgba(251, 191, 36, 0.1)'],
    dark: ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)'],
  },
  ERROR: {
    light: ['rgba(248, 113, 113, 0.3)', 'rgba(248, 113, 113, 0.1)'],
    dark: ['rgba(248, 113, 113, 0.2)', 'rgba(248, 113, 113, 0.05)'],
  },
  INFO: {
    light: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)'],
    dark: ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)'],
  },
} as const;

// Utility for creating themed glass overlay colors
export function createGlassOverlayColors(
  baseColor: string,
  lightOpacity: number = 0.3,
  darkOpacity: number = 0.2
) {
  return {
    light: [
      baseColor.replace(/rgba?\([^)]+\)/, `rgba(${baseColor.match(/\d+/g)?.slice(0, 3).join(', ')}, ${lightOpacity})`),
      baseColor.replace(/rgba?\([^)]+\)/, `rgba(${baseColor.match(/\d+/g)?.slice(0, 3).join(', ')}, ${lightOpacity * 0.5})`),
    ],
    dark: [
      baseColor.replace(/rgba?\([^)]+\)/, `rgba(${baseColor.match(/\d+/g)?.slice(0, 3).join(', ')}, ${darkOpacity})`),
      baseColor.replace(/rgba?\([^)]+\)/, `rgba(${baseColor.match(/\d+/g)?.slice(0, 3).join(', ')}, ${darkOpacity * 0.5})`),
    ],
  };
}