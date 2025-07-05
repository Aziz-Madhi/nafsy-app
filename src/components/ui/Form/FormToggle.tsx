import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Switch } from '@/components/ui/Switch';
import { useAppTheme } from '@/theme';

interface FormToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
}

/**
 * Modular FormToggle component extracted from Form.tsx
 * This demonstrates the theme-aware toggle styling approach
 */
export function FormToggle({ 
  label, 
  value, 
  onValueChange, 
  disabled = false,
  description,
}: FormToggleProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background.secondary }
    ]}>
      <View style={styles.content}>
        <Text style={[
          styles.label,
          { color: theme.colors.text.primary },
          disabled && { color: theme.colors.text.tertiary }
        ]}>
          {label}
        </Text>
        {description && (
          <Text style={[
            styles.description,
            { color: theme.colors.text.secondary }
          ]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
});