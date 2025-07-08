"use client";

import React from "react";
import { ScrollViewProps } from "react-native";
import { useAppTheme } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabOverflow } from "../TabBarBackground";
import { useScrollToTop } from "@/hooks/useTabToTop";
import Animated from "react-native-reanimated";

export function ScrollView(
  props: ScrollViewProps & { ref?: React.Ref<Animated.ScrollView> }
) {
  const { colors } = useAppTheme();
  const paddingBottom = useBottomTabOverflow();

  const { top: statusBarInset, bottom } = useSafeAreaInsets(); // inset of the status bar

  const largeHeaderInset = statusBarInset + 92; // inset to use for a large header since it's frame is equal to 96 + the frame of status bar

  useScrollToTop(props.ref!, -largeHeaderInset);

  return (
    <Animated.ScrollView
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