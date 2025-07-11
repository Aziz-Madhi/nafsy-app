// Shared types for Form components
import { IconSymbolName } from "@/components/core/Icon/IconSymbol";
import { SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, StyleProp, TextStyle, TextProps } from "react-native";

export type ListStyle = "grouped" | "auto";

export interface SystemImageCustomProps {
  name: IconSymbolName;
  color?: OpaqueColorValue;
  size?: number;
  weight?: SymbolWeight;
  style?: StyleProp<TextStyle>;
}

export type SystemImageProps = IconSymbolName | SystemImageCustomProps;

export interface FormItemProps {
  systemImage?: string;
  systemImageProps?: SystemImageCustomProps;
  children?: React.ReactNode;
  style?: any;
  disabled?: boolean;
  onPress?: () => void;
}

export type FormTextProps = TextProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** A true/false value for the hint. */
  hintBoolean?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text */
  systemImage?: SystemImageProps | React.ReactNode;

  bold?: boolean;
};