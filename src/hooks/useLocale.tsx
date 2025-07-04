import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

const LOCALE_KEY = "@nafsy/locale";

export type Locale = "en" | "ar";

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
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Prevent multiple loads
    if (hasLoaded) return;
    
    setHasLoaded(true);
    
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
  }, [hasLoaded]);

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
    [locale, isLoading]
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

// Translation helper
export function useTranslation() {
  const { locale } = useLocale();
  
  const t = (key: string, translations: { en: string; ar: string }) => {
    return translations[locale];
  };
  
  return { t, locale };
}