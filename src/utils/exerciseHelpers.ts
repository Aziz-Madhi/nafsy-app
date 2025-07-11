/**
 * Exercise utility functions
 * Shared utilities for exercise components following LEVER framework
 */

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseData {
  id: string;
  titleKey: string;
  descriptionKey: string;
  duration: string;
  type: 'breathing' | 'grounding' | 'thoughtChallenge' | 'gratitude' | 'mindfulness';
  difficulty: ExerciseDifficulty;
  icon: string;
  gradient: [string, string];
}

/**
 * Get color for exercise difficulty level
 */
export const getDifficultyColor = (difficulty: ExerciseDifficulty, fallbackColor: string = '#6B7280'): string => {
  switch (difficulty) {
    case 'beginner':
      return '#4ADE80'; // Green for beginner
    case 'intermediate':
      return '#FBBF24'; // Yellow for intermediate
    case 'advanced':
      return '#F87171'; // Red for advanced
    default:
      return fallbackColor;
  }
};

/**
 * Get localized text for exercise difficulty level
 */
export const getDifficultyText = (difficulty: ExerciseDifficulty, locale: 'en' | 'ar'): string => {
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

/**
 * Get localized text for when exercise was last completed
 */
export const getLastCompletedText = (lastCompleted: number | undefined, locale: 'en' | 'ar'): string | null => {
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

/**
 * Common props for all exercise card variants
 */
export interface BaseExerciseCardProps {
  exercise: ExerciseData;
  onPress: () => void;
  isRecommended?: boolean;
  completedCount?: number;
  lastCompleted?: number;
  effectiveness?: number;
}