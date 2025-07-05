import React from "react";
import { TextInput, TextInputProps, TextStyle } from "react-native";
import * as AppleColors from "@bacons/apple-colors";
import { FormFont } from "../Form";
import { mergedStyleProp } from "./utils";

export function TextField({ ...props }: TextInputProps) {
  const font: TextStyle = {
    ...FormFont.default,
  };

  return (
    <TextInput
      placeholderTextColor={AppleColors.placeholderText}
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";