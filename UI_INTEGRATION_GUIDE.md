# UI Integration Guide

This guide provides a systematic approach for integrating new UI designs into the Nafsy app codebase, helping you avoid common pitfalls with hooks, naming, and theme systems.

## 🏗️ **Where to Put New UI Components**

### **1. Determine Component Category**
```
src/components/
├── animations/        # Animated components and transitions
├── chat/              # AI chat interface components
├── core/              # Basic UI primitives (buttons, inputs, icons)
├── data-display/      # Charts, cards, lists, progress indicators  
├── error/             # Error handling & boundaries
├── exercises/         # Exercise-specific components
├── feedback/          # Alerts, empty states, loading indicators
├── forms/             # Complete form system with validation
├── glass/             # Glassmorphic effects and containers
├── layout/            # Screen wrappers, containers, navigation
├── mood/              # Mood tracking components
├── onboarding/        # Onboarding flow components
├── profile/           # User profile & progress components
├── runtime/           # Runtime utilities & platform code
```

### **2. Component Placement Rules**
- **Reusable UI primitives** → `src/components/core/`
- **Data presentation** → `src/components/data-display/`
- **Form elements** → `src/components/forms/`
- **AI Chat interface** → `src/components/chat/`
- **Screen-specific features** → `src/components/[feature]/` (e.g., `mood/`, `exercises/`, `profile/`)
- **Onboarding flows** → `src/components/onboarding/`
- **Glassmorphic UI** → `src/components/glass/`
- **Runtime utilities** → `src/components/runtime/`

## 🔄 **Pre-Integration Checklist**

### **Step 1: Theme System Compatibility**
```typescript
// ✅ DO: Use your existing theme system
const { colors, spacing, borderRadius, typography } = useAppTheme();

// ❌ AVOID: Hardcoded colors/values
backgroundColor: '#007AFF'  // Bad
backgroundColor: colors.interactive.primary  // Good
```

### **Step 2: Hook Integration**
```typescript
// ✅ DO: Use existing patterns
const { colors, styles } = useAppTheme();
const { locale } = useLocale();

// ❌ AVOID: Creating new hooks for existing functionality
const [theme, setTheme] = useState(); // Don't do this
```

### **Step 3: Naming Convention Check**
```typescript
// ✅ DO: Follow existing patterns
// Core components: descriptive names
export const PrimaryButton = () => {};
export const BaseInput = () => {};

// Feature components: prefixed names  
export const ChatHeader = () => {};
export const MessageGroup = () => {};
export const ExerciseCard = () => {};
export const ExercisePlayer = () => {};
export const MoodChart = () => {};
export const MoodTracker = () => {};
export const OnboardingStep = () => {};
export const OptionCard = () => {};
export const ProfileAvatar = () => {};
export const ProgressCard = () => {};

// Glass components: Glass prefix
export const GlassContainer = () => {};
```

## 📋 **Integration Process (Step-by-Step)**

### **Phase 1: Preparation**
1. **Identify component category** from the design
2. **Check existing similar components** in that category
3. **Extract design tokens** (colors, spacing, typography)
4. **Map to your theme system** values

### **Phase 2: Theme Mapping**
```typescript
// Before copying code, create this mapping:
const DESIGN_TO_THEME_MAP = {
  // Colors
  '#007AFF': 'colors.interactive.primary',
  '#FF3B30': 'colors.interactive.destructive',
  '#F2F2F7': 'colors.background.secondary',
  
  // Spacing  
  '16px': 'spacing.md',
  '24px': 'spacing.lg',
  '8px': 'spacing.sm',
  
  // Typography
  'fontSize: 16': 'typography.body.fontSize',
  'fontWeight: 600': 'typography.body.fontWeight',
};
```

### **Phase 3: Component Creation**
1. **Create component file** in appropriate directory
2. **Add to index.ts** barrel export
3. **Implement with theme integration**:

```typescript
// src/components/core/NewButton.tsx
import { useAppTheme } from '@/theme';

interface NewButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function NewButton({ title, onPress, variant = 'primary' }: NewButtonProps) {
  const { colors, spacing, borderRadius, typography } = useAppTheme();
  
  const styles = createStyles({ colors, spacing, borderRadius, typography, variant });
  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = ({ colors, spacing, borderRadius, typography, variant }) => ({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: variant === 'primary' 
      ? colors.interactive.primary 
      : colors.interactive.secondary,
  },
  text: {
    ...typography.body,
    color: variant === 'primary' 
      ? colors.text.inverse 
      : colors.text.primary,
  },
});
```

### **Phase 4: Integration Testing**
1. **Test in light/dark modes**
2. **Test with different screen sizes**
3. **Verify accessibility**
4. **Check performance** (no unnecessary re-renders)

## 🚨 **Common Pitfalls to Avoid**

