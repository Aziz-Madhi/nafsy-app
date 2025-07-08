import React from "react";
import { TextInput, TextInputProps, TextStyle } from "react-native";
import { mergedStyleProp } from "./utils";
import { useAppTheme } from "@/theme";
import { useFormFont } from "./fontHelpers";

export function TextField({ ...props }: TextInputProps) {
  const { colors } = useAppTheme();
  const formFont = useFormFont();
  const font: TextStyle = {
    ...formFont.default,
  };

  return (
    <TextInput
      placeholderTextColor={colors.text.placeholder}
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";