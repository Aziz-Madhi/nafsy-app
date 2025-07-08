/**
 * Theme system exports for Nafsy app
 * Following LEVER framework - centralized theme access
 */

// Core theme types and colors
// Import required for the convenience hook
import { useTheme } from './ThemeProvider';
import { createThemedCommonStyles, Spacing, BorderRadius, FontSize, FontWeight } from './themedStyles';

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

/**
 * Convenience hook that combines common usage patterns
 * Returns structured theme object with proper typing
 */
export function useAppTheme() {
  const theme = useTheme();
  const themedStyles = createThemedCommonStyles(theme.colors, theme.isDark);
  
  return {
    // Core theme object (use sparingly - prefer destructured values below)
    theme,
    // Recommended: Use these destructured values instead of theme.property
    colors: theme.colors,
    isDark: theme.isDark,
    themeMode: theme.themeMode,
    setThemeMode: theme.setThemeMode,
    isLoading: theme.isLoading,
    // Pre-built common styles
    styles: themedStyles,
    // Design tokens (use these for consistency)
    spacing: Spacing,
    borderRadius: BorderRadius,
    fontSize: FontSize,
    fontWeight: FontWeight,
  } as const;
}

/**
 * Type for the useAppTheme return value
 * Use this for component prop types and createStyles parameters
 */
export type AppTheme = ReturnType<typeof useAppTheme>;

/**
 * Helper type for createStyles function parameters
 * Includes only the properties typically needed for styling
 */
export type StylesProps = {
  spacing: AppTheme['spacing'];
  fontSize: AppTheme['fontSize'];
  fontWeight: AppTheme['fontWeight'];
  borderRadius: AppTheme['borderRadius'];
  colors: AppTheme['colors'];
};

/**
 * Helper function to create properly typed styles
 * Usage: const styles = createStyles({ spacing, fontSize, fontWeight, colors })
 */
export const createStyles = <T>(
  styleFactory: (props: StylesProps) => T,
  props: StylesProps
): T => styleFactory(props);