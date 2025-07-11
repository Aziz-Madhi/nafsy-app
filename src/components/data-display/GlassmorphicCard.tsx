import React from 'react';
import {
  ViewStyle,
  StyleProp,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useButtonPressAnimation } from '@/hooks/animations';
import { GlassContainer } from '@/components/glass';
import { GlassVariant, GLASS_VARIANTS } from '@/hooks/glass';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  
  // Glass effect configuration
  variant?: GlassVariant;
  intensity?: number;
  borderRadius?: number;
  padding?: number;
  gradient?: boolean;
  gradientColors?: string[];
  
  // Animation and interaction
  animated?: boolean;
  elevation?: number;
  
  // Legacy props for backward compatibility
  /** @deprecated Use variant instead */
  blurIntensity?: number;
}

// Removed CardContent component - now using GlassContainer

export function GlassmorphicCard({
  children,
  style,
  onPress,
  variant = GLASS_VARIANTS.MEDIUM,
  intensity,
  borderRadius = 20,
  padding = 16,
  gradient = false,
  gradientColors,
  animated = true,
  elevation = 2,
  blurIntensity, // Legacy prop support
}: GlassmorphicCardProps) {
  // Use the reusable button press animation hook
  const { animatedStyle, tapGesture } = useButtonPressAnimation({
    onPress,
    disabled: !animated || !onPress,
  });

  // Support legacy intensity prop
  const finalIntensity = intensity || blurIntensity;

  if (onPress) {
    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[animated && animatedStyle]}>
          <GlassContainer
            style={style}
            variant={variant}
            customIntensity={finalIntensity}
            customColors={gradientColors ? { light: gradientColors, dark: gradientColors } : undefined}
            borderRadius={borderRadius}
            padding={padding}
            useBlur={true}
            useGradient={gradient}
            elevation={elevation}
          >
            {children}
          </GlassContainer>
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <GlassContainer
      style={style}
      variant={variant}
      customIntensity={finalIntensity}
      customColors={gradientColors ? { light: gradientColors, dark: gradientColors } : undefined}
      borderRadius={borderRadius}
      padding={padding}
      useBlur={true}
      useGradient={gradient}
      elevation={elevation}
    >
      {children}
    </GlassContainer>
  );
}

// Styles no longer needed - handled by GlassContainer