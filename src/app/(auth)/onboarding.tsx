import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import * as AC from "@bacons/apple-colors";
import { useTranslation } from "@/hooks/useLocale";
import * as Form from "@/components/ui/Form";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { t, tLegacy, locale } = useTranslation();
  
  const upsertUser = useMutation(api.users.upsertUser);
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
                tintColor={AC.systemTeal}
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
                tintColor={AC.systemGreen}
                style={styles.icon}
              />
              <Text style={styles.stepTitle}>{content.privacy}</Text>
              <Text style={styles.stepDescription}>{content.privacyDesc}</Text>
            </View>

            <View style={styles.privacyFeatures}>
              <View style={styles.privacyFeature}>
                <Image source="sf:lock.fill" size={24} tintColor={AC.systemBlue} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.encrypted")}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:hand.raised.fill" size={24} tintColor={AC.systemBlue} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.noSharing")}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:trash.fill" size={24} tintColor={AC.systemBlue} />
                <Text style={styles.privacyFeatureText}>
                  {t("auth.onboarding.deleteAnytime")}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  icon: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: AC.label,
    marginBottom: 12,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  form: {
    marginTop: -20,
  },
  settingDescription: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  selectedTheme: {
    backgroundColor: AC.systemBlue,
  },
  themeText: {
    fontSize: 14,
    fontWeight: "500",
    color: AC.label,
  },
  privacyFeatures: {
    gap: 24,
    marginTop: 40,
  },
  privacyFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  privacyFeatureText: {
    fontSize: 16,
    color: AC.label,
  },
  footer: {
    paddingVertical: 24,
    gap: 24,
  },
  continueButton: {
    height: 56,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AC.quaternaryLabel,
  },
  progressDotActive: {
    backgroundColor: AC.systemBlue,
    width: 24,
  },
});