### **1. Hook Conflicts**
```typescript
// ❌ AVOID: Duplicate state management
const [theme, setTheme] = useState();
const { theme: appTheme } = useAppTheme(); // Conflict!

// ✅ DO: Use existing hooks
const { colors, spacing } = useAppTheme();
```

### **2. Naming Conflicts**
```typescript
// ❌ AVOID: Generic names that might conflict
export const Button = () => {}; // Might conflict with existing

// ✅ DO: Descriptive, unique names
export const GlassActionButton = () => {};
```

### **3. Theme System Bypass**
```typescript
// ❌ AVOID: Hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
});

// ✅ DO: Use theme system
const createStyles = ({ colors, spacing }) => ({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
});
```

## 🎯 **Quick Integration Template**

```typescript
// src/components/[category]/[ComponentName].tsx
import { useAppTheme } from '@/theme';

interface [ComponentName]Props {
  // Props here
}

export function [ComponentName]({ ...props }: [ComponentName]Props) {
  const { colors, spacing, borderRadius, typography } = useAppTheme();
  const styles = createStyles({ colors, spacing, borderRadius, typography });
  
  return (
    // Your JSX here using styles
  );
}

const createStyles = ({ colors, spacing, borderRadius, typography }) => ({
  // Your styles here using theme tokens
});
```

## 📚 **Current Architecture Overview**

### **Component Directory Structure**
The app has a clean, category-based structure:

```
src/components/
├── animations/          # Animated components (AnimatedMoodGradient, LiquidTab)
├── chat/               # AI chat interface (ChatHeader, MessageGroup, ConversationHistory)
├── core/               # Core UI primitives (Icon, Image, Switch)
├── data-display/       # Data presentation (GenericList, ProgressRing, SparkLine)
├── error/              # Error handling & boundaries (ErrorBoundary, GlobalErrorHandler)
├── exercises/          # Exercise components (ExerciseCard, ExercisePlayer, ExerciseCategories)
├── feedback/           # User feedback & empty states (ContentUnavailable)
├── forms/              # Complete form system (BaseButton, BaseInput, FormField, validation)
├── glass/              # Glassmorphic UI system (GlassContainer)
├── layout/             # Layout & screen wrappers (BaseScreen)
├── mood/               # Mood tracking (MoodChart, MoodTracker, InsightsSection)
├── onboarding/         # Onboarding flow (OptionCard, ProgressBar, PrivacyFeature)
├── profile/            # User profile & progress (ProfileAvatar, ProgressCard, AIInsightsCard)
└── runtime/            # Runtime utilities & platform code (local-storage, apple-css-variables)
```

### **Theme System**
Modern, comprehensive theme architecture with:
- **Light/Dark/System mode** support
- **Semantic color system** built on Apple Colors
- **Mental health-specific colors** (wellness, mood categories)
- **Design tokens** for spacing, typography, and borders
- **Automatic theme detection** and smooth transitions

### **Available Hooks**
```typescript
// Theme hooks
useAppTheme()         // Main theme hook with convenience methods & design tokens
useTheme()            // Core theme hook
useColors()           // Colors-only hook
useThemedStyles()     // Dynamic style generation

// Form hooks
useForm()             // Complete form state management
useFormState()        // Form state management
useFormValidation()   // Form validation logic

// Feature hooks
useChatManager()      // AI chat functionality
useAIActions()        // AI interaction management
useAuthState()        // Authentication state
useUserData()         // User data management
useGlassEffect()      // Glassmorphic effects
useLocale()          // Internationalization

// Animation hooks
useFadeAnimation()    // Fade in/out animations
useScaleAnimation()   // Scale animations
useRotationAnimation() // Rotation animations
useButtonPressAnimation() // Button press feedback
useStaggeredAnimation() // Staggered list animations
useTypingDotsAnimation() // Chat typing indicators
usePageTransition()   // Screen transition animations
useSwipeGesture()     // Swipe gesture handling

// Utility hooks
useOptimizedQueries() // Query optimization
useHeaderSearch()     // Header search functionality
useScrollToTop()      // Modern scroll-to-top behavior (React Navigation)
useMergedRef()        // Ref merging utility
useChunkedDisplay()   // Performance optimization for large lists
```

### **Design Token System**
- **Spacing**: `xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)`
- **BorderRadius**: `sm(8), md(12), lg(16), xl(20), round(999)`
- **FontSize**: `xs(12)` through `display(32)`
- **FontWeight**: `normal, medium, semibold, bold`

## 🔧 **Development Tips**

1. **Always use barrel exports** for clean imports
2. **Follow TypeScript-first** approach with proper interfaces
3. **Use iOS design patterns** throughout the app
4. **Implement proper accessibility** with native accessibility props
5. **Test on both light and dark modes**
6. **Verify component performance** with React Compiler integration

This process will help you avoid hook conflicts, naming issues, and theme system problems when integrating new UI designs into your Nafsy app!