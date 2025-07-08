import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";
import { useFormFont } from "./fontHelpers";
import { mergedStyleProp } from "./utils";

export type FormTextProps = TextProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** A true/false value for the hint. */
  hintBoolean?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text */
  systemImage?: any;
  
  bold?: boolean;
};

/**
 * Modular FormText component extracted from Form.tsx
 * Compatible with existing Form usage patterns - Text but with iOS default color and sizes.
 */
export function FormText({ bold, ...props }: FormTextProps) {
  const formFont = useFormFont();
  const font: TextStyle = {
    ...formFont.default,
    flexShrink: 0,
    fontWeight: bold ? "600" : "normal",
  };

  return (
    <RNText
      dynamicTypeRamp="body"
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}