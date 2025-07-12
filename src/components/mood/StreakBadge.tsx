import { GlassOverlay } from "@/components/glass";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";

interface StreakBadgeProps {
  userId: Id<"users">;
  type?: "mood" | "exercise" | "check-in";
  variant?: "compact" | "full";
  showAnimation?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function StreakBadge({
  userId,
  type = "mood",
  variant = "compact",
  showAnimation = true,
  onPress,
  style,
}: StreakBadgeProps) {
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  const { t, locale } = useTranslation();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const streak = useQuery(api.moods.getUserStreak, { userId, type });

  // Animate when streak increases
  useEffect(() => {
    if (streak && streak.currentStreak > 0 && showAnimation) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streak?.currentStreak, showAnimation]);

  const flameAnimatedStyle = useAnimatedStyle(() => {
    if (!shouldAnimate) return { transform: [{ scale: 1 }] };

    const scale = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      3,
      true
    );

    return {
      transform: [{ scale }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    if (!shouldAnimate) return { opacity: 0 };

    const opacity = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      3,
      true
    );

    return {
      opacity,
      position: "absolute" as const,
      inset: -10,
      backgroundColor: "#FF9800",
      borderRadius: borderRadius.round,
    };
  });

  if (!streak || streak.currentStreak === 0) {
    return null;
  }

  const isHighStreak = streak.currentStreak >= 7;
  const isMilestone = streak.currentStreak % 10 === 0 && streak.currentStreak > 0;

  const styles = {
    container: {
      alignItems: "center" as const,
      ...style,
    },
    badge: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.round,
      gap: spacing.xs,
    },
    flameContainer: {
      position: "relative" as const,
    },
    flame: {
      fontSize: variant === "compact" ? 16 : 24,
    },
    streakText: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      fontWeight: "700" as const,
    } as TextStyle,
    milestoneText: {
      ...typography.caption,
      color: colors.interactive.warning,
      fontWeight: "600" as const,
    } as TextStyle,
    fullVariant: {
      alignItems: "center" as const,
      gap: spacing.xs,
    },
    label: {
      ...typography.caption,
      color: colors.text.secondary,
    } as TextStyle,
    subtext: {
      ...typography.caption,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    } as TextStyle,
  };

  const content = (
    <View style={styles.container}>
      <GlassOverlay
        variant="overlay"
        borderRadius={borderRadius.round}
        customColors={
          isHighStreak
            ? {
                light: ["rgba(255, 152, 0, 0.1)", "rgba(255, 193, 7, 0.1)"],
                dark: ["rgba(255, 152, 0, 0.2)", "rgba(255, 193, 7, 0.2)"],
              }
            : undefined
        }
        style={styles.badge}
      >
        <View style={styles.flameContainer}>
          <Animated.View style={glowAnimatedStyle} />
          <Animated.Text style={[styles.flame, flameAnimatedStyle]}>
            🔥
          </Animated.Text>
        </View>
        
        {variant === "compact" ? (
          <Text style={styles.streakText}>{streak.currentStreak}</Text>
        ) : (
          <View style={styles.fullVariant}>
            <Text style={styles.streakText}>
              {streak.currentStreak} {t("common.days", "days")}
            </Text>
            <Text style={styles.label}>
              {t(`streak.${type}`, type + " streak")}
            </Text>
          </View>
        )}
        
        {isMilestone ? <Text style={styles.milestoneText}>✨</Text> : null}
      </GlassOverlay>
      
      {variant === "full" && (
        <>
          <Text style={styles.subtext}>
            {t("streak.best", "Best:")} {streak.longestStreak} {t("common.days", "days")}
          </Text>
          <Text style={styles.subtext}>
            {t("streak.total", "Total entries:")} {streak.totalEntries}
          </Text>
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}