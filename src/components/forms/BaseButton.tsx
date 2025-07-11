import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { useButtonPressAnimation } from '@/hooks/animations';
import { GlassContainer } from '@/components/glass';

export interface BaseButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'glass' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
}

const BUTTON_SIZES = {
  small: {
    height: 36,
    paddingHorizontal: 16,
    fontSize: 14,
    borderRadius: 8,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
    fontSize: 16,
    borderRadius: 12,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
    fontSize: 18,
    borderRadius: 16,
  },
} as const;

export function BaseButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  loadingColor,
}: BaseButtonProps) {
  const { colors } = useTheme();
  
  // Animation for button press
  const { animatedStyle, tapGesture: _tapGesture } = useButtonPressAnimation({
    onPress,
    disabled: disabled || loading,
  });

  const sizeConfig = BUTTON_SIZES[size];
  const isDisabled = disabled || loading;

  // Get variant-specific styling
  const getVariantStyles = () => {
    const baseStyle: ViewStyle = {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      borderRadius: sizeConfig.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.6 : 1,
    };

    const baseTextStyle: TextStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: colors.interactive.primary,
          },
          textStyle: {
            ...baseTextStyle,
            color: '#FFFFFF',
          },
          loadingColor: loadingColor || '#FFFFFF',
        };

      case 'secondary':
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.interactive.primary,
          },
          textStyle: {
            ...baseTextStyle,
            color: colors.interactive.primary,
          },
          loadingColor: loadingColor || colors.interactive.primary,
        };

      case 'tertiary':
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: 'transparent',
          },
          textStyle: {
            ...baseTextStyle,
            color: colors.interactive.primary,
          },
          loadingColor: loadingColor || colors.interactive.primary,
        };

      case 'glass':
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          textStyle: {
            ...baseTextStyle,
            color: colors.text.primary,
          },
          loadingColor: loadingColor || colors.text.primary,
        };

      case 'danger':
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: colors.feedback.error,
          },
          textStyle: {
            ...baseTextStyle,
            color: '#FFFFFF',
          },
          loadingColor: loadingColor || '#FFFFFF',
        };

      default:
        return {
          buttonStyle: baseStyle,
          textStyle: baseTextStyle,
          loadingColor: loadingColor || colors.text.primary,
        };
    }
  };

  const { buttonStyle, textStyle: variantTextStyle, loadingColor: variantLoadingColor } = getVariantStyles();

  const renderContent = () => (
    <>
      {/* Left Icon */}
      {leftIcon && !loading ? (
        <IconSymbol
          name={leftIcon}
          size={sizeConfig.fontSize}
          color={variantTextStyle.color}
          style={styles.leftIcon}
        />
      ) : null}

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantLoadingColor}
          style={[
            leftIcon && styles.leftIcon,
            rightIcon && styles.rightIcon,
          ]}
        />
      ) : null}

      {/* Button Text */}
      <Text style={[variantTextStyle, textStyle]}>
        {title}
      </Text>

      {/* Right Icon */}
      {rightIcon && !loading ? (
        <IconSymbol
          name={rightIcon}
          size={sizeConfig.fontSize}
          color={variantTextStyle.color}
          style={styles.rightIcon}
        />
      ) : null}
    </>
  );

  const containerStyle = [
    buttonStyle,
    fullWidth && styles.fullWidth,
    style,
  ];

  if (variant === 'glass') {
    return (
      <GlassContainer
        variant="card"
        borderRadius={sizeConfig.borderRadius}
        padding={0}
        style={[containerStyle, animatedStyle]}
        useBlur={true}
        useGradient={true}
      >
        <TouchableOpacity
          style={[
            styles.glassButtonContent,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.paddingHorizontal,
            },
          ]}
          onPress={onPress}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          {renderContent()}
        </TouchableOpacity>
      </GlassContainer>
    );
  }

  return (
    <TouchableOpacity
      style={[containerStyle, animatedStyle]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

/**
 * Pre-configured button variants for common use cases
 */
export function PrimaryButton(props: Omit<BaseButtonProps, 'variant'>) {
  return <BaseButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<BaseButtonProps, 'variant'>) {
  return <BaseButton {...props} variant="secondary" />;
}

export function TertiaryButton(props: Omit<BaseButtonProps, 'variant'>) {
  return <BaseButton {...props} variant="tertiary" />;
}

export function GlassButton(props: Omit<BaseButtonProps, 'variant'>) {
  return <BaseButton {...props} variant="glass" />;
}

export function DangerButton(props: Omit<BaseButtonProps, 'variant'>) {
  return <BaseButton {...props} variant="danger" />;
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  glassButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});