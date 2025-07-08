"use client";

import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

const BASE_COLORS = {
  dark: { primary: "rgb(17, 17, 17)", secondary: "rgb(51, 51, 51)" },
  light: {
    primary: "rgb(250, 250, 250)",
    secondary: "rgb(205, 205, 205)",
  },
} as const;

const makeColors = (mode: keyof typeof BASE_COLORS) => [
  BASE_COLORS[mode].primary,
  BASE_COLORS[mode].secondary,
  BASE_COLORS[mode].secondary,
  BASE_COLORS[mode].primary,
  BASE_COLORS[mode].secondary,
  BASE_COLORS[mode].primary,
];

const DARK_COLORS = new Array(3)
  .fill(0)
  .map(() => makeColors("dark"))
  .flat();

const LIGHT_COLORS = new Array(3)
  .fill(0)
  .map(() => makeColors("light"))
  .flat();

export const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
  delay,
}: {
  width: number;
  height: number;
  borderRadius?: number;
  delay?: number;
}) => {
  return (
    <Skeleton
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height,
        height,
        borderRadius,
      }}
      delay={delay}
    />
  );
};

const Skeleton = ({
  style,
  delay,
  dark: inputDark,
}: {
  style?: StyleProp<ViewStyle>;
  delay?: number;
  dark?: boolean;
} = {}) => {
  const colorScheme = useColorScheme();
  const dark = inputDark ?? colorScheme !== "light";
  const translateX = useSharedValue(-1);
  const [width, setWidth] = React.useState(150);

  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const targetRef = React.useRef<View>(null);

  React.useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 5000,
          easing: Easing.in(Easing.ease),
        })
      ),
      -1
    );
  }, [translateX, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [-1, 1],
            [-width * 8, width]
          ),
        },
      ],
    };
  });

  return (
    <View
      ref={targetRef}
      style={[
        {
          height: 32,
          borderRadius: 8,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: "transparent",
        },
        style,
      ]}
      onLayout={() => {
        targetRef.current?.measureInWindow((_x, _y, width, _height) => {
          setWidth(width);
        });
      }}
    >
      <Animated.View
        style={[
          {
            width: "800%",
            height: "100%",
            backgroundColor: "transparent",
          },
          animatedStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              [process.env.EXPO_OS === "web"
                ? `backgroundImage`
                : `experimental_backgroundImage`]: `linear-gradient(to right, ${colors.join(
                ", "
              )})`,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

export default Skeleton;
