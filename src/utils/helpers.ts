/**
 * Utility functions for common operations
 * Following LEVER framework - centralized utility functions
 */

import { Locale, MoodRating, ExerciseType, Theme } from '@/types';

// Date formatting utilities
export const formatDate = (timestamp: number, locale: Locale = 'en'): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
};

export const formatDateTime = (timestamp: number, locale: Locale = 'en'): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
};

export const formatTime = (timestamp: number, locale: Locale = 'en'): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
};

export const formatRelativeTime = (timestamp: number, locale: Locale = 'en'): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { numeric: 'auto' });
  
  if (diff < minute) {
    return rtf.format(-Math.floor(diff / 1000), 'second');
  } else if (diff < hour) {
    return rtf.format(-Math.floor(diff / minute), 'minute');
  } else if (diff < day) {
    return rtf.format(-Math.floor(diff / hour), 'hour');
  } else if (diff < week) {
    return rtf.format(-Math.floor(diff / day), 'day');
  } else if (diff < month) {
    return rtf.format(-Math.floor(diff / week), 'week');
  } else if (diff < year) {
    return rtf.format(-Math.floor(diff / month), 'month');
  } else {
    return rtf.format(-Math.floor(diff / year), 'year');
  }
};

export const formatDuration = (seconds: number, locale: Locale = 'en'): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (locale === 'ar') {
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة`;
    } else {
      return `${remainingSeconds} ثانية`;
    }
  } else {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
};

/**
 * Parse a duration string (e.g., "5 min", "3 min", "1h 30m") to seconds
 */
export const parseDurationToSeconds = (durationStr: string | number): number => {
  // If it's already a number, return it
  if (typeof durationStr === 'number') {
    return durationStr;
  }
  
  // If it's a string, parse it
  if (typeof durationStr === 'string') {
    const str = durationStr.toLowerCase().trim();
    
    // Common patterns: "5 min", "3 min", "10 min", "1h 30m", "30s", etc.
    let totalSeconds = 0;
    
    // Match hours (1h, 2 hours, etc.)
    const hourMatch = str.match(/(\d+)\s*h(?:our)?s?/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1], 10) * 3600;
    }
    
    // Match minutes (5 min, 30 minutes, etc.)
    const minuteMatch = str.match(/(\d+)\s*m(?:in)?(?:ute)?s?/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1], 10) * 60;
    }
    
    // Match seconds (30s, 45 seconds, etc.)
    const secondMatch = str.match(/(\d+)\s*s(?:ec)?(?:ond)?s?/);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1], 10);
    }
    
    // If no units found, try to extract just a number and assume minutes
    if (totalSeconds === 0) {
      const numberMatch = str.match(/(\d+)/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[1], 10) * 60; // Assume minutes
      }
    }
    
    return totalSeconds;
  }
  
  // Default fallback
  return 0;
};

export const getDateRange = (days: number): { start: number; end: number } => {
  const end = Date.now();
  const start = end - (days * 24 * 60 * 60 * 1000);
  return { start, end };
};

export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (timestamp: number): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const isThisWeek = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMoodRating = (rating: number): rating is MoodRating => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text.split(' ').map(capitalizeFirst).join(' ');
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const extractInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Number utilities
export const formatNumber = (num: number, locale: Locale = 'en'): string => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num);
};

export const formatPercentage = (value: number, total: number, locale: Locale = 'en'): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
};

export const roundToDecimal = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const median = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[middle - 1] + sorted[middle]) / 2 
    : sorted[middle];
};

export const standardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const avg = average(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
  return Math.sqrt(average(squaredDiffs));
};

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const intersection = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => array2.includes(item));
};

export const difference = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => !array2.includes(item));
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Object utilities
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned = {} as any;
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
};

export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => isEqual(item, b[index]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  
  return false;
};

// Mental health specific utilities
export const getMoodLabel = (rating: MoodRating, locale: Locale = 'en'): string => {
  const labels = {
    en: {
      1: 'Terrible',
      2: 'Terrible',
      3: 'Bad',
      4: 'Bad',
      5: 'Okay',
      6: 'Okay',
      7: 'Good',
      8: 'Good',
      9: 'Great',
      10: 'Great',
    },
    ar: {
      1: 'فظيع',
      2: 'فظيع',
      3: 'سيء',
      4: 'سيء',
      5: 'عادي',
      6: 'عادي',
      7: 'جيد',
      8: 'جيد',
      9: 'ممتاز',
      10: 'ممتاز',
    },
  };
  
  return labels[locale][rating];
};

export const getMoodColor = (rating: MoodRating): string => {
  const colors = {
    1: '#FF3B30', // red
    2: '#FF3B30',
    3: '#FF9500', // orange
    4: '#FF9500',
    5: '#FFCC00', // yellow
    6: '#FFCC00',
    7: '#34C759', // green
    8: '#34C759',
    9: '#30D158', // bright green
    10: '#30D158',
  };
  
  return colors[rating];
};

export const getExerciseLabel = (type: ExerciseType, locale: Locale = 'en'): string => {
  const labels = {
    en: {
      breathing: 'Breathing Exercise',
      cbt_thought_challenge: 'Thought Challenge',
      grounding: 'Grounding Exercise',
      meditation: 'Meditation',
      journaling: 'Journaling',
      progressive_muscle_relaxation: 'Muscle Relaxation',
      mindfulness: 'Mindfulness',
      gratitude: 'Gratitude Practice',
      visualization: 'Visualization',
      cognitive_restructuring: 'Cognitive Restructuring',
    },
    ar: {
      breathing: 'تمرين التنفس',
      cbt_thought_challenge: 'تحدي الأفكار',
      grounding: 'تمرين التأريض',
      meditation: 'التأمل',
      journaling: 'الكتابة',
      progressive_muscle_relaxation: 'استرخاء العضلات',
      mindfulness: 'اليقظة الذهنية',
      gratitude: 'ممارسة الامتنان',
      visualization: 'التصور',
      cognitive_restructuring: 'إعادة البناء المعرفي',
    },
  };
  
  return labels[locale][type];
};

export const calculateMoodTrend = (ratings: number[]): { trend: 'up' | 'down' | 'stable'; change: number } => {
  if (ratings.length < 2) return { trend: 'stable', change: 0 };
  
  const recent = ratings.slice(-7); // Last 7 entries
  const previous = ratings.slice(-14, -7); // Previous 7 entries
  
  if (recent.length === 0 || previous.length === 0) return { trend: 'stable', change: 0 };
  
  const recentAvg = average(recent);
  const previousAvg = average(previous);
  const change = recentAvg - previousAvg;
  
  if (Math.abs(change) < 0.5) return { trend: 'stable', change };
  return { trend: change > 0 ? 'up' : 'down', change };
};

export const calculateStreak = (timestamps: number[]): number => {
  if (timestamps.length === 0) return 0;
  
  const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const currentDate = new Date(today);
  
  for (const timestamp of sortedTimestamps) {
    const entryDate = new Date(timestamp);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      break;
    }
  }
  
  return streak;
};

// Theme utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  // This would need to be implemented differently in React Native
  // For now, return a default
  return 'light';
};

export const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Async utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await delay(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    }),
  ]);
};