# Nafsy Chat Features - Implementation Todo List

## Overview
This todo list follows the LEVER framework (Leverage, Extend, Verify, Eliminate, Reduce) to implement chat features with minimal code and maximum reuse.

## Pre-Implementation Analysis ✅

### Existing Components to Leverage:
1. **FloatingChatMode.tsx** - Already handles animations, keyboard, messages
2. **TypingIndicator.tsx** - Reusable typing animation component  
3. **Message bubbles** in index.tsx - Can be extended with reactions
4. **GenericList pattern** - Can create if needed for virtualization
5. **useTranslation hook** - Already handles Arabic/English
6. **Convex real-time** - Existing patterns for queries/mutations

### Extension Opportunities:
- Add props to existing components instead of creating new ones
- Enhance existing Convex functions rather than duplicating
- Use conditional rendering for new features

## High Priority Tasks 🔴

### 1. Quick Reply Suggestions (Week 1)
- [ ] **LEVER Analysis**: Can extend FloatingChatMode's input area
- [ ] Add `quickReplies` prop to existing chat components
- [ ] Create ONE new component: `QuickReplySuggestions.tsx` (50 lines max)
  ```typescript
  // Reuse existing styles and animations
  interface QuickReplySuggestionsProps {
    suggestions: string[]
    onSelect: (text: string) => void
    mode: 'floating' | 'traditional'
  }
  ```
- [ ] Extend `convex/ai.ts` with `generateQuickReplies` action (30 lines)
- [ ] Add conditional rendering in both chat modes
- [ ] Reuse existing theme colors and animations

### 2. Message Pagination (Week 1)
- [ ] **LEVER Analysis**: Extend existing query, no new components needed
- [ ] Modify `getConversationMessages` query to add cursor support
  ```typescript
  // Add to existing query
  args: {
    conversationId: v.id("conversations"),
    cursor: v.optional(v.string()),
    limit: v.number()
  }
  ```
- [ ] Update existing FlatList with these optimizations:
  ```typescript
  // Add to existing FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ```
- [ ] Add `loadMore` function to existing chat screen (20 lines)
- [ ] No new components needed - just enhance existing

### 3. Message Reactions (Week 1-2)
- [ ] **LEVER Analysis**: Extend message bubble, no new screen
- [ ] Add `reactions` field to message schema
- [ ] Extend existing message bubble with reaction display:
  ```typescript
  // Add to existing bubble
  {message.reactions && (
    <View style={styles.reactions}>
      {/* Reuse existing styles */}
    </View>
  )}
  ```
- [ ] Create `addReaction` mutation in existing messages.ts (20 lines)
- [ ] Add long-press handler to existing bubble component
- [ ] Use React Native's built-in Animated for micro-animations

### 4. Crisis Detection Enhancement (Week 1)
- [ ] **LEVER Analysis**: Enhance existing sendMessage action
- [ ] Add keyword patterns to existing emergency check
- [ ] Extend sentiment analysis in existing flow
- [ ] No new components - enhance existing logic

## Medium Priority Tasks 🟡

### 5. Conversation Search (Week 2)
- [ ] **LEVER Analysis**: Can add to existing chat screen header
- [ ] Add search mode to existing chat screen state
- [ ] Create `searchMessages` query in messages.ts (30 lines)
- [ ] Conditionally show search UI in existing header:
  ```typescript
  // Toggle existing header content
  {isSearchMode ? <SearchBar /> : <Text>Chat</Text>}
  ```
- [ ] Reuse existing message list for results
- [ ] Highlight matches with existing Text styles

### 6. Export Conversation (Week 2-3)
- [ ] **LEVER Analysis**: Action only, no new UI needed
- [ ] Create `exportConversation` action in conversations.ts
- [ ] Add export button to existing chat header
- [ ] Generate formats using existing message data
- [ ] Use React Native Share API (built-in)

### 7. Smart Notifications (Week 3)
- [ ] **LEVER Analysis**: Backend only, reuse existing patterns
- [ ] Add scheduled function to existing Convex backend
- [ ] Reuse existing user activity tracking
- [ ] No frontend changes needed initially

## Low Priority Tasks 🟢

### 8. Voice Messages (Week 4)
- [ ] **LEVER Analysis**: Extend input component
- [ ] Add voice button to existing input area
- [ ] Use expo-av (already in Expo SDK)
- [ ] Extend existing message schema with audioUrl
- [ ] Reuse existing upload patterns

### 9. Message Threading (Week 4-5)
- [ ] **LEVER Analysis**: Extend existing message structure
- [ ] Add threadId to message schema
- [ ] Conditionally show thread indicator in bubble
- [ ] Reuse existing message list for thread view

### 10. Analytics Dashboard (Week 5-6)
- [ ] **LEVER Analysis**: Can extend profile screen
- [ ] Add insights section to existing profile tab
- [ ] Reuse existing mood tracking queries
- [ ] Use existing chart components or React Native SVG

## Performance & Quality Tasks 🔧

### 11. Performance Optimization
- [ ] Test with 1000+ messages using existing components
- [ ] Add indexes to Convex schema (backend only)
- [ ] Implement message caching using React Query patterns
- [ ] Profile using React DevTools Profiler

### 12. Accessibility
- [ ] Add accessibility labels to existing components
- [ ] Test with VoiceOver on existing screens
- [ ] Ensure existing RTL support works with new features

## Code Reduction Tracking 📊

| Feature | Traditional Approach | LEVER Approach | Reduction |
|---------|---------------------|----------------|-----------|
| Quick Replies | 200 lines (new component) | 80 lines (extend existing) | 60% |
| Pagination | 150 lines (new list) | 50 lines (enhance FlatList) | 67% |
| Reactions | 300 lines (new UI) | 100 lines (extend bubble) | 67% |
| Search | 400 lines (new screen) | 120 lines (mode toggle) | 70% |
| Export | 200 lines (new modal) | 80 lines (action only) | 60% |
| **Total** | **1250 lines** | **430 lines** | **66% reduction** |

## Implementation Rules 📋

1. **Before creating ANY new component**:
   - Can I add props to an existing component?
   - Can I use conditional rendering?
   - Can I compose existing components?

2. **For each feature**:
   - Start with 15 minutes of pattern analysis
   - Find all similar existing code
   - Design with maximum reuse
   - Document why extensions were chosen

3. **Component creation criteria**:
   - Only if no existing component can be extended
   - Must be reusable across features
   - Must follow existing patterns
   - Maximum 100 lines per component

4. **Testing approach**:
   - Test extensions in existing test suites
   - No new test files unless absolutely necessary
   - Focus on integration over unit tests

## Weekly Review Checklist ✅

### Week 1 Review:
- [ ] Quick replies working in both modes?
- [ ] Pagination smooth with 1000+ messages?
- [ ] Reactions added without new screens?
- [ ] Crisis detection enhanced?
- [ ] Code addition < 200 lines total?

### Week 2 Review:
- [ ] Search using existing UI patterns?
- [ ] Export working without new modals?
- [ ] Performance metrics acceptable?
- [ ] Bundle size increase < 5%?

### Success Metrics:
- [ ] 70%+ code reuse achieved
- [ ] No performance degradation
- [ ] All features work in both chat modes
- [ ] Arabic/RTL fully supported
- [ ] Accessibility standards met

## Notes
- Prioritize extending FloatingChatMode and existing chat screen
- Every new file needs strong justification
- Prefer props and composition over new components
- Test on actual iOS devices frequently
- Document all extension decisions

---
Created: 2025-01-05
Based on: CHAT_FEATURES_PLAN.md + optimization-principles.md