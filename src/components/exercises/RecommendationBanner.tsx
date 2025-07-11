import React from "react";
import { Text, StyleSheet } from "react-native";
import { GlassmorphicCard } from "@/components/data-display/GlassmorphicCard";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

interface RecommendationBannerProps {
  recommendation: any;
  standardGradients: any;
  colors: any;
}

export const RecommendationBanner = React.memo<RecommendationBannerProps>(({
  recommendation,
  standardGradients,
  colors,
}) => {
  if (!recommendation) return null;

  return (
    <GlassmorphicCard
      style={styles.recommendationBanner}
      gradient={true}
      gradientColors={standardGradients.recommendation}
      borderRadius={20}
      elevation={2}
    >
      <IconSymbol name="sparkles" size={20} color={colors.interactive.primary} />
      <Text style={[styles.recommendationText, { color: colors.text.primary }]}>
        {recommendation.reason}
      </Text>
    </GlassmorphicCard>
  );
});

RecommendationBanner.displayName = 'RecommendationBanner';

const styles = StyleSheet.create({
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
});