# AI-Powered Memory Architecture for Mental Health Chat App

## Overview

This document outlines the architecture for building a persistent user memory system within an AI-powered mental health coaching app.

## Stack

- **Frontend:** React Native (Expo)
- **Backend:** Convex (for database & serverless functions)
- **Authentication:** Clerk
- **AI Models:**
  - **Main Chat Model:** GPT-4o via OpenAI
  - **Summarization Model:** Smaller GPT model (GPT-4o-mini)
  - **Embedding Model:** OpenAI Embeddings (e.g., `text-embedding-3-small`)

---

## System Goals

- Persist conversations and summaries per user.
- Summarize each session post-chat to extract key user info.
- Store and retrieve summaries to act as user "memory".
- Allow the AI to reference memory in new sessions.
- Cloud-based, syncing across devices.

---

## Key Components

### 1. Database Schema (Convex)

- **Users Table:**
  - `userId` (Clerk ID)
  - `userProfile` (optional metadata)

- **Conversations Table:**
  - `userId`
  - `sessionId`
  - `messages` (full chat transcript - optional)
  - `summary` (condensed conversation summary)
  - `embedding` (vector embedding of the summary for semantic search)
  - `timestamp`

---

### 2. Workflow

#### Chat Session

1. User logs in via Clerk.
2. App fetches user memory summary from Convex.
3. Inject memory summary into the system prompt for GPT-4o chat.
4. User chats with GPT-4o in real-time.

#### Post-Session Processing

1. After session ends, send the transcript to summarization model (GPT-4o-mini).
2. Summarize:
   - Key topics.
   - Emotional tone.
   - User preferences or concerns.

3. Save summary & optional embedding to Convex.

#### Memory Retrieval

- On every new session:
  - Fetch latest summary.
  - (Optional) Use embedding to retrieve most relevant past summaries.
  - Prepend memory data to system prompt.

---

## Models Used

### Main Chat Model

- **Purpose:** Live interaction.
- **Suggested Models:** GPT-4o.

### Summarization & Analysis Model

- **Purpose:** Summarize & extract user state.
- **Suggested Models:** GPT-4o-mini.

### Embedding Model

- **Purpose:** Vectorize summaries for semantic search.
- **Suggested Model:** OpenAI `text-embedding-3-small`.

---

## Prompt Strategy

### Summarization Prompt Example

"Summarize this conversation, focusing on user concerns, emotional state, preferences, and goals. Keep it concise."

### Chat Session System Prompt Example

"You are an AI mental health coach. Here is information about the user from past sessions: {userMemory}. Use this to personalize your responses."

---

## Advantages

- Efficient: Only summaries stored for long-term memory.
- Scalable: Embeddings enable fast similarity search.
- Personalized: AI maintains continuity between sessions.

---

## Optional Enhancements

- Incremental summarization after every message.
- Sentiment analysis with specialized models.
- User dashboard for memory editing or review.

---

## Next Steps

1. Define Convex schema.
2. Set up summarization and embedding pipelines.
3. Build post-session summarization flow.
4. Integrate memory injection into chat prompts.
5. Optimize embedding-based retrieval if needed.

---

## References

- LangChain ConversationSummaryMemory
- Convex Agents & Embeddings
- Pinecone Conversational Memory Guide
