import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate 
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface AnimatedMoodGradientProps {
  moodRating?: number; // 1-10 scale
  recentMoods?: number[]; // Array of recent mood ratings
  style?: ViewStyle;
  animated?: boolean;
  opacity?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mood-based color palettes
const MOOD_GRADIENTS = {
  // Very low mood (1-2)
  veryLow: {
    colors: ['#1e3a8a', '#312e81', '#1e1b4b'],
    locations: [0, 0.5, 1],
  },
  // Low mood (3-4)
  low: {
    colors: ['#374151', '#4b5563', '#6b7280'],
    locations: [0, 0.5, 1],
  },
  // Neutral mood (5-6)
  neutral: {
    colors: ['#6366f1', '#8b5cf6', '#a855f7'],
    locations: [0, 0.5, 1],
  },
  // Good mood (7-8)
  good: {
    colors: ['#10b981', '#34d399', '#6ee7b7'],
    locations: [0, 0.5, 1],
  },
  // Excellent mood (9-10)
  excellent: {
    colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    locations: [0, 0.5, 1],
  },
};

// Time-based gradients
const TIME_GRADIENTS = {
  dawn: ['#ff9a9e', '#fecfef', '#fecfef'],
  morning: ['#a8edea', '#fed6e3', '#d299c2'],
  afternoon: ['#ffecd2', '#fcb69f', '#ff8a80'],
  evening: ['#667eea', '#764ba2', '#667eea'],
  night: ['#2c3e50', '#34495e', '#2c3e50'],
};

export function AnimatedMoodGradient({
  moodRating,
  recentMoods = [],
  style,
  animated = true,
  opacity = 0.3,
}: AnimatedMoodGradientProps) {
  const { isDark } = useTheme();
  const position = useSharedValue(0);

  // Calculate average mood for gradient selection
  const averageMood = React.useMemo(() => {
    if (moodRating) return moodRating;
    if (recentMoods.length > 0) {
      return recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
    }
    return 5; // Default neutral
  }, [moodRating, recentMoods]);

  // Get mood-based gradient
  const getMoodGradient = (mood: number) => {
    if (mood <= 2) return MOOD_GRADIENTS.veryLow;
    if (mood <= 4) return MOOD_GRADIENTS.low;
    if (mood <= 6) return MOOD_GRADIENTS.neutral;
    if (mood <= 8) return MOOD_GRADIENTS.good;
    return MOOD_GRADIENTS.excellent;
  };

  // Get time-based gradient
  const getTimeGradient = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return TIME_GRADIENTS.dawn;
    if (hour >= 7 && hour < 12) return TIME_GRADIENTS.morning;
    if (hour >= 12 && hour < 17) return TIME_GRADIENTS.afternoon;
    if (hour >= 17 && hour < 20) return TIME_GRADIENTS.evening;
    return TIME_GRADIENTS.night;
  };

  // Combine mood and time gradients
  const getBlendedColors = () => {
    const moodGradient = getMoodGradient(averageMood);
    const timeGradient = getTimeGradient();
    
    // In dark mode, prefer mood colors with darker tone
    // In light mode, blend with time-based colors
    if (isDark) {
      return moodGradient.colors.map(color => 
        color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) =>
          `rgba(${Math.floor(Number(r) * 0.7)}, ${Math.floor(Number(g) * 0.7)}, ${Math.floor(Number(b) * 0.7)}, ${opacity})`
        )
      );
    }
    
    return timeGradient.map(color => color + Math.floor(opacity * 255).toString(16));
  };

  useEffect(() => {
    if (animated) {
      // Animate gradient position for subtle movement
      position.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 8000 }),
          withTiming(0, { duration: 8000 })
        ),
        -1,
        false
      );
    }
  }, [animated, position]);

  const colors = getBlendedColors();

  // Note: LinearGradient start/end positions cannot be animated directly with reanimated
  // This animation provides subtle movement via the container's style

  return (
    <Animated.View style={[styles.container, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Additional overlay for more depth */}
      <LinearGradient
        colors={[
          'transparent',
          isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.overlay, { opacity: 0.5 }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});