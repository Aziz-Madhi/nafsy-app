import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { Image, SFSymbolSource } from "@/components/core/Image/Image";
import { useAppTheme } from "@/theme";

interface ToggleOptionProps {
  icon: SFSymbolSource;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

export function ToggleOption({
  icon,
  label,
  value,
  onToggle,
  style,
}: ToggleOptionProps) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useAppTheme();

  const styles = {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: value ? colors.interactive.primary : colors.system.border,
      borderRadius: borderRadius.md,
      backgroundColor: value ? colors.interactive.primary : colors.background.secondary,
      gap: spacing.md,
      ...style,
    },
    text: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      color: value ? colors.text.inverse : colors.text.primary,
    } as TextStyle,
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(!value)}
    >
      <Image 
        source={icon} 
        size={24} 
        tintColor={value ? colors.text.inverse : colors.interactive.primary}
      />
      <Text style={styles.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}