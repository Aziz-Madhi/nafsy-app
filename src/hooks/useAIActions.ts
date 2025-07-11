/**
 * AI-related action hooks for Nafsy app
 * Following LEVER framework - specialized hooks for AI/external API calls
 */
import { useActionWithState, useDebouncedAction, ActionOptions } from './useActionWithState';
import { api } from '@/convex/_generated/api';

/**
 * Hook for sending chat messages with AI response
 * Usage: const { execute: sendMessage, loading, error } = useSendMessage();
 */
export function useSendMessage(options?: ActionOptions<any>) {
  return useActionWithState(
    api.messages.sendMessage,
    {
      retryAttempts: 2,
      retryDelay: 1000,
      ...options,
    }
  );
}

/**
 * Hook for generating AI chat responses
 * Usage: const { execute: generateResponse, loading, error } = useAIChatResponse();
 */
export function useAIChatResponse(options?: ActionOptions<string>) {
  return useActionWithState(
    api.ai.generateResponse,
    {
      retryAttempts: 2,
      retryDelay: 1000,
      ...options,
    }
  );
}

/**
 * Hook for AI-powered mood analysis
 * Usage: const { execute: analyzeMood, data: analysis } = useMoodAnalysis();
 */
export function useMoodAnalysis(options?: ActionOptions<any>) {
  // TODO: Implement when AI actions are added to Convex
  return useActionWithState(
    {} as any, // api.ai.analyzeMoodEntry - placeholder for future implementation
    {
      retryAttempts: 1,
      retryDelay: 500,
      ...options,
    }
  );
}

/**
 * Hook for generating personalized exercise recommendations
 * Usage: const { execute: getRecommendations } = useExerciseRecommendations();
 */
export function useExerciseRecommendations(options?: ActionOptions<any>) {
  return useActionWithState(
    api.ai.suggestExercise,
    {
      retryAttempts: 1,
      ...options,
    }
  );
}

/**
 * Hook for AI content moderation (safety checks)
 * Usage: const { execute: moderateContent } = useContentModeration();
 */
export function useContentModeration(options?: ActionOptions<{ safe: boolean; reason?: string }>) {
  // TODO: Implement when AI actions are added to Convex
  return useActionWithState(
    {} as any, // api.ai.moderateContent - placeholder for future implementation
    {
      retryAttempts: 0, // No retries for moderation
      ...options,
    }
  );
}

/**
 * Debounced hook for real-time chat suggestions
 * Usage: const { execute: getSuggestions } = useChatSuggestions();
 */
export function useChatSuggestions(delay = 500, options?: ActionOptions<string[]>) {
  // TODO: Implement when AI actions are added to Convex
  return useDebouncedAction(
    {} as any, // api.ai.generateChatSuggestions - placeholder for future implementation
    delay,
    {
      retryAttempts: 0,
      ...options,
    }
  );
}

/**
 * Hook for crisis detection and intervention
 * Usage: const { execute: checkCrisis } = useCrisisDetection();
 */
export function useCrisisDetection(options?: ActionOptions<{ crisis: boolean; resources?: any[] }>) {
  // TODO: Implement when AI actions are added to Convex
  return useActionWithState(
    {} as any, // api.ai.detectCrisis - placeholder for future implementation
    {
      retryAttempts: 2, // Important for safety
      retryDelay: 500,
      ...options,
    }
  );
}

/**
 * Example usage patterns for the mental health app
 */

// In a chat component:
/*
const ChatComponent = () => {
  const { execute: sendMessage, loading, error, data } = useAIChatResponse({
    onSuccess: (response) => {
      // Add AI response to chat
      addMessageToChat({ content: response, sender: 'ai' });
    },
    onError: (error) => {
      // Show fallback message
      showErrorMessage('Sorry, I couldn\'t respond right now. Please try again.');
    }
  });

  const handleUserMessage = async (message: string) => {
    // Add user message immediately
    addMessageToChat({ content: message, sender: 'user' });
    
    // Get AI response
    await sendMessage({ 
      message, 
      userId: currentUser.id,
      conversationId: conversation.id 
    });
  };

  return (
    <ChatInterface 
      onSendMessage={handleUserMessage}
      loading={loading}
      error={error}
    />
  );
};
*/

// In a mood tracking component:
/*
const MoodEntryComponent = () => {
  const { execute: analyzeMood, loading, data: analysis } = useMoodAnalysis({
    onSuccess: (analysis) => {
      // Show insights to user
      setMoodInsights(analysis);
    }
  });

  const handleMoodSubmit = async (moodData: MoodEntry) => {
    // Save mood entry first
    await saveMoodEntry(moodData);
    
    // Get AI analysis
    await analyzeMood({
      moodEntry: moodData,
      userId: currentUser.id,
      recentHistory: recentMoodEntries
    });
  };

  return (
    <MoodForm 
      onSubmit={handleMoodSubmit}
      insights={analysis}
      analyzing={loading}
    />
  );
};
*/