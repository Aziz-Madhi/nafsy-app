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
  const { t, locale } = useTranslation();
  
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
    welcome: t("Welcome", { en: "Welcome", ar: "مرحباً" }),
    letsGetStarted: t("Let's get started", { 
      en: "Let's personalize your experience", 
      ar: "دعنا نخصص تجربتك" 
    }),
    preferences: t("Preferences", { en: "Your Preferences", ar: "تفضيلاتك" }),
    notifications: t("Daily Check-ins", { 
      en: "Daily Mood Check-ins", 
      ar: "تسجيل المزاج اليومي" 
    }),
    notificationDesc: t("Get reminded", { 
      en: "Get reminded to track your mood", 
      ar: "احصل على تذكير لتتبع مزاجك" 
    }),
    voiceChat: t("Voice Chat", { en: "Voice Conversations", ar: "المحادثات الصوتية" }),
    voiceChatDesc: t("Talk to Nafsy", { 
      en: "Talk to Nafsy using voice", 
      ar: "تحدث مع نفسي بالصوت" 
    }),
    theme: t("Theme", { en: "App Theme", ar: "مظهر التطبيق" }),
    themeAuto: t("Auto", { en: "Automatic", ar: "تلقائي" }),
    themeLight: t("Light", { en: "Light", ar: "فاتح" }),
    themeDark: t("Dark", { en: "Dark", ar: "داكن" }),
    continue: t("Continue", { en: "Continue", ar: "متابعة" }),
    finish: t("Finish", { en: "Start Your Journey", ar: "ابدأ رحلتك" }),
    privacy: t("Privacy", { 
      en: "Your privacy matters", 
      ar: "خصوصيتك مهمة" 
    }),
    privacyDesc: t("Privacy description", { 
      en: "Everything you share with Nafsy is encrypted and private. We never share your data without your permission. You can delete your data anytime.", 
      ar: "كل ما تشاركه مع نفسي مشفر وخاص. لن نشارك بياناتك أبداً بدون إذنك. يمكنك حذف بياناتك في أي وقت." 
    }),
    emergencyContact: t("Emergency Contact", { 
      en: "Emergency Contact (Optional)", 
      ar: "جهة اتصال الطوارئ (اختياري)" 
    }),
    emergencyDesc: t("Emergency description", { 
      en: "Add someone we can suggest contacting if you're in crisis", 
      ar: "أضف شخصاً يمكننا اقتراح الاتصال به في حالة الأزمات" 
    }),
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
        t("Error", { en: "Error", ar: "خطأ" }),
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
                  {t("Encrypted", { en: "End-to-end encrypted", ar: "تشفير من طرف إلى طرف" })}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:hand.raised.fill" size={24} tintColor={AC.systemBlue} />
                <Text style={styles.privacyFeatureText}>
                  {t("No sharing", { en: "Never shared without consent", ar: "لن تُشارك بدون موافقة" })}
                </Text>
              </View>
              <View style={styles.privacyFeature}>
                <Image source="sf:trash.fill" size={24} tintColor={AC.systemBlue} />
                <Text style={styles.privacyFeatureText}>
                  {t("Delete anytime", { en: "Delete your data anytime", ar: "احذف بياناتك في أي وقت" })}
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