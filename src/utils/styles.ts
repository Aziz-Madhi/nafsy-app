import { StyleSheet } from 'react-native';
import * as AC from '@bacons/apple-colors';

/**
 * Common style patterns used throughout the app.
 * Following LEVER framework - reuse instead of recreate.
 */
export const CommonStyles = StyleSheet.create({
  // Container patterns
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
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
    color: AC.label,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  titleLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AC.label,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: 'center',
  },
  
  subtitleLarge: {
    fontSize: 18,
    color: AC.secondaryLabel,
    textAlign: 'center',
  },
  
  description: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  label: {
    fontSize: 14,
    color: AC.label,
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
    color: AC.label,
    marginBottom: 8,
    fontWeight: '500',
  },
  
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: AC.separator,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: AC.label,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },

  // Button patterns
  primaryButton: {
    height: 48,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primaryButtonFull: {
    width: '100%',
    height: 48,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  primaryButtonTextLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  secondaryButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AC.separator,
    borderRadius: 12,
    gap: 8,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    color: AC.label,
    fontWeight: '500',
  },
  
  disabledButton: {
    opacity: 0.6,
  },

  // Link patterns
  link: {
    fontSize: 14,
    color: AC.systemBlue,
    fontWeight: '500',
  },
  
  linkSmall: {
    fontSize: 14,
    color: AC.systemBlue,
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
    backgroundColor: AC.separator,
  },
  
  dividerText: {
    fontSize: 14,
    color: AC.secondaryLabel,
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
    color: AC.secondaryLabel,
  },

  // Avatar patterns
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AC.systemBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: AC.label,
    marginBottom: 4,
  },
  
  email: {
    fontSize: 16,
    color: AC.secondaryLabel,
  },

  // Logo patterns
  logo: {
    marginBottom: 16,
  },
  
  logoLarge: {
    marginBottom: 24,
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
});

/**
 * Common spacing values following iOS design guidelines
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
 * Common border radius values
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

/**
 * Common font sizes following iOS typography scale
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
 * Common font weights
 */
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * Helper function to create responsive styles
 */
export const createResponsiveStyle = (baseStyle: any, variants: Record<string, any>) => {
  return StyleSheet.create({
    base: baseStyle,
    ...variants,
  });
};