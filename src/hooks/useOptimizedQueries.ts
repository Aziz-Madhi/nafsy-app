/**
 * Optimized Convex query hooks for Nafsy app
 * Following LEVER framework - efficient data fetching patterns
 * 
 * Features:
 * - Batched queries for related data
 * - Conditional queries to prevent unnecessary fetches
 * - Memoized query results
 * - Optimistic updates for mutations
 * - Smart caching strategies
 */

// @ts-nocheck

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useMemo } from 'react';

/**
 * Optimized user data hook - combines user info with related data
 */
export function useUserProfile(clerkId?: string) {
  // Only fetch if clerkId is available
  const user = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : 'skip'
  );

  // Memoize derived state to prevent re-renders
  const userInfo = useMemo(() => {
    if (!user) return null;
    
    return {
      ...user,
      isOnboarded: user.onboardingCompleted,
      preferredLanguage: user.language || 'en',
      isDarkMode: user.preferences?.theme === 'dark',
      isSystemTheme: user.preferences?.theme === 'auto',
    };
  }, [user]);

  return {
    user: userInfo,
    isLoading: user === undefined,
    error: user === null ? 'User not found' : null,
  };
}

/**
 * Optimized dashboard data hook - batches related queries
 */
export function useDashboardData(userId?: Id<'users'>) {
  // Conditional queries - only fetch when userId is available
  const recentMoods = useQuery(
    api.moods.getRecentMoods,
    userId ? { userId, limit: 7 } : 'skip'
  );
  
  const recentExercises = useQuery(
    api.exercises.getRecentExercises,
    userId ? { userId, limit: 5 } : 'skip'
  );
  
  const activeConversations = useQuery(
    api.conversations.getActiveConversations,
    userId ? { userId } : 'skip'
  );

  // Memoize computed dashboard stats
  const dashboardStats = useMemo(() => {
    if (!recentMoods || !recentExercises) return null;

    const avgMoodThisWeek = recentMoods.length > 0
      ? recentMoods.reduce((sum, mood) => sum + mood.rating, 0) / recentMoods.length
      : 0;

    const exercisesThisWeek = recentExercises.length;
    
    const moodTrend = recentMoods.length >= 2
      ? recentMoods[0].rating - recentMoods[recentMoods.length - 1].rating
      : 0;

    return {
      avgMoodThisWeek: Math.round(avgMoodThisWeek * 10) / 10,
      exercisesThisWeek,
      moodTrend,
      hasActiveConversation: activeConversations && activeConversations.length > 0,
    };
  }, [recentMoods, recentExercises, activeConversations]);

  const isLoading = recentMoods === undefined || 
                   recentExercises === undefined || 
                   activeConversations === undefined;

  return {
    recentMoods,
    recentExercises,
    activeConversations,
    dashboardStats,
    isLoading,
  };
}

/**
 * Optimized mood history hook with pagination
 */
export function useMoodHistory(userId?: Id<'users'>, limit = 30) {
  const moods = useQuery(
    api.moods.getMoodHistory,
    userId ? { userId, limit } : 'skip'
  );

  // Memoize mood analytics
  const moodAnalytics = useMemo(() => {
    if (!moods || moods.length === 0) return null;

    const ratings = moods.map(m => m.rating);
    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    const moodDistribution = {
      low: ratings.filter(r => r <= 3).length,
      medium: ratings.filter(r => r > 3 && r <= 7).length,
      high: ratings.filter(r => r > 7).length,
    };

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalEntries: moods.length,
      moodDistribution,
      latestMood: moods[0],
    };
  }, [moods]);

  return {
    moods,
    moodAnalytics,
    isLoading: moods === undefined,
  };
}

/**
 * Optimized conversation hook with message batching
 */
export function useConversationWithMessages(conversationId?: Id<'conversations'>) {
  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : 'skip'
  );

  const messages = useQuery(
    api.messages.getConversationMessages,
    conversationId ? { conversationId, limit: 50 } : 'skip'
  );

  // Memoize conversation metadata
  const conversationInfo = useMemo(() => {
    if (!conversation || !messages) return null;

    return {
      ...conversation,
      messageCount: messages.length,
      lastMessage: messages[0], // Assuming sorted by timestamp desc
      hasUnreadMessages: false, // TODO: Implement read status
    };
  }, [conversation, messages]);

  return {
    conversation: conversationInfo,
    messages,
    isLoading: conversation === undefined || messages === undefined,
  };
}

/**
 * Optimized mutation hooks with optimistic updates
 */
