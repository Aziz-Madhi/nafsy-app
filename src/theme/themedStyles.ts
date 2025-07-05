import { StyleSheet } from 'react-native';
import { ThemeColors } from './colors';

/**
 * Themed styles for Nafsy app
 * Following LEVER framework - theme-aware common styles
 * 
 * This replaces direct Apple Colors usage with semantic theme colors
 */

export const createThemedCommonStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    // Container patterns
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    
    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    paddedContent: {
      flex: 1,
      paddingHorizontal: 24,
    },
    
    centeredPaddedContent: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Header patterns
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    
    headerLarge: {
      alignItems: 'center',
      marginBottom: 40,
    },

    // Typography patterns
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    
    titleLarge: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    
    subtitleLarge: {
      fontSize: 18,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    
    description: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    
    label: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '500',
    },

    // Form patterns
    form: {
      marginBottom: 24,
    },
    
    inputContainer: {
      marginBottom: 16,
    },
    
    inputLabel: {
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: 8,
      fontWeight: '500',
    },
    
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.system.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.secondary,
    },

    // Button patterns
    primaryButton: {
      height: 48,
      backgroundColor: colors.interactive.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    primaryButtonFull: {
      width: '100%',
      height: 48,
      backgroundColor: colors.interactive.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.inverse,
    },
    
    primaryButtonTextLarge: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.inverse,
    },
    
    secondaryButton: {
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.system.border,
      borderRadius: 12,
      gap: 8,
      backgroundColor: colors.background.secondary,
    },
    
    secondaryButtonText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    
    disabledButton: {
      opacity: 0.6,
    },

    // Wellness-specific button styles
    calmButton: {
      height: 48,
      backgroundColor: colors.wellness.calm,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    energyButton: {
      height: 48,
      backgroundColor: colors.wellness.energy,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    balanceButton: {
      height: 48,
      backgroundColor: colors.wellness.balance,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Link patterns
    link: {
      fontSize: 14,
      color: colors.interactive.primary,
      fontWeight: '500',
    },
    
    linkSmall: {
      fontSize: 14,
      color: colors.interactive.primary,
    },

    // Divider patterns
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.system.separator,
    },
    
    dividerText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginHorizontal: 16,
    },

    // Footer patterns
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    
    footerText: {
      fontSize: 14,
      color: colors.text.secondary,
    },

    // Avatar patterns
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.interactive.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.inverse,
    },
    
    name: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    
    email: {
      fontSize: 16,
      color: colors.text.secondary,
    },

    // Logo patterns
    logo: {
      marginBottom: 16,
    },
    
    logoLarge: {
      marginBottom: 24,
    },

    // Card patterns
    card: {
      backgroundColor: colors.background.elevated,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.system.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    
    cardContent: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },

    // Mood-specific styles
    moodGreat: {
      backgroundColor: colors.mood.great,
    },
    
    moodGood: {
      backgroundColor: colors.mood.good,
    },
    
    moodOkay: {
      backgroundColor: colors.mood.okay,
    },
    
    moodBad: {
      backgroundColor: colors.mood.bad,
    },
    
    moodTerrible: {
      backgroundColor: colors.mood.terrible,
    },

    // Status indicators
    statusSuccess: {
      backgroundColor: colors.interactive.success,
    },
    
    statusWarning: {
      backgroundColor: colors.interactive.warning,
    },
    
    statusError: {
      backgroundColor: colors.interactive.destructive,
    },
    
    statusInfo: {
      backgroundColor: colors.interactive.primary,
    },

    // Spacing patterns
    marginBottomSmall: {
      marginBottom: 16,
    },
    
    marginBottomMedium: {
      marginBottom: 24,
    },
    
    marginBottomLarge: {
      marginBottom: 32,
    },
    
    marginBottomXLarge: {
      marginBottom: 48,
    },

    // Alignment patterns
    center: {
      alignItems: 'center',
    },
    
    centerText: {
      textAlign: 'center',
    },

    // Loading and skeleton patterns
    skeleton: {
      backgroundColor: colors.system.fill,
      borderRadius: 4,
    },
    
    skeletonText: {
      height: 16,
      backgroundColor: colors.system.fill,
      borderRadius: 4,
      marginBottom: 8,
    },
    
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },

    // Error patterns
    errorContainer: {
      backgroundColor: colors.interactive.destructive,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    
    errorText: {
      color: colors.text.inverse,
      fontSize: 14,
      textAlign: 'center',
    },

    // Success patterns
    successContainer: {
      backgroundColor: colors.interactive.success,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    
    successText: {
      color: colors.text.inverse,
      fontSize: 14,
      textAlign: 'center',
    },
  });

/**
 * Common spacing values (theme-independent)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Common border radius values (theme-independent)
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

/**
 * Common font sizes (theme-independent)
 */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
} as const;

/**
 * Common font weights (theme-independent)
 */
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};