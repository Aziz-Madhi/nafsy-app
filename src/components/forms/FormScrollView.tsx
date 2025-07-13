"use client";

import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { ScrollViewProps } from "react-native";
import { useAppTheme } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Removed deprecated useBottomTabBarHeight import
import { useScrollToTop } from "@react-navigation/native";
import Animated from "react-native-reanimated";

export const ScrollView = forwardRef<Animated.ScrollView, ScrollViewProps>(
  (props, forwardedRef) => {
    const { colors } = useAppTheme();
    const { top: statusBarInset, bottom } = useSafeAreaInsets();
    
    // Use safe area bottom inset plus some extra space for tab bar
    // This is a more reliable approach than the deprecated useBottomTabBarHeight
    const paddingBottom = bottom + 83; // Standard tab bar height (49) + safe area + extra spacing
    const largeHeaderInset = statusBarInset + 92;

    // Create internal ref for scroll-to-top functionality
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    
    // Use React Navigation's modern useScrollToTop hook
    useScrollToTop(scrollViewRef);

    // Forward ref to parent component if needed
    useImperativeHandle(forwardedRef, () => scrollViewRef.current!, []);

    return (
      <Animated.ScrollView
        ref={scrollViewRef}
        scrollToOverflowEnabled
        automaticallyAdjustsScrollIndicatorInsets
        contentInsetAdjustmentBehavior="automatic"
        contentInset={{ bottom: paddingBottom }}
        scrollIndicatorInsets={{
          bottom: paddingBottom - (process.env.EXPO_OS === "ios" ? bottom : 0),
        }}
        {...props}
        style={[{ backgroundColor: colors.background.primary }, props.style]}
      />
    );
  }
);