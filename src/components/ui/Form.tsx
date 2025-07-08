"use client";

import { useAppTheme } from "@/theme";
import { IconSymbolName } from "@/components/ui/IconSymbol";
import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";
import { use } from "react";
import {
  OpaqueColorValue,
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { SwitchProps } from "@/components/ui/Switch";

import { SymbolWeight } from "expo-symbols";

type SystemImageCustomProps = {
  name: IconSymbolName;
  color?: OpaqueColorValue;
  size?: number;
  weight?: SymbolWeight;
  style?: StyleProp<TextStyle>;
};

type SystemImageProps = IconSymbolName | SystemImageCustomProps;

const minItemHeight = 20;

const useColors = () => {
  const { colors } = useAppTheme();
  return {
    systemGray4: colors.system.border,
    secondarySystemGroupedBackground: colors.background.elevated,
  };
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  itemPadding: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  hstack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vstack: {
    flex: 1,
    flexDirection: "column",
    // alignItems: "center",
    // gap: 8,
  },
  spacer: { flex: 1 },
  separator: {
    marginStart: 60,
    borderBottomWidth: 0.5, //StyleSheet.hairlineWidth,
    marginTop: -0.5, // -StyleSheet.hairlineWidth,
    borderBottomColor: colors.system.separator,
  },
  groupedList: {
    backgroundColor: colors.background.elevated,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.system.separator,
  },
  standardList: {
    borderCurve: "continuous",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
  },

  hintText: {
    color: colors.text.secondary,
    paddingVertical: 8,
    fontSize: 14,
  },
});

const useFormStyles = () => {
  const { colors } = useAppTheme();
  return createStyles(colors);
};

// Legacy export for backward compatibility
export const styles = {
  itemPadding: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  hstack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vstack: {
    flex: 1,
    flexDirection: "column",
  },
  spacer: { flex: 1 },
};

// Import modular components and shared contexts
import { List, useListRefresh } from "./Form/FormList";
import { ScrollView } from "./Form/FormScrollView";
import { FormToggle } from "./Form/FormToggle";
import { DatePicker as FormDatePicker } from "./Form/FormDatePicker";
import { FormItem as ModularFormItem } from "./Form/FormItem";
import { FormText, FormTextProps } from "./Form/FormText";
import { TextField as ModularTextField } from "./Form/FormTextField";
import { Link as ModularLink } from "./Form/FormLink";
import { ListStyleContext, SectionStyleContext, RefreshContext, FormFont, styles as sharedStyles } from "./Form/contexts";
import { getFlatChildren } from "./Form/utils";
import { useFormFont } from "./Form/fontHelpers";

// Re-export modular components and contexts for backward compatibility
export { List, useListRefresh, RefreshContext, ScrollView, FormToggle, ModularFormItem as FormItem, ListStyleContext, SectionStyleContext, FormFont };

// Use modular FormItem
export const FormItem = ModularFormItem;

// Use modular FormText
export const Text = FormText;

// Use modular TextField
export const TextField = ModularTextField;

export function Toggle({
  value,
  onValueChange,
  ...props
}: FormTextProps & Required<Pick<SwitchProps, "value" | "onValueChange">>) {
  return <FormToggle value={value} onValueChange={onValueChange} {...props} />;
}

if (__DEV__) Toggle.displayName = "FormToggle";

export function DatePicker({
  ...props
}: FormTextProps &
  Omit<IOSNativeProps | AndroidNativeProps, "display" | "accentColor"> & {
    /**
     * The date picker accent color.
     *
     * Sets the color of the selected, date and navigation icons.
     * Has no effect for display 'spinner'.
     */
    accentColor?: OpaqueColorValue | string;
  }) {
  return <FormDatePicker {...props} />;
}

if (__DEV__) DatePicker.displayName = "FormDatePicker";

// Use modular Link
export const Link = ModularLink;




// Import Section component
import { Section } from "./Form/FormSection";

// Re-export Section component for backward compatibility
export { Section };


export function HStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={mergedStyleProp<ViewStyle>(styles.hstack, props.style)}
    />
  );
}
export function VStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={mergedStyleProp<ViewStyle>(styles.vstack, props.style)}
    />
  );
}

export function Spacer(props: ViewProps) {
  return <View {...props} style={[styles.spacer, props.style]} />;
}

function Separator(props: ViewProps) {
  return <View {...props} style={[styles.separator, props.style]} />;
}

export function mergedStyleProp<TStyle extends ViewStyle | TextStyle>(
  ...styleProps: (StyleProp<TStyle> | null | undefined)[]
): StyleProp<TStyle> {
  if (!styleProps.length) return undefined;

  return styleProps
    .map((style) => {
      if (Array.isArray(style)) {
        return mergedStyleProp(...style);
      } else {
        return style;
      }
    })
    .filter(Boolean);
}


