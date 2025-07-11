import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { useAppTheme } from "@/theme";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  style,
}: ProgressBarProps) {
  const { colors, spacing, fontSize, fontWeight } = useAppTheme();
  
  const progress = (currentStep / totalSteps) * 100;

  const styles = {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.system.separator,
      ...style,
    },
    progressBackground: {
      flex: 1,
      height: 4,
      backgroundColor: colors.system.separator,
      borderRadius: 2,
      marginRight: spacing.md,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.interactive.primary,
      borderRadius: 2,
      width: `${Math.round(progress)}%`,
    },
    progressText: {
      fontSize: fontSize.sm,
      color: colors.text.secondary,
      fontWeight: fontWeight.medium,
    } as TextStyle,
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.progressText}>
        {currentStep} / {totalSteps}
      </Text>
    </View>
  );
}