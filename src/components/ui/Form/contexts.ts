import React from "react";
import { StyleProp, ViewStyle } from "react-native";

// Shared types and contexts to avoid circular dependencies

export type ListStyle = "grouped" | "auto";

export const ListStyleContext = React.createContext<ListStyle>("auto");

export const SectionStyleContext = React.createContext<{
  style: StyleProp<ViewStyle>;
}>({
  style: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
});

export type RefreshCallback = () => Promise<void>;

export const RefreshContext = React.createContext<{
  subscribe: (cb: RefreshCallback) => () => void;
  hasSubscribers: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
}>({
  subscribe: () => () => {},
  hasSubscribers: false,
  refresh: async () => {},
  refreshing: false,
});

// Shared styles - static values to avoid circular dependencies
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
} as const;

// Legacy FormFont for backward compatibility - static values
export const FormFont = {
  default: {
    fontSize: 17,
  },
  secondary: {
    fontSize: 17,
  },
  caption: {
    fontSize: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600" as any,
  },
};