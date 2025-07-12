import { api } from "@/convex/_generated/api";
import { buildRecentMessages } from "@/utils/chat";
import { recordChatMetric } from "@/utils/metrics";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Alert } from "react-native";

export interface ChatMessage {
  _id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  reactions?: {
    userId: string;
    type: 'helpful' | 'not-helpful' | 'emoji';
    emoji?: string;
    timestamp: number;
  }[];
  metadata?: {
    isEmergency?: boolean;
    exerciseType?: string;
    language?: string;
    chatMode?: string;
    chunks?: string[];
  };
}

export interface QuickReply {
  id: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'supportive';
}

export function useChatManager(chatMode: 'floating' | 'full' = 'full') {
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasLoadedInitial = useRef(false);
  
  // OPTIMIZATION: Maintain a Set of message IDs for O(1) deduplication
  const messageIds = useRef(new Set<string>());
  
  // OPTIMIZATION: Memoize message ID set to prevent recreation on every render
  const existingMessageIds = useMemo(() => {
    // Update the ref when allMessages changes and return the set
    messageIds.current = new Set(allMessages.map(msg => msg._id));
    return messageIds.current;
  }, [allMessages]);

  // Convex hooks
  const testQuery = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  const activeConversation = useQuery(api.conversations.getActiveConversation,
    testQuery ? { userId: testQuery._id } : "skip"
  );

  const createConversation = useMutation(api.conversations.createConversation);
  const startNewConversation = useMutation(api.conversations.startNewConversation);
  const sendMessage = useAction(api.messages.sendMessage);
  const addReaction = useMutation(api.messages.addReaction);
  const _removeReaction = useMutation(api.messages.removeReaction);
  const switchToConversation = useMutation(api.conversations.switchToConversation);
  
  // New query for conversation history
  const conversationsWithPreview = useQuery(api.conversations.getUserConversationsWithPreview,
    testQuery ? { userId: testQuery._id } : "skip"
  );

  const messageData = useQuery(api.messages.getConversationMessages,
    activeConversation ? { 
      conversationId: activeConversation._id, 
      limit: 30,
      ...(cursor ? { cursor } : {}),
    } : "skip"
  );

  // Merge new messages with existing ones - improved deduplication
  useEffect(() => {
    if (!messageData?.messages) return;

    if (!hasLoadedInitial.current && !isLoadingMore) {
      // Initial load
      setAllMessages(messageData.messages);
      setCursor(messageData.nextCursor);
      hasLoadedInitial.current = true;
    } else if (isLoadingMore) {
      // Loading more messages (pagination)
      setAllMessages(prev => [...messageData.messages, ...prev]);
      setCursor(messageData.nextCursor);
      setIsLoadingMore(false);
    } else if (hasLoadedInitial.current) {
      // Real-time updates (new messages)
      // OPTIMIZATION: Use memoized Set for O(1) deduplication
      const newMessages = messageData.messages.filter((msg: any) => !existingMessageIds.has(msg._id));
      
      if (newMessages.length > 0) {
        // Add only truly new messages and update the ID set
        setAllMessages(prev => {
          const updated = [...prev, ...newMessages];
          // Update the ref with new IDs
          newMessages.forEach(msg => messageIds.current.add(msg._id));
          return updated;
        });
        setCursor(messageData.nextCursor);
      } else if (messageData.messages.length !== allMessages.length) {
        // Handle edge case where message order might have changed
        setAllMessages(messageData.messages);
        setCursor(messageData.nextCursor);
      }
    }
  }, [messageData?.messages, messageData?.nextCursor, isLoadingMore, allMessages]);

  // Reset when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setAllMessages([]);
      setCursor(null);
      hasLoadedInitial.current = false;
      // OPTIMIZATION: Clear message IDs set when switching conversations
      messageIds.current.clear();
    }
  }, [activeConversation]);

  const messages = allMessages;

  // Create conversation if user exists but no conversation
  useEffect(() => {
    if (testQuery && !activeConversation && activeConversation !== undefined) {
      createConversation({ userId: testQuery._id });
    }
  }, [testQuery, activeConversation, createConversation]);

  // Detect language from text content
  const detectLanguage = useCallback((text: string): 'en' | 'ar' => {
    // Safety check for undefined or null text
    if (!text || typeof text !== 'string') {
      return (testQuery?.language as 'en' | 'ar') || 'en';
    }
    
    // Arabic character range detection
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    // Arabic keywords
    const arabicKeywords = ['انا', 'هذا', 'هل', 'ماذا', 'كيف', 'متى', 'اين', 'لماذا', 'من', 'الى', 'في', 'على', 'مع', 'بعد', 'قبل'];
    
    // English keywords
    const englishKeywords = ['i', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    const lowerText = text.toLowerCase();
    
    // Check for Arabic characters
    if (arabicRegex.test(text)) {
      return 'ar';
    }
    
    // Check for Arabic keywords
    const arabicCount = arabicKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const englishCount = englishKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    // If we found Arabic keywords or Arabic characters, assume Arabic
    if (arabicCount > 0) {
      return 'ar';
    }
    
    // If we found more English keywords, assume English
    if (englishCount > arabicCount) {
      return 'en';
    }
    
    // Default to user's profile language or English
    return (testQuery?.language as 'en' | 'ar') || 'en';
  }, [testQuery?.language]);

  // Send message function with natural timing
  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || messageText.trim();
    if (!messageToSend || !activeConversation || !testQuery) return;
    
    if (!message) {
      setMessageText(""); // Clear input immediately only if from traditional chat
    }
    
    // Performance logging - start timing
    const startTime = performance.now();
    const performanceMetrics = {
      messageLength: messageToSend.length,
      contextSize: allMessages.length,
      language: '',
      chatMode: chatMode,
      startTime,
      endTime: 0,
      totalDuration: 0,
      languageDetectionTime: 0,
      contextBuildingTime: 0,
      sendMessageTime: 0,
      error: null as string | null,
    };
    
    try {
      // Show typing indicator immediately when user sends message
      setIsTyping(true);

      // Detect language from user input - with timing
      const langDetectionStart = performance.now();
      const detectedLanguage = detectLanguage(messageToSend);
      performanceMetrics.languageDetectionTime = performance.now() - langDetectionStart;
      performanceMetrics.language = detectedLanguage;

      // Prepare context for optimized sendMessage - with timing
      const contextBuildingStart = performance.now();
      const recentMessages = buildRecentMessages(allMessages, messageToSend);
      performanceMetrics.contextBuildingTime = performance.now() - contextBuildingStart;

      const userInfo = {
        name: testQuery.name,
        language: testQuery.language,
        preferences: testQuery.preferences,
      };

      // Send the message with detected language and chat mode - with timing
      const sendMessageStart = performance.now();
      await sendMessage({
        conversationId: activeConversation._id,
        userId: testQuery._id,
        content: messageToSend,
        language: detectedLanguage, // Use detected language instead of profile language
        chatMode, // Pass the current chat mode
        recentMessages,
        userInfo,
      });
      performanceMetrics.sendMessageTime = performance.now() - sendMessageStart;

      // Hide typing indicator after message is processed
      setIsTyping(false);
      
      // QuickReply generation disabled for now
    } catch (error) {
      console.error('Error sending message:', error);
      performanceMetrics.error = error instanceof Error ? error.message : 'Unknown error';
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      // Performance logging - end timing and log metrics
      performanceMetrics.endTime = performance.now();
      performanceMetrics.totalDuration = performanceMetrics.endTime - performanceMetrics.startTime;
      
      // Record comprehensive metrics
      recordChatMetric({
        messageLength: performanceMetrics.messageLength,
        language: performanceMetrics.language as 'en' | 'ar',
        chatMode: performanceMetrics.chatMode as 'floating' | 'full',
        contextSize: performanceMetrics.contextSize,
        hasRecentMessages: true, // Always true since we build recent messages
        hasUserInfo: !!testQuery,
        totalDuration: performanceMetrics.totalDuration,
        languageDetectionTime: performanceMetrics.languageDetectionTime,
        contextBuildingTime: performanceMetrics.contextBuildingTime,
        sendMessageTime: performanceMetrics.sendMessageTime,
        crisisDetected: false, // Will be updated if crisis is detected
        error: performanceMetrics.error || undefined,
        errorType: performanceMetrics.error ? 'unknown' : undefined,
        userId: testQuery?._id,
        conversationId: activeConversation?._id,
      });
      
      // Log performance metrics for monitoring
      console.log('Chat Performance Metrics:', {
        messageLength: performanceMetrics.messageLength,
        contextSize: performanceMetrics.contextSize,
        language: performanceMetrics.language,
        chatMode: performanceMetrics.chatMode,
        totalDuration: `${performanceMetrics.totalDuration.toFixed(2)}ms`,
        languageDetectionTime: `${performanceMetrics.languageDetectionTime.toFixed(2)}ms`,
        contextBuildingTime: `${performanceMetrics.contextBuildingTime.toFixed(2)}ms`,
        sendMessageTime: `${performanceMetrics.sendMessageTime.toFixed(2)}ms`,
        error: performanceMetrics.error,
        timestamp: new Date().toISOString(),
      });
      
      // Log warning if performance is slow
      if (performanceMetrics.totalDuration > 5000) {
        console.warn('Slow chat performance detected:', {
          totalDuration: `${performanceMetrics.totalDuration.toFixed(2)}ms`,
          messageLength: performanceMetrics.messageLength,
          contextSize: performanceMetrics.contextSize,
        });
      }
    }
  }, [messageText, activeConversation, testQuery, allMessages, sendMessage, chatMode, detectLanguage]);

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
    if (!activeConversation || isLoadingMore || !messageData?.hasMore || !cursor) return;
    
    setIsLoadingMore(true);
  }, [activeConversation, isLoadingMore, messageData?.hasMore, cursor]);

  // Handle starting a new chat
  const handleStartNewChat = useCallback(async () => {
    if (!testQuery) return;
    
    try {
      await startNewConversation({
        userId: testQuery._id,
        currentConversationId: activeConversation?._id,
      });
      
      // Clear local state
      setAllMessages([]);
      setCursor(null);
      hasLoadedInitial.current = false;
    } catch (error) {
      console.error('Error starting new chat:', error);
      Alert.alert('Error', 'Failed to start new chat');
    }
  }, [testQuery, activeConversation, startNewConversation]);

  // Handle switching to a different conversation
  const handleSwitchConversation = useCallback(async (conversationId: string) => {
    if (!testQuery) return;
    
    try {
      await switchToConversation({
        userId: testQuery._id,
        conversationId: conversationId as any,
      });
      
      // Clear local state to force reload of new conversation
      setAllMessages([]);
      setCursor(null);
      hasLoadedInitial.current = false;
    } catch (error) {
      console.error('Error switching conversation:', error);
      Alert.alert('Error', 'Failed to switch conversation');
    }
  }, [testQuery, switchToConversation]);

  // Convert messages to floating format with chunks support
  const floatingMessages = (allMessages || []).map((msg: ChatMessage) => ({
    id: msg._id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    timestamp: msg.timestamp || Date.now(),
    chunks: msg.metadata?.chunks, // Include chunks for floating display
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
    conversations: conversationsWithPreview,

    // Actions
    handleSendMessage,
    handleAddReaction,
    handleMessageLongPress,
    loadOlderMessages,
    handleStartNewChat,
    handleSwitchConversation,

    // Query states
    isLoadingUser: testQuery === undefined,
    isLoadingConversation: activeConversation === undefined,
    isLoadingMessages: messageData === undefined,
    isLoadingConversations: conversationsWithPreview === undefined,
    isLoadingMore,
    hasMoreMessages: messageData?.hasMore || false,
  };
}