import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { GlassContainer } from '@/components/glass';
// import { useButtonPressAnimation } from '@/hooks/animations'; // For future use

export interface BaseInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void; // TODO: Implement right icon press handling
  variant?: 'default' | 'glass' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const INPUT_SIZES = {
  small: {
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  medium: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  large: {
    height: 56,
    paddingHorizontal: 20,
    fontSize: 18,
  },
} as const;

export function BaseInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress: _onRightIconPress,
  variant = 'default',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  required = false,
  disabled = false,
  loading = false,
  ...textInputProps
}: BaseInputProps) {
  const { colors, isDark } = useTheme();
  const { locale } = useLocale();
  const isRTL = locale === 'ar';
  
  // Animation for right icon press (if needed in future)
  // const { animatedStyle: iconAnimatedStyle, tapGesture } = useButtonPressAnimation({
  //   onPress: onRightIconPress,
  //   disabled: !onRightIconPress || disabled,
  // });

  const sizeConfig = INPUT_SIZES[size];
  const hasError = Boolean(error);

  // Memoize variant-specific styling to prevent infinite re-renders
  const { variantContainerStyle, variantInputStyle } = React.useMemo(() => {
    const baseInputStyle: TextStyle = {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      fontSize: sizeConfig.fontSize,
      color: colors.text.primary,
      textAlign: isRTL ? 'right' : 'left',
      opacity: disabled ? 0.6 : 1,
    };

    const baseContainerStyle: ViewStyle = {
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'glass':
        return {
          variantContainerStyle: {
            ...baseContainerStyle,
            borderWidth: 0,
            overflow: 'hidden' as 'hidden',
          },
          variantInputStyle: {
            ...baseInputStyle,
            backgroundColor: 'transparent',
          },
        };

      case 'outlined':
        return {
          variantContainerStyle: {
            ...baseContainerStyle,
            backgroundColor: 'transparent',
            borderColor: hasError 
              ? colors.interactive.destructive 
              : colors.system.border,
          },
          variantInputStyle: {
            ...baseInputStyle,
            backgroundColor: 'transparent',
          },
        };

      case 'filled':
        return {
          variantContainerStyle: {
            ...baseContainerStyle,
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)',
            borderColor: hasError 
              ? colors.interactive.destructive 
              : 'transparent',
          },
          variantInputStyle: {
            ...baseInputStyle,
          },
        };

      default:
        return {
          variantContainerStyle: {
            ...baseContainerStyle,
            backgroundColor: colors.background.secondary,
            borderColor: hasError 
              ? colors.interactive.destructive 
              : colors.system.border,
          },
          variantInputStyle: {
            ...baseInputStyle,
          },
        };
    }
  }, [sizeConfig, colors, isRTL, disabled, variant, hasError, isDark]);

  const renderInput = () => (
    <View style={[variantContainerStyle, containerStyle]}>
      {/* Left Icon */}
      {leftIcon ? (
        <View style={[styles.iconContainer, isRTL && styles.iconContainerRTL]}>
          <IconSymbol
            name={leftIcon}
            size={20}
            color={hasError ? colors.interactive.destructive : colors.text.tertiary}
          />
        </View>
      ) : null}

      {/* Text Input */}
      <TextInput
        style={[
          variantInputStyle,
          leftIcon && { paddingLeft: isRTL ? sizeConfig.paddingHorizontal : 8 },
          rightIcon && { paddingRight: isRTL ? 8 : sizeConfig.paddingHorizontal },
          inputStyle,
        ]}
        placeholderTextColor={colors.text.placeholder}
        editable={!disabled && !loading}
        {...textInputProps}
      />

      {/* Right Icon */}
      {rightIcon ? (
        <View style={[styles.iconContainer, isRTL && styles.iconContainerRTL]}>
          <IconSymbol
            name={rightIcon}
            size={20}
            color={hasError ? colors.interactive.destructive : colors.text.tertiary}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Label */}
      {label ? (
        <Text style={[
          styles.label,
          { color: hasError ? colors.interactive.destructive : colors.text.secondary },
          labelStyle,
        ]}>
          {label}
          {required ? <Text style={{ color: colors.interactive.destructive }}> *</Text> : null}
        </Text>
      ) : null}

      {/* Input Container */}
      {variant === 'glass' ? (
        <GlassContainer
          variant="input"
          borderRadius={12}
          padding={0}
          style={containerStyle}
        >
          {renderInput()}
        </GlassContainer>
      ) : (
        renderInput()
      )}

      {/* Error Message */}
      {error ? (
        <Text style={[
          styles.errorText,
          { color: colors.interactive.destructive },
          errorStyle,
        ]}>
          {error}
        </Text>
      ) : null}

      {/* Helper Text */}
      {(helperText && !error) ? (
        <Text style={[
          styles.helperText,
          { color: colors.text.tertiary },
          helperStyle,
        ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerRTL: {
    // RTL-specific icon styling if needed
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});