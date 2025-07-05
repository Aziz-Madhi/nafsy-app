/**
 * Centralized translation system for Nafsy app
 * Following LEVER framework - single source of truth for all translations
 */
import { en } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';
export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  ar,
} as const;

/**
 * Type-safe translation function
 * Usage: t('auth.signIn.title') or t('common.continue')
 */
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      console.warn(`Translation key "${key}" not found for locale "${locale}", falling back to English`);
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          console.error(`Translation key "${key}" not found in English fallback`);
          return key; // Return the key itself as last resort
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Helper to get nested translation value safely
 */
export function getNestedTranslation(translations: typeof en, path: string): string {
  const keys = path.split('.');
  let current: any = translations;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return original path if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

export { en, ar };