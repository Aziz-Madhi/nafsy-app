import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  const { theme } = useTheme();
  const dot1Opacity = useSharedValue(0);
  const dot2Opacity = useSharedValue(0);
  const dot3Opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Create staggered animation for the three dots
      const animateDot = (opacity: any, delay: number) => {
        opacity.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 600 }),
              withTiming(0, { duration: 600 })
            ),
            -1
          )
        );
      };

      animateDot(dot1Opacity, 0);
      animateDot(dot2Opacity, 200);
      animateDot(dot3Opacity, 400);
    } else {
      dot1Opacity.value = 0;
      dot2Opacity.value = 0;
      dot3Opacity.value = 0;
    }
  }, [visible, dot1Opacity, dot2Opacity, dot3Opacity]);

  const dot1Style = useAnimatedStyle(() => {
    return {
      opacity: dot1Opacity.value,
    };
  });

  const dot2Style = useAnimatedStyle(() => {
    return {
      opacity: dot2Opacity.value,
    };
  });

  const dot3Style = useAnimatedStyle(() => {
    return {
      opacity: dot3Opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.innerContainer}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Nafsy is typing
      </Text>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.text.secondary,
            },
            dot1Style,
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.text.secondary,
            },
            dot2Style,
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.text.secondary,
            },
            dot3Style,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontStyle: 'italic',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});