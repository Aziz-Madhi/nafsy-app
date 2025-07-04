# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo Router template project featuring iOS-style form components. Originally created by Evan Bacon from the Expo team, it provides a comprehensive UI component library that mimics Apple's settings app design patterns.

## Development Commands
AlWAYS USE BUN or BUNX COMMAND

## Commands

### Development
- `bun expo start` - Start Expo development server
- `bun expo start --tunnel` - Start with tunnel for testing on physical devices
- `bun expo start --clear` - Start with cache cleared
- `bun expo prebuild` - Generate native iOS/Android projects
- `bun expo run:ios` - Run on iOS simulator
- `bun expo run:android` - Run on Android emulator

### Convex Backend
- `bunx convex dev` - Start Convex development server
- `bunx convex deploy` - Deploy backend to production
- `bunx convex dashboard` - Open Convex dashboard in browser
- `bunx convex logs` - View real-time backend logs
- `bunx convex init` - Initialize new Convex project
- `bunx convex env` - Manage environment variables

### Code Quality
- `bun expo install --fix` - Fix package version mismatches
- `bun lint` - Run ESLint
- `bun lint:fix` - Run ESLint with auto-fix
- `bun type-check` - Run TypeScript type checking
- `bun format` - Format code with Prettier

### Build & Deploy
- `bunx eas build --platform ios` - Build for iOS using EAS
- `bunx eas build --platform android` - Build for Android using EAS
- `bunx eas build --platform all` - Build for both platforms
- `bunx eas submit` - Submit to app stores
- `bunx eas update` - Push OTA updates

### OpenAI Integration
- `bun test:openai` - Test OpenAI API connection
- `bun openai:models` - List available OpenAI models


## Architecture Overview

### Navigation Structure
- **Root Layout**: `/src/app/_layout.tsx` - Sets up theme provider, font loading, and tab navigation
- **Tab Navigation**: Two main tabs - Home `(index)` and Info `(info)`
- **Stack Navigation**: Uses custom `Stack` component that wraps Expo Router with iOS-style headers
- **Modal Support**: Custom modal navigator with native iOS bottom sheets and web-compatible drawer (vaul)

### Component Architecture
- **Form Components** (`/src/components/ui/Form.tsx`): Core form system with sections, items, links, toggles, date pickers
- **Theme System** (`/src/components/ui/ThemeProvider.tsx`): Automatic dark/light mode with Apple color system
- **Platform-Specific**: Components have `.ios.tsx`, `.web.tsx` variants for platform optimization

### Key Technical Decisions
- **React 19 + React Compiler**: Enabled for performance optimization
- **SVG Handling**: Custom Metro transformer converts SVGs to React components
- **SF Symbols**: Custom `Image` component (`/src/components/ui/img.tsx`) supports `sf:` prefix for Apple icons
- **Path Aliases**: Use `@/` to import from `src/` directory
- **Fonts**: Suspense-based font loading system with custom `AsyncFont` component

### Form Component Patterns
```tsx
// Basic form structure
<Form.List navigationTitle="Title">
  <Form.Section title="Section">
    <Form.Text>Item</Form.Text>
    <Form.Link href="/path">Link</Form.Link>
    <Form.Toggle value={state} onValueChange={setState}>Toggle</Form.Toggle>
  </Form.Section>
</Form.List>
```

### Important Implementation Notes
- All form items must be direct children of `Form.Section`
- Use `@bacons/apple-colors` for P3 color support
- Bottom sheets require `sheet` prop on Stack.Screen
- Toast notifications use `sonner-native`
- No test framework is currently configured

## Project-Specific Conventions
- Prefer editing existing components over creating new files
- Follow iOS design patterns for consistency
- Use platform-specific file extensions when behavior differs
- Keep components modular for easy extraction to other projects

## Architecture

This is an Expo React Native application using Convex as the backend and storage, Clerk for authentication, Superwall for payments, and OpenAI for AI-powered chat features.

### Project Structure
- `/app` - Main application screens using Expo Router
  - `(auth)` - Authentication screens managed by Clerk
  - `(tabs)` - Main tab navigation screens
  - `chat` - AI chat interface screens
  - `paywall` - Superwall paywall screens
- `/components` - Reusable UI components
- `/convex` - Convex backend functions and schema
  - `schema.ts` - Database schema definitions
  - `mutations.ts` - Data mutation functions
  - `queries.ts` - Data query functions
  - `actions.ts` - External API actions (OpenAI)
- `/hooks` - Custom React hooks
- `/utils` - Utility functions and constants

### Key Features
- **Authentication** via Clerk with multiple providers (Google, Apple, Email)
- **Real-time Database & Storage** using Convex with automatic reactivity
- **Payment Processing** through Superwall with native paywall experiences
- **AI Chat** powered by OpenAI GPT models via Convex actions
- **Cross-platform** iOS and Android support with Expo

### Data Flow
1. User authentication handled by Clerk with secure sessions
2. Real-time data sync between client and Convex backend/storage
3. Superwall manages subscription states and paywall presentation
4. OpenAI API provides chat completions via Convex actions
5. All data mutations trigger automatic UI updates via Convex reactivity

