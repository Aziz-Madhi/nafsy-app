/**
 * Accessibility utilities for the Nafsy app
 * Following LEVER framework - centralized accessibility helpers
 * 
 * Features:
 * - Screen reader labels and hints
 * - Voice control support
 * - High contrast mode detection
 * - Reduced motion preferences
 * - Font scaling support
 * - Touch target sizing
 * - Focus management
 * - Semantic role definitions
 */

import { AccessibilityInfo, Dimensions } from 'react-native';
import { Locale } from '@/types';

// Accessibility constants
export const MINIMUM_TOUCH_TARGET_SIZE = 44; // iOS HIG recommendation
export const PREFERRED_TOUCH_TARGET_SIZE = 44;
export const MAXIMUM_FONT_SCALE = 3.0; // Maximum font scaling

// Accessibility roles for common UI patterns
export const AccessibilityRoles = {
  BUTTON: 'button' as const,
  LINK: 'link' as const,
  TEXT: 'text' as const,
  IMAGE: 'image' as const,
  HEADER: 'header' as const,
  TAB: 'tab' as const,
  SWITCH: 'switch' as const,
  SLIDER: 'slider' as const,
  SEARCH: 'search' as const,
  LIST: 'list' as const,
  LIST_ITEM: 'listitem' as const,
  NAVIGATION: 'navigation' as const,
  MAIN: 'main' as const,
  COMPLEMENTARY: 'complementary' as const,
  FORM: 'form' as const,
} as const;

// Accessibility states
export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  expanded?: boolean;
  busy?: boolean;
}

// Common accessibility labels and hints
export const AccessibilityLabels = {
  en: {
    // Navigation
    goBack: 'Go back',
    close: 'Close',
    menu: 'Menu',
    settings: 'Settings',
    profile: 'Profile',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    retry: 'Retry',
    refresh: 'Refresh',
    
    // Form elements
    required: 'Required field',
    optional: 'Optional field',
    search: 'Search',
    filter: 'Filter',
    
    // Mental health specific
    moodEntry: 'Mood entry',
    exerciseSession: 'Exercise session',
    chatMessage: 'Chat message',
    emergencyContact: 'Emergency contact',
    
    // States
    loading: 'Loading',
    error: 'Error occurred',
    success: 'Success',
    completed: 'Completed',
    
    // Content
    noResults: 'No results found',
    emptyList: 'List is empty',
    
    // Media
    playAudio: 'Play audio',
    pauseAudio: 'Pause audio',
    stopAudio: 'Stop audio',
  },
  ar: {
    // Navigation
    goBack: 'العودة',
    close: 'إغلاق',
    menu: 'القائمة',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    share: 'مشاركة',
    retry: 'إعادة المحاولة',
    refresh: 'تحديث',
    
    // Form elements
    required: 'حقل مطلوب',
    optional: 'حقل اختياري',
    search: 'بحث',
    filter: 'تصفية',
    
    // Mental health specific
    moodEntry: 'إدخال المزاج',
    exerciseSession: 'جلسة تمرين',
    chatMessage: 'رسالة محادثة',
    emergencyContact: 'جهة اتصال طوارئ',
    
    // States
    loading: 'جاري التحميل',
    error: 'حدث خطأ',
    success: 'نجح',
    completed: 'مكتمل',
    
    // Content
    noResults: 'لم يتم العثور على نتائج',
    emptyList: 'القائمة فارغة',
    
    // Media
    playAudio: 'تشغيل الصوت',
    pauseAudio: 'إيقاف الصوت مؤقتاً',
    stopAudio: 'إيقاف الصوت',
  },
} as const;

// Accessibility hints for better UX
export const AccessibilityHints = {
  en: {
    // Navigation
    goBack: 'Double tap to go back to the previous screen',
    menu: 'Double tap to open the navigation menu',
    
    // Actions
    save: 'Double tap to save your changes',
    delete: 'Double tap to delete this item',
    share: 'Double tap to share this content',
    
    // Form interactions
    textInput: 'Double tap to edit text',
    slider: 'Swipe up or down to adjust value',
    switch: 'Double tap to toggle on or off',
    
    // Lists
    listItem: 'Double tap to select this item',
    scrollable: 'Swipe up or down to scroll through items',
    
    // Mental health specific
    moodRating: 'Swipe up or down to change your mood rating',
    exerciseStart: 'Double tap to start this exercise',
    chatSend: 'Double tap to send your message',
  },
  ar: {
    // Navigation
    goBack: 'انقر مرتين للعودة إلى الشاشة السابقة',
    menu: 'انقر مرتين لفتح قائمة التنقل',
    
    // Actions
    save: 'انقر مرتين لحفظ التغييرات',
    delete: 'انقر مرتين لحذف هذا العنصر',
    share: 'انقر مرتين لمشاركة هذا المحتوى',
    
    // Form interactions
    textInput: 'انقر مرتين لتعديل النص',
    slider: 'اسحب لأعلى أو لأسفل لضبط القيمة',
    switch: 'انقر مرتين للتبديل',
    
    // Lists
    listItem: 'انقر مرتين لتحديد هذا العنصر',
    scrollable: 'اسحب لأعلى أو لأسفل للتمرير عبر العناصر',
    
    // Mental health specific
    moodRating: 'اسحب لأعلى أو لأسفل لتغيير تقييم مزاجك',
    exerciseStart: 'انقر مرتين لبدء هذا التمرين',
    chatSend: 'انقر مرتين لإرسال رسالتك',
  },
} as const;

