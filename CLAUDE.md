# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nafsy** is a mental health React Native app built with Expo, featuring AI-powered chat, mood tracking, wellness exercises, and multilingual support (English/Arabic). The app uses Clerk for authentication, Convex for real-time backend, and follows iOS design patterns with Apple-style components.

## Development Commands
**ALWAYS USE BUN or BUNX COMMANDS**

### Development
- `bun expo start` - Start Expo development server
- `bun expo start --clear` - Start with cache cleared
- `bun expo start --tunnel` - Start with tunnel for testing on physical devices
- `bun expo prebuild` - Generate native iOS/Android projects
- `bun expo run:ios` - Run on iOS simulator
- `bun expo run:android` - Run on Android emulator

### Convex Backend
- `bunx convex dev` - Start Convex development server
- `bunx convex deploy` - Deploy backend to production
- `bunx convex dashboard` - Open Convex dashboard in browser
- `bunx convex logs` - View real-time backend logs
- `bunx convex env` - Manage environment variables

### Code Quality
- `bun expo install --fix` - Fix package version mismatches
- `bun lint` - Run ESLint (currently has config issues)
- `bun lint:fix` - Run ESLint with auto-fix (currently has config issues)
- TypeScript checking via IDE integration (no separate command available)
- `bun format` - Format code with Prettier (if available)

### Build & Deploy
- `bunx eas build --platform ios` - Build for iOS using EAS
- `bunx eas build --platform android` - Build for Android using EAS
- `bunx eas build --platform all` - Build for both platforms
- `bunx eas submit` - Submit to app stores
- `bunx eas update` - Push OTA updates

## Critical Lessons Learned

### Infinite Render Loop Prevention
**MOST IMPORTANT**: This project previously had infinite render loop issues. Always follow these patterns:

1. **LocaleProvider Context Stability**:
   ```tsx
   // CORRECT: Use React.useMemo and useCallback for stable context values
   const setLocale = React.useCallback(async (newLocale: Locale) => {
     // implementation
   }, []);

   const value = React.useMemo(() => ({
     locale,
     setLocale,
     isLoading,
     isRTL: locale === "ar",
   }), [locale, isLoading]);
   ```

2. **Navigation Redirect Loops**: Always check loading states before redirecting
   ```tsx
   // CORRECT: Wait for auth state to load
   if (!isLoaded) {
     return null;
   }
   ```

3. **Effect Dependencies**: Be careful with useEffect dependencies to prevent loops
   ```tsx
   // CORRECT: Use refs for one-time operations
   const hasRedirected = useRef(false);
   
   useEffect(() => {
     if (hasRedirected.current || !isLoaded) return;
     hasRedirected.current = true;
     // redirect logic
   }, [isSignedIn, isLoaded, router]);
   ```

### TypeScript Color Handling
When using Apple Colors with React Navigation:
```tsx
// CORRECT: Cast OpaqueColorValue to string
tabBarActiveTintColor: AC.systemBlue as unknown as string,
```

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication flow
│   │   ├── _layout.tsx    # Auth layout with redirect logic
│   │   ├── welcome.tsx    # Language selection
│   │   ├── sign-in.tsx    # Sign in screen
│   │   ├── sign-up.tsx    # Sign up screen
│   │   └── onboarding.tsx # User preferences setup
│   ├── (tabs)/            # Main app tabs
│   │   ├── _layout.tsx    # Tab navigation with user creation logic
│   │   ├── index.tsx      # Chat screen (placeholder)
│   │   ├── mood.tsx       # Mood tracking
│   │   ├── exercises.tsx  # Wellness exercises
│   │   └── profile.tsx    # User profile and settings
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Entry point with auth routing
├── components/ui/         # Reusable UI components
│   ├── Form.tsx          # Apple-style form components
│   ├── img.tsx           # SF Symbols support
│   └── ...               # Other UI components
├── hooks/
│   └── useLocale.tsx     # Multilingual support with Context
├── utils/
│   └── cache.ts          # Clerk token cache
└── convex/               # Backend functions
    ├── users.ts          # User management
    ├── schema.ts         # Database schema
    └── ...               # Other backend functions
