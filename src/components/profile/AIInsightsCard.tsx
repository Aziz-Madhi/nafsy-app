import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useGlassStyle } from "@/hooks/glass/useGlassEffect";
import { useAppTheme } from "@/theme";

interface UserSummary {
  summary: string;
  keyThemes: string[];
}

interface AIInsightsCardProps {
  userSummary?: UserSummary;
  locale: string;
}

export function AIInsightsCard({
  userSummary,
  locale,
}: AIInsightsCardProps) {
  const { colors } = useAppTheme();
  const insightCardGlass = useGlassStyle({ variant: 'light', borderEnabled: false, shadowEnabled: false });

  if (!userSummary) return null;

  return (
    <View style={[styles.insightCard, insightCardGlass]}>
      <View style={styles.insightHeader}>
        <IconSymbol name="sparkles" size={20} color={colors.interactive.primary} />
        <Text style={[styles.insightTitle, { color: colors.text.primary }]}>
          {locale === 'ar' ? 'رؤى مخصصة' : 'Personalized Insights'}
        </Text>
      </View>
      <Text style={[styles.insightText, { color: colors.text.secondary }]}>
        {userSummary.summary}
      </Text>
      {userSummary.keyThemes.length > 0 && (
        <View style={styles.themeTags}>
          {userSummary.keyThemes.slice(0, 3).map((theme, i) => (
            <View key={i} style={[styles.themeTag, { backgroundColor: colors.interactive.primary + '20' }]}>
              <Text style={[styles.themeTagText, { color: colors.interactive.primary }]}>
                {theme}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  insightCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  themeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  themeTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
});