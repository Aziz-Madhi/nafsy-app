import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { GlassCard } from "@/components/glass";
import { useAppTheme } from "@/theme";
import { eachDayOfInterval, endOfMonth, format, isSameDay, isToday, startOfMonth } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface MoodEntry {
  date: string;
  mood: number;
  emoji: string;
}

interface MoodCalendarProps {
  moodEntries: MoodEntry[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayPress?: (date: Date) => void;
  style?: ViewStyle;
}

const MOOD_EMOJIS: Record<number, string> = {
  5: "😄",
  4: "🙂",
  3: "😐",
  2: "😕",
  1: "😢",
};

const MOOD_COLORS: Record<number, string> = {
  5: "#4CAF50",
  4: "#8BC34A",
  3: "#FFC107",
  2: "#FF9800",
  1: "#F44336",
};

export function MoodCalendar({
  moodEntries,
  currentMonth,
  onMonthChange,
  onDayPress,
  style,
}: MoodCalendarProps) {
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get all days in the current month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Create a map of mood entries by date
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodEntry>();
    moodEntries.forEach((entry) => {
      map.set(entry.date, entry);
    });
    return map;
  }, [moodEntries]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    onDayPress?.(date);
  };

  const styles = {
    container: {
      ...style,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.system.border,
    },
    monthText: {
      ...typography.title3,
      color: colors.text.primary,
    } as TextStyle,
    navigationButton: {
      padding: spacing.xs,
    },
    weekDaysRow: {
      flexDirection: "row" as const,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.system.separator,
    },
    weekDayText: {
      flex: 1,
      textAlign: "center" as const,
      ...typography.caption,
      color: colors.text.secondary,
      fontWeight: "600" as const,
    } as TextStyle,
    calendarGrid: {
      padding: spacing.sm,
    },
    week: {
      flexDirection: "row" as const,
      marginBottom: spacing.xs,
    },
    dayContainer: {
      flex: 1,
      aspectRatio: 1,
      padding: 2,
    },
    dayButton: {
      flex: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      borderRadius: borderRadius.sm,
      position: "relative" as const,
    },
    dayNumber: {
      ...typography.caption,
      fontWeight: "500" as const,
      marginBottom: 2,
    } as TextStyle,
    moodEmoji: {
      fontSize: 20,
    },
    todayIndicator: {
      position: "absolute" as const,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.interactive.primary,
      bottom: 2,
    },
    selectedRing: {
      position: "absolute" as const,
      inset: -2,
      borderRadius: borderRadius.sm + 2,
      borderWidth: 2,
      borderColor: colors.interactive.primary,
    },
    emptyDay: {
      height: 24,
    },
    legend: {
      flexDirection: "row" as const,
      justifyContent: "space-evenly" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.system.separator,
    },
    legendItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.xs,
    },
    legendEmoji: {
      fontSize: 16,
    },
    legendText: {
      ...typography.caption,
      color: colors.text.secondary,
    } as TextStyle,
  };

  // Calculate first day padding
  const firstDayOfWeek = monthDays[0].getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  // Group days into weeks
  const weeks = [];
  let currentWeek = [...emptyDays];
  
  monthDays.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <GlassCard variant="secondary" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handlePreviousMonth}
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handleNextMonth}
        >
          <IconSymbol
            name="chevron.right"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekDaysRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayContainer}>
                {day ? (
                  <DayCell
                    day={day}
                    moodEntry={moodMap.get(format(day, "yyyy-MM-dd"))}
                    isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                    isToday={isToday(day)}
                    onPress={() => handleDayPress(day)}
                    colors={colors}
                    styles={styles}
                  />
                ) : (
                  <View style={styles.emptyDay} />
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(MOOD_EMOJIS).map(([value, emoji]) => (
          <View key={value} style={styles.legendItem}>
            <Text style={styles.legendEmoji}>{emoji}</Text>
            <Text style={styles.legendText}>
              {value === "5" ? "Great" : value === "4" ? "Good" : value === "3" ? "OK" : value === "2" ? "Bad" : "Tough"}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

interface DayCellProps {
  day: Date;
  moodEntry?: MoodEntry;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  styles: any;
}

function DayCell({ day, moodEntry, isSelected, isToday, onPress, colors, styles }: DayCellProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 0.95 : 1) }],
  }));

  const backgroundColor = moodEntry
    ? MOOD_COLORS[moodEntry.mood] + "20"
    : "transparent";

  return (
    <Animated.View
      style={[animatedStyle, { flex: 1 }]}
      entering={FadeIn.delay(50)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={[
          styles.dayButton,
          { backgroundColor },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayNumber,
            {
              color: moodEntry
                ? MOOD_COLORS[moodEntry.mood]
                : colors.text.primary,
            },
          ]}
        >
          {format(day, "d")}
        </Text>
        
        {moodEntry ? (
          <Text style={styles.moodEmoji}>
            {moodEntry.emoji}
          </Text>
        ) : null}
        
        {isToday ? <View style={styles.todayIndicator} /> : null}
        {isSelected ? <View style={styles.selectedRing} /> : null}
      </TouchableOpacity>
    </Animated.View>
  );
}