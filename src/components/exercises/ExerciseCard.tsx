import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

interface ExerciseCardProps {
  exercise: {
    id: string;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    duration: string;
    type: 'breathing' | 'grounding' | 'thoughtChallenge' | 'gratitude' | 'mindfulness';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    icon: string;
    gradient: [string, string];
  };
  onPress: () => void;
  isRecommended?: boolean;
  completedCount?: number;
  lastCompleted?: number;
  effectiveness?: number;
}

export function ExerciseCard({
  exercise,
  onPress,
  isRecommended = false,
  completedCount = 0,
  lastCompleted,
  effectiveness,
}: ExerciseCardProps) {
  const { colors, isDark } = useTheme();
  const { locale } = useLocale();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4ADE80';
      case 'intermediate':
        return '#FBBF24';
      case 'advanced':
        return '#F87171';
      default:
        return colors.text.secondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return locale === 'ar' ? 'مبتدئ' : 'Beginner';
      case 'intermediate':
        return locale === 'ar' ? 'متوسط' : 'Intermediate';
      case 'advanced':
        return locale === 'ar' ? 'متقدم' : 'Advanced';
      default:
        return '';
    }
  };

  const getLastCompletedText = () => {
    if (!lastCompleted) return null;
    
    const now = Date.now();
    const diff = now - lastCompleted;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return locale === 'ar' ? 'اليوم' : 'Today';
    } else if (days === 1) {
      return locale === 'ar' ? 'أمس' : 'Yesterday';
    } else if (days < 7) {
      return locale === 'ar' ? `منذ ${days} أيام` : `${days} days ago`;
    } else {
      return locale === 'ar' ? 'منذ فترة' : 'A while ago';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={exercise.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Recommended Badge */}
        {isRecommended ? <View style={styles.recommendedBadge}>
            <IconSymbol name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.recommendedText}>
              {locale === 'ar' ? 'موصى به' : 'Recommended'}
            </Text>
          </View> : null}

        {/* Exercise Icon */}
        <View style={styles.iconContainer}>
          <IconSymbol name={exercise.icon} size={32} color="#FFFFFF" />
        </View>

        {/* Exercise Info */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {exercise.title[locale]}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {exercise.description[locale]}
          </Text>

          {/* Duration and Difficulty */}
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <IconSymbol name="clock" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metadataText}>{exercise.duration}</Text>
            </View>
            
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '30' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                {getDifficultyText(exercise.difficulty)}
              </Text>
            </View>
          </View>

          {/* Completion Stats */}
          {completedCount > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {locale === 'ar' ? `أُكمل ${completedCount} مرة` : `Completed ${completedCount} times`}
              </Text>
              {lastCompleted ? <Text style={styles.lastCompletedText}>
                  {getLastCompletedText()}
                </Text> : null}
              {effectiveness && effectiveness > 0 ? <View style={styles.effectivenessContainer}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <IconSymbol
                      key={i}
                      name="star.fill"
                      size={10}
                      color={i < effectiveness ? '#FFB800' : 'rgba(255,255,255,0.3)'}
                    />
                  ))}
                </View> : null}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function ExerciseCardSkeleton() {
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
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