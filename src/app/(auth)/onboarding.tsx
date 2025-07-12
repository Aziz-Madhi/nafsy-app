import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { useMultiStepForm, Step } from "@/hooks/forms";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { OptionCardEnhanced } from "@/components/onboarding/OptionCardEnhanced";
import { TimeOption } from "@/components/onboarding/TimeOption";
import { ToggleOption } from "@/components/onboarding/ToggleOption";
import { BaseButton } from "@/components/forms/BaseButton";
import { BaseInput } from "@/components/forms/BaseInput";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

interface OnboardingData {
  displayName: string;
  primaryGoal: string;
  initialMood: string;
  reminderTime?: string;
  notifications: boolean;
  voiceEnabled: boolean;
}

const GOALS = [
  { id: "stress", labelKey: "goals.manageStress", icon: "brain" },
  { id: "mood", labelKey: "goals.improveMood", icon: "sparkles" },
  { id: "sleep", labelKey: "goals.betterSleep", icon: "moon.stars.fill" },
  { id: "resilience", labelKey: "goals.buildResilience", icon: "shield.fill" },
  { id: "emotions", labelKey: "goals.trackEmotions", icon: "heart.text.square" },
  { id: "skills", labelKey: "goals.learnSkills", icon: "book.fill" },
] as const;

const MOOD_OPTIONS = [
  { id: "great", emoji: "😄", labelKey: "mood.great" },
  { id: "good", emoji: "🙂", labelKey: "mood.good" },
  { id: "okay", emoji: "😐", labelKey: "mood.okay" },
  { id: "bad", emoji: "😕", labelKey: "mood.bad" },
  { id: "terrible", emoji: "😢", labelKey: "mood.terrible" },
] as const;

const REMINDER_TIMES = [
  { id: "morning", time: "09:00", labelKey: "time.morning" },
  { id: "afternoon", time: "14:00", labelKey: "time.afternoon" },
  { id: "evening", time: "20:00", labelKey: "time.evening" },
  { id: "night", time: "22:00", labelKey: "time.night" },
] as const;

