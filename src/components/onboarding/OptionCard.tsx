import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { Image, SFSymbolSource } from "@/components/core/Image/Image";
import { useAppTheme } from "@/theme";

interface OptionCardProps {
  icon: SFSymbolSource;
  label: string;
  value: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  color?: string;
  style?: ViewStyle;
}

export function OptionCard({
  icon,
  label,
  value,
  selectedValue,
  onSelect,
  color,
  style,
}: OptionCardProps) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useAppTheme();
  
  const isSelected = selectedValue === value;
  
  const styles = {
    card: {
      width: "45%" as const,
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: isSelected ? colors.interactive.primary : colors.system.border,
      borderRadius: borderRadius.lg,
      backgroundColor: isSelected ? colors.interactive.primary : colors.background.secondary,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing.sm,
      ...style,
    },
    text: {
      fontSize: fontSize.md,
      color: isSelected ? colors.text.inverse : colors.text.primary,
      fontWeight: fontWeight.medium,
    } as TextStyle,
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(value)}
    >
      <Image 
        source={icon} 
        size={32} 
        tintColor={isSelected ? colors.text.inverse : (color || colors.text.secondary)}
      />
      <Text style={styles.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}