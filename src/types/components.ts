/**
 * TypeScript interfaces for all component props
 * Following LEVER framework - centralized type definitions
 */

import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';

// Base component interfaces
export interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface BaseTextProps {
  style?: StyleProp<TextStyle>;
  testID?: string;
}

// Layout component interfaces
export interface BaseScreenProps extends BaseComponentProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  scrollable?: boolean;
  centered?: boolean;
  keyboardAvoiding?: boolean;
  padding?: number;
  backgroundColor?: string;
  safeAreaStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  onBackPress?: () => void;
}

export interface FormScreenProps extends BaseScreenProps {
  showProgress?: boolean;
  progressValue?: number;
  submitButton?: React.ReactNode;
  isSubmitting?: boolean;
}

export interface ContentScreenProps extends BaseScreenProps {
  showHeader?: boolean;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  refreshControl?: React.ReactNode;
}

export interface CenteredScreenProps extends BaseScreenProps {
  icon?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export interface ModalScreenProps extends BaseScreenProps {
  visible: boolean;
  onDismiss: () => void;
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?: 'formSheet' | 'pageSheet' | 'overFullScreen';
}

// UI component interfaces
export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
}

export interface ErrorStateProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  error?: Error | string;
  onRetry?: () => void;
  retryText?: string;
  showDetails?: boolean;
}

// Form component interfaces
export interface FormSectionProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: string;
  children: React.ReactNode;
}

export interface FormTextProps extends BaseComponentProps {
  children: React.ReactNode;
  systemImage?: string;
  onPress?: () => void;
  accessoryText?: string;
  accessoryView?: React.ReactNode;
}

export interface FormLinkProps extends BaseComponentProps {
  href: string;
  children: React.ReactNode;
  systemImage?: string;
  external?: boolean;
}

export interface FormToggleProps extends BaseComponentProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface FormInputProps extends BaseComponentProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'default' | 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  error?: string;
  required?: boolean;
  maxLength?: number;
  systemImage?: string;
}

// List component interfaces
export interface ListItem {
  id: string;
  [key: string]: any;
}

export interface GenericListProps<T extends ListItem> extends BaseComponentProps {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  loading?: boolean;
  error?: string;
  emptyState?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  ItemSeparatorComponent?: React.ReactNode;
  sectionListData?: Array<{
    title: string;
    data: T[];
  }>;
}

// Mental Health specific interfaces
export interface MoodEntry {
  _id: Id<'moods'>;
  userId: Id<'users'>;
  rating: number;
  emotions: string[];
  note?: string;
  timestamp: number;
  triggers?: string[];
  activities?: string[];
}

export interface MoodEntryProps extends BaseComponentProps {
  mood: MoodEntry;
  onPress?: (mood: MoodEntry) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export interface MoodRatingProps extends BaseComponentProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  labels?: string[];
}

export interface ExerciseEntry {
  _id: Id<'exercises'>;
  userId: Id<'users'>;
  type: string;
  completedAt: number;
  duration?: number;
  conversationId?: Id<'conversations'>;
  data: {
    inputs?: any;
    outputs?: any;
    effectiveness?: number;
  };
}

export interface ExerciseCardProps extends BaseComponentProps {
  exercise: ExerciseEntry;
  onPress?: (exercise: ExerciseEntry) => void;
  showProgress?: boolean;
  compact?: boolean;
}

export interface ConversationEntry {
  _id: Id<'conversations'>;
  userId: Id<'users'>;
  title?: string;
  lastMessageAt: number;
  messageCount: number;
  isActive: boolean;
  metadata?: {
    primaryTopic?: string;
    emotionalTone?: string;
  };
}

export interface ConversationCardProps extends BaseComponentProps {
  conversation: ConversationEntry;
  onPress?: (conversation: ConversationEntry) => void;
  showMetadata?: boolean;
  compact?: boolean;
}

export interface MessageEntry {
  _id: Id<'messages'>;
  conversationId: Id<'conversations'>;
  userId: Id<'users'>;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  audioUrl?: string;
  sentiment?: {
    score: number;
    label: string;
  };
  metadata?: {
    isEmergency?: boolean;
    exerciseType?: string;
    language?: string;
  };
}

export interface MessageBubbleProps extends BaseComponentProps {
  message: MessageEntry;
  isOwn?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  onPress?: (message: MessageEntry) => void;
  onLongPress?: (message: MessageEntry) => void;
}

// Error boundary interfaces
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export interface ScreenErrorBoundaryProps extends ErrorBoundaryProps {
  screenName: string;
  showDebugInfo?: boolean;
}

export interface ComponentErrorBoundaryProps extends ErrorBoundaryProps {
  componentName: string;
  isolate?: boolean;
}

export interface NetworkErrorBoundaryProps extends ErrorBoundaryProps {
  onRetry?: () => void;
  retryText?: string;
}

// Theme and styling interfaces
export interface ThemeProps {
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
      grouped: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
    };
    interactive: {
      primary: string;
      secondary: string;
      tertiary: string;
      destructive: string;
      warning: string;
      success: string;
    };
    wellness: {
      calm: string;
      energy: string;
      balance: string;
      focus: string;
      joy: string;
    };
    mood: {
      great: string;
      good: string;
      okay: string;
      bad: string;
      terrible: string;
    };
    system: {
      separator: string;
      fill: string;
      border: string;
      shadow: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    fonts: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  customTheme?: Partial<ThemeProps>;
}

// Hook interfaces
export interface UseActionWithStateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  optimisticUpdate?: (args: any) => void;
  rollbackUpdate?: (args: any) => void;
  debounceMs?: number;
}

export interface UseActionWithStateResult<T> {
  mutate: (args: any) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  retry: () => void;
}

// Accessibility interfaces
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'header' | 'tab' | 'switch';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: any) => void;
}

// Animation interfaces
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
}

// Navigation interfaces
export interface NavigationProps {
  navigation: any; // TODO: Add proper navigation type
  route: any; // TODO: Add proper route type
}

// Screen-specific interfaces
export interface WelcomeScreenProps extends BaseScreenProps {
  onLanguageSelect: (language: 'en' | 'ar') => void;
  selectedLanguage?: 'en' | 'ar';
}

export interface OnboardingScreenProps extends BaseScreenProps {
  onComplete: (preferences: any) => void;
  isLoading?: boolean;
}

export interface ChatScreenProps extends BaseScreenProps {
  conversationId?: Id<'conversations'>;
  onNewConversation?: () => void;
}

export interface MoodTrackingScreenProps extends BaseScreenProps {
  onMoodSubmit: (mood: Partial<MoodEntry>) => void;
  isSubmitting?: boolean;
}

export interface ExerciseScreenProps extends BaseScreenProps {
  exerciseType?: string;
  onExerciseComplete: (exercise: Partial<ExerciseEntry>) => void;
  isCompleting?: boolean;
}

export interface ProfileScreenProps extends BaseScreenProps {
  user: any; // TODO: Add user type
  onUpdateProfile: (updates: any) => void;
  isUpdating?: boolean;
}

// Utility type helpers
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Re-export common React Native types
export type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';