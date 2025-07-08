import { api } from "@/convex/_generated/api";
import { buildRecentMessages } from "@/utils/chat";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const removeReaction = useMutation(api.messages.removeReaction);
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
      // Use message IDs for proper deduplication instead of just length
      const existingIds = new Set(allMessages.map(msg => msg._id));
      const newMessages = messageData.messages.filter((msg: any) => !existingIds.has(msg._id));
      
      if (newMessages.length > 0) {
        // Add only truly new messages
        setAllMessages(prev => [...prev, ...newMessages]);
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
  const detectLanguage = (text: string): 'en' | 'ar' => {
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
  };

  // Send message function with natural timing
  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || messageText.trim();
    if (!messageToSend || !activeConversation || !testQuery) return;
    
    if (!message) {
      setMessageText(""); // Clear input immediately only if from traditional chat
    }
    
    try {
      // Show typing indicator immediately when user sends message
      setIsTyping(true);

      // Detect language from user input
      const detectedLanguage = detectLanguage(messageToSend);

      // Prepare context for optimized sendMessage
      // Include the new message itself so that the server/LLM sees it immediately
      const recentMessages = buildRecentMessages(allMessages, messageToSend);

      const userInfo = {
        name: testQuery.name,
        language: testQuery.language,
        preferences: testQuery.preferences,
      };

      // Send the message with detected language and chat mode
      await sendMessage({
        conversationId: activeConversation._id,
        userId: testQuery._id,
        content: messageToSend,
        language: detectedLanguage, // Use detected language instead of profile language
        chatMode, // Pass the current chat mode
        recentMessages,
        userInfo,
      });

      // Hide typing indicator after message is processed
      setIsTyping(false);
      
      // QuickReply generation disabled for now
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message');
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