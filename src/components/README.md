# Nafsy App Components

This directory contains all reusable UI components for the Nafsy mental health app, organized by category for better maintainability and discoverability.

## Directory Structure

```
components/
├── animations/      # Animated components and effects
├── chat/           # Chat-specific components
├── core/           # Core UI primitives (Image, Icon, Switch)
├── data-display/   # Components for displaying data (cards, charts, progress)
├── error/          # Error handling components
├── exercises/      # Exercise-related components
├── feedback/       # User feedback components (empty states, etc.)
├── forms/          # Complete form system
├── layout/         # Layout and screen wrapper components
├── mood/           # Mood tracking components
└── runtime/        # Runtime utilities and platform-specific code
```

## Component Categories

### Core Components (`/core`)
- **IconSymbol**: SF Symbols wrapper for iOS-style icons
- **Image**: Enhanced image component with SF Symbol support
- **Switch**: Platform-aware toggle switch

### Forms (`/forms`)
Complete form system with iOS-style components:
- **Form**: Main form component with context
- **FormTextField**: Text input fields
- **FormDatePicker**: Date selection
- **FormToggle**: Toggle switches
- **FormSection**: Grouped form sections
- And more specialized form components

### Chat (`/chat`)
AI-powered chat interface components:
- **ChatManagement**: Chat session management
- **ChatSearch**: Message search functionality
- **ConversationHistory**: Past conversations display
- **TypingIndicator**: AI typing animation
- **QuickReplySuggestions**: Suggested responses
- **ReactionPicker**: Message reactions

### Feedback (`/feedback`)
User feedback and empty state components:
- **ContentUnavailable**: Empty state displays

### Data Display (`/data-display`)
Components for presenting data:
- **GlassmorphicCard**: iOS-style blurred glass cards
- **ProgressRing**: Circular progress indicators
- **SparkLine**: Mini charts for trends
- **GenericList**: Flexible list component

### Animation Components (`/animations`)
- **AnimatedMoodGradient**: Animated gradient background for mood screens
- **LiquidTab**: Liquid animation tab component

## Usage Guidelines

### Importing Components

Use barrel exports for cleaner imports:

```typescript
// Good - using barrel exports
import { IconSymbol, Image } from '@/components/core';
import { ChatManagement, TypingIndicator } from '@/components/chat';

// Also good - direct imports for tree-shaking
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
```

### Adding New Components

1. **Determine the category**: Choose the most appropriate directory
2. **Follow naming conventions**: Use PascalCase for components
3. **Include TypeScript types**: Export prop interfaces
4. **Update barrel exports**: Add to the category's index.ts
5. **Document complex components**: Add JSDoc comments

### Component Standards

All components should:
- Use the new theme system from `src/theme/`
- Support both light and dark modes
- Include proper TypeScript types
- Follow iOS design patterns
- Support RTL for Arabic localization
- Include accessibility props

### Theme Usage

```typescript
import { useAppTheme } from '@/theme';

const MyComponent = () => {
  const { theme, colors } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Component content */}
    </View>
  );
};
```

## Clean Component Architecture

This structure has been radically cleaned up from the previous messy organization:

- **Removed duplicates**: Eliminated 40+ duplicate components from the old ui/ folder
- **Clear categories**: Components are now organized by their actual function
- **No unused code**: Removed all orphaned and unused components
- **Better imports**: All imports now use the organized folder structure
- **Consistent exports**: Every folder has a proper index.ts for clean imports

## Performance Considerations

- Components are optimized for React 19 and the React Compiler
- Use barrel exports judiciously to maintain tree-shaking
- Leverage memoization for expensive components
- Follow virtual scrolling patterns for lists

## Platform-Specific Code

When creating platform-specific components:
- Use `.ios.tsx` and `.android.tsx` extensions
- Provide web fallbacks with `.web.tsx` when needed
- Ensure consistent APIs across platforms