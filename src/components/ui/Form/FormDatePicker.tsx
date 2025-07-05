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

export function DatePicker({ ...props }: FormDatePickerProps) {
  return <FormText {...props} />;
}

if (__DEV__) DatePicker.displayName = "FormDatePicker";