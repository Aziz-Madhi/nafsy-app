import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { GlassOverlay } from "@/components/glass";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, {
    SlideInDown,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface ExerciseQuickActionsProps {
  isVisible: boolean;
  actions?: QuickAction[];
  onClose?: () => void;
  style?: ViewStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const DEFAULT_ACTIONS: Omit<QuickAction, 'onPress'>[] = [
  {
    id: "start",
    icon: "play.fill",
    label: "Start",
    color: "#4CAF50",
  },
  {
    id: "favorite",
    icon: "heart",
    label: "Favorite",
    color: "#F44336",
  },
  {
    id: "schedule",
    icon: "calendar.badge.plus",
    label: "Schedule",
    color: "#4A90E2",
  },
  {
    id: "share",
    icon: "square.and.arrow.up",
    label: "Share",
    color: "#9B59B6",
  },
];

export function ExerciseQuickActions({
  isVisible,
  actions,
  onClose,
  style,
}: ExerciseQuickActionsProps) {
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  const { t } = useTranslation();

  const handleActionPress = useCallback(async (action: QuickAction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
    onClose?.();
  }, [onClose]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
    transform: [
      { scale: withSpring(isVisible ? 1 : 0.95, { damping: 15 }) },
    ],
  }));

  if (!isVisible) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      zIndex: 1000,
      ...style,
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      padding: spacing.md,
      gap: spacing.sm,
    },
    actionButton: {
      alignItems: "center",
      gap: spacing.xs,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionLabel: {
      ...typography.caption,
      color: colors.text.primary,
      fontWeight: "500",
    },
    closeButton: {
      position: "absolute",
      top: -10,
      right: -10,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.background.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  });

  const finalActions = actions || DEFAULT_ACTIONS.map(action => ({
    ...action,
    onPress: () => console.log(`Action: ${action.id}`),
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <GlassOverlay
        variant="card"
        borderRadius={borderRadius.xl}
        style={styles.content}
      >
        {finalActions.map((action, index) => (
          <AnimatedTouchableOpacity
            key={action.id}
            entering={SlideInDown.delay(index * 50).springify()}
            style={styles.actionButton}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.7}
          >
            <QuickActionButton
              action={action}
              colors={colors}
              styles={styles}
            />
            <Text style={styles.actionLabel}>
              {t(`exercise.quickActions.${action.id}`, action.label)}
            </Text>
          </AnimatedTouchableOpacity>
        ))}
      </GlassOverlay>

      {onClose ? (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <IconSymbol
            name="xmark"
            size={16}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
  colors: ReturnType<typeof useAppTheme>["colors"];
  styles: any;
}

function QuickActionButton({ action, styles }: QuickActionButtonProps) {
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }));

  return (
    <Animated.View style={[scale]}>
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: action.color + "20" },
        ]}
      >
        <IconSymbol
          name={action.icon as any}
          size={24}
          color={action.color}
        />
      </View>
    </Animated.View>
  );
}