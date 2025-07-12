import { Platform, TextStyle } from 'react-native';

/**
 * Typography system for Nafsy app
 * Following new UI design guidelines for accessibility and readability
 * 
 * Features:
 * - Minimum 16px body text for accessibility
 * - Line height 1.4-1.5x font size for optimal readability
 * - Platform-specific font families
 * - Mental health app appropriate font weights
 * - Type-safe typography tokens
 */

// Font family configuration
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

// Font size scale (following new design guidelines)
export const fontSize = {
  // Display sizes
  display: 32,        // Main headers
  
  // Title sizes
  titleLarge: 32,     // Screen titles
  title: 28,          // Section headers
  titleSmall: 24,     // Subsection headers
  
  // Body sizes
  bodyLarge: 18,      // Emphasis text
  body: 16,           // MINIMUM for body text (accessibility)
  bodySmall: 14,      // Secondary text
  
  // Supporting sizes
  caption: 14,        // Captions and labels
  small: 12,          // Minimal use (timestamps, etc.)
  xs: 12,             // Extra small (badges only)
} as const;

// Font weight scale
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Line height multipliers (1.4-1.5x for readability)
export const lineHeightMultiplier = {
  tight: 1.2,         // For headers only
  normal: 1.5,        // Standard body text (optimal readability)
  relaxed: 1.75,      // For descriptions
} as const;

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
} as const;

// Typography style presets
export const typography = {
  // Display
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display * lineHeightMultiplier.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  // Titles
  titleLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.titleLarge,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.titleLarge * lineHeightMultiplier.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  title: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.title * lineHeightMultiplier.tight,
  } as TextStyle,
  
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.titleSmall,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.titleSmall * lineHeightMultiplier.normal,
  } as TextStyle,
  
  // Body
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.bodyLarge * lineHeightMultiplier.normal,
  } as TextStyle,
  
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.body,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.body * lineHeightMultiplier.normal,
  } as TextStyle,
  
  bodyMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.body * lineHeightMultiplier.normal,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.bodySmall * lineHeightMultiplier.normal,
  } as TextStyle,
  
  // Supporting
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.caption * lineHeightMultiplier.normal,
  } as TextStyle,
  
  captionMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.caption * lineHeightMultiplier.normal,
  } as TextStyle,
  
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.small,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.small * lineHeightMultiplier.normal,
  } as TextStyle,
  
  // Special purpose
  button: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.body * lineHeightMultiplier.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
  
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.caption * lineHeightMultiplier.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase' as const,
  } as TextStyle,
} as const;

// Helper function to calculate line height
export const getLineHeight = (size: number, multiplier: keyof typeof lineHeightMultiplier = 'normal'): number => {
  return Math.round(size * lineHeightMultiplier[multiplier]);
};

// Helper function to get optimal reading width (45-75 characters)
export const getOptimalLineWidth = (fontSize: number): number => {
  const averageCharWidth = fontSize * 0.5; // Approximate
  const optimalChars = 66; // Ideal line length
  return optimalChars * averageCharWidth;
};

// Typography usage guidelines
export const typographyGuidelines = {
  // Headers
  screenTitle: typography.title,
  sectionHeader: typography.titleSmall,
  cardHeader: typography.bodyMedium,
  
  // Body text
  primaryText: typography.body,
  secondaryText: typography.bodySmall,
  description: typography.body,
  
  // Interactive elements
  buttonText: typography.button,
  linkText: typography.bodyMedium,
  
  // Supporting elements
  timestamp: typography.small,
  badge: typography.captionMedium,
  helperText: typography.caption,
} as const;