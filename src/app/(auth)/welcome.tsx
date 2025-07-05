import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  I18nManager,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "@/components/ui/img";
import { useLocale } from "@/hooks/useLocale";
import { CenteredScreen } from "@/components/layout/BaseScreen";
import { useAppTheme } from "@/theme";

// Removed unused width

export default function WelcomeScreen() {
  const router = useRouter();
  const { locale, setLocale, isLoading } = useLocale();
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
    
    // Handle RTL changes
    const shouldBeRTL = language === "ar";
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Note: App might need to reload for RTL changes to take effect
    }
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

  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <CenteredScreen contentPadding>
      <View style={styles.header}>
        <Image 
          source="sf:brain.head.profile" 
          size={80} 
          tintColor={theme.colors.tint}
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
    </CenteredScreen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => ({
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  logo: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.secondaryText,
    textAlign: "center",
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.secondaryText,
    textAlign: "center",
    marginBottom: theme.spacing.xl * 2,
    lineHeight: 24,
  },
  languageSection: {
    width: "100%",
    marginBottom: theme.spacing.xl * 2,
  },
  languageTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  languageButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  languageButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  selectedLanguage: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },
  languageButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  selectedLanguageText: {
    color: theme.colors.background,
  },
  primaryButton: {
    backgroundColor: theme.colors.tint,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
});