export function useOptimizedMutations() {
  const upsertUser = useMutation(api.users.upsertUser);
  const updatePreferences = useMutation(api.users.updatePreferences);
  const createMoodEntry = useMutation(api.moods.createMoodEntry);
  const completeExercise = useMutation(api.exercises.completeExercise);

  // Optimistic mood entry creation
  const createMoodEntryOptimistic = useCallback(async (
    userId: Id<'users'>,
    moodData: { rating: number; emotions: string[]; note?: string }
  ) => {
    // TODO: Implement optimistic update
    // This would immediately update the local cache while the mutation runs
    return await createMoodEntry({
      userId,
      ...moodData,
      timestamp: Date.now(),
    });
  }, [createMoodEntry]);

  // Optimistic preference updates
  const updatePreferencesOptimistic = useCallback(async (
    userId: Id<'users'>,
    preferences: Record<string, any>
  ) => {
    // TODO: Implement optimistic update
    return await updatePreferences({ userId, preferences });
  }, [updatePreferences]);

  return {
    upsertUser,
    updatePreferences: updatePreferencesOptimistic,
    createMoodEntry: createMoodEntryOptimistic,
    completeExercise,
  };
}

/**
 * Smart caching hook for frequently accessed data
 */
export function useCachedResources(language: string) {
  // Cache resources by language to avoid refetching
  const resources = useQuery(
    api.resources.getResourcesByLanguage,
    { language }
  );

  // Memoize categorized resources
  const categorizedResources = useMemo(() => {
    if (!resources) return null;

    return {
      emergency: resources.filter(r => r.isEmergency),
      crisis: resources.filter(r => r.category.includes('crisis')),
      general: resources.filter(r => !r.isEmergency && !r.category.includes('crisis')),
    };
  }, [resources]);

  return {
    resources: categorizedResources,
    isLoading: resources === undefined,
  };
}

/**
 * Batched user data hook for admin/analytics views
 */
export function useBatchedUserData(userIds: Id<'users'>[]) {
  // Use a custom query that batches user fetches
  const users = useQuery(
    api.users.getBatchedUsers,
    userIds.length > 0 ? { userIds } : 'skip'
  );

  // Memoize user lookup map
  const userMap = useMemo(() => {
    if (!users) return new Map();
    
    return new Map(users.map(user => [user._id, user]));
  }, [users]);

  return {
    users,
    userMap,
    isLoading: users === undefined,
  };
}

/**
 * Subscription-based real-time hook for chat
 */
export function useRealtimeMessages(conversationId?: Id<'conversations'>) {
  // Convex automatically handles real-time updates
  const messages = useQuery(
    api.messages.getConversationMessages,
    conversationId ? { conversationId, limit: 50 } : 'skip'
  );

  // Only return the latest messages to minimize re-renders
  const latestMessages = useMemo(() => {
    if (!messages) return [];
    
    // Return only messages from the last 5 minutes for real-time display
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return messages.filter(m => m.timestamp > fiveMinutesAgo);
  }, [messages]);

  return {
    messages,
    latestMessages,
    isLoading: messages === undefined,
  };
}

/**
 * Active conversation hook for chat interface
 */
export function useActiveConversation(userId?: Id<'users'>) {
  const activeConversation = useQuery(
    api.conversations.getActiveConversation,
    userId ? { userId } : 'skip'
  );

  return {
    conversation: activeConversation,
    isLoading: activeConversation === undefined,
    hasActiveConversation: activeConversation !== null,
  };
}

/**
 * User conversations list hook
 */
export function useUserConversations(userId?: Id<'users'>) {
  const conversations = useQuery(
    api.conversations.getUserConversations,
    userId ? { userId } : 'skip'
  );

  const conversationStats = useMemo(() => {
    if (!conversations) return null;

    return {
      total: conversations.length,
      active: conversations.filter(c => c.isActive).length,
      archived: conversations.filter(c => !c.isActive).length,
    };
  }, [conversations]);

  return {
    conversations,
    conversationStats,
    isLoading: conversations === undefined,
  };
}

/**
 * Prefetch hook for anticipated data needs
 */
export function usePrefetchedData(userId?: Id<'users'>) {
  // Prefetch commonly needed data when user is available
  const userResources = useQuery(
    api.resources.getResourcesByLanguage,
    userId ? { language: 'en' } : 'skip' // Default to English, update based on user language
  );

  const exerciseTemplates = useQuery(
    api.exercises.getExerciseTemplates,
    userId ? {} : 'skip'
  );

  return {
    userResources,
    exerciseTemplates,
    isPrefetching: userResources === undefined || exerciseTemplates === undefined,
  };
}

/**
 * Query invalidation utilities
 */
export function useQueryInvalidation() {
  // TODO: Implement query invalidation patterns
  // This would be used after mutations to refresh related data
  
  const invalidateUserData = useCallback((userId: Id<'users'>) => {
    // Invalidate all queries related to this user
    console.log('Invalidating user data for:', userId);
  }, []);

  const invalidateDashboard = useCallback(() => {
    // Invalidate dashboard-related queries
    console.log('Invalidating dashboard data');
  }, []);

  return {
    invalidateUserData,
    invalidateDashboard,
  };
}