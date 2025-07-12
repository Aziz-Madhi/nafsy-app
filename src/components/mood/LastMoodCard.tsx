import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassmorphicCard } from "@/components/data-display/GlassmorphicCard";
import { ProgressRing } from "@/components/data-display/ProgressRing";
import { useThemedGlass } from "@/hooks/useThemedGlass";

interface MoodEntry {
  rating: number;
  timestamp: Date;
  note?: string;
  factors?: string[];
}

interface LastMoodCardProps {
  latestMood: MoodEntry | null;
  locale: string;
  lastMoodTime: string | null;
  onPress: () => void;
}

export function LastMoodCard({
  latestMood,
  locale,
  lastMoodTime,
  onPress,
}: LastMoodCardProps) {
  const { colors, standardGradients, cardGlass } = useThemedGlass();

  if (!latestMood) return null;

  return (
    <GlassmorphicCard
      style={styles.lastMoodCard}
      onPress={onPress}
      gradient={true}
      borderRadius={24}
      elevation={3}
    >
      <View style={styles.lastMoodHeader}>
        <Text style={[styles.lastMoodTitle, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'آخر تسجيل' : 'Last Check-in'}
        </Text>
        <Text style={[styles.lastMoodTime, { color: colors.text.tertiary }]}>
          {lastMoodTime}
        </Text>
      </View>
      
      <View style={styles.lastMoodContent}>
        <View style={styles.moodEmojiContainer}>
          <ProgressRing
            size={80}
            strokeWidth={4}
            progress={(latestMood.rating / 10) * 100}
            gradientColors={standardGradients.primary}
            backgroundColor={cardGlass.backgroundColor}
          >
            <Text style={styles.lastMoodEmoji}>
              {latestMood.rating <= 2 ? '😔' :
               latestMood.rating <= 4 ? '😕' :
               latestMood.rating <= 6 ? '😐' :
               latestMood.rating <= 8 ? '🙂' : '😄'}
            </Text>
          </ProgressRing>
        </View>
        <View style={styles.lastMoodDetails}>
          <Text style={[styles.lastMoodRating, { color: colors.text.primary }]}>
            {latestMood.rating}/10
          </Text>
          {!!latestMood.note && (
            <Text 
              style={[styles.lastMoodNote, { color: colors.text.secondary }]}
              numberOfLines={2}
            >
              &ldquo;{latestMood.note}&rdquo;
            </Text>
          )}
        </View>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  lastMoodCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  lastMoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastMoodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMoodTime: {
    fontSize: 14,
  },
  lastMoodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmojiContainer: {
    marginRight: 20,
  },
  lastMoodEmoji: {
    fontSize: 32,
  },
  lastMoodDetails: {
    flex: 1,
  },
  lastMoodRating: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  lastMoodNote: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    overflow: 'hidden',
  },
});