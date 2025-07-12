/**
 * Theme system for Nafsy app
 * Following LEVER framework - centralized color system abstraction
 * 
 * Features:
 * - Semantic color names with new UI design integration
 * - Light/Dark theme support
 * - Mental health app specific color palette (evidence-based colors)
 * - Type-safe color access
 * - Easy theme switching
 * 
 * Updated with new UI design colors:
 * - Soft blue (#4A90E2) for trust and calm
 * - Muted green (#7ED321) for growth and balance
 * - Soft orange (#F5A623) for gentle CTAs
 * - Evidence-based color psychology for mental health
 */

import * as AC from '@bacons/apple-colors';

/**
 * Semantic color tokens for mental health app
 */
export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    grouped: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    placeholder: string;
  };
  
  // Interactive colors
  interactive: {
    primary: string;
    secondary: string;
    tertiary: string;
    destructive: string;
    warning: string;
    success: string;
    disabled: string;
  };
  
  // Mental health specific colors
  wellness: {
    calm: string;        // For relaxation, meditation
    energy: string;      // For motivation, exercise
    balance: string;     // For mood tracking
    growth: string;      // For progress, achievements
    support: string;     // For help, community
    crisis: string;      // For emergency, warnings
  };
  
  // Mood colors
  mood: {
    great: string;
    good: string;
    okay: string;
    bad: string;
    terrible: string;
  };
  
  // System colors
  system: {
    border: string;
    separator: string;
    fill: string;
    shadow: string;
    overlay: string;
  };
}

/**
 * Light theme colors
 */
