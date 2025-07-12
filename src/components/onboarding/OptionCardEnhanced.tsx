import React from "react";
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "@/theme";
import { useButtonPressAnimation } from "@/hooks/animations";

interface OptionCardEnhancedProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function OptionCardEnhanced({
  icon,
  label,
  selected,
  onPress,
  multiSelect = false,
  disabled = false,
  style,
}: OptionCardEnhancedProps) {
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();
  
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const scale = selected
      ? withSpring(1.02, { damping: 15, stiffness: 300 })
      : withSpring(1, { damping: 15, stiffness: 300 });

    const borderWidth = selected
      ? withTiming(2, { duration: 200 })
      : withTiming(1, { duration: 200 });

    return {
      transform: [{ scale }],
      borderWidth,
    };
  });

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    const scale = selected
      ? withSpring(1, { damping: 15, stiffness: 300 })
      : withSpring(0, { damping: 15, stiffness: 300 });

    const opacity = selected
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 200 });

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const styles = {
    card: {
      width: "45%" as const,
      aspectRatio: 1,
      borderColor: selected ? colors.interactive.primary : colors.system.border,
      borderRadius: borderRadius.lg,
      backgroundColor: selected 
        ? colors.interactive.primary + "10" 
        : colors.background.secondary,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: spacing.md,
      opacity: disabled ? 0.5 : 1,
      ...style,
    } as ViewStyle,
    content: {
      alignItems: "center" as const,
      gap: spacing.sm,
    },
    iconContainer: {
      position: "relative" as const,
    },
    checkmark: {
      position: "absolute" as const,
      top: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.interactive.success,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    checkmarkText: {
      color: colors.text.inverse,
      fontSize: 12,
      fontWeight: "bold" as const,
    },
    label: {
      ...typography.body,
      color: selected ? colors.interactive.primary : colors.text.primary,
      textAlign: "center" as const,
      fontWeight: selected ? "600" : "400",
    } as TextStyle,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.card, animatedStyle, cardAnimatedStyle]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {icon}
            {multiSelect ? (
              <Animated.View style={[styles.checkmark, checkmarkAnimatedStyle]}>
                <Text style={styles.checkmarkText}>{'\u2713'}</Text>
              </Animated.View>
            ) : null}
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}