import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { useAppTheme } from "@/theme";

interface TimeOptionProps {
  time: string;
  label: string;
  selectedTime?: string;
  onSelect: (time: string) => void;
  style?: ViewStyle;
}

export function TimeOption({
  time,
  label,
  selectedTime,
  onSelect,
  style,
}: TimeOptionProps) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useAppTheme();
  
  const isSelected = selectedTime === time;

  const styles = {
    container: {
      flex: 1,
      minWidth: "45%",
      padding: spacing.md,
      borderWidth: 1,
      borderColor: isSelected ? colors.interactive.primary : colors.system.border,
      borderRadius: borderRadius.md,
      backgroundColor: isSelected ? colors.interactive.primary : colors.background.secondary,
      alignItems: "center" as const,
      ...style,
    },
    text: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      color: isSelected ? colors.text.inverse : colors.text.primary,
    } as TextStyle,
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(time)}
    >
      <Text style={styles.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}