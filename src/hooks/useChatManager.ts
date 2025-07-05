import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface ChatMessage {
  _id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  reactions?: Array<{
    userId: string;
    type: 'helpful' | 'not-helpful' | 'emoji';
    emoji?: string;
    timestamp: number;
  }>;
}

export interface QuickReply {
  id: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'supportive';
}

export function useChatManager() {
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);

  // Convex hooks
  const testQuery = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  const activeConversation = useQuery(api.conversations.getActiveConversation,
    testQuery ? { userId: testQuery._id } : "skip"
  );

  const createConversation = useMutation(api.conversations.createConversation);
  const sendMessage = useAction(api.messages.sendMessage);
  const addReaction = useMutation(api.messages.addReaction);
  const removeReaction = useMutation(api.messages.removeReaction);

  const messageData = useQuery(api.messages.getConversationMessages,
    activeConversation ? { 
      conversationId: activeConversation._id, 
      limit: 50,
    } : "skip"
  );

  const messages = messageData?.messages || [];

  // Create conversation if user exists but no conversation
  useEffect(() => {
    if (testQuery && !activeConversation && activeConversation !== undefined) {
      createConversation({ userId: testQuery._id });
    }
  }, [testQuery, activeConversation, createConversation]);

  // Generate random delay between 1-7 seconds for natural feeling
  const getRandomDelay = () => {
    return Math.floor(Math.random() * 6000) + 1000; // 1000ms to 7000ms
  };

  // Send message function with realistic timing
  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || messageText.trim();
    if (!messageToSend || !activeConversation || !testQuery) return;
    
    if (!message) {
      setMessageText(""); // Clear input immediately only if from traditional chat
    }
    
    try {
      // Show typing indicator after a brief moment
      setTimeout(() => {
        setIsTyping(true);
      }, 300);

      // Prepare context for optimized sendMessage
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const userInfo = {
        name: testQuery.name,
        language: testQuery.language,
        preferences: testQuery.preferences,
      };

      // Send the message with context to avoid database roundtrips
      const messagePromise = sendMessage({
        conversationId: activeConversation._id,
        userId: testQuery._id,
        content: messageToSend,
        language: testQuery.language || 'en',
        recentMessages,
        userInfo,
      });

      // Wait for both the message to be sent AND the random delay
      const delay = getRandomDelay();
      await Promise.all([
        messagePromise,
        new Promise(resolve => setTimeout(resolve, delay))
      ]);

      // Hide typing indicator
      setIsTyping(false);
      
      // QuickReply generation disabled
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message');
    }
  }, [messageText, activeConversation, testQuery, messages, sendMessage]);

  // Handle adding reaction to message
  const handleAddReaction = useCallback(async (messageId: string, type: 'helpful' | 'not-helpful' | 'emoji', emoji?: string) => {
    if (!testQuery) return;
    
    try {
      await addReaction({
        messageId: messageId as any,
        userId: testQuery._id,
        type,
        emoji,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [testQuery, addReaction]);

  // Handle long press on message for reactions
  const handleMessageLongPress = useCallback((messageId: string) => {
    // For now, just add a helpful reaction - in a full implementation,
    // this would show a reaction picker
    handleAddReaction(messageId, 'helpful');
  }, [handleAddReaction]);

  // Load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || !messageData?.hasMore || !messageData.nextCursor) return;
    
    try {
      // This would need a separate query for loading more - for now we'll implement virtual scrolling
      console.log('Loading older messages...', messageData.nextCursor);
    } catch (error) {
      console.error('Error loading older messages:', error);
    }
  }, [activeConversation, messageData]);

  // Convert messages to floating format
  const floatingMessages = (messages || []).map(msg => ({
    id: msg._id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    timestamp: msg.timestamp || Date.now(),
  }));

  return {
    // State
    messageText,
    setMessageText,
    isTyping,
    quickReplies,
    setQuickReplies,
    messages,
    floatingMessages,
    activeConversation,
    user: testQuery,

    // Actions
    handleSendMessage,
    handleAddReaction,
    handleMessageLongPress,
    loadOlderMessages,

    // Query states
    isLoadingUser: testQuery === undefined,
    isLoadingConversation: activeConversation === undefined,
    isLoadingMessages: messageData === undefined,
  };
}