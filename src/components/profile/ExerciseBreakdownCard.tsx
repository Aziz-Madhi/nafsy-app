import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGlassStyle } from "@/hooks/glass/useGlassEffect";
import { useAppTheme } from "@/theme";

interface ExerciseStats {
  typeStats?: Record<string, number>;
}

interface ExerciseBreakdownCardProps {
  exerciseStats?: ExerciseStats;
  locale: string;
}

export function ExerciseBreakdownCard({
  exerciseStats,
  locale,
}: ExerciseBreakdownCardProps) {
  const { colors } = useAppTheme();
  const breakdownCardGlass = useGlassStyle({ variant: 'light', borderEnabled: false, shadowEnabled: false });

  if (!exerciseStats?.typeStats || Object.keys(exerciseStats.typeStats).length === 0) {
    return null;
  }

  return (
    <View style={[styles.breakdownCard, breakdownCardGlass]}>
      <Text style={[styles.breakdownTitle, { color: colors.text.primary }]}>
        {locale === 'ar' ? 'توزيع التمارين' : 'Exercise Breakdown'}
      </Text>
      {Object.entries(exerciseStats.typeStats).map(([type, count]) => (
        <View key={type} style={styles.breakdownItem}>
          <Text style={[styles.breakdownLabel, { color: colors.text.secondary }]}>
            {type}
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.text.primary }]}>
            {count}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  breakdownCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});