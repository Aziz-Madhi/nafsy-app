/**
 * Theme system exports for Nafsy app
 * Following LEVER framework - centralized theme access
 */

// Core theme types and colors
export type { ThemeColors, Theme, ThemeMode } from './colors';
export {
  lightTheme,
  darkTheme,
  themes,
  colorUtils,
  semanticColors,
  exerciseColors,
  severityColors,
} from './colors';

// Theme provider and hooks
export {
  ThemeProvider,
  useTheme,
  useColors,
  useThemedStyles,
  withTheme,
  createThemedStyles,
  useThemeValue,
  useThemeTransition,
} from './ThemeProvider';

// Themed styles
export {
  createThemedCommonStyles,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from './themedStyles';

// Import required for the convenience hook
import { useTheme } from './ThemeProvider';
import { createThemedCommonStyles, Spacing, BorderRadius, FontSize, FontWeight } from './themedStyles';

/**
 * Convenience hook that combines common usage patterns
 */
export function useAppTheme() {
  const theme = useTheme();
  const themedStyles = createThemedCommonStyles(theme.colors, theme.isDark);
  
  return {
    ...theme,
    styles: themedStyles,
    spacing: Spacing,
    borderRadius: BorderRadius,
    fontSize: FontSize,
    fontWeight: FontWeight,
  };
}