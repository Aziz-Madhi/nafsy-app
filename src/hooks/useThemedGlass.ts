import { useGlassStyle } from "@/hooks/glass/useGlassEffect";
import { useTheme, lightTheme } from "@/theme";
import { GlassVariant } from "@/hooks/glass";

// OPTIMIZATION: Consolidated glass effect + theme pattern following LEVER framework
// Eliminates duplicate glass style setup across multiple screens

interface UseThemedGlassOptions {
  variant?: GlassVariant;
  borderEnabled?: boolean;
  shadowEnabled?: boolean;
}

export function useThemedGlass(options: UseThemedGlassOptions = {}) {
  const { 
    variant = 'light', 
    borderEnabled = false, 
    shadowEnabled = false 
  } = options;
  
  const { colors, isDark } = useTheme();
  const glassStyle = useGlassStyle({ 
    variant, 
    borderEnabled, 
    shadowEnabled 
  });
  
  // Standardized gradient colors used across the app
  const standardGradients = {
    recommendation: [
      isDark ? 'rgba(100, 149, 237, 0.2)' : 'rgba(100, 149, 237, 0.15)',
      isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'
    ],
    mood: [
      isDark ? 'rgba(100, 149, 237, 0.3)' : 'rgba(100, 149, 237, 0.2)',
      isDark ? 'rgba(100, 149, 237, 0.1)' : 'rgba(100, 149, 237, 0.08)'
    ],
    primary: [
      colors?.interactive?.primary || lightTheme.interactive.primary,
      colors?.interactive?.secondary || lightTheme.interactive.secondary
    ],
  };
  
  return { 
    glassStyle, 
    colors, 
    isDark,
    standardGradients,
    
    // Convenience methods for common glass configurations
    cardGlass: useGlassStyle({ variant: 'light', borderEnabled: false, shadowEnabled: false }),
    dividerGlass: useGlassStyle({ variant: 'light', borderEnabled: false, shadowEnabled: false }),
    badgeGlass: useGlassStyle({ variant: 'ultra', elevation: 2 }),
  };
}