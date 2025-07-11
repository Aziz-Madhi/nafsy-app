import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { Image, SFSymbolSource } from "@/components/core/Image/Image";
import { useAppTheme } from "@/theme";

interface PrivacyFeatureProps {
  icon: SFSymbolSource;
  title: string;
  description: string;
  style?: ViewStyle;
}

export function PrivacyFeature({
  icon,
  title,
  description,
  style,
}: PrivacyFeatureProps) {
  const { colors, spacing, fontSize, fontWeight } = useAppTheme();

  const styles = {
    container: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: spacing.md,
      ...style,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    } as TextStyle,
    description: {
      fontSize: fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
    } as TextStyle,
  };

  return (
    <View style={styles.container}>
      <Image 
        source={icon} 
        size={20} 
        tintColor={colors.wellness.calm}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}