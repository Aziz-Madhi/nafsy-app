import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { useLocale } from '@/hooks/useLocale';
import * as Haptics from 'expo-haptics';
import { BaseExerciseCard, CARD_WIDTH } from './BaseExerciseCard';
import { BaseExerciseCardProps } from '@/utils/exerciseHelpers';
import { useButtonPressAnimation, ANIMATION_CONSTANTS } from '@/hooks/animations';
import { GlassOverlay } from '@/components/glass';
import { GLASS_OVERLAY_COLORS } from '@/hooks/glass';

const SWIPE_THRESHOLD = ANIMATION_CONSTANTS.SWIPE_THRESHOLD;

interface SwipeableExerciseCardProps extends BaseExerciseCardProps {
  onFavorite?: () => void;
  onComplete?: () => void;
  isFavorited?: boolean;
}

export function SwipeableExerciseCard({
  onFavorite,
  onComplete,
  isFavorited = false,
  ...baseProps
}: SwipeableExerciseCardProps) {
  const { locale } = useLocale();

  // Use button press animation hook for tap gesture
  const { tapGesture: buttonTapGesture, animatedStyle: buttonAnimatedStyle } = useButtonPressAnimation({
    onPress: baseProps.onPress,
  });

  // Shared values for swipe animations  
  const translateX = useSharedValue(0);
  const swipeScale = useSharedValue(1);
  const leftActionOpacity = useSharedValue(0);
  const rightActionOpacity = useSharedValue(0);

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
          swipeScale.value = withSpring(ANIMATION_CONSTANTS.LARGE_SCALE, ANIMATION_CONSTANTS.SPRING_CONFIG);
        } else if (translationX < -SWIPE_THRESHOLD && onComplete) {
          // Swipe left - complete action
          leftActionOpacity.value = withTiming(0);
          rightActionOpacity.value = withTiming(1);
          swipeScale.value = withSpring(ANIMATION_CONSTANTS.LARGE_SCALE, ANIMATION_CONSTANTS.SPRING_CONFIG);
        } else {
          // No action zone
          leftActionOpacity.value = withTiming(0);
          rightActionOpacity.value = withTiming(0);
          swipeScale.value = withSpring(1, ANIMATION_CONSTANTS.SPRING_CONFIG);
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
      translateX.value = withSpring(0, ANIMATION_CONSTANTS.SPRING_CONFIG);
      swipeScale.value = withSpring(1, ANIMATION_CONSTANTS.SPRING_CONFIG);
      leftActionOpacity.value = withTiming(0);
      rightActionOpacity.value = withTiming(0);
    });

  // Combined gesture
  const combinedGesture = Gesture.Simultaneous(panGesture, buttonTapGesture);

  // Animated styles - combine button press and swipe animations
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: swipeScale.value },
      ],
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
          <GlassOverlay
            customColors={GLASS_OVERLAY_COLORS.FAVORITE}
            borderRadius={12}
            style={styles.actionGlass}
          >
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
          </GlassOverlay>
        </Animated.View> : null}

      {/* Right Action (Complete) */}
      {onComplete ? <Animated.View style={[styles.rightAction, rightActionAnimatedStyle]}>
          <GlassOverlay
            customColors={GLASS_OVERLAY_COLORS.SUCCESS}
            borderRadius={12}
            style={styles.actionGlass}
          >
            <IconSymbol name="checkmark.circle.fill" size={24} color="#4ADE80" />
            <Text style={styles.actionText}>
              {locale === 'ar' ? 'تمرين سريع' : 'Quick Complete'}
            </Text>
          </GlassOverlay>
        </Animated.View> : null}

      {/* Main Card */}
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.card, buttonAnimatedStyle, cardAnimatedStyle]}>
          <BaseExerciseCard 
            {...baseProps}
            isFavorited={isFavorited}
            showSwipeHint={true}
          />
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
  leftAction: {
    position: 'absolute',
    left: -10,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    zIndex: 1,
    minWidth: 60,
  },
  rightAction: {
    position: 'absolute',
    right: -10,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    zIndex: 1,
    minWidth: 60,
  },
  actionGlass: {
    alignItems: 'center',
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
});