import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "@/components/ui/img";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import * as Form from "@/components/ui/Form";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { t, tLegacy: _tLegacy, locale } = useTranslation();
  const { theme, styles: commonStyles } = useAppTheme();
  
  const _upsertUser = useMutation(api.users.upsertUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    dailyCheckInTime: "09:00",
    enableNotifications: true,
    voiceEnabled: false,
    theme: "auto" as "light" | "dark" | "auto",
  });
  const [isLoading, setIsLoading] = useState(false);

  const content = {
    welcome: t("auth.onboarding.title"),
    letsGetStarted: t("auth.onboarding.subtitle"),
    preferences: "Your Preferences", // TODO: Add to centralized translations
    notifications: "Daily Mood Check-ins", // TODO: Add to centralized translations
    notificationDesc: "Get reminded to track your mood", // TODO: Add to centralized translations
    voiceChat: "Voice Conversations", // TODO: Add to centralized translations
    voiceChatDesc: "Talk to Nafsy using voice", // TODO: Add to centralized translations
    theme: "App Theme", // TODO: Add to centralized translations
    themeAuto: "Automatic", // TODO: Add to centralized translations
    themeLight: "Light", // TODO: Add to centralized translations
    themeDark: "Dark", // TODO: Add to centralized translations
    continue: t("continue"),
    finish: t("auth.onboarding.getStarted"),
    privacy: "Your privacy matters", // TODO: Add to centralized translations
    privacyDesc: "Everything you share with Nafsy is encrypted and private. We never share your data without your permission. You can delete your data anytime.", // TODO: Add to centralized translations
    emergencyContact: t("auth.onboarding.emergencyContact"),
    emergencyDesc: t("auth.onboarding.emergencyDescription"),
  };

  const handleComplete = async () => {
    if (!user || !isAuthenticated) {
      console.error("Cannot complete onboarding: user not authenticated", { user: !!user, isAuthenticated });
      return;
    }

    console.log("Starting onboarding completion with:", { clerkId: user.id, language: locale, preferences });
    setIsLoading(true);
    try {
      // Complete onboarding with preferences (user should already exist)
      await completeOnboarding({
        clerkId: user.id,
        language: locale,
        preferences,
      });

      console.log("Onboarding completed successfully, navigating to tabs");
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert(
        t("error"),
        t("Onboarding failed", { 
          en: "Failed to complete setup. Please try again.", 
          ar: "فشل إكمال الإعداد. يرجى المحاولة مرة أخرى." 
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Image 
                source="sf:hand.wave.fill" 
                size={60} 
                tintColor={theme.colors.wellness.calm}
                style={styles.icon}
              />
              <Text style={styles.stepTitle}>
                {content.welcome} {user?.firstName || ""}!
              </Text>
              <Text style={styles.stepSubtitle}>{content.letsGetStarted}</Text>
            </View>

            <Form.List style={styles.form}>
              <Form.Section title={content.preferences}>
                <Form.Toggle
                  value={preferences.enableNotifications}
                  onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, enableNotifications: value }))
                  }
                  systemImage="bell.badge"
                >
                  {content.notifications}
                </Form.Toggle>
                <Text style={styles.settingDescription}>{content.notificationDesc}</Text>

                <Form.Toggle
                  value={preferences.voiceEnabled}
                  onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, voiceEnabled: value }))
                  }
                  systemImage="mic"
                >
                  {content.voiceChat}
                </Form.Toggle>
                <Text style={styles.settingDescription}>{content.voiceChatDesc}</Text>
              </Form.Section>

              <Form.Section title={content.theme}>
                <Form.HStack>
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      preferences.theme === "auto" && styles.selectedTheme,
                    ]}
                    onPress={() => setPreferences(prev => ({ ...prev, theme: "auto" }))}
                  >
                    <Text style={styles.themeText}>{content.themeAuto}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      preferences.theme === "light" && styles.selectedTheme,
                    ]}
                    onPress={() => setPreferences(prev => ({ ...prev, theme: "light" }))}
                  >
                    <Text style={styles.themeText}>{content.themeLight}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      preferences.theme === "dark" && styles.selectedTheme,
                    ]}
                    onPress={() => setPreferences(prev => ({ ...prev, theme: "dark" }))}
                  >
                    <Text style={styles.themeText}>{content.themeDark}</Text>
                  </TouchableOpacity>
                </Form.HStack>
              </Form.Section>
            </Form.List>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Image 
                source="sf:lock.shield.fill" 
                size={60} 
                tintColor={theme.colors.interactive.success}
                style={styles.icon}
              />
              <Text style={styles.stepTitle}>{content.privacy}</Text>
              <Text style={styles.stepDescription}>{content.privacyDesc}</Text>
            </View>

            <View style={styles.privacyFeatures}>
              <View style={styles.privacyFeature}>
                <Image source="sf:lock.fill" size={24} tintColor={theme.colors.interactive.primary} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.encrypted")}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:hand.raised.fill" size={24} tintColor={theme.colors.interactive.primary} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.noSharing")}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:trash.fill" size={24} tintColor={theme.colors.interactive.primary} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.deleteAnytime")}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {renderStep()}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.disabledButton]}
            onPress={() => {
              if (step < 2) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {step === 2 ? content.finish : content.continue}
            </Text>
          </TouchableOpacity>

          <View style={styles.progress}>
            {[1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => ({
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl * 2,
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  form: {
    marginTop: -theme.spacing.lg,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  themeOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedTheme: {
    backgroundColor: theme.colors.interactive.primary,
  },
  themeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  privacyFeatures: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl * 2,
  },
  privacyFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  privacyFeatureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  continueButton: {
    height: 56,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.divider,
  },
  progressDotActive: {
    backgroundColor: theme.colors.interactive.primary,
    width: 24,
  },
});