```

## Architecture

### Authentication Flow (Clerk + Convex)
1. **Root Index** (`/src/app/index.tsx`) - Handles initial auth routing
2. **Auth Layout** (`/src/app/(auth)/_layout.tsx`) - Redirects authenticated users to tabs
3. **Tabs Layout** (`/src/app/(tabs)/_layout.tsx`) - Creates Convex user if needed, handles onboarding
4. **User Creation Flow**: Clerk user → Convex user creation → Onboarding (if needed) → Main app

### Key Components
- **LocaleProvider**: Provides stable context for language switching (en/ar) with RTL support
- **Form Components**: Apple-style settings forms with sections, links, toggles
- **Navigation**: Expo Router with proper loading states and redirect handling

### Backend (Convex)
- **Real-time Database**: Document-based with automatic reactivity
- **Mutations**: Transactional operations (upsertUser, completeOnboarding)
- **Queries**: Real-time data fetching with optimistic updates
- **Actions**: External API calls (OpenAI integration planned)

## Environment Variables Required
```bash
# Convex
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deployment-key

# Clerk Authentication  
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-secret-key
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev

# OpenAI (for AI chat features)
OPENAI_API_KEY=sk-proj-your-api-key

# Future: Superwall (for payments)
# EXPO_PUBLIC_SUPERWALL_API_KEY=your_superwall_api_key
```

## Form Component Patterns
```tsx
// Apple-style settings form
<Form.List navigationTitle="Settings">
  <Form.Section title="Preferences">
    <Form.Text systemImage="bell">Notifications</Form.Text>
    <Form.Toggle value={enabled} onValueChange={setEnabled}>
      Dark Mode
    </Form.Toggle>
    <Form.Link href="/settings/privacy" systemImage="hand.raised">
      Privacy Settings
    </Form.Link>
  </Form.Section>
</Form.List>
```

## Multilingual Support
- English and Arabic support with RTL layout
- Context-based with stable provider pattern
- **Centralized translations** in `/src/locales/en.ts` and `/src/locales/ar.ts`
- Translation helper: `const { t } = useTranslation()`
- **PREFERRED Usage**: `t("auth.onboarding.title")` (centralized keys)
- **Legacy Usage**: `t("key", { en: "English text", ar: "النص العربي" })` (inline - avoid for new code)

### Translation System Architecture
- **Centralized Pattern**: Use nested keys like `auth.signIn.title`, `navigation.chat`, etc.
- **File Structure**: Well-organized sections (auth, navigation, chat, mood, exercises, profile, etc.)
- **Type Safety**: Both translation files use `as const` for TypeScript support
- **RTL Support**: Automatic RTL detection and layout switching for Arabic
- **Fallback**: Graceful fallback to English if Arabic translation missing

## Important Implementation Notes

### Navigation
- Always check `isLoaded` before auth-based redirects
- Use `router.replace()` instead of `<Redirect>` for complex flows
- Handle loading states to prevent redirect loops

### Convex Integration
- User creation happens automatically in tabs layout
- Use refs to prevent duplicate user creation attempts
- All mutations are transactional (all or nothing)

### Apple Design System
- Use `@bacons/apple-colors` with proper TypeScript casting
- SF Symbols support via `<Image source="sf:icon.name" />`
- Platform-specific components (`.ios.tsx`, `.web.tsx`)

### Code Quality
- TypeScript checking via IDE integration (no separate command available)
- Fix TypeScript errors immediately
- Use proper memoization for context providers
- Follow React hooks rules strictly
- **Translation Best Practices**: Use centralized translation keys instead of inline objects

## Debugging Common Issues

### Infinite Render Loop
1. Check LocaleProvider context value stability
2. Verify useEffect dependencies
3. Look for setState calls during render
4. Check navigation redirect logic

### TypeScript Errors
1. Cast Apple Colors: `AC.color as unknown as string`
2. Use proper Expo Router href types
3. Handle Convex query loading states

### Authentication Issues  
1. Verify environment variables
2. Check Clerk provider setup in root layout
3. Ensure proper loading state handling

### Translation Issues
1. **Missing Translation Errors**: Add keys to both `/src/locales/en.ts` and `/src/locales/ar.ts`
2. **Legacy Inline Usage**: Migrate to centralized keys (e.g., `t("auth.signIn.title")`)
3. **Key Not Found**: Check for typos in nested key paths
4. **RTL Layout Issues**: Ensure Arabic translations are properly set and RTL is working

## Project-Specific Conventions
- Prefer editing existing components over creating new files
- Follow iOS design patterns for consistency
- Use platform-specific file extensions when behavior differs  
- Always use stable context patterns to prevent re-render loops
- Test auth flow thoroughly after any navigation changes