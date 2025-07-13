import React from "react";
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";
import { IconSymbol } from "../Icon/IconSymbol";
import { SymbolViewProps } from "expo-symbols";
import { ColorValue } from "react-native";

export type SFSymbolSource = `sf:${SymbolViewProps["name"]}`;

export type ImageProps = Omit<ExpoImageProps, "tintColor"> & {
  tintColor?: ColorValue | null;
} & {
  source: SFSymbolSource;
  size?: number;
  weight?: SymbolViewProps["weight"];
  animationSpec?: SymbolViewProps["animationSpec"];
};

// Simplified implementation without Animated.createAnimatedComponent to avoid New Architecture issues
export const Image = React.forwardRef<any, ImageProps>(function Image(props, ref) {
  const { source } = props;

  if (typeof source === "string") {
    if (source.startsWith("sf:")) {
      return (
        <IconSymbol
          {...props}
          name={source.substring(3) as SymbolViewProps["name"]}
          color={props.tintColor}
          ref={ref}
        />
      );
    }
  }

  return <ExpoImage {...props} ref={ref} />;
});
