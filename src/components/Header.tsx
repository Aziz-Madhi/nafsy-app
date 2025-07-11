import React from "react";
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";

interface HeaderButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  pressOpacity?: number;
}

export function HeaderButton({
  children,
  style,
  pressOpacity = 0.7,
  ...props
}: HeaderButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
          minWidth: 44,
        },
        style,
      ]}
      activeOpacity={pressOpacity}
    >
      {children}
    </TouchableOpacity>
  );
}