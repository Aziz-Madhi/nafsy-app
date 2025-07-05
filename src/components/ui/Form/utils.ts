import React from "react";
import { StyleProp, ViewStyle, TextStyle } from "react-native";

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

export function getFlatChildren(children: React.ReactNode) {
  const allChildren: React.ReactNode[] = [];

  React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // If the child is a fragment, unwrap it and add the children to the list
    if (
      child.type === React.Fragment &&
      typeof child.props === "object" &&
      child.props != null &&
      "key" in child.props &&
      child.props?.key == null &&
      "children" in child.props
    ) {
      React.Children.forEach(child.props?.children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        allChildren.push(child);
      });
      return;
    }

    allChildren.push(child);
  });
  return allChildren;
}

/** @return true if the node should be wrapped in text. */
export function isStringishNode(node: React.ReactNode): boolean {
  let containsStringChildren = typeof node === "string";

  React.Children.forEach(node, (child) => {
    if (typeof child === "string") {
      containsStringChildren = true;
    } else if (
      React.isValidElement(child) &&
      "props" in child &&
      typeof child.props === "object" &&
      child.props !== null &&
      "children" in child.props
    ) {
      containsStringChildren = isStringishNode(child.props.children as any);
    }
  });
  return containsStringChildren;
}