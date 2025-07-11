import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { useAutoTypingDotsAnimation } from '@/hooks/animations';

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  const { theme } = useTheme();
  
  // Use the reusable typing dots animation hook
  const { dotStyles } = useAutoTypingDotsAnimation(visible, {
    duration: 600, // Match original timing
    dotCount: 3,
  });

  if (!visible) return null;

  return (
    <View style={styles.innerContainer}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        Nafsy is typing
      </Text>
      <View style={styles.dotsContainer}>
        {dotStyles.map((dotStyle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: theme.colors.text.secondary,
              },
              dotStyle,
            ]}
          />
        ))}
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