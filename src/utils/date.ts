import { format as formatDate } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export type SupportedLocale = 'en' | 'ar';

const LOCALE_MAP = {
  en: enUS,
  ar: ar,
} as const;

/**
 * Converts various date inputs to Date object
 * Handles Date objects, strings, and Unix timestamps (numbers)
 */
function normalizeDate(date: Date | number | string): Date | null {
  if (!date && date !== 0) return null;
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  if (typeof date === 'number') {
    // Handle Unix timestamps (both seconds and milliseconds)
    const timestamp = date < 10000000000 ? date * 1000 : date;
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

/**
 * Centralized date formatting utility
 * Optimizes bundle size by consolidating date-fns imports
 */
export function formatDateForLocale(
  date: Date | number | string, 
  formatString: string, 
  locale: SupportedLocale = 'en'
): string {
  const dateObj = normalizeDate(date);
  
  // Handle invalid dates
  if (!dateObj) {
    return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
  }
  
  return formatDate(dateObj, formatString, { locale: LOCALE_MAP[locale] });
}

/**
 * Format relative time (hours ago, days ago)
 */
export function getRelativeTime(date: Date | number | string, locale: SupportedLocale = 'en'): string {
  const dateObj = normalizeDate(date);
  
  // Handle invalid dates
  if (!dateObj) {
    return locale === 'ar' ? 'وقت غير معروف' : 'Unknown time';
  }
  
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return locale === 'ar' ? 'منذ أقل من ساعة' : 'Less than an hour ago';
  } else if (diffHours < 24) {
    return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
  } else {
    return formatDateForLocale(dateObj, 'PPP', locale);
  }
}

/**
 * Format member since date
 */
export function formatMemberSince(date: Date | number | string, locale: SupportedLocale = 'en'): string {
  const dateObj = normalizeDate(date);
  
  // Handle invalid dates
  if (!dateObj) {
    return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
  }
  
  return formatDateForLocale(dateObj, 'LLLL yyyy', locale);
}