// Utility functions for accessibility

/**
 * Get accessibility label for a given key and locale
 */
export function getAccessibilityLabel(key: keyof typeof AccessibilityLabels.en, locale: Locale = 'en'): string {
  return AccessibilityLabels[locale][key] || AccessibilityLabels.en[key];
}

/**
 * Get accessibility hint for a given key and locale
 */
export function getAccessibilityHint(key: keyof typeof AccessibilityHints.en, locale: Locale = 'en'): string {
  return AccessibilityHints[locale][key] || AccessibilityHints.en[key];
}

/**
 * Create accessibility props for mood rating
 */
export function getMoodAccessibilityProps(rating: number, locale: Locale = 'en') {
  const moodLabels = {
    en: { 1: 'Terrible', 2: 'Terrible', 3: 'Bad', 4: 'Bad', 5: 'Okay', 6: 'Okay', 7: 'Good', 8: 'Good', 9: 'Great', 10: 'Great' },
    ar: { 1: 'فظيع', 2: 'فظيع', 3: 'سيء', 4: 'سيء', 5: 'عادي', 6: 'عادي', 7: 'جيد', 8: 'جيد', 9: 'ممتاز', 10: 'ممتاز' },
  };

  return {
    accessibilityRole: AccessibilityRoles.SLIDER,
    accessibilityLabel: `${getAccessibilityLabel('moodEntry', locale)}: ${moodLabels[locale][rating as keyof typeof moodLabels.en]}`,
    accessibilityHint: getAccessibilityHint('moodRating', locale),
    accessibilityValue: {
      min: 1,
      max: 10,
      now: rating,
      text: `${rating} out of 10, ${moodLabels[locale][rating as keyof typeof moodLabels.en]}`,
    },
  };
}

/**
 * Create accessibility props for exercise cards
 */
export function getExerciseAccessibilityProps(exerciseType: string, duration?: number, locale: Locale = 'en') {
  const durationText = duration ? `, duration ${Math.floor(duration / 60)} minutes` : '';
  
  return {
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: `${getAccessibilityLabel('exerciseSession', locale)}: ${exerciseType}${durationText}`,
    accessibilityHint: getAccessibilityHint('exerciseStart', locale),
  };
}

/**
 * Create accessibility props for chat messages
 */
export function getMessageAccessibilityProps(
  content: string, 
  role: 'user' | 'assistant' | 'system',
  timestamp: number,
  locale: Locale = 'en'
) {
  const roleText = role === 'user' ? 'You' : role === 'assistant' ? 'Assistant' : 'System';
  const timeText = new Date(timestamp).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US');
  
  return {
    accessibilityRole: AccessibilityRoles.TEXT,
    accessibilityLabel: `${getAccessibilityLabel('chatMessage', locale)} from ${roleText} at ${timeText}: ${content}`,
  };
}

/**
 * Create accessibility props for navigation buttons
 */
export function getNavigationAccessibilityProps(action: 'back' | 'close' | 'menu', locale: Locale = 'en') {
  const labels = {
    back: getAccessibilityLabel('goBack', locale),
    close: getAccessibilityLabel('close', locale),
    menu: getAccessibilityLabel('menu', locale),
  };

  const hints = {
    back: getAccessibilityHint('goBack', locale),
    close: getAccessibilityHint('goBack', locale),
    menu: getAccessibilityHint('menu', locale),
  };

  return {
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: labels[action],
    accessibilityHint: hints[action],
  };
}

/**
 * Create accessibility props for form inputs
 */
export function getFormInputAccessibilityProps(
  label: string,
  required: boolean = false,
  error?: string,
  locale: Locale = 'en'
) {
  const requiredText = required ? `, ${getAccessibilityLabel('required', locale)}` : '';
  const errorText = error ? `, Error: ${error}` : '';
  
  return {
    accessibilityLabel: `${label}${requiredText}${errorText}`,
    accessibilityHint: getAccessibilityHint('textInput', locale),
    accessibilityRole: AccessibilityRoles.TEXT,
    accessibilityState: {
      disabled: false,
    } as AccessibilityState,
  };
}

/**
 * Create accessibility props for list items
 */
export function getListItemAccessibilityProps(
  title: string,
  subtitle?: string,
  index?: number,
  total?: number,
  locale: Locale = 'en'
) {
  const positionText = (index !== undefined && total !== undefined) 
    ? `, item ${index + 1} of ${total}` 
    : '';
  const subtitleText = subtitle ? `, ${subtitle}` : '';
  
  return {
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: `${title}${subtitleText}${positionText}`,
    accessibilityHint: getAccessibilityHint('listItem', locale),
  };
}

