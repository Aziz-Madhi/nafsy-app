import React from "react";
import { Href, LinkProps, Link as RouterLink } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text as RNText, Share, TextStyle } from "react-native";
import * as AppleColors from "@bacons/apple-colors";
import { FormFont } from "../Form";
import { HeaderButton } from "../Header";
import { mergedStyleProp } from "./utils";
import { SystemImageProps } from "./types";

export type FormLinkProps = LinkProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text. */
  systemImage?: SystemImageProps | React.ReactNode;

  /** Changes the right icon. */
  hintImage?: SystemImageProps | React.ReactNode;

  // TODO: Automatically detect this somehow.
  /** Is the link inside a header. */
  headerRight?: boolean;

  bold?: boolean;
};

export function Link({
  bold,
  children,
  headerRight,
  hintImage,
  ...props
}: FormLinkProps) {
  const font: TextStyle = {
    ...FormFont.default,
    fontWeight: bold ? "600" : "normal",
  };

  const resolvedChildren = (() => {
    if (headerRight) {
      if (process.env.EXPO_OS === "web") {
        return <div style={{ paddingRight: 16 }}>{children}</div>;
      }
      const wrappedTextChildren = React.Children.map(children, (child) => {
        // Filter out empty children
        if (!child) {
          return null;
        }
        if (typeof child === "string") {
          return (
            <RNText
              style={mergedStyleProp<TextStyle>(
                { ...font, color: AppleColors.link },
                props.style
              )}
            >
              {child}
            </RNText>
          );
        }
        return child;
      });

      return (
        <HeaderButton
          pressOpacity={0.7}
          style={{
            // Offset on the side so the margins line up. Unclear how to handle when this is used in headerLeft.
            // We should automatically detect it somehow.
            marginRight: -8,
          }}
        >
          {wrappedTextChildren}
        </HeaderButton>
      );
    }
    return children;
  })();

  return (
    <RouterLink
      dynamicTypeRamp="body"
      {...props}
      asChild={
        props.asChild ?? (process.env.EXPO_OS === "web" ? false : headerRight)
      }
      style={mergedStyleProp<TextStyle>(font, props.style)}
      onPress={
        process.env.EXPO_OS === "web"
          ? props.onPress
          : (e) => {
              if (
                props.target === "_blank" &&
                // Ensure the resolved href is an external URL.
                /^([\w\d_+.-]+:)?\/\//.test(RouterLink.resolveHref(props.href))
              ) {
                // Prevent the default behavior of linking to the default browser on native.
                e.preventDefault();
                // Open the link in an in-app browser.
                WebBrowser.openBrowserAsync(props.href as string, {
                  presentationStyle:
                    WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
                });
              } else if (
                props.target === "share" &&
                // Ensure the resolved href is an external URL.
                /^([\w\d_+.-]+:)?\/\//.test(RouterLink.resolveHref(props.href))
              ) {
                // Prevent the default behavior of linking to the default browser on native.
                e.preventDefault();
                // Open the link in an in-app browser.
                Share.share({
                  url: props.href as string,
                });
              } else {
                props.onPress?.(e);
              }
            }
      }
      children={resolvedChildren}
    />
  );
}

if (__DEV__) Link.displayName = "FormLink";