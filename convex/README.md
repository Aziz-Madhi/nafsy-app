# Convex Backend for Nafsy App

This directory contains all the backend functions for the Nafsy mental wellness app.

## Setup

1. Make sure you have the Convex CLI installed and logged in
2. Run `bunx convex dev` to start the development server
3. The `_generated` directory will be created automatically

## Schema Overview

- **users**: User profiles and preferences
- **conversations**: Chat sessions
- **messages**: Individual chat messages  
- **moods**: Daily mood tracking entries
- **exercises**: Completed therapeutic exercises
- **goals**: User goals (for future features)
- **emergencyContacts**: User's personal emergency contacts
- **resources**: Mental health resources and crisis hotlines

## Key Functions

### Users
- `upsertUser`: Create/update user from Clerk auth
- `completeOnboarding`: Mark onboarding complete
- `getUserByClerkId`: Get user by auth ID

### Conversations & Messages
- `createConversation`: Start new chat session
- `sendMessage`: Send message and get AI response
- `getConversationMessages`: Get chat history

### Mood Tracking
- `recordMood`: Record daily mood entry
- `getUserMoods`: Get mood history
- `getMoodStats`: Get mood statistics and trends

### Exercises
- `recordExercise`: Track exercise completion
- `getExerciseStats`: Get exercise statistics
- `getMostEffectiveExercises`: Find what works best

### AI Integration
- `generateResponse`: Generate AI coach responses
- `suggestExercise`: Recommend exercises based on mood

### Crisis Support
- `getEmergencyResources`: Get crisis hotlines
- `getUserEmergencyContacts`: Get personal contacts

## Environment Variables

Make sure these are set in the Convex dashboard:
- `OPENAI_API_KEY`: For AI responses
- `CLERK_SECRET_KEY`: For auth verification