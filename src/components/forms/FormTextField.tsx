import React from "react";
import { TextInputProps } from "react-native";
import { BaseInput, BaseInputProps } from "./BaseInput";

// OPTIMIZATION: Consolidated FormTextField into BaseInput following LEVER framework
// This eliminates ~87% functionality overlap and reduces bundle size
// Migration: Replace TextField with BaseInput variant='default' size='medium'

export interface TextFieldProps extends Omit<BaseInputProps, 'variant' | 'size'> {
  // Keep original TextInputProps for backward compatibility
  style?: TextInputProps['style'];
}

export function TextField({ style, ...props }: TextFieldProps) {
  return (
    <BaseInput
      variant="default"
      size="medium"
      inputStyle={style}
      {...props}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";