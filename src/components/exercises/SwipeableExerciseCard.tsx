import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding
const SWIPE_THRESHOLD = 60;

interface SwipeableExerciseCardProps {
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
  onFavorite?: () => void;
  onComplete?: () => void;
  isRecommended?: boolean;
  isFavorited?: boolean;
  completedCount?: number;
  lastCompleted?: number;
  effectiveness?: number;
}

export function SwipeableExerciseCard({
  exercise,
  onPress,
  onFavorite,
  onComplete,
  isRecommended = false,
  isFavorited = false,
  completedCount = 0,
  lastCompleted,
  effectiveness,
}: SwipeableExerciseCardProps) {
  const { colors, isDark } = useTheme();
  const { locale } = useLocale();

  // Shared values for animations
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const leftActionOpacity = useSharedValue(0);
  const rightActionOpacity = useSharedValue(0);

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

  // Pan gesture for swipe actions
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationX } = event;
      
      // Only handle horizontal swipes
      if (Math.abs(translationX) > Math.abs(event.translationY)) {
        translateX.value = translationX;
        
        // Show action indicators based on swipe direction
        if (translationX > SWIPE_THRESHOLD && onFavorite) {
          // Swipe right - favorite action
          leftActionOpacity.value = withTiming(1);
          rightActionOpacity.value = withTiming(0);
          scale.value = withSpring(1.02);
        } else if (translationX < -SWIPE_THRESHOLD && onComplete) {
          // Swipe left - complete action
          leftActionOpacity.value = withTiming(0);
          rightActionOpacity.value = withTiming(1);
          scale.value = withSpring(1.02);
        } else {
          // No action zone
          leftActionOpacity.value = withTiming(0);
          rightActionOpacity.value = withTiming(0);
          scale.value = withSpring(1);
        }
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      
      // Determine action based on swipe distance and velocity
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - favorite
        if (onFavorite) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          runOnJS(onFavorite)();
        }
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - complete
        if (onComplete) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
          runOnJS(onComplete)();
        }
      }
      
      // Reset position
      translateX.value = withSpring(0, { tension: 300, friction: 25 });
      scale.value = withSpring(1);
      leftActionOpacity.value = withTiming(0);
      rightActionOpacity.value = withTiming(0);
    });

  // Tap gesture for main action
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98);
      opacity.value = withTiming(0.8);
    })
    .onEnd(() => {
      runOnJS(onPress)();
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    });

  // Combined gesture
  const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const leftActionAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: leftActionOpacity.value,
      transform: [
        { 
          scale: leftActionOpacity.value 
        }
      ],
    };
  });

  const rightActionAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: rightActionOpacity.value,
      transform: [
        { 
          scale: rightActionOpacity.value 
        }
      ],
    };
  });

  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>
      {/* Left Action (Favorite) */}
      {onFavorite ? <Animated.View style={[styles.leftAction, leftActionAnimatedStyle]}>
          <IconSymbol 
            name={isFavorited ? "heart.fill" : "heart"} 
            size={24} 
            color="#FF6B9D" 
          />
          <Text style={styles.actionText}>
            {isFavorited 
              ? (locale === 'ar' ? 'إلغاء المفضلة' : 'Unfavorite')
              : (locale === 'ar' ? 'إضافة للمفضلة' : 'Favorite')
            }
          </Text>
        </Animated.View> : null}

      {/* Right Action (Complete) */}
      {onComplete ? <Animated.View style={[styles.rightAction, rightActionAnimatedStyle]}>
          <IconSymbol name="checkmark.circle.fill" size={24} color="#4ADE80" />
          <Text style={styles.actionText}>
            {locale === 'ar' ? 'تمرين سريع' : 'Quick Complete'}
          </Text>
        </Animated.View> : null}

      {/* Main Card */}
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
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

            {/* Favorite Indicator */}
            {isFavorited ? <View style={styles.favoriteIndicator}>
                <IconSymbol name="heart.fill" size={16} color="#FF6B9D" />
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

            {/* Swipe Hint */}
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>
                {locale === 'ar' ? '← سحب للخيارات →' : '← swipe for actions →'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 16,
    position: 'relative',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  leftAction: {
    position: 'absolute',
    left: -10,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderRadius: 12,
    padding: 8,
    minWidth: 60,
  },
  rightAction: {
    position: 'absolute',
    right: -10,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 12,
    padding: 8,
    minWidth: 60,
  },
  actionText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 107, 157, 0.3)',
    borderRadius: 12,
    padding: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
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
    marginTop: 4,
  },
  statsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  lastCompletedText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  effectivenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});