import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { getTranslation, type Locale } from "@/locales";

const LOCALE_KEY = "@nafsy/locale";

interface LocaleContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => Promise<void>;
  isLoading: boolean;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load locale on mount
    AsyncStorage.getItem(LOCALE_KEY)
      .then((savedLocale) => {
        if (savedLocale === "ar" || savedLocale === "en") {
          setLocaleState(savedLocale);
          
          // Synchronize I18nManager with saved locale
          const shouldBeRTL = savedLocale === "ar";
          if (I18nManager.isRTL !== shouldBeRTL) {
            I18nManager.forceRTL(shouldBeRTL);
          }
        } else {
          // Default to English and ensure LTR layout
          if (I18nManager.isRTL) {
            I18nManager.forceRTL(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading locale:", error);
        // On error, default to English and LTR
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setLocale = React.useCallback(async (newLocale: Locale) => {
    try {
      await AsyncStorage.setItem(LOCALE_KEY, newLocale);
      setLocaleState(newLocale);
      
      // Synchronize I18nManager with locale state
      const shouldBeRTL = newLocale === "ar";
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error("Error saving locale:", error);
    }
  }, []);

  // Memoize the context value so React can bail out of unnecessary updates
  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      isLoading,
      isRTL: I18nManager.isRTL,
    }),
    [locale, setLocale, isLoading]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

// Translation helper - now uses centralized translations
export function useTranslation() {
  const { locale } = useLocale();
  
  const t = React.useCallback((key: string) => {
    return getTranslation(locale, key);
  }, [locale]);
  
  // Legacy support for inline translations (deprecated)
  const tLegacy = React.useCallback((key: string, translations: { en: string; ar: string }) => {
    console.warn(`Legacy translation used for "${key}". Please migrate to centralized translations.`);
    return translations[locale];
  }, [locale]);
  
  return React.useMemo(() => ({ t, tLegacy, locale }), [t, tLegacy, locale]);
}