/**
 * Check if device has accessibility features enabled
 */
export async function getAccessibilityInfo() {
  try {
    const [
      isScreenReaderEnabled,
      isReduceMotionEnabled,
      isReduceTransparencyEnabled,
      isBoldTextEnabled,
      isGrayscaleEnabled,
      isInvertColorsEnabled,
    ] = await Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isReduceTransparencyEnabled?.() || Promise.resolve(false),
      AccessibilityInfo.isBoldTextEnabled?.() || Promise.resolve(false),
      AccessibilityInfo.isGrayscaleEnabled?.() || Promise.resolve(false),
      AccessibilityInfo.isInvertColorsEnabled?.() || Promise.resolve(false),
    ]);

    return {
      isScreenReaderEnabled,
      isReduceMotionEnabled,
      isReduceTransparencyEnabled,
      isBoldTextEnabled,
      isGrayscaleEnabled,
      isInvertColorsEnabled,
    };
  } catch (error) {
    console.warn('Error getting accessibility info:', error);
    return {
      isScreenReaderEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      isInvertColorsEnabled: false,
    };
  }
}

/**
 * Ensure touch target meets minimum size requirements
 */
export function ensureAccessibleTouchTarget(size: { width: number; height: number }) {
  return {
    width: Math.max(size.width, MINIMUM_TOUCH_TARGET_SIZE),
    height: Math.max(size.height, MINIMUM_TOUCH_TARGET_SIZE),
  };
}

/**
 * Get font size considering accessibility scaling
 */
export function getAccessibleFontSize(baseSize: number, maxScale: number = MAXIMUM_FONT_SCALE): number {
  const { fontScale } = Dimensions.get('window');
  const scale = Math.min(fontScale, maxScale);
  return baseSize * scale;
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string, locale: Locale = 'en') {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Set accessibility focus to an element
 */
export function setAccessibilityFocus(reactTag: number) {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
}

/**
 * Create accessibility actions for common patterns
 */
export function createAccessibilityActions(actions: Array<{ name: string; label: string; onPress: () => void }>) {
  return {
    accessibilityActions: actions.map(({ name, label }) => ({ name, label })),
    onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
      const action = actions.find(a => a.name === event.nativeEvent.actionName);
      action?.onPress();
    },
  };
}

/**
 * Mental health specific accessibility helpers
 */

/**
 * Create accessibility props for mood tracking
 */
export function getMoodTrackingAccessibilityProps(
  selectedRating?: number,
  selectedEmotions: string[] = [],
  locale: Locale = 'en'
) {
  const ratingText = selectedRating ? `Current rating: ${selectedRating} out of 10` : 'No rating selected';
  const emotionsText = selectedEmotions.length > 0 
    ? `, Selected emotions: ${selectedEmotions.join(', ')}` 
    : ', No emotions selected';

  return {
    accessibilityLabel: `Mood tracking form. ${ratingText}${emotionsText}`,
    accessibilityRole: AccessibilityRoles.FORM,
  };
}

/**
 * Create accessibility props for exercise instructions
 */
export function getExerciseInstructionAccessibilityProps(
  step: number,
  totalSteps: number,
  instruction: string,
  locale: Locale = 'en'
) {
  return {
    accessibilityRole: AccessibilityRoles.TEXT,
    accessibilityLabel: `Step ${step} of ${totalSteps}: ${instruction}`,
    accessibilityLiveRegion: 'polite' as const,
  };
}

/**
 * Create accessibility props for emergency contacts
 */
export function getEmergencyContactAccessibilityProps(
  name: string,
  phone: string,
  relationship?: string,
  isPrimary: boolean = false,
  locale: Locale = 'en'
) {
  const relationshipText = relationship ? `, ${relationship}` : '';
  const primaryText = isPrimary ? ', Primary contact' : '';
  
  return {
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: `${getAccessibilityLabel('emergencyContact', locale)}: ${name}${relationshipText}, ${phone}${primaryText}`,
    accessibilityHint: 'Double tap to call this contact',
  };
}

/**
 * Create accessibility props for crisis resources
 */
export function getCrisisResourceAccessibilityProps(
  title: string,
  type: 'hotline' | 'text' | 'chat' | 'website',
  isEmergency: boolean = false,
  locale: Locale = 'en'
) {
  const typeText = {
    hotline: 'Phone hotline',
    text: 'Text service',
    chat: 'Chat service',
    website: 'Website',
  };

  const urgencyText = isEmergency ? ', Emergency resource' : '';
  
  return {
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: `${title}, ${typeText[type]}${urgencyText}`,
    accessibilityHint: `Double tap to access this ${type}`,
  };
}

/**
 * Export accessibility role constants
 */
export { AccessibilityRoles };

/**
 * Export accessibility state interface
 */
export type { AccessibilityState };