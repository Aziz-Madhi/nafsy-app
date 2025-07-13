import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "@/components/core/Image/Image";
import { useLocale } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";

// Removed unused width

export default function WelcomeScreen() {
  const router = useRouter();
  const { locale, setLocale, isLoading } = useLocale();
  const { theme: _theme, styles: _commonStyles, spacing, fontSize, fontWeight, colors } = useAppTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  
  // Update selectedLanguage when locale changes, but only once when component mounts
  React.useEffect(() => {
    if (!isLoading && locale) {
      setSelectedLanguage(locale);
    }
  }, [locale, isLoading]);
  
  // Don't render until locale is loaded
  if (isLoading) {
    return null;
  }

  const handleLanguageSelect = async (language: "en" | "ar") => {
    setSelectedLanguage(language);
    await setLocale(language);
    // RTL changes are now handled automatically in useLocale hook
  };

  const content = {
    en: {
      title: "Welcome to Nafsy",
      subtitle: "Your AI-powered mental wellness companion",
      description: "Get personalized support, track your mood, and build healthy habits - all in a safe, private space.",
      selectLanguage: "Select your language",
      continue: "Continue",
      arabic: "العربية",
      english: "English",
    },
    ar: {
      title: "مرحباً بك في نفسي",
      subtitle: "رفيقك الذكي للصحة النفسية",
      description: "احصل على دعم شخصي، تتبع مزاجك، وابني عادات صحية - كل ذلك في مساحة آمنة وخاصة.",
      selectLanguage: "اختر لغتك",
      continue: "متابعة",
      arabic: "العربية",
      english: "English",
    },
  };

  const t = content[selectedLanguage];

  const styles = createStyles({ spacing, fontSize, fontWeight, colors });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      <View style={styles.content}>
        <View style={styles.header}>
        <Image 
          source="sf:brain.head.profile" 
          size={80} 
          tintColor={colors.interactive.primary}
          style={styles.logo}
        />
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <Text style={styles.description}>{t.description}</Text>

      <View style={styles.languageSection}>
        <Text style={styles.languageTitle}>{t.selectLanguage}</Text>
        
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === "en" && styles.selectedLanguage,
            ]}
            onPress={() => handleLanguageSelect("en")}
          >
            <Text
              style={[
                styles.languageButtonText,
                selectedLanguage === "en" && styles.selectedLanguageText,
              ]}
            >
              {t.english}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === "ar" && styles.selectedLanguage,
            ]}
            onPress={() => handleLanguageSelect("ar")}
          >
            <Text
              style={[
                styles.languageButtonText,
                selectedLanguage === "ar" && styles.selectedLanguageText,
              ]}
            >
              {t.arabic}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text style={styles.primaryButtonText}>{t.continue}</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = ({ spacing, fontSize, fontWeight, colors }: {
  spacing: ReturnType<typeof useAppTheme>['spacing'];
  fontSize: ReturnType<typeof useAppTheme>['fontSize'];
  fontWeight: ReturnType<typeof useAppTheme>['fontWeight'];
  colors: ReturnType<typeof useAppTheme>['colors'];
}) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 50, // Manual safe area top padding
    paddingBottom: 20, // Manual safe area bottom padding
  },
  content: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: spacing.xl,
  },
  logo: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: "center" as const,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: "center" as const,
    marginBottom: spacing.xl * 2,
    lineHeight: 24,
  },
  languageSection: {
    width: "100%",
    marginBottom: spacing.xl * 2,
  },
  languageTitle: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center" as const,
  },
  languageButtons: {
    flexDirection: "row" as const,
    gap: spacing.md,
  },
  languageButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.system.border,
    backgroundColor: colors.background.secondary,
    alignItems: "center" as const,
  },
  selectedLanguage: {
    backgroundColor: colors.interactive.primary,
    borderColor: colors.interactive.primary,
  },
  languageButtonText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  selectedLanguageText: {
    color: colors.text.inverse,
  },
  primaryButton: {
    backgroundColor: colors.interactive.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center" as const,
    width: "100%",
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});