/**
 * Centralized type exports for the Nafsy app
 * Following LEVER framework - single source of truth for types
 */

// Re-export all component types
export * from './components';

// Re-export Convex generated types
export type { Id } from '@/convex/_generated/dataModel';

// Common utility types
export type Locale = 'en' | 'ar';

export type Theme = 'light' | 'dark' | 'auto';

export type MoodRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ExerciseType = 
  | 'breathing'
  | 'cbt_thought_challenge'
  | 'grounding'
  | 'meditation'
  | 'journaling'
  | 'progressive_muscle_relaxation'
  | 'mindfulness'
  | 'gratitude'
  | 'visualization'
  | 'cognitive_restructuring';

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationStatus = 'active' | 'inactive' | 'archived';

export type ResourceType = 'hotline' | 'article' | 'exercise' | 'video' | 'website';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export type GoalCategory = 'mental_health' | 'habits' | 'personal_growth' | 'wellness' | 'social';

export type NotificationCategory = 'mood_reminder' | 'exercise_reminder' | 'check_in' | 'emergency' | 'system';

// User preference types
export interface UserPreferences {
  dailyCheckInTime?: string;
  enableNotifications: boolean;
  voiceEnabled: boolean;
  theme: Theme;
  language: Locale;
  timezone?: string;
  emergencyContactsEnabled?: boolean;
  dataExportEnabled?: boolean;
  analyticsEnabled?: boolean;
}

// API response types
export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'toggle';
  placeholder?: string;
  value: any;
  error?: string;
  validation?: ValidationRule;
  options?: { label: string; value: any }[];
  disabled?: boolean;
  required?: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface UserAnalytics {
  moodEntries: number;
  exercisesCompleted: number;
  conversationsStarted: number;
  totalMessages: number;
  avgMoodRating: number;
  moodStability: number;
  exerciseConsistency: number;
  streakDays: number;
  lastActiveAt: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
}

export interface NetworkError extends AppError {
  status?: number;
  endpoint?: string;
  method?: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: any;
}

// Storage types
export interface StorageItem {
  key: string;
  value: any;
  expiresAt?: number;
  encrypted?: boolean;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  key: string;
}

// Navigation types (to be updated when we have proper navigation typing)
export interface NavigationState {
  index: number;
  routes: {
    name: string;
    params?: Record<string, any>;
  }[];
}

export interface RouteParams {
  [key: string]: any;
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  isTyping?: boolean;
  isError?: boolean;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title?: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Mood tracking types
export interface MoodDataPoint {
  date: string;
  rating: MoodRating;
  emotions: string[];
  note?: string;
  activities?: string[];
  triggers?: string[];
}

export interface MoodTrend {
  period: 'week' | 'month' | 'year';
  average: number;
  change: number;
  changePercentage: number;
  dataPoints: MoodDataPoint[];
}

// Exercise types
export interface ExerciseTemplate {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
  tags: string[];
  isGuided: boolean;
  audioUrl?: string;
  videoUrl?: string;
}

export interface ExerciseSession {
  id: string;
  templateId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  completionRate: number;
  effectiveness?: number;
  notes?: string;
  data?: Record<string, any>;
}

// Resource types
export interface MentalHealthResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  phone?: string;
  category: string[];
  language: Locale;
  country?: string;
  isEmergency: boolean;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  metadata?: Record<string, any>;
}

// Goal types
export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  targetDate?: number;
  createdAt: number;
  updatedAt: number;
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
  milestones?: {
    title: string;
    completed: boolean;
    date?: number;
  }[];
}

// Notification types
export interface NotificationSettings {
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: {
    moodReminders: 'daily' | 'weekly' | 'never';
    exerciseReminders: 'daily' | 'weekly' | 'never';
    checkIns: 'daily' | 'weekly' | 'never';
  };
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  data?: Record<string, any>;
  scheduledAt?: number;
  deliveredAt?: number;
  readAt?: number;
  actionable?: boolean;
  actions?: {
    id: string;
    title: string;
    type: 'default' | 'destructive';
  }[];
}

// Export utility type guards
export const isValidLocale = (locale: string): locale is Locale => {
  return ['en', 'ar'].includes(locale);
};

export const isValidTheme = (theme: string): theme is Theme => {
  return ['light', 'dark', 'auto'].includes(theme);
};

export const isValidMoodRating = (rating: number): rating is MoodRating => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
};

export const isValidExerciseType = (type: string): type is ExerciseType => {
  const validTypes: ExerciseType[] = [
    'breathing',
    'cbt_thought_challenge',
    'grounding',
    'meditation',
    'journaling',
    'progressive_muscle_relaxation',
    'mindfulness',
    'gratitude',
    'visualization',
    'cognitive_restructuring'
  ];
  return validTypes.includes(type as ExerciseType);
};

export const isValidMessageRole = (role: string): role is MessageRole => {
  return ['user', 'assistant', 'system'].includes(role);
};