import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  I18nManager,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "@/components/ui/img";
import * as AC from "@bacons/apple-colors";
import { useLocale } from "@/hooks/useLocale";

const { width } = Dimensions.get("window");

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source="sf:brain.head.profile" 
            size={80} 
            tintColor={AC.systemTeal}
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
          style={styles.continueButton}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.continueButtonText}>{t.continue}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: AC.label,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: AC.secondaryLabel,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  languageSection: {
    width: "100%",
    marginBottom: 48,
  },
  languageTitle: {
    fontSize: 16,
    color: AC.label,
    marginBottom: 16,
    textAlign: "center",
  },
  languageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AC.separator,
    backgroundColor: AC.secondarySystemGroupedBackground,
    alignItems: "center",
  },
  selectedLanguage: {
    backgroundColor: AC.systemTeal,
    borderColor: AC.systemTeal,
  },
  languageButtonText: {
    fontSize: 16,
    color: AC.label,
    fontWeight: "500",
  },
  selectedLanguageText: {
    color: "#FFFFFF",
  },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});