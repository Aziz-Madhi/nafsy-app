import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { useTheme } from '@/theme';
import { useLocale, useTranslation } from '@/hooks/useLocale';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BaseExerciseCardProps, 
  getDifficultyColor, 
  getDifficultyText, 
  getLastCompletedText 
} from '@/utils/exerciseHelpers';
import { GlassOverlay } from '@/components/glass';
import { GLASS_OVERLAY_COLORS } from '@/hooks/glass';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

interface BaseExerciseCardContentProps extends BaseExerciseCardProps {
  children?: React.ReactNode;
  showSwipeHint?: boolean;
  isFavorited?: boolean;
}

export function BaseExerciseCard({
  exercise,
  isRecommended = false,
  completedCount = 0,
  lastCompleted,
  effectiveness,
  children,
  showSwipeHint = false,
  isFavorited = false,
}: BaseExerciseCardContentProps) {
  const { colors } = useTheme();
  const { locale } = useLocale();
  const { t } = useTranslation();

  // Safety check for undefined exercise
  if (!exercise) {
    return <BaseExerciseCardSkeleton />;
  }

  return (
    <LinearGradient
      colors={exercise.gradient}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Recommended Badge */}
      {isRecommended ? (
        <GlassOverlay 
          variant="overlay" 
          borderRadius={12}
          style={styles.recommendedBadge}
        >
          <IconSymbol name="sparkles" size={12} color="#FFFFFF" />
          <Text style={styles.recommendedText}>
            {locale === 'ar' ? 'موصى به' : 'Recommended'}
          </Text>
        </GlassOverlay>
      ) : null}

      {/* Favorite Indicator - only show if favorited */}
      {isFavorited ? (
        <GlassOverlay
          customColors={{
            light: [...GLASS_OVERLAY_COLORS.FAVORITE.light],
            dark: [...GLASS_OVERLAY_COLORS.FAVORITE.dark],
          }}
          borderRadius={20}
          style={styles.favoriteIndicator}
        >
          <IconSymbol name="heart.fill" size={16} color="#FF6B9D" />
        </GlassOverlay>
      ) : null}

      {/* Exercise Icon */}
      <GlassOverlay 
        variant="overlay" 
        borderRadius={20}
        style={styles.iconContainer}
      >
        <IconSymbol name={exercise.icon as any} size={32} color="#FFFFFF" />
      </GlassOverlay>

      {/* Exercise Info */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {t(exercise.titleKey)}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {t(exercise.descriptionKey)}
        </Text>

        {/* Duration and Difficulty */}
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <IconSymbol name="clock" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metadataText}>{exercise.duration}</Text>
          </View>
          
          <View style={[
            styles.difficultyBadge, 
            { backgroundColor: getDifficultyColor(exercise.difficulty, colors.text.secondary) + '30' }
          ]}>
            <Text style={[
              styles.difficultyText, 
              { color: getDifficultyColor(exercise.difficulty, colors.text.secondary) }
            ]}>
              {getDifficultyText(exercise.difficulty, locale)}
            </Text>
          </View>
        </View>

        {/* Completion Stats */}
        {completedCount > 0 ? (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {locale === 'ar' ? `أُكمل ${completedCount} مرة` : `Completed ${completedCount} times`}
            </Text>
            {lastCompleted ? (
              <Text style={styles.lastCompletedText}>
                {getLastCompletedText(lastCompleted, locale)}
              </Text>
            ) : null}
            {effectiveness && effectiveness > 0 ? (
              <View style={styles.effectivenessContainer}>
                {Array.from({ length: 5 }, (_, i) => (
                  <IconSymbol
                    key={i}
                    name="star.fill"
                    size={10}
                    color={i < effectiveness ? '#FFB800' : 'rgba(255,255,255,0.3)'}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Swipe Hint - only show for swipeable cards */}
      {showSwipeHint ? (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>
            {locale === 'ar' ? '← سحب للخيارات →' : '← swipe for actions →'}
          </Text>
        </View>
      ) : null}

      {/* Additional content slot for card-specific elements */}
      {children}
    </LinearGradient>
  );
}

export function BaseExerciseCardSkeleton() {
  const { isDark } = useTheme();
  
  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>
      <View style={[styles.skeleton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
        <View style={[styles.skeletonIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonTitle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
          <View style={[styles.skeletonDescription, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={[styles.skeletonDescription, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', width: '70%' }]} />
        </View>
      </View>
    </View>
  );
}

// Export the CARD_WIDTH for use in wrapper components
export { CARD_WIDTH };

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    lineHeight: 16,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statsText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  lastCompletedText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  effectivenessContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  swipeHint: {
    alignItems: 'center',
    marginTop: 4,
  },
  swipeHintText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  skeleton: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescription: {
    width: '100%',
    height: 12,
    borderRadius: 3,
    marginBottom: 4,
  },
});