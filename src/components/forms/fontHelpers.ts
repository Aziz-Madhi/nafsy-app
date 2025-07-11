import { useAppTheme } from "@/theme";

/**
 * Theme-aware font helper hook for Form components
 */
export const useFormFont = () => {
  const { colors } = useAppTheme();
  return {
    // From inspecting SwiftUI `List { Text("Foo") }` in Xcode.
    default: {
      color: colors.text.primary,
      // 17.00pt is the default font size for a Text in a List.
      fontSize: 17,
      // UICTFontTextStyleBody is the default fontFamily.
    },
    secondary: {
      color: colors.text.secondary,
      fontSize: 17,
    },
    caption: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    title: {
      color: colors.text.primary,
      fontSize: 17,
      fontWeight: "600" as any,
    },
  };
};