import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { ProgressCard } from "./ProgressCard";
import { AIInsightsCard } from "./AIInsightsCard";
import { ExerciseBreakdownCard } from "./ExerciseBreakdownCard";
import { useAppTheme } from "@/theme";

interface ProgressCardData {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: 'improving' | 'declining' | 'stable';
}

interface ProgressOverviewProps {
  progressCards: ProgressCardData[];
  showFullStats: boolean;
  onToggleStats: () => void;
  sectionHeaderStyle: any;
  handlePressIn: () => void;
  handlePressOut: () => void;
  userSummary?: any;
  exerciseStats?: any;
  locale: string;
}

export function ProgressOverview({
  progressCards,
  showFullStats,
  onToggleStats,
  sectionHeaderStyle,
  handlePressIn,
  handlePressOut,
  userSummary,
  exerciseStats,
  locale,
}: ProgressOverviewProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.progressSection}>
      <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(onToggleStats)())}>
        <Animated.View 
          style={[styles.sectionHeader, sectionHeaderStyle]}
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
        >
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'نظرة عامة على التقدم' : 'Progress Overview'}
          </Text>
          <IconSymbol 
            name={showFullStats ? 'chevron.up' : 'chevron.down'} 
            size={20} 
            color={colors.text.tertiary} 
          />
        </Animated.View>
      </GestureDetector>
      
      <View style={styles.progressGrid}>
        {progressCards.map((card, index) => (
          <ProgressCard
            key={index}
            icon={card.icon}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            color={card.color}
            trend={card.trend}
          />
        ))}
      </View>
      
      {!!showFullStats && (
        <View style={styles.extendedStats}>
          <AIInsightsCard userSummary={userSummary} locale={locale} />
          <ExerciseBreakdownCard exerciseStats={exerciseStats} locale={locale} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  extendedStats: {
    marginTop: 16,
  },
});