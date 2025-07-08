import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, themes, ThemeColors } from './colors';

/**
 * Theme Provider for Nafsy app
 * Following LEVER framework - centralized theme management
 * 
 * Features:
 * - Light/Dark/System theme modes
 * - Persistent theme preference
 * - Automatic system theme detection
 * - Theme switching with smooth transitions
 * - Type-safe theme access
 */

const THEME_KEY = '@nafsy/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
  isDark: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the actual theme based on mode and system preference
  const getEffectiveTheme = (mode: ThemeMode, systemScheme: ColorSchemeName): Theme => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? themes.dark : themes.light;
    }
    return themes[mode];
  };

  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  
  const currentTheme = getEffectiveTheme(themeMode, systemScheme);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      theme: currentTheme,
      themeMode,
      setThemeMode,
      colors: currentTheme.colors,
      isDark: currentTheme.mode === 'dark',
      isLoading,
    }),
    [currentTheme, themeMode, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to access just colors (most common use case)
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

/**
 * Hook for theme-aware styles
 */
export function useThemedStyles<T>(
  styleFactory: (colors: ThemeColors, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  
  return React.useMemo(() => {
    return styleFactory(colors, isDark);
  }, [colors, isDark, styleFactory]);
}

/**
 * Higher-order component to inject theme
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) {
  const ThemedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme.theme} />;
  };

  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
}

export function createThemedStyles<T extends Record<string, any>>(
  styleFactory: (colors: ThemeColors, isDark: boolean) => T
) {
  return (colors: ThemeColors, isDark: boolean) => {
    return StyleSheet.create(styleFactory(colors, isDark));
  };
}

/**
 * Utility hook for conditional theme values
 */
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
}

/**
 * Hook for theme-aware animation values
 */
export function useThemeTransition() {
  const { isDark } = useTheme();
  
  return {
    isDark,
    // Could be extended with animation values for smooth theme transitions
    transitionDuration: 200,
  };
}