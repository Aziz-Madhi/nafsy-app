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