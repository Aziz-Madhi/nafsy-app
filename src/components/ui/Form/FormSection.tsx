import React, { use } from "react";
import {
  View,
  ViewProps,
  Text as RNText,
  TextInput,
  Button,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import Animated from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as AppleColors from "@bacons/apple-colors";
import { Link as RouterLink } from "expo-router";
import { Switch } from "@/components/ui/Switch";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { Image } from "@/components/ui/img";
import { FormItem } from "./FormItem";
import { FormText as Text } from "./FormText";
import { TextField } from "./FormTextField";
import { DatePicker } from "./FormDatePicker";
import { Toggle } from "./FormToggle";
import { Link } from "./FormLink";
import { FormFont, styles, ListStyleContext, SectionStyleContext } from "../Form";
import { mergedStyleProp, isStringishNode, getFlatChildren } from "./utils";
import { SystemImageProps, SystemImageCustomProps } from "./types";

const minItemHeight = 20;

export type FormSectionProps = ViewProps & {
  title?: string | React.ReactNode;
  titleHint?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  itemStyle?: ViewStyle;
};

export function Section({
  children,
  title,
  titleHint,
  footer,
  itemStyle,
  ...props
}: FormSectionProps) {
  const listStyle = React.use(ListStyleContext) ?? "auto";

  const allChildren = getFlatChildren(children);

  const childrenWithSeparator = allChildren.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const isLastChild = index === allChildren.length - 1;

    const resolvedProps = {
      ...child.props,
    };

    const isDatePicker = child.type === DatePicker;
    const isToggle = child.type === Toggle;

    if (isToggle) {
      resolvedProps.hint = (
        <Switch
          thumbColor={resolvedProps.thumbColor}
          trackColor={resolvedProps.trackColor}
          ios_backgroundColor={resolvedProps.ios_backgroundColor}
          onChange={resolvedProps.onChange}
          disabled={resolvedProps.disabled}
          value={resolvedProps.value}
          onValueChange={resolvedProps.onValueChange}
        />
      );
    } else if (isDatePicker) {
      resolvedProps.hint = (
        // TODO: Add more props
        <DateTimePicker
          locale={resolvedProps.locale}
          minuteInterval={resolvedProps.minuteInterval}
          mode={resolvedProps.mode}
          timeZoneOffsetInMinutes={resolvedProps.timeZoneOffsetInMinutes}
          textColor={resolvedProps.textColor}
          disabled={resolvedProps.disabled}
          accentColor={resolvedProps.accentColor}
          value={resolvedProps.value}
          display={resolvedProps.display}
          onChange={resolvedProps.onChange}
        />
      );
    }

    // Set the hint for the hintBoolean prop.
    if (resolvedProps.hintBoolean != null) {
      resolvedProps.hint ??= resolvedProps.hintBoolean ? (
        <Image
          source="sf:checkmark.circle.fill"
          tintColor={AppleColors.systemGreen}
        />
      ) : (
        <Image source="sf:slash.circle" tintColor={AppleColors.systemGray} />
      );
    }

    // Extract onPress from child
    const originalOnPress = resolvedProps.onPress;
    const originalOnLongPress = resolvedProps.onLongPress;
    let wrapsFormItem = false;
    if (child.type === Button) {
      const { title, color } = resolvedProps;

      delete resolvedProps.title;
      resolvedProps.style = mergedStyleProp(
        { color: color ?? AppleColors.link },
        resolvedProps.style
      );
      child = <RNText {...resolvedProps}>{title}</RNText>;
    }

    if (
      // If child is type of Text, add default props
      child.type === RNText ||
      child.type === Text ||
      isToggle ||
      isDatePicker
    ) {
      child = React.cloneElement(child, {
        dynamicTypeRamp: "body",
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
        ...resolvedProps,
        onPress: undefined,
        onLongPress: undefined,
        style: mergedStyleProp(FormFont.default, resolvedProps.style),
      });

      const hintView = (() => {
        if (!resolvedProps.hint) {
          return null;
        }

        return React.Children.map(resolvedProps.hint, (child) => {
          // Filter out empty children
          if (!child) {
            return null;
          }
          if (typeof child === "string") {
            return (
              <RNText
                selectable
                dynamicTypeRamp="body"
                style={{
                  ...FormFont.secondary,
                  textAlign: "right",
                  flexShrink: 1,
                }}
              >
                {child}
              </RNText>
            );
          }
          return child;
        });
      })();

      if (hintView || resolvedProps.systemImage) {
        child = (
          <HStack>
            <SymbolView
              systemImage={resolvedProps.systemImage}
              style={resolvedProps.style}
            />
            {child}
            {hintView && <Spacer />}
            {hintView}
          </HStack>
        );
      }
    } else if (child.type === RouterLink || child.type === Link) {
      wrapsFormItem = true;

      const wrappedTextChildren = React.Children.map(
        resolvedProps.children,
        (linkChild) => {
          // Filter out empty children
          if (!linkChild) {
            return null;
          }
          if (typeof linkChild === "string") {
            return (
              <RNText
                dynamicTypeRamp="body"
                style={mergedStyleProp(FormFont.default, resolvedProps?.style)}
              >
                {linkChild}
              </RNText>
            );
          }
          return linkChild;
        }
      );

      const hintView = (() => {
        if (!resolvedProps.hint) {
          return null;
        }

        return React.Children.map(resolvedProps.hint, (child) => {
          // Filter out empty children
          if (!child) {
            return null;
          }
          if (typeof child === "string") {
            return (
              <Text selectable style={FormFont.secondary}>
                {child}
              </Text>
            );
          }
          return child;
        });
      })();

      child = React.cloneElement(child, {
        style: [
          FormFont.default,
          process.env.EXPO_OS === "web" && {
            alignItems: "stretch",
            flexDirection: "column",
            display: "flex",
          },
          resolvedProps.style,
        ],
        dynamicTypeRamp: "body",
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
        // TODO: This causes issues with ref in React 19.
        asChild: process.env.EXPO_OS !== "web",
        children: (
          <FormItem>
            <HStack>
              <SymbolView
                systemImage={resolvedProps.systemImage}
                style={resolvedProps.style}
              />
              {wrappedTextChildren}
              <Spacer />
              {hintView}
              <View style={{}}>
                <LinkChevronIcon
                  href={resolvedProps.href}
                  systemImage={resolvedProps.hintImage}
                />
              </View>
            </HStack>
          </FormItem>
        ),
      });
    } else if (child.type === TextInput || child.type === TextField) {
      wrapsFormItem = true;
      child = (
        <FormItem
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={{ paddingVertical: 0, paddingHorizontal: 0 }}
        >
          {React.cloneElement(child, {
            placeholderTextColor: AppleColors.placeholderText,
            ...resolvedProps,
            onPress: undefined,
            onLongPress: undefined,
            style: mergedStyleProp(
              FormFont.default,
              {
                outline: "none",
                // outlineWidth: 1,
                // outlineStyle: "auto",
                // outlineColor: AppleColors.systemGray4,
              },
              styles.itemPadding,
              resolvedProps.style
            ),
          })}
        </FormItem>
      );
    }

    // Ensure child is a FormItem otherwise wrap it in a FormItem
    if (!wrapsFormItem && !child.props.custom && child.type !== FormItem) {
      // Toggle needs reduced padding to account for the larger element.
      const reducedPadding =
        isToggle || isDatePicker
          ? {
              paddingVertical: 8,
            }
          : undefined;

      child = (
        <FormItem
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={reducedPadding}
        >
          {child}
        </FormItem>
      );
    }

    return (
      <>
        {child}
        {!isLastChild && <Separator />}
      </>
    );
  });

  const contents = (
    <SectionStyleContext
      value={{
        style: mergedStyleProp<ViewStyle>(styles.itemPadding, itemStyle),
      }}
    >
      <Animated.View
        {...props}
        style={[
          listStyle === "grouped" ? styles.groupedList : styles.standardList,
          props.style,
        ]}
      >
        {childrenWithSeparator.map((child, index) => (
          <React.Fragment key={index}>{child}</React.Fragment>
        ))}
      </Animated.View>
    </SectionStyleContext>
  );

  const padding = listStyle === "grouped" ? 0 : 16;

  if (!title && !footer) {
    return (
      <View
        style={{
          paddingHorizontal: padding,
        }}
      >
        {contents}
      </View>
    );
  }

  const titleHintJsx = (() => {
    if (!titleHint) {
      return null;
    }

    if (isStringishNode(titleHint)) {
      return (
        <RNText dynamicTypeRamp="footnote" style={styles.hintText}>
          {titleHint}
        </RNText>
      );
    }

    return titleHint;
  })();

  return (
    <View
      style={{
        paddingHorizontal: padding,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          gap: 20,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {title && (
          <RNText
            dynamicTypeRamp="footnote"
            style={{
              textTransform: "uppercase",
              color: AppleColors.secondaryLabel,
              paddingVertical: 8,
              fontSize: 14,
              // use Apple condensed font
              // fontVariant: ["small-caps"],
            }}
          >
            {title}
          </RNText>
        )}
        {titleHintJsx}
      </View>

      {contents}

      {footer && (
        <RNText
          dynamicTypeRamp="footnote"
          style={{
            color: AppleColors.secondaryLabel,
            paddingHorizontal: 20,
            paddingTop: 8,
            fontSize: 14,
          }}
        >
          {footer}
        </RNText>
      )}
    </View>
  );
}

function SymbolView({
  systemImage,
  style,
}: {
  systemImage?: SystemImageProps | React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  if (!systemImage) {
    return null;
  }

  if (typeof systemImage !== "string" && React.isValidElement(systemImage)) {
    return systemImage;
  }

  const symbolProps: SystemImageCustomProps =
    typeof systemImage === "object" && "name" in systemImage
      ? systemImage
      : { name: systemImage as unknown as string };

  let color: string | OpaqueColorValue | undefined = symbolProps.color;
  if (color == null) {
    const flatStyle = StyleSheet.flatten(style);
    color = extractStyle(flatStyle, "color");
  }

  return (
    <IconSymbol
      name={symbolProps.name}
      size={symbolProps.size ?? 20}
      style={[{ marginRight: 8 }, symbolProps.style]}
      weight={symbolProps.weight}
      color={color ?? AppleColors.label}
    />
  );
}

function LinkChevronIcon({
  href,
  systemImage,
}: {
  href?: any;
  systemImage?: SystemImageProps | React.ReactNode;
}) {
  const isHrefExternal =
    typeof href === "string" && /^([\w\d_+.-]+:)?\/\//.test(href);

  const size = process.env.EXPO_OS === "ios" ? 14 : 24;

  if (systemImage) {
    if (typeof systemImage !== "string") {
      if (React.isValidElement(systemImage)) {
        return systemImage;
      }
      return (
        <IconSymbol
          name={systemImage.name}
          size={systemImage.size ?? size}
          color={systemImage.color ?? AppleColors.tertiaryLabel}
        />
      );
    }
  }

  const resolvedName =
    typeof systemImage === "string"
      ? systemImage
      : isHrefExternal
      ? "arrow.up.right"
      : "chevron.right";

  return (
    <Image
      source={"sf:" + resolvedName}
      size={size}
      weight="bold"
      // from xcode, not sure which color is the exact match
      // #BFBFBF
      // #9D9DA0
      tintColor={AppleColors.tertiaryLabel}
    />
  );
}

export function HStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={mergedStyleProp<ViewStyle>(styles.hstack, props.style)}
    />
  );
}

export function VStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={mergedStyleProp<ViewStyle>(styles.vstack, props.style)}
    />
  );
}

export function Spacer(props: ViewProps) {
  return <View {...props} style={[styles.spacer, props.style]} />;
}

function Separator(props: ViewProps) {
  return <View {...props} style={[styles.separator, props.style]} />;
}

function extractStyle<TStyle extends ViewStyle | TextStyle>(
  styleProp: TStyle,
  key: keyof TStyle
) {
  if (styleProp == null) {
    return undefined;
  } else if (Array.isArray(styleProp)) {
    return styleProp.find((style) => {
      return style[key] != null;
    })?.[key];
  } else if (typeof styleProp === "object") {
    return styleProp?.[key];
  }
  return null;
}