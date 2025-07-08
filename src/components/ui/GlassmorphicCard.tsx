import React from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
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
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: number;
  borderRadius?: number;
  padding?: number;
  gradient?: boolean;
  gradientColors?: string[];
  animated?: boolean;
  elevation?: number;
}

interface CardContentProps {
  children: React.ReactNode;
  intensity: number;
  isDark: boolean;
  borderRadius: number;
  gradient: boolean;
  gradientColors?: string[];
}

const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  intensity, 
  isDark, 
  borderRadius, 
  gradient, 
  gradientColors 
}) => {
  const defaultGradientColors = isDark
    ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
    : ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)'];

  return (
    <View style={[styles.contentContainer, { borderRadius }]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blurContainer, { borderRadius }]}
      >
        {gradient ? <LinearGradient
            colors={gradientColors || defaultGradientColors}
            style={[styles.gradientOverlay, { borderRadius }]}
          /> : null}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

export function GlassmorphicCard({
  children,
  style,
  onPress,
  intensity = 80,
  borderRadius = 20,
  padding = 16,
  gradient = false,
  gradientColors,
  animated = true,
  elevation = 2,
}: GlassmorphicCardProps) {
  const { colors, isDark } = useTheme();
  
  // Shared values for reanimated
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  // Tap gesture with pressure sensitivity
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      if (animated && onPress) {
        scaleValue.value = withSpring(0.98, { tension: 300, friction: 10 });
        opacityValue.value = withTiming(0.8, { duration: 100 });
      }
    })
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
      if (animated) {
        scaleValue.value = withSpring(1, { tension: 300, friction: 10 });
        opacityValue.value = withTiming(1, { duration: 100 });
      }
    })
    .onFinalize(() => {
      if (animated) {
        scaleValue.value = withSpring(1, { tension: 300, friction: 10 });
        opacityValue.value = withTiming(1, { duration: 100 });
      }
    });

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const cardStyle = [
    styles.card,
    {
      borderRadius,
      padding,
      // Glass effect border
      borderWidth: 1,
      borderColor: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.3)',
      // Shadow for depth
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: elevation * 2,
      },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: elevation * 3,
      elevation: elevation * 2,
    },
    style,
  ];

  const cardContent = (
    <CardContent
      intensity={intensity}
      isDark={isDark}
      borderRadius={borderRadius}
      gradient={gradient}
      gradientColors={gradientColors}
    >
      {children}
    </CardContent>
  );

  if (onPress) {
    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          style={[
            cardStyle,
            animated && animatedStyle,
          ]}
        >
          {cardContent}
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <View style={cardStyle}>
      {cardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});