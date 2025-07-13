import React from "react";
import { Platform } from "react-native";
import { SymbolView } from "expo-symbols";
import { IconSymbolMaterial, IconSymbolName, IconSymbolProps } from "./IconSymbolFallback";

// Enhanced IconSymbol that uses SF Symbols on iOS and Material Icons elsewhere
export const IconSymbol = React.forwardRef<any, IconSymbolProps>(function IconSymbol(
  { name, size = 24, color = "#000000", style, ...props },
  ref
) {
  // Use SF Symbols on iOS, fallback to Material Icons elsewhere
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color}
        style={style}
        {...props}
      />
    );
  }

  // Fallback to Material Icons for Android/Web
  return (
    <IconSymbolMaterial
      name={name}
      size={size}
      color={color}
      style={style}
      ref={ref}
      {...props}
    />
  );
});

export { IconSymbolName, IconSymbolProps };
