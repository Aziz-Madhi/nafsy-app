# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nafsy** is a mental health React Native app built with Expo, featuring AI-powered chat, mood tracking, wellness exercises, and multilingual support (English/Arabic). The app uses Clerk for authentication, Convex for real-time backend, and follows iOS design patterns.

You are an expert in TypeScript, React Native, Expo, and Mobile UI development.

Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript for better type safety.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

UI and Styling

- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and Expo's useWindowDimensions for screen size adjustments.
- Use styled-components or Tailwind CSS for component styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

Safe Area Management

- Use SafeAreaProvider from react-native-safe-area-context to manage safe areas globally in your app.
- Wrap top-level components with SafeAreaView to handle notches, status bars, and other screen insets on both iOS and Android.
- Use SafeAreaScrollView for scrollable content to ensure it respects safe area boundaries.
- Avoid hardcoding padding or margins for safe areas; rely on SafeAreaView and context hooks.

Performance Optimization

- Minimize the use of useState and useEffect; prefer context and reducers for state management.
- Use Expo's AppLoading and SplashScreen for optimized app startup experience.
- Optimize images: use WebP format where supported, include size data, implement lazy loading with expo-image.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Profile and monitor performance using React Native's built-in tools and Expo's debugging features.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately.

Navigation

- Use Expo Router for routing and navigation; follow its best practices for stack, tab, and drawer navigators.
- Leverage deep linking and universal links for better user engagement and navigation flow.
- Use dynamic routes with expo-router for better navigation handling.

State Management

- Use React Context and useReducer for managing global state.
- Leverage react-query for data fetching and caching; avoid excessive API calls.
- For complex state management, consider using Zustand or Redux Toolkit.
- Handle URL search parameters using libraries like expo-linking.

Error Handling and Validation

- Use Zod for runtime validation and error handling.
- Implement proper error logging using Sentry or a similar service.
- Prioritize error handling and edge cases:
  - Handle errors at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Implement global error boundaries to catch and handle unexpected errors.
- Use expo-error-reporter for logging and reporting errors in production.

Testing

- Write unit tests using Jest and React Native Testing Library.
- Implement integration tests for critical user flows using Detox.
- Use Expo's testing tools for running tests in different environments.
- Consider snapshot testing for components to ensure UI consistency.

Security

- Sanitize user inputs to prevent XSS attacks.
- Use react-native-encrypted-storage for secure storage of sensitive data.
- Ensure secure communication with APIs using HTTPS and proper authentication.
- Use Expo's Security guidelines to protect your app: https://docs.expo.dev/guides/security/

Internationalization (i18n)

- Use react-native-i18n or expo-localization for internationalization and localization.
- Support multiple languages and RTL layouts.
- Ensure text scaling and font adjustments for accessibility.

Key Conventions

1. Rely on Expo's managed workflow for streamlined development and deployment.
2. Prioritize Mobile Web Vitals (Load Time, Jank, and Responsiveness).
3. Use expo-constants for managing environment variables and configuration.
4. Use expo-permissions to handle device permissions gracefully.
5. Implement expo-updates for over-the-air (OTA) updates.
6. Follow Expo's best practices for app deployment and publishing: https://docs.expo.dev/distribution/introduction/
7. Ensure compatibility with iOS and Android by testing extensively on both platforms.

API Documentation

- Use Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Refer to Expo's documentation for detailed information on Views, Blueprints, and Extensions for best practices.

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
- `bun lint` - Run ESLint with React Compiler integration
- `bun lint:fix` - Run ESLint with auto-fix
- `bun lint:check` - Run ESLint for CI/CD (no warnings allowed)
- `bun format` - Format code with Prettier
- `bun format:check` - Check code formatting without fixing
- TypeScript checking via IDE integration (no separate command available)

#### ESLint Configuration

- **Modern Flat Config**: Uses ESLint 9.x flat config format
- **React Compiler Integration**: Enforces React Compiler rules for performance
- **TypeScript Support**: Full TypeScript linting with array type enforcement
- **Import Organization**: Enforces import order and prevents duplicates
- **React Best Practices**: Includes React Hooks and component best practices
- **VS Code Integration**: Auto-fix on save enabled via .vscode/settings.json

### Performance & Monitoring

- **React Compiler**: Automatic performance optimizations with React 19
- **Expo Atlas**: Bundle analysis and performance monitoring
- **Virtual Scrolling**: Efficient list rendering for large datasets
- **Memoization**: Strategic component memoization for performance
- **Query Optimization**: Efficient data fetching patterns with Convex

### Build & Deploy

- `bunx eas build --platform ios` - Build for iOS using EAS
- `bunx eas build --platform android` - Build for Android using EAS
- `bunx eas build --platform all` - Build for both platforms
- `bunx eas submit` - Submit to app stores
- `bunx eas update` - Push OTA updates

## Convex Tools Guidance

- **Convex MCP Server Tool**: Can be used for all Convex-related tasks and operations

## Convex Development Notes

- When you try to run convex, don't put bunx convex dev, but put bun convex dev.

## Development Gotchas

- If you want to start the expo simulator don't put bun expo start --clear but put bun start --clear remove the expo word
