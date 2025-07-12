import React, { useMemo } from "react";
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { GlassmorphicCard } from "@/components/glass";
import { ProgressRing } from "@/components/data-display";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useAppTheme } from "@/theme";
import { useTranslation } from "@/hooks/useLocale";
import { LinearGradient } from "expo-linear-gradient";

interface WeeklyStats {
  moodEntries: number;
  exercisesCompleted: number;
  totalMinutes: number;
  averageMood: number;
  streakDays: number;
}

interface WeeklyProgressCardProps {
  stats: WeeklyStats;
  weekStartDate: Date;
  onViewDetails?: () => void;
  style?: ViewStyle;
}

const WEEKLY_GOALS = {
  moodEntries: 7,
  exercisesCompleted: 5,
  totalMinutes: 60,
};

export function WeeklyProgressCard({
  stats,
  weekStartDate,
  onViewDetails,
  style,
}: WeeklyProgressCardProps) {
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  const { t, locale } = useTranslation();

  // Calculate progress percentages
  const progress = useMemo(() => ({
    mood: Math.min((stats.moodEntries / WEEKLY_GOALS.moodEntries) * 100, 100),
    exercise: Math.min((stats.exercisesCompleted / WEEKLY_GOALS.exercisesCompleted) * 100, 100),
    minutes: Math.min((stats.totalMinutes / WEEKLY_GOALS.totalMinutes) * 100, 100),
  }), [stats]);

  const overallProgress = useMemo(() => {
    return Math.round((progress.mood + progress.exercise + progress.minutes) / 3);
  }, [progress]);

  const weekLabel = useMemo(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startMonth = weekStartDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
    const startDay = weekStartDate.getDate();
    const endDay = endDate.getDate();
    
    return `${startMonth} ${startDay}-${endDay}`;
  }, [weekStartDate, locale]);

  const getMoodEmoji = (average: number) => {
    if (average >= 4.5) return "😄";
    if (average >= 3.5) return "🙂";
    if (average >= 2.5) return "😐";
    if (average >= 1.5) return "😕";
    return "😢";
  };

  const styles = {
    container: {
      padding: spacing.lg,
      ...style,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.title3,
      color: colors.text.primary,
    } as TextStyle,
    weekLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    } as TextStyle,
    progressSection: {
      alignItems: "center" as const,
      marginBottom: spacing.lg,
    },
    progressRingContainer: {
      position: "relative" as const,
    },
    streakBadge: {
      position: "absolute" as const,
      top: -10,
      right: -10,
      backgroundColor: colors.wellness.energy,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.round,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 2,
    },
    streakText: {
      ...typography.caption,
      color: colors.text.inverse,
      fontWeight: "700" as const,
    } as TextStyle,
    statsGrid: {
      gap: spacing.sm,
    },
    statRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingVertical: spacing.xs,
    },
    statLeft: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    statLabel: {
      ...typography.body,
      color: colors.text.primary,
    } as TextStyle,
    statValue: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      fontWeight: "600" as const,
    } as TextStyle,
    statProgress: {
      alignItems: "flex-end" as const,
      gap: 4,
    },
    miniProgressBar: {
      width: 60,
      height: 4,
      backgroundColor: colors.system.separator,
      borderRadius: 2,
      overflow: "hidden" as const,
    },
    miniProgressFill: {
      height: "100%",
      borderRadius: 2,
    },
    averageMood: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.system.separator,
    },
    moodEmoji: {
      fontSize: 24,
    },
    viewDetailsButton: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: "center" as const,
    },
    viewDetailsText: {
      ...typography.button,
      color: colors.interactive.primary,
    } as TextStyle,
  };

  const StatRow = ({ 
    icon, 
    label, 
    value, 
    target, 
    current, 
    color 
  }: {
    icon: string;
    label: string;
    value: string;
    target: number;
    current: number;
    color: string;
  }) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <Animated.View
        entering={FadeIn.delay(200)}
        layout={Layout.springify()}
        style={styles.statRow}
      >
        <View style={styles.statLeft}>
          <LinearGradient
            colors={[color + "20", color + "10"]}
            style={styles.statIcon}
          >
            <IconSymbol name={icon as any} size={18} color={color} />
          </LinearGradient>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        
        <View style={styles.statProgress}>
          <Text style={styles.statValue}>{value}</Text>
          <View style={styles.miniProgressBar}>
            <Animated.View
              style={[
                styles.miniProgressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <GlassmorphicCard variant="secondary" style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("progress.weeklyProgress")}</Text>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
        </View>
        
        <View style={styles.progressRingContainer}>
          <ProgressRing
            size={60}
            strokeWidth={6}
            progress={overallProgress}
            gradientColors={["#4CAF50", "#8BC34A"]}
            showPercentage
            percentageStyle={{ fontSize: 16 }}
          />
          
          {stats.streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Text style={{ fontSize: 12 }}>🔥</Text>
              <Text style={styles.streakText}>{stats.streakDays}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatRow
          icon="brain"
          label={t("progress.moodCheckins")}
          value={`${stats.moodEntries}/${WEEKLY_GOALS.moodEntries}`}
          target={WEEKLY_GOALS.moodEntries}
          current={stats.moodEntries}
          color={colors.wellness.mood}
        />
        
        <StatRow
          icon="figure.mind.and.body"
          label={t("progress.exercises")}
          value={`${stats.exercisesCompleted}/${WEEKLY_GOALS.exercisesCompleted}`}
          target={WEEKLY_GOALS.exercisesCompleted}
          current={stats.exercisesCompleted}
          color={colors.wellness.energy}
        />
        
        <StatRow
          icon="clock"
          label={t("progress.minutes")}
          value={`${stats.totalMinutes}m`}
          target={WEEKLY_GOALS.totalMinutes}
          current={stats.totalMinutes}
          color={colors.wellness.calm}
        />
      </View>

      {stats.moodEntries > 0 && (
        <View style={styles.averageMood}>
          <Text style={styles.moodEmoji}>
            {getMoodEmoji(stats.averageMood)}
          </Text>
          <Text style={styles.statLabel}>
            {t("progress.averageMood")}: {stats.averageMood.toFixed(1)}
          </Text>
        </View>
      )}

      {onViewDetails && (
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={onViewDetails}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>
            {t("progress.viewDetails")}
          </Text>
        </TouchableOpacity>
      )}
    </GlassmorphicCard>
  );
}