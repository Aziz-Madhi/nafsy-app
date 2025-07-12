import React from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "@/theme";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export function ProgressDots({
  currentStep,
  totalSteps,
  style,
}: ProgressDotsProps) {
  const { colors, spacing } = useAppTheme();

  const styles = {
    container: {
      flexDirection: "row" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.md,
      gap: spacing.sm,
      ...style,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <ProgressDot
          key={index}
          isActive={index === currentStep - 1}
          isCompleted={index < currentStep - 1}
          colors={colors}
        />
      ))}
    </View>
  );
}

interface ProgressDotProps {
  isActive: boolean;
  isCompleted: boolean;
  colors: ReturnType<typeof useAppTheme>["colors"];
}

function ProgressDot({ isActive, isCompleted, colors }: ProgressDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = isActive
      ? withSpring(1.25, { damping: 15, stiffness: 300 })
      : withSpring(1, { damping: 15, stiffness: 300 });

    const backgroundColor = isActive
      ? colors.interactive.primary
      : isCompleted
      ? colors.interactive.success
      : colors.system.separator;

    const opacity = isActive ? 1 : isCompleted ? 0.8 : 0.5;

    return {
      width: 8,
      height: 8,
      borderRadius: 4,
      transform: [{ scale }],
      backgroundColor,
      opacity: withTiming(opacity, { duration: 300 }),
    };
  });

  return <Animated.View style={animatedStyle} />;
}