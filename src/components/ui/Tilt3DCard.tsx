import React, { useRef, useEffect } from 'react';
import {
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Tilt3DCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  disabled?: boolean;
  onPress?: () => void;
}

export function Tilt3DCard({
  children,
  style,
  maxTilt = 8,
  perspective = 1000,
  scale = 1.05,
  disabled = false,
  onPress,
}: Tilt3DCardProps) {
  // Shared values for reanimated
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const isPressed = useSharedValue(false);

  // Card dimensions for calculating tilt ratios
  const cardWidth = useSharedValue(200); // Default, will be updated on layout
  const cardHeight = useSharedValue(200);

  // Pan gesture for real-time finger tracking
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (disabled) return;
      isPressed.value = true;
      scaleValue.value = withSpring(scale, { tension: 300, friction: 10 });
    })
    .onUpdate((event) => {
      if (disabled) return;
      
      // Calculate tilt based on finger position relative to card center
      const centerX = cardWidth.value / 2;
      const centerY = cardHeight.value / 2;
      
      // Get relative position from center (-1 to 1)
      const relativeX = (event.x - centerX) / centerX;
      const relativeY = (event.y - centerY) / centerY;
      
      // Apply tilt with smooth interpolation
      rotateY.value = withSpring(relativeX * maxTilt, { tension: 400, friction: 8 });
      rotateX.value = withSpring(-relativeY * maxTilt, { tension: 400, friction: 8 });
    })
    .onEnd(() => {
      if (disabled) return;
      
      // Return to neutral position
      rotateX.value = withSpring(0, { tension: 300, friction: 10 });
      rotateY.value = withSpring(0, { tension: 300, friction: 10 });
      scaleValue.value = withSpring(1, { tension: 300, friction: 10 });
      isPressed.value = false;
    });

  // Tap gesture for press events
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (disabled || !onPress) return;
      runOnJS(onPress)();
    });

  // Combined gesture
  const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: scaleValue.value },
      ],
    };
  });

  // Handle layout to get card dimensions
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    cardWidth.value = width;
    cardHeight.value = height;
  };

  if (disabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[style, animatedStyle]}
        onLayout={handleLayout}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}