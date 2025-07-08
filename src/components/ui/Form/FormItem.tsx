import React, { use } from "react";
import {
  View,
  ViewProps,
  TouchableHighlight,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import { Href, Link } from "expo-router";
import { useAppTheme } from "@/theme";
import { SectionStyleContext, styles } from "./contexts";
import { getFlatChildren } from "./utils";

const minItemHeight = 20;

// Local HStack implementation to avoid circular dependency
function HStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        props.style,
      ]}
    />
  );
}

/**
 * Modular FormItem component extracted from Form.tsx
 * Compatible with existing Form.Section usage patterns
 */
export function FormItem({
  children,
  href,
  onPress,
  onLongPress,
  style,
  ref,
}: Pick<ViewProps, "children"> & {
  href?: Href<any>;
  onPress?: (event: any) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  ref?: React.Ref<View>;
}) {
  const { colors } = useAppTheme();
  const itemStyle = use(SectionStyleContext)?.style ?? styles.itemPadding;
  const resolvedStyle = [itemStyle, style];
  
  if (href == null) {
    if (onPress == null && onLongPress == null) {
      const childrenCount = getFlatChildren(children).length;

      // If there's only one child, avoid the HStack. This ensures that TextInput doesn't jitter horizontally when typing.
      if (childrenCount === 1) {
        return (
          <View style={resolvedStyle}>
            <View style={{ minHeight: minItemHeight }}>{children}</View>
          </View>
        );
      }

      return (
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      );
    }
    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={colors.system.border}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <Link asChild href={href} onPress={onPress} onLongPress={onLongPress}>
      <TouchableHighlight ref={ref} underlayColor={colors.system.border}>
        <View style={resolvedStyle}>
          <HStack style={{ minHeight: minItemHeight }}>{children}</HStack>
        </View>
      </TouchableHighlight>
    </Link>
  );
}