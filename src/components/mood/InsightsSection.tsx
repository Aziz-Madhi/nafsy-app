import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { GlassmorphicCard } from "@/components/data-display/GlassmorphicCard";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { SparkLine } from "@/components/data-display/SparkLine";
import { useThemedGlass } from "@/hooks/useThemedGlass";

interface InsightCard {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  sparkData?: number[];
}

interface InsightsSectionProps {
  insightCards: InsightCard[];
  showInsights: boolean;
  onToggleInsights: () => void;
  cardAnimatedStyles: any[];
  locale: string;
}

export function InsightsSection({
  insightCards,
  showInsights,
  onToggleInsights,
  cardAnimatedStyles,
  locale,
}: InsightsSectionProps) {
  const { colors } = useThemedGlass();

  return (
    <View style={styles.insightsSection}>
      <GestureDetector 
        gesture={Gesture.Tap().onEnd(() => runOnJS(onToggleInsights)())}
      >
        <Animated.View style={styles.insightsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'رؤى وإحصائيات' : 'Insights & Stats'}
          </Text>
          <IconSymbol 
            name={showInsights ? 'chevron.up' : 'chevron.down'} 
            size={20} 
            color={colors.text.tertiary} 
          />
        </Animated.View>
      </GestureDetector>
      
      {!!showInsights && (
        <View style={styles.insightsGrid}>
          {insightCards.map((card, index) => (
            <Animated.View
              key={index}
              style={cardAnimatedStyles[index]}
            >
              <GlassmorphicCard
                style={styles.insightCard}
                gradient={true}
                borderRadius={16}
                elevation={2}
              >
                <View style={[styles.insightIconContainer, { backgroundColor: card.color + '20' }]}>
                  <IconSymbol name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={[styles.insightTitle, { color: colors.text.secondary }]}>
                  {card.title}
                </Text>
                <Text style={[styles.insightValue, { color: colors.text.primary }]}>
                  {card.value}
                </Text>
                {!!(card.sparkData && card.sparkData.length > 0) && (
                  <View style={styles.sparkLineContainer}>
                    <SparkLine
                      data={card.sparkData}
                      width={60}
                      height={20}
                      color={card.color}
                      strokeWidth={2}
                    />
                  </View>
                )}
                {!!card.subtitle && (
                  <Text style={[styles.insightSubtitle, { color: colors.text.tertiary }]}>
                    {card.subtitle}
                  </Text>
                )}
              </GlassmorphicCard>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  insightsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  insightCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sparkLineContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  insightSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});