export const lightTheme: ThemeColors = {
  background: {
    primary: '#FFFFFF',                        // Clean white background
    secondary: '#F8FAFB',                      // Softer gray for sections
    tertiary: '#F2F5F7',                       // Subtle gray for depth
    elevated: '#FFFFFF',                       // Elevated surfaces
    grouped: '#F8FAFB',                        // Grouped content background
  },
  
  text: {
    primary: AC.label,
    secondary: AC.secondaryLabel,
    tertiary: AC.tertiaryLabel,
    disabled: AC.quaternaryLabel,
    inverse: '#FFFFFF',
    placeholder: AC.placeholderText,
  },
  
  interactive: {
    primary: '#4A90E2',          // Soft blue for trust (research-based)
    secondary: '#7ED321',        // Muted green for growth (replacing systemGray)
    tertiary: '#F5A623',         // Soft orange for non-aggressive CTAs
    destructive: '#E74C3C',      // Softer coral red for errors
    warning: '#F39C12',          // Warmer, softer warning orange
    success: '#52C41A',          // Softer success green
    disabled: '#D3D3D3',         // Light gray for disabled states
  },
  
  wellness: {
    calm: '#85C1E9',            // Light sky blue for relaxation
    energy: '#F8A25D',          // Warm peach for motivation
    balance: '#AF7AC5',         // Soft lavender for balance
    growth: '#7ED321',          // Muted green for growth (research-based)
    support: '#4A90E2',         // Soft blue for support
    crisis: '#E74C3C',          // Soft coral red for emergencies
  },
  
  mood: {
    great: '#52C41A',           // 😄 Excellent - softer green
    good: '#8BC34A',            // 🙂 Good - lighter green
    okay: '#FFD93D',            // 😐 Okay - softer yellow
    bad: '#F5A623',             // 😕 Bad - soft orange (matching CTA)
    terrible: '#E74C3C',        // 😢 Terrible - softer coral red
  },
  
  system: {
    border: AC.separator,
    separator: AC.separator,
    fill: AC.systemFill,
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

/**
 * Dark theme colors (inherits from light but overrides specific colors)
 */
export const darkTheme: ThemeColors = {
  ...lightTheme,
  
  background: {
    primary: '#1A1A1A',                        // Softer dark (better for eyes)
    secondary: '#242424',                      // Slightly lighter surface
    tertiary: '#2E2E2E',                       // Surface variant
    elevated: '#242424',                       // Elevated surfaces
    grouped: '#242424',                        // Grouped content
  },
  
  system: {
    ...lightTheme.system,
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

/**
 * Theme configuration
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

/**
 * Default themes
 */
export const themes = {
  light: {
    mode: 'light' as const,
    colors: lightTheme,
  },
  dark: {
    mode: 'dark' as const,
    colors: darkTheme,
  },
};

/**
 * Color utility functions
 */
export const colorUtils = {
  /**
   * Get mood color based on mood value
   */
  getMoodColor: (mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible', theme: ThemeColors) => {
    return theme.mood[mood];
  },
  
  /**
   * Get wellness color for specific wellness area
   */
  getWellnessColor: (
    type: 'calm' | 'energy' | 'balance' | 'growth' | 'support' | 'crisis',
    theme: ThemeColors
  ) => {
    return theme.wellness[type];
  },
  
  /**
   * Add opacity to a color
   */
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba or add alpha channel
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // If it's already rgba, replace the alpha
    if (color.startsWith('rgba')) {
      return color.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    
    // If it's rgb, convert to rgba
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    return color;
  },
  
  /**
   * Get contrasting text color for a background
   */
  getContrastText: (backgroundColor: string, theme: ThemeColors): string => {
    // Simple contrast logic - in a real app, you'd use a proper contrast calculation
    const darkColors = [
      theme.interactive.primary,
      theme.wellness.calm,
      theme.wellness.balance,
      theme.wellness.support,
      theme.interactive.destructive,
    ];
    
    if (darkColors.includes(backgroundColor)) {
      return theme.text.inverse;
    }
    
    return theme.text.primary;
  },
  
  /**
   * Lighten a color by a percentage
   */
  lighten: (color: string, amount: number): string => {
    // Convert hex to RGB
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Lighten each channel
      const newR = Math.min(255, Math.round(r + (255 - r) * amount));
      const newG = Math.min(255, Math.round(g + (255 - g) * amount));
      const newB = Math.min(255, Math.round(b + (255 - b) * amount));
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    // For non-hex colors, return with opacity
    return color;
  },
  
  /**
   * Darken a color by a percentage
   */
  darken: (color: string, amount: number): string => {
    // Convert hex to RGB
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Darken each channel
      const newR = Math.max(0, Math.round(r * (1 - amount)));
      const newG = Math.max(0, Math.round(g * (1 - amount)));
      const newB = Math.max(0, Math.round(b * (1 - amount)));
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    // For non-hex colors, return as is
    return color;
  },
};

/**
 * Semantic color aliases for common use cases
 */
export const semanticColors = {
  // Button colors
  button: {
    primary: (theme: ThemeColors) => theme.interactive.primary,
    secondary: (theme: ThemeColors) => theme.interactive.secondary,
    destructive: (theme: ThemeColors) => theme.interactive.destructive,
    disabled: (theme: ThemeColors) => theme.interactive.disabled,
  },
  
  // Status colors
  status: {
    success: (theme: ThemeColors) => theme.interactive.success,
    warning: (theme: ThemeColors) => theme.interactive.warning,
    error: (theme: ThemeColors) => theme.interactive.destructive,
    info: (theme: ThemeColors) => theme.interactive.primary,
  },
  
  // Card colors
  card: {
    background: (theme: ThemeColors) => theme.background.elevated,
    border: (theme: ThemeColors) => theme.system.border,
    shadow: (theme: ThemeColors) => theme.system.shadow,
  },
  
  // Form colors
  form: {
    background: (theme: ThemeColors) => theme.background.secondary,
    border: (theme: ThemeColors) => theme.system.border,
    placeholder: (theme: ThemeColors) => theme.text.placeholder,
    focus: (theme: ThemeColors) => theme.interactive.primary,
  },
};

/**
 * Exercise category color mapping
 */
export const exerciseColors = {
  breathing: (theme: ThemeColors) => theme.wellness.calm,
  meditation: (theme: ThemeColors) => theme.wellness.balance,
  mindfulness: (theme: ThemeColors) => theme.wellness.growth,
  relaxation: (theme: ThemeColors) => theme.wellness.calm,
  movement: (theme: ThemeColors) => theme.wellness.energy,
  journaling: (theme: ThemeColors) => theme.wellness.support,
} as const;

/**
 * Mental health severity color mapping
 */
export const severityColors = {
  low: (theme: ThemeColors) => theme.interactive.success,
  moderate: (theme: ThemeColors) => theme.interactive.warning,
  high: (theme: ThemeColors) => theme.interactive.destructive,
  crisis: (theme: ThemeColors) => theme.wellness.crisis,
} as const;