import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme';

interface FormTextProps {
  children: React.ReactNode;
  bold?: boolean;
  style?: any;
  numberOfLines?: number;
}

/**
 * Modular FormText component extracted from Form.tsx
 * This demonstrates the theme-aware text styling approach
 */
export function FormText({ 
  bold = false, 
  children, 
  style,
  ...props 
}: FormTextProps) {
  const { theme } = useAppTheme();

  return (
    <Text
      style={[
        styles.text,
        { color: theme.colors.text.primary },
        bold && styles.bold,
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
});