### Environment Variables Required
- `EXPO_PUBLIC_CONVEX_URL` - Convex deployment URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key (backend only)
- `OPENAI_API_KEY` - OpenAI API key (backend only)
- `SUPERWALL_PUBLIC_API_KEY` - Superwall public API key
- `CONVEX_DEPLOY_KEY` - Convex deployment key for CI/CD

### Mobile-Specific Considerations
- Use `expo-secure-store` for sensitive data storage
- Implement proper keyboard handling for chat interface
- Configure SuperwallKit for native iOS/Android paywall experiences
- Handle network connectivity changes gracefully
- Optimize for both iOS and Android design patterns
- Use Clerk's React Native SDK for seamless authentication

### Backend Functions (Convex)
- **Queries** for reading data with automatic reactivity
- **Mutations** for writing data with optimistic updates
- **Actions** for external API calls (OpenAI) and file storage
- **HTTP Actions** for webhooks and external integrations

### Authentication Flow (Clerk)
# Add Clerk to React (Vite)

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Clerk](https://clerk.com/) into a React application.
**Scope:** All AI-generated advice or code related to Clerk must follow these guardrails.

## **1. OFFICIAL CLERK + REACT (VITE) SETUP**

1. Create a React + Vite project.
2. Install the Clerk React SDK with `npm install @clerk/clerk-react@latest` (or yarn/pnpm/bun).
3. Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` or `.env`. Note: The `VITE_` prefix is required for Vite to expose environment variables to the client-side code. `.env.local` is preferred for local development secrets.
4. Wrap the app in <ClerkProvider publishableKey={...}> within `main.tsx` or `main.jsx`.
5. Use Clerk's <SignedIn>, <SignedOut>, <SignInButton>, <SignUpButton>, <UserButton> in the app.

### **Correct, Up-to-Date Quickstart Code Examples**

```bash
# 1. Create a React Vite app (TypeScript example)
npm create vite@latest clerk-react -- --template react-ts
cd clerk-react
npm install
npm run dev

# 2. Install the Clerk React SDK
npm install @clerk/clerk-react@latest

# 3. In .env.local (or .env):
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dGhvcm91Z2gtZmVsaW5lLTk5LmNsZXJrLmFjY291bnRzLmRldiQ

NOTE: This key is real and is injected dynamically into this prompt. It is NOT a placeholder and is ready to use.
```

```typescript
// 4. Wrap with <ClerkProvider> in main.tsx or main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Ensure your index.html contains a <div id="root"></div> element for React to mount the app.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

// 5. Example usage of Clerk's prebuilt components in App.tsx
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export default function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

> Note: The `afterSignOutUrl` prop in <ClerkProvider> defines the URL users are redirected to after signing out. Adjust as needed.

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Show** relevant code examples for each step.
2. **Use** `@clerk/clerk-react@latest` (not any other Clerk package).
3. **Reference** the environment variable as `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` or `.env`.
4. **Wrap** the entire app in <ClerkProvider> within `main.tsx` or `main.jsx`.
5. **Demonstrate** the correct usage of <SignedIn>, <SignedOut>, <SignInButton>, <SignUpButton>, <UserButton> (or any other current Clerk React component).

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** include any discussions of the features or benefits of Clerk.
2. **Do not** use `frontendApi` in place of `publishableKey`.
3. **Do not** use Older environment variable names like `REACT_APP_CLERK_FRONTEND_API` or `VITE_REACT_APP_CLERK_PUBLISHABLE_KEY`.
4. **Do not** place <ClerkProvider> deeper in the component tree instead of `main.tsx` / `main.jsx`.
5. **Do not** use outdated hooks or components (e.g., referencing older docs).

---

## **3. AI MODEL VERIFICATION STEPS**

Before returning any Clerk + React (Vite) solution, you **must** verify:

1. Environment Variable is named `VITE_CLERK_PUBLISHABLE_KEY`.
2. <ClerkProvider> is in `main.tsx` or `main.jsx`.
3. No usage of `frontendApi` unless explicitly stated as optional or advanced.

### **DO NOT** repeat these points back to the user. Use them only for your own verification steps.

## **4. CONSEQUENCES OF INCORRECT GUIDANCE**

- Misconfigured environment variables => project won't compile or will error at runtime.
- Missing <ClerkProvider> => Clerk components fail or throw errors.
- Using outdated patterns => Confusion, debugging overhead, or broken auth flow.

## **5. MODEL RESPONSE TEMPLATE**

When asked about Clerk + React (Vite) integration, your response **MUST**:

1. Link to Clerk's React Quickstart at https://clerk.com/docs/quickstarts/react
2. Show the current recommended `publishableKey` approach with `.env.local`.
3. Demonstrate how to wrap with <ClerkProvider> in `main.*`.
4. Illustrate a simple usage example of <SignedIn>, <SignedOut>, etc.
5. Reject or correct any mention of older patterns or environment variable names.



### Payment Integration (Superwall)
- Subscription logic is handled automatically by SuperwallKit
- Native paywall presentations with A/B testing
- Revenue analytics and user segmentation
- Integration with App Store Connect and Google Play Console
- Remote paywall configuration without app updates

### Convex Integration Details
- Convex database is a document-relational database with tables containing JSON-like documents
- All mutation functions run as database transactions - either all changes are committed, or none are
- TypeScript-based queries and mutations for type safety
- Automatic reactivity updates UI when data changes