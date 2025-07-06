import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
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
        }
      })
      .catch((error) => {
        console.error("Error loading locale:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setLocale = React.useCallback(async (newLocale: Locale) => {
    try {
      await AsyncStorage.setItem(LOCALE_KEY, newLocale);
      setLocaleState(newLocale);
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
      isRTL: locale === "ar",
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
  
  const t = (key: string) => {
    return getTranslation(locale, key);
  };
  
  // Legacy support for inline translations (deprecated)
  const tLegacy = (key: string, translations: { en: string; ar: string }) => {
    console.warn(`Legacy translation used for "${key}". Please migrate to centralized translations.`);
    return translations[locale];
  };
  
  return { t, tLegacy, locale };
}