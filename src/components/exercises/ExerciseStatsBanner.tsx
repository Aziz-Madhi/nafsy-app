import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

interface ExerciseStatsBannerProps {
  exerciseStats: any;
  colors: any;
  dividerGlass: any;
  cardGlass: any;
  locale: string;
}

export const ExerciseStatsBanner = React.memo<ExerciseStatsBannerProps>(({ 
  exerciseStats, 
  colors, 
  dividerGlass, 
  cardGlass, 
  locale 
}) => {
  if (!exerciseStats || exerciseStats.totalExercises === 0) return null;
  
  return (
    <View style={[styles.statsBanner, cardGlass]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.interactive.primary }]}>
          {exerciseStats.totalExercises}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'تمرين مكتمل' : 'Completed'}
        </Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: dividerGlass.backgroundColor }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.interactive.secondary }]}>
          {Math.round(exerciseStats.totalDuration / 60)}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'دقيقة' : 'Minutes'}
        </Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: dividerGlass.backgroundColor }]} />
      <View style={styles.statItem}>
        <View style={styles.starsContainer}>
          {Array.from({ length: 5 }, (_, i) => (
            <IconSymbol
              key={i}
              name="star.fill"
              size={14}
              color={i < Math.round(exerciseStats.averageEffectiveness) ? '#FFB800' : colors.text.tertiary}
            />
          ))}
        </View>
        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'التقييم' : 'Rating'}
        </Text>
      </View>
    </View>
  );
});

ExerciseStatsBanner.displayName = 'ExerciseStatsBanner';

const styles = StyleSheet.create({
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});