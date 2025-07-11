import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { GlassmorphicCard } from "@/components/data-display/GlassmorphicCard";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useThemedGlass } from "@/hooks/useThemedGlass";

interface ExerciseRecommendation {
  reason: string;
  exerciseId?: string;
  // Add other properties as needed
}

interface ExerciseRecommendationCardProps {
  exerciseRecommendation: ExerciseRecommendation | null;
  locale: string;
  onTryExercise?: (exerciseId?: string) => void;
}

export function ExerciseRecommendationCard({
  exerciseRecommendation,
  locale,
  onTryExercise,
}: ExerciseRecommendationCardProps) {
  const { colors, standardGradients } = useThemedGlass();

  if (!exerciseRecommendation) return null;

  const handleTryExercise = () => {
    if (onTryExercise) {
      onTryExercise(exerciseRecommendation.exerciseId);
    } else {
      // TODO: Navigate to exercise
      console.log('Navigate to recommended exercise');
    }
  };

  return (
    <GlassmorphicCard
      style={styles.recommendationCard}
      gradient={true}
      gradientColors={standardGradients.recommendation}
      borderRadius={20}
      elevation={2}
    >
      <IconSymbol 
        name="sparkles" 
        size={20} 
        color={colors.interactive.primary} 
        style={styles.recommendationIcon}
      />
      <View style={styles.recommendationContent}>
        <Text style={[styles.recommendationTitle, { color: colors.text.primary }]}>
          {locale === 'ar' ? 'توصية مخصصة' : 'Personalized Recommendation'}
        </Text>
        <Text style={[styles.recommendationText, { color: colors.text.secondary }]}>
          {exerciseRecommendation.reason}
        </Text>
        <GestureDetector 
          gesture={Gesture.Tap().onEnd(handleTryExercise)}
        >
          <Animated.View style={[styles.recommendationButton, { backgroundColor: colors.interactive.primary }]}>
            <Text style={styles.recommendationButtonText}>
              {locale === 'ar' ? 'جرب التمرين' : 'Try Exercise'}
            </Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});