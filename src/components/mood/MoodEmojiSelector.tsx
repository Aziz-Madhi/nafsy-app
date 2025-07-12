import { useAppTheme } from "@/theme";
import { colorUtils } from "@/theme/colors";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

interface MoodEmojiSelectorProps {
  value?: number;
  onChange: (value: number) => void;
  onComplete?: () => void;
  showCelebration?: boolean;
  style?: ViewStyle;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 5, emoji: "😄", label: "Excellent", color: "#4CAF50" },
  { value: 4, emoji: "🙂", label: "Good", color: "#8BC34A" },
  { value: 3, emoji: "😐", label: "Okay", color: "#FFC107" },
  { value: 2, emoji: "😕", label: "Bad", color: "#FF9800" },
  { value: 1, emoji: "😢", label: "Terrible", color: "#F44336" },
];


export function MoodEmojiSelector({
  value,
  onChange,
  onComplete,
  showCelebration = true,
  style,
}: MoodEmojiSelectorProps) {
  const { colors, spacing, typography } = useAppTheme();
  
  // Animation values
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);
  const selectionScale = useSharedValue(1);
  
  const handleMoodSelect = useCallback(async (moodValue: number) => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update value
    onChange(moodValue);
    
    // Trigger selection animation
    selectionScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    
    // Check for celebration (95% completion simulation)
    if (showCelebration && onComplete) {
      // Simulate 95% completion celebration
      const shouldCelebrate = Math.random() > 0.05; // 95% chance
      
      if (shouldCelebrate) {
        // Start celebration animation
        'worklet';
        celebrationScale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 200 }),
          withDelay(500, withTiming(1, { duration: 300 })),
          withDelay(1000, withTiming(0, { duration: 300 }))
        );
        
        celebrationOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(1300, withTiming(0, { duration: 300 }))
        );
        
        // Trigger haptic celebration
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          runOnJS(onComplete)();
        }, 500);
      }
    }
  }, [onChange, onComplete, showCelebration, selectionScale, celebrationScale, celebrationOpacity]);

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    marginTop: -60,
    marginLeft: -60,
  }));

  const styles = {
    container: {
      ...style,
    },
    moodContainer: {
      flexDirection: "row" as const,
      justifyContent: "space-evenly" as const,
      alignItems: "center" as const,
      paddingVertical: spacing.md,
    },
    moodOption: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    emojiContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      marginBottom: spacing.xs,
    },
    emoji: {
      fontSize: 32,
    },
    label: {
      ...typography.caption,
      textAlign: "center" as const,
    } as TextStyle,
    celebrationContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.interactive.success + "20",
      alignItems: "center" as const,
      justifyContent: "center" as const,
      zIndex: 1000,
    },
    celebrationEmoji: {
      fontSize: 60,
    },
    celebrationText: {
      ...typography.bodyMedium,
      color: colors.interactive.success,
      marginTop: spacing.xs,
    } as TextStyle,
  };

  return (
    <View style={styles.container}>
      <View style={styles.moodContainer}>
        {MOOD_OPTIONS.map((mood) => (
          <MoodEmoji
            key={mood.value}
            mood={mood}
            isSelected={value === mood.value}
            onPress={() => handleMoodSelect(mood.value)}
            colors={colors}
            spacing={spacing}
            styles={styles}
          />
        ))}
      </View>
      
      {/* Celebration overlay */}
      <Animated.View
        style={[styles.celebrationContainer, celebrationAnimatedStyle]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.celebrationText}>95%!</Text>
      </Animated.View>
    </View>
  );
}

interface MoodEmojiProps {
  mood: MoodOption;
  isSelected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  spacing: ReturnType<typeof useAppTheme>["spacing"];
  styles: any;
}

function MoodEmoji({ mood, isSelected, onPress, colors, styles }: MoodEmojiProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const handlePressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, [scale]);
  
  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    
    if (isSelected) {
      // Wiggle animation when selected
      rotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [scale, rotation, isSelected]);
  
  return (
    <TouchableOpacity
      style={styles.moodOption}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.emojiContainer,
            {
              backgroundColor: isSelected
                ? colorUtils.withOpacity(mood.color, 0.2)
                : colors.background.secondary,
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? mood.color : colors.system.border,
            },
          ]}
        >
          <Text style={styles.emoji}>{mood.emoji}</Text>
        </View>
      </Animated.View>
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? mood.color : colors.text.secondary,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
      >
        {mood.label}
      </Text>
    </TouchableOpacity>
  );
}