# Nafsy Chat Features - Implementation Plan

## Overview
This document outlines the implementation plan for Phase 2, Section 2 chat features, focusing on creating a high-quality, mental health-aware chat experience.

## Core Principles
1. **Mental Health First**: Every feature should enhance therapeutic value
2. **Performance**: Smooth experience even with large conversation histories
3. **Accessibility**: Full support for Arabic/English, RTL, and screen readers
4. **Privacy**: User data protection and optional anonymization
5. **Quality**: Polished interactions with thoughtful micro-animations

## Feature Implementation Plan

### 1. Quick Reply Suggestions (Priority: High)
**Goal**: Provide contextually relevant response options to reduce cognitive load during difficult moments.

#### Implementation Details:
```typescript
// Frontend: QuickReplySuggestions.tsx
interface QuickReply {
  id: string;
  text: string;
  icon?: string; // SF Symbol
  sentiment: 'positive' | 'neutral' | 'supportive';
}

// Features:
- 3-4 contextual suggestions based on:
  - Current conversation topic
  - User's emotional state
  - Time of day / user patterns
  - Previous effective responses

// UI Design:
- Traditional mode: Chips above keyboard
- Floating mode: Small cloud bubbles around input
- Smooth fade-in animation
- Haptic feedback on selection
```

#### Backend Requirements:
- New action: `generateQuickReplies` in `ai.ts`
- Cache frequent suggestions for performance
- Track usage analytics for improvement

### 2. Message History with Pagination (Priority: High)
**Goal**: Efficiently handle long conversations without performance degradation.

#### Implementation Details:
```typescript
// Convex: Enhanced pagination
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    cursor: v.optional(v.string()), // For pagination
    limit: v.number(), // Default: 50
  },
  returns: {
    messages: v.array(messageSchema),
    nextCursor: v.optional(v.string()),
    hasMore: v.boolean(),
  }
});

// Frontend: Infinite scroll
- Virtual list rendering for performance
- Load more on scroll threshold
- Skeleton loading states
- Jump to bottom FAB
- Date separators
```

#### Performance Optimizations:
- Index messages by conversation + timestamp
- Implement message caching layer
- Lazy load older messages
- Compress message content for storage

### 3. Conversation Search (Priority: Medium)
**Goal**: Help users find important moments and track progress over time.

#### Implementation Details:
```typescript
// Search Features:
interface SearchFilters {
  query: string;
  dateRange?: { start: Date; end: Date };
  sentiment?: 'positive' | 'negative' | 'neutral';
  hasAudio?: boolean;
  starred?: boolean;
}

// UI Components:
- SearchBar with filters dropdown
- Search results with context preview
- Highlight matching terms
- Quick actions (star, share, delete)
```

#### Search Capabilities:
- Full-text search across messages
- Filter by date, sentiment, keywords
- Search within specific conversations
- Save frequent searches
- Export search results

### 4. Export Conversation (Priority: Medium)
**Goal**: Allow users to save conversations for therapy sessions or personal records.

#### Implementation Details:
```typescript
// Export Formats:
type ExportFormat = 'pdf' | 'txt' | 'json' | 'therapeutic-summary';

// Export Options:
interface ExportOptions {
  format: ExportFormat;
  includeTimestamps: boolean;
  includeSentiment: boolean;
  anonymize: boolean; // Remove personal details
  dateRange?: DateRange;
  includeAIInsights: boolean;
}

// Therapeutic Summary:
- Key themes discussed
- Emotional journey graph
- Progress indicators
- Coping strategies used
- AI recommendations summary
```

#### Privacy Features:
- Optional anonymization
- Selective message export
- Watermark with export date
- Secure temporary download links

### 5. Message Reactions/Feedback (Priority: High)
**Goal**: Improve AI responses through user feedback and create emotional connection.

#### Implementation Details:
```typescript
// Reaction System:
interface MessageReaction {
  messageId: string;
  userId: string;
  type: 'helpful' | 'not-helpful' | 'emoji';
  emoji?: string; // If type is emoji
  feedback?: string; // Optional text feedback
}

// Quick Reactions:
- 👍 Helpful
- 👎 Not helpful
- ❤️ Comforting
- 💡 Insightful
- 🎯 Accurate
```

#### Feedback Loop:
- Store reactions in database
- Analyze patterns for AI improvement
- Show reaction stats to user (optional)
- Use feedback for personalization

