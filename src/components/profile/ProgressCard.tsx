import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassmorphicCard } from "@/components/data-display/GlassmorphicCard";
import { ProgressRing } from "@/components/data-display/ProgressRing";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useGlassStyle } from "@/hooks/glass/useGlassEffect";
import { useAppTheme } from "@/theme";

type IconName = any; // Using any for now to avoid complex type definitions

interface ProgressCardProps {
  icon: IconName;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: 'improving' | 'declining' | 'stable';
}

export function ProgressCard({
  icon,
  title,
  value,
  subtitle,
  color,
  trend,
}: ProgressCardProps) {
  const { colors } = useAppTheme();
  const progressRingGlass = useGlassStyle({ variant: 'light', borderEnabled: false, shadowEnabled: false });

  // Calculate progress value for the ring
  const getProgressValue = () => {
    if (value === 'Improving') return 80;
    if (value === 'Declining') return 20;
    return parseFloat(value) * 10;
  };

  return (
    <GlassmorphicCard
      style={styles.progressCard}
      gradient={true}
      borderRadius={16}
      elevation={2}
    >
      <View style={styles.progressIconWrapper}>
        <ProgressRing
          size={56}
          strokeWidth={3}
          progress={getProgressValue()}
          color={color}
          backgroundColor={progressRingGlass.backgroundColor as string}
        >
          <IconSymbol name={icon} size={20} color={color} />
        </ProgressRing>
      </View>
      <Text style={[styles.progressTitle, { color: colors.text.secondary }]}>
        {title}
      </Text>
      <View style={styles.progressValueContainer}>
        <Text style={[styles.progressValue, { color: colors.text.primary }]}>
          {value}
        </Text>
        {!!trend && (
          <IconSymbol 
            name={(trend === 'improving' ? 'arrow.up.right' : trend === 'declining' ? 'arrow.down.right' : 'minus') as any}
            size={16}
            color={trend === 'improving' ? '#4ADE80' : trend === 'declining' ? '#F87171' : colors.text.tertiary}
          />
        )}
      </View>
      <Text style={[styles.progressSubtitle, { color: colors.text.tertiary }]}>
        {subtitle}
      </Text>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  progressIconWrapper: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});