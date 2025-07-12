import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { GlassOverlay } from '@/components/glass';
import { GLASS_OVERLAY_COLORS } from '@/hooks/glass';
import { useLocale, useTranslation } from '@/hooks/useLocale';
import { useTheme, useAppTheme } from '@/theme';
import {
  BaseExerciseCardProps,
  getDifficultyColor,
  getDifficultyText,
  getLastCompletedText
} from '@/utils/exerciseHelpers';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

interface BaseExerciseCardContentProps extends BaseExerciseCardProps {
  children?: React.ReactNode;
  showSwipeHint?: boolean;
  isFavorited?: boolean;
  progress?: number; // 0-100 percentage
  isInProgress?: boolean;
  streakDays?: number;
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
  progress = 0,
  isInProgress = false,
  streakDays = 0,
}: BaseExerciseCardContentProps) {
  const { colors } = useTheme();
  const { typography } = useAppTheme();
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
          <Text style={[typography.small, styles.recommendedText]}>
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
        <Text style={[typography.bodyMedium, styles.title]} numberOfLines={2}>
          {t(exercise.titleKey)}
        </Text>
        
        <Text style={[typography.small, styles.description]} numberOfLines={2}>
          {t(exercise.descriptionKey)}
        </Text>

        {/* Duration and Difficulty */}
        <View style={styles.metadata}>
          <View style={styles.metadataLeft}>
            {/* Enhanced Duration Badge */}
            <Animated.View 
              entering={FadeIn.delay(200)}
              style={[
                styles.durationBadge,
                isInProgress && styles.durationBadgeActive
              ]}
            >
              <IconSymbol 
                name={isInProgress ? "timer" : "clock"} 
                size={14} 
                color={isInProgress ? "#4CAF50" : "rgba(255,255,255,0.8)"} 
              />
              <Text style={[
                typography.small,
                styles.metadataText,
                isInProgress && styles.metadataTextActive
              ]}>
                {exercise.duration}
              </Text>
            </Animated.View>
            
            {/* Streak Badge */}
            {streakDays > 0 ? (
              <Animated.View 
                entering={FadeIn.delay(300)}
                style={styles.streakBadge}
              >
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[typography.small, styles.streakText]}>{streakDays}</Text>
              </Animated.View>
            ) : null}
          </View>
          
          <View style={[
            styles.difficultyBadge, 
            { backgroundColor: getDifficultyColor(exercise.difficulty, colors.text.secondary) + '30' }
          ]}>
            <Text style={[
              typography.small,
              styles.difficultyText, 
              { color: getDifficultyColor(exercise.difficulty, colors.text.secondary) }
            ]}>
              {getDifficultyText(exercise.difficulty, locale)}
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        {progress > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#4CAF50' : '#4A90E2',
                  }
                ]}
              />
            </View>
            <Text style={[typography.small, styles.progressText]}>
              {progress === 100 
                ? (locale === 'ar' ? 'مكتمل!' : 'Complete!') 
                : `${progress}%`
              }
            </Text>
          </View>
        ) : null}

        {/* Completion Stats */}
        {completedCount > 0 ? (
          <View style={styles.statsContainer}>
            <Text style={[typography.small, styles.statsText]}>
              {locale === 'ar' ? `أُكمل ${completedCount} مرة` : `Completed ${completedCount} times`}
            </Text>
            {lastCompleted ? (
              <Text style={[typography.small, styles.lastCompletedText]}>
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
          <Text style={[typography.small, styles.swipeHintText]} numberOfLines={1}>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    padding: 16,
    overflow: 'hidden',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recommendedText: {
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  metadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationBadgeActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  metadataTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    color: '#FF9800',
    fontWeight: '700',
    marginLeft: 2,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statsText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  lastCompletedText: {
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'normal',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'right',
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