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
  
  // Standardized gradient colors using new UI design palette
  const standardGradients = {
    recommendation: [
      isDark ? 'rgba(74, 144, 226, 0.2)' : 'rgba(74, 144, 226, 0.15)', // Soft blue (#4A90E2)
      isDark ? 'rgba(126, 211, 33, 0.2)' : 'rgba(126, 211, 33, 0.15)'  // Muted green (#7ED321)
    ],
    mood: [
      isDark ? 'rgba(74, 144, 226, 0.3)' : 'rgba(74, 144, 226, 0.2)',  // Soft blue
      isDark ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.08)'  // Soft blue lighter
    ],
    primary: [
      colors?.interactive?.primary || lightTheme.interactive.primary,
      colors?.interactive?.secondary || lightTheme.interactive.secondary
    ],
    // New gradients for mental health features
    wellness: [
      isDark ? 'rgba(133, 193, 233, 0.2)' : 'rgba(133, 193, 233, 0.15)', // Light sky blue (#85C1E9)
      isDark ? 'rgba(175, 122, 197, 0.2)' : 'rgba(175, 122, 197, 0.15)'  // Soft lavender (#AF7AC5)
    ],
    energy: [
      isDark ? 'rgba(248, 162, 93, 0.2)' : 'rgba(248, 162, 93, 0.15)',   // Warm peach (#F8A25D)
      isDark ? 'rgba(245, 166, 35, 0.2)' : 'rgba(245, 166, 35, 0.15)'    // Soft orange (#F5A623)
    ],
    calm: [
      isDark ? 'rgba(133, 193, 233, 0.25)' : 'rgba(133, 193, 233, 0.2)', // Light sky blue
      isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(74, 144, 226, 0.1)'    // Soft blue
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