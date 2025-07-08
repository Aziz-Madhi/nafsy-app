// Similar to https://developer.apple.com/documentation/swiftui/contentunavailableview

import { View, Text } from "react-native";
import { IconSymbol, IconSymbolName } from "./IconSymbol";

type Props = {
  title: string;
  description?: string;
  systemImage: IconSymbolName | (React.ReactElement & {});
  actions?: React.ReactNode;
};

export function ContentUnavailable({
  title,
  description,
  systemImage,
  actions,
  ...props
}:
  | Props
  | ({
      search: boolean | string;
    } & Partial<Props>)
  | ({
      internet: boolean;
    } & Partial<Props>)) {
  let resolvedTitle = title;
  let resolvedSystemImage = systemImage;
  let resolvedDescription = description;
  let animationSpec:
    | import("expo-symbols").SymbolViewProps["animationSpec"]
    | undefined;

  if ("search" in props && props.search) {
    resolvedTitle =
      title ?? typeof props.search === "string"
        ? `No Results for "${props.search}"`
        : `No Results`;
    resolvedSystemImage ??= "magnifyingglass";
    resolvedDescription ??= `Check the spelling or try a new search.`;
  } else if ("internet" in props && props.internet) {
    resolvedTitle ??= "Connection issue";
    resolvedSystemImage ??=
      process.env.EXPO_OS === "ios" ? "wifi" : "wifi.slash";

    animationSpec = {
      repeating: true,
      variableAnimationSpec: {
        iterative: true,
        dimInactiveLayers: true,
      },
    };
    resolvedDescription ??= `Check your internet connection.`;
  }

  return (
    <View
      style={{
        flex: 1,
        gap: 6,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {typeof resolvedSystemImage === "string" ? (
        <IconSymbol
          animationSpec={animationSpec}
          name={resolvedSystemImage as any}
          size={48}
          color="#8E8E93"
        />
      ) : (
        resolvedSystemImage
      )}

      <View
        style={{
          gap: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          dynamicTypeRamp="title1"
          style={{
            color: "#000000",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 17,
          }}
        >
          {resolvedTitle}
        </Text>
        {resolvedDescription ? <Text
            dynamicTypeRamp="body"
            style={{
              color: "#8E8E93",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {resolvedDescription}
          </Text> : null}
      </View>
      {actions}
    </View>
  );
}