export default function EnhancedOnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { t, locale } = useTranslation();
  const { colors, spacing, typography, borderRadius } = useAppTheme();
  
  const completeOnboardingMutation = useMutation(api.users.completeOnboarding);

  // Define onboarding steps
  const steps: Step<OnboardingData>[] = [
    {
      id: "welcome",
      title: t("onboarding.welcome.title"),
      fields: ["displayName"],
      validator: (data) => {
        if (!data.displayName?.trim()) {
          return t("validation.required");
        }
        return true;
      },
    },
    {
      id: "goals",
      title: t("onboarding.goals.title"),
      fields: ["primaryGoal"],
      validator: (data) => {
        if (!data.primaryGoal) {
          return t("validation.selectOne");
        }
        return true;
      },
    },
    {
      id: "mood",
      title: t("onboarding.mood.title"),
      fields: ["initialMood"],
      validator: (data) => {
        if (!data.initialMood) {
          return t("validation.selectOne");
        }
        return true;
      },
    },
    {
      id: "preferences",
      title: t("onboarding.preferences.title"),
      fields: ["reminderTime", "notifications", "voiceEnabled"],
    },
  ];

  const {
    currentStep,
    currentStepData,
    totalSteps,
    formData,
    updateField,
    goToNext,
    goToPrevious,
    canGoPrevious,
    isLastStep,
  } = useMultiStepForm<OnboardingData>({
    steps,
    initialData: {
      displayName: user?.firstName || "",
      notifications: true,
      voiceEnabled: false,
    },
    onComplete: async (data) => {
      try {
        await completeOnboardingMutation({
          displayName: data.displayName,
          primaryGoal: data.primaryGoal,
          initialMood: data.initialMood,
          preferences: {
            notifications: data.notifications,
            reminderTime: data.reminderTime,
            voiceEnabled: data.voiceEnabled,
          },
        });
        router.replace("/(tabs)/home");
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      }
    },
  });

  const handleNext = useCallback(async () => {
    const success = await goToNext();
    if (!success) {
      // Validation failed - error will be shown by form
    }
  }, [goToNext]);

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "welcome":
        return (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.stepContent}
          >
            <Text style={[typography.titleLarge, { color: colors.text.primary, textAlign: "center" }]}>
              {t("onboarding.welcome.greeting")}
            </Text>
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: "center", marginTop: spacing.sm }]}>
              {t("onboarding.welcome.subtitle")}
            </Text>
            
            <View style={{ marginTop: spacing.xl }}>
              <BaseInput
                placeholder={t("onboarding.welcome.namePlaceholder")}
                value={formData.displayName}
                onChangeText={(text) => updateField("displayName", text)}
                autoFocus
                style={{ marginBottom: spacing.md }}
              />
            </View>
          </Animated.View>
        );

      case "goals":
        return (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
            style={styles.stepContent}
          >
            <Text style={[typography.title, { color: colors.text.primary, textAlign: "center" }]}>
              {t("onboarding.goals.question")}
            </Text>
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: "center", marginTop: spacing.sm }]}>
              {t("onboarding.goals.subtitle")}
            </Text>
            
            <View style={styles.optionsGrid}>
              {GOALS.map((goal) => (
                <OptionCardEnhanced
                  key={goal.id}
                  icon={<IconSymbol name={goal.icon as any} size={32} color={colors.interactive.primary} />}
                  label={t(goal.labelKey)}
                  selected={formData.primaryGoal === goal.id}
                  onPress={() => updateField("primaryGoal", goal.id)}
                />
              ))}
            </View>
          </Animated.View>
        );

      case "mood":
        return (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
            style={styles.stepContent}
          >
            <Text style={[typography.title, { color: colors.text.primary, textAlign: "center" }]}>
              {t("onboarding.mood.question")}
            </Text>
            
            <View style={styles.moodOptions}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: formData.initialMood === mood.id
                        ? colors.interactive.primary + "20"
                        : colors.background.secondary,
                      borderColor: formData.initialMood === mood.id
                        ? colors.interactive.primary
                        : colors.system.border,
                    },
                  ]}
                  onPress={() => updateField("initialMood", mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[typography.caption, { color: colors.text.primary }]}>
                    {t(mood.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case "preferences":
        return (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
            style={styles.stepContent}
          >
            <Text style={[typography.title, { color: colors.text.primary, textAlign: "center" }]}>
              {t("onboarding.preferences.title")}
            </Text>
            
            <View style={{ marginTop: spacing.xl }}>
              <Text style={[typography.bodyMedium, { color: colors.text.primary, marginBottom: spacing.md }]}>
                {t("onboarding.preferences.reminderTime")}
              </Text>
              
              <View style={styles.timeOptions}>
                {REMINDER_TIMES.map((time) => (
                  <TimeOption
                    key={time.id}
                    time={time.time}
                    label={t(time.labelKey)}
                    selected={formData.reminderTime === time.time}
                    onPress={() => updateField("reminderTime", time.time)}
                  />
                ))}
              </View>
              
              <View style={{ marginTop: spacing.xl }}>
                <ToggleOption
                  icon={<IconSymbol name="bell.fill" size={24} color={colors.interactive.primary} />}
                  label={t("onboarding.preferences.notifications")}
                  value={formData.notifications}
                  onToggle={(value) => updateField("notifications", value)}
                />
                
                <ToggleOption
                  icon={<IconSymbol name="mic.fill" size={24} color={colors.interactive.primary} />}
                  label={t("onboarding.preferences.voice")}
                  value={formData.voiceEnabled}
                  onToggle={(value) => updateField("voiceEnabled", value)}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    stepContent: {
      flex: 1,
      paddingTop: spacing.xl,
    },
    optionsGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      justifyContent: "space-between" as const,
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    moodOptions: {
      flexDirection: "row" as const,
      justifyContent: "space-evenly" as const,
      marginTop: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    moodOption: {
      alignItems: "center" as const,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      minWidth: 60,
    },
    moodEmoji: {
      fontSize: 32,
      marginBottom: spacing.xs,
    },
    timeOptions: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.sm,
    },
    footer: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.interactive.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <ProgressDots
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
          />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          {canGoPrevious ? (
            <BaseButton
              title={t("common.back")}
              variant="secondary"
              onPress={goToPrevious}
              style={{ flex: 1 }}
            />
          ) : null}
          
          <BaseButton
            title={isLastStep ? t("common.complete") : t("common.next")}
            onPress={handleNext}
            style={{ flex: canGoPrevious ? 1 : undefined }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}