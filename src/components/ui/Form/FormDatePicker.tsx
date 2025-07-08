import React from "react";
import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";
import { OpaqueColorValue } from "react-native";
import { FormText } from "./FormText";
import { FormTextProps } from "./types";

export type FormDatePickerProps = FormTextProps &
  Omit<IOSNativeProps | AndroidNativeProps, "display" | "accentColor"> & {
    /**
     * The date picker accent color.
     *
     * Sets the color of the selected, date and navigation icons.
     * Has no effect for display 'spinner'.
     */
    accentColor?: OpaqueColorValue | string;
  };

export function DatePicker({ children, ...props }: FormDatePickerProps) {
  // The DatePicker component is designed to work within Form.Section
  // The actual DateTimePicker is handled by the Section component automatically
  // This component just renders the label text
  return <>{children}</>;
}

if (__DEV__) DatePicker.displayName = "FormDatePicker";