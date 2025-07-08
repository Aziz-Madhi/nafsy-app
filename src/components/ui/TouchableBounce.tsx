"use client";

import {
  TouchableOpacityProps as RNTouchableOpacityProps,
  View,
} from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import * as Haptics from "expo-haptics";
import * as React from "react";

export type TouchableScaleProps = {
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  /** Enables haptic feedback on press down. */
  sensory?:
    | boolean
    | "success"
    | "error"
    | "warning"
    | "light"
    | "medium"
    | "heavy";
  /** Scale factor for bounce effect */
  bounceScale?: number;
};

/**
 * Touchable which scales the children down when pressed using react-native-reanimated.
 */
export default function TouchableBounce({
  style,
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  sensory,
  bounceScale = 0.95,
}: TouchableScaleProps) {
  // Shared value for scale animation
  const scale = useSharedValue(1);

  const onSensory = React.useCallback(() => {
    if (!sensory) return;
    if (sensory === true) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (sensory === "success") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (sensory === "error") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (sensory === "warning") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (sensory === "light") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (sensory === "medium") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (sensory === "heavy") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [sensory]);

  // Tap gesture with advanced bounce animation
  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      runOnJS(onSensory)();
      if (onPressIn) {
        runOnJS(onPressIn)();
      }
      // Quick bounce down
      scale.value = withSpring(bounceScale, {
        tension: 400,
        friction: 10,
      });
    })
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
      if (onPressOut) {
        runOnJS(onPressOut)();
      }
      // Spring back with bounce
      scale.value = withSpring(1, {
        tension: 300,
        friction: 8,
      });
    })
    .onFinalize(() => {
      // Ensure we always return to normal scale
      scale.value = withSpring(1, {
        tension: 300,
        friction: 8,
      });
    });

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (disabled) {
    return (
      <View style={style}>
        {children ? children : <View />}
      </View>
    );
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[style, animatedStyle]}>
        {children ? children : <View />}
      </Animated.View>
    </GestureDetector>
  );
}