## Additional Quality Improvements

### 6. Voice Message Support (Already Planned)
**Enhanced Implementation**:
```typescript
// Features:
- Press and hold to record
- Visual waveform while recording
- Playback speed control
- Automatic transcription
- Language detection
- Background noise reduction
```

### 7. Crisis Detection System (Already Planned)
**Enhanced Implementation**:
```typescript
// Multi-layer Detection:
1. Keyword matching (immediate)
2. Sentiment analysis trends
3. Behavioral patterns (message frequency, time)
4. AI context understanding

// Response Levels:
- Gentle check-in
- Resource suggestions
- Crisis hotline promotion
- Emergency contact alert
```

### 8. Message Threading
**Goal**: Organize related messages for better context.

```typescript
// Features:
- Reply to specific messages
- Thread view for conversations
- Collapse/expand threads
- Thread summaries
```

### 9. Conversation Insights Dashboard
**Goal**: Help users track their mental health journey.

```typescript
// Analytics:
- Mood trends over time
- Common topics discussed
- Progress indicators
- Coping strategies effectiveness
- Weekly/monthly summaries
```

### 10. Smart Notifications
**Goal**: Supportive check-ins without being intrusive.

```typescript
// Features:
- Personalized timing based on user patterns
- Mood-based check-ins
- Milestone celebrations
- Gentle reminders for exercises
- Do not disturb settings
```

## Technical Architecture Updates

### Database Schema Enhancements:
```typescript
// messages table additions
{
  audioUrl: v.optional(v.string()),
  threadId: v.optional(v.id("threads")),
  reactions: v.array(reactionSchema),
  edited: v.optional(v.boolean()),
  editedAt: v.optional(v.float64()),
}

// New tables
defineTable("quickReplies", {
  text: v.string(),
  language: v.string(),
  category: v.string(),
  usageCount: v.number(),
  effectiveness: v.number(),
});

defineTable("searchHistory", {
  userId: v.id("users"),
  query: v.string(),
  filters: v.any(),
  timestamp: v.float64(),
});
```

### Performance Optimizations:
1. **Implement Redis caching** for:
   - Frequent quick replies
   - Recent messages
   - User preferences

2. **Add database indexes**:
   - messages.conversationId + timestamp
   - messages.userId + sentiment
   - messages.content (full-text)

3. **Optimize AI calls**:
   - Batch quick reply generation
   - Cache common responses
   - Implement response streaming

### UI/UX Enhancements:
1. **Micro-interactions**:
   - Haptic feedback on actions
   - Smooth transitions between states
   - Loading skeletons
   - Pull-to-refresh

2. **Accessibility**:
   - Full VoiceOver support
   - Keyboard navigation
   - High contrast mode
   - Text size preferences

3. **Error Handling**:
   - Graceful degradation
   - Offline queue for messages
   - Retry mechanisms
   - Clear error messages

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Message pagination backend
- [ ] Virtual list implementation
- [ ] Basic search infrastructure
- [ ] Reaction system backend

### Week 3-4: Core Features
- [ ] Quick reply suggestions
- [ ] Search UI and filters
- [ ] Export functionality
- [ ] Voice message recording

### Week 5-6: Polish & Testing
- [ ] Performance optimization
- [ ] Accessibility testing
- [ ] Arabic/RTL testing
- [ ] Crisis detection refinement

### Week 7-8: Advanced Features
- [ ] Conversation insights
- [ ] Smart notifications
- [ ] Message threading
- [ ] Final polish and testing

## Success Metrics
1. **Performance**: <100ms message send time, <50ms UI response
2. **Engagement**: 70%+ quick reply usage, 50%+ reaction rate
3. **Retention**: 80%+ users export conversations
4. **Satisfaction**: 4.5+ star rating on chat experience
5. **Safety**: 100% crisis keywords detected and handled

## Testing Strategy
1. **Unit Tests**: All new Convex functions
2. **Integration Tests**: Chat flow scenarios
3. **Performance Tests**: 1000+ message conversations
4. **Accessibility Tests**: VoiceOver, TalkBack
5. **User Testing**: 20+ beta testers (Arabic & English)

## Notes
- Prioritize mental health value over feature complexity
- Every feature should work seamlessly in both chat modes
- Maintain simplicity - don't overwhelm vulnerable users
- Ensure all features respect user privacy and cultural sensitivities

---
Created: 2025-01-05
Last Updated: 2025-01-05