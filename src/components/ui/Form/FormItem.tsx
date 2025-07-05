import React from 'react';
import { TouchableHighlight, View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FormItemProps } from './types';

/**
 * Modular FormItem component extracted from Form.tsx
 * This demonstrates the approach for breaking down the monolithic Form component
 */
export function FormItem({
  systemImage,
  systemImageProps,
  children,
  style,
  disabled = false,
  onPress,
  ...props
}: FormItemProps) {
  const { theme } = useAppTheme();
  
  const content = (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.background.secondary,
        borderBottomColor: theme.colors.system.separator,
      },
      disabled && styles.disabled,
      style
    ]}>
      {systemImage && (
        <View style={styles.iconContainer}>
          <IconSymbol
            name={systemImage as any}
            size={systemImageProps?.size || 24}
            color={systemImageProps?.color || theme.colors.interactive.primary}
          />
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableHighlight
        onPress={onPress}
        underlayColor={theme.colors.system.fill}
        style={styles.touchable}
        {...props}
      >
        {content}
      </TouchableHighlight>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});