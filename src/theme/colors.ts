/**
 * Theme system for Nafsy app
 * Following LEVER framework - centralized color system abstraction
 * 
 * Features:
 * - Semantic color names instead of Apple Color direct usage
 * - Light/Dark theme support
 * - Mental health app specific color palette
 * - Type-safe color access
 * - Easy theme switching
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
    primary: AC.systemBackground,
    secondary: AC.secondarySystemBackground,
    tertiary: AC.tertiarySystemBackground,
    elevated: AC.systemBackground,
    grouped: AC.systemGroupedBackground,
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
    primary: AC.systemBlue,
    secondary: AC.systemGray,
    tertiary: AC.systemGray2,
    destructive: AC.systemRed,
    warning: AC.systemOrange,
    success: AC.systemGreen,
    disabled: AC.systemGray3,
  },
  
  wellness: {
    calm: AC.systemTeal,        // Calming blue-green
    energy: AC.systemOrange,    // Energizing orange
    balance: AC.systemPurple,   // Balanced purple
    growth: AC.systemGreen,     // Growth green
    support: AC.systemBlue,     // Supportive blue
    crisis: AC.systemRed,       // Crisis red
  },
  
  mood: {
    great: AC.systemGreen,      // 😄 Green for great
    good: AC.systemBlue,        // 😊 Blue for good
    okay: AC.systemYellow,      // 😐 Yellow for okay
    bad: AC.systemOrange,       // 😞 Orange for bad
    terrible: AC.systemRed,     // 😢 Red for terrible
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
    primary: AC.systemBackground,
    secondary: AC.secondarySystemBackground,
    tertiary: AC.tertiarySystemBackground,
    elevated: AC.secondarySystemBackground,
    grouped: AC.systemGroupedBackground,
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