import { ContentUnavailable } from "@/components/ui/ContentUnavailable";
import { FloatingChatMode } from "@/components/ui/FloatingChatMode";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { QuickReplySuggestions } from "@/components/ui/QuickReplySuggestions";
import { api } from "@/convex/_generated/api";
import { useTranslation } from "@/hooks/useLocale";
import { useTheme } from "@/theme/ThemeProvider";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { State, TapGestureHandler } from 'react-native-gesture-handler';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFloatingMode, setIsFloatingMode] = useState(true);
  const [quickReplies, setQuickReplies] = useState<Array<{
    id: string;
    text: string;
    sentiment: 'positive' | 'neutral' | 'supportive';
  }>>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  // Use proper timer type that works across platforms
  const autoReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  // Test a basic Convex query
  const testQuery = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  // Get active conversation
  const activeConversation = useQuery(api.conversations.getActiveConversation,
    testQuery ? { userId: testQuery._id } : "skip"
  );

  // Mutation to create conversation
  const createConversation = useMutation(api.conversations.createConversation);

  // Action to send message
  const sendMessage = useAction(api.messages.sendMessage);

  // Action to generate quick replies
  const generateQuickReplies = useAction(api.ai.generateQuickReplies);
  
  // Mutations for message reactions
  const addReaction = useMutation(api.messages.addReaction);
  const removeReaction = useMutation(api.messages.removeReaction);
  
  // Get messages for the active conversation with pagination
  const messageData = useQuery(api.messages.getConversationMessages,
    activeConversation ? { 
      conversationId: activeConversation._id, 
      limit: 50,
      // Don't pass cursor for first page - let it be undefined
    } : "skip"
  );
  
  // Function to load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || !messageData?.hasMore || !messageData.nextCursor) return;
    
    try {
      // This would need a separate query for loading more - for now we'll implement virtual scrolling
      console.log('Loading older messages...', messageData.nextCursor);
    } catch (error) {
      console.error('Error loading older messages:', error);
    }
  }, [activeConversation, messageData]);
  
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
  
  // Extract messages from paginated response
  const messages = messageData?.messages || [];

  // Create conversation if user exists but no conversation
  useEffect(() => {
    if (testQuery && !activeConversation && activeConversation !== undefined) {
      createConversation({ userId: testQuery._id });
    }
  }, [testQuery, activeConversation, createConversation]);

  // Auto-scroll to bottom when new messages arrive or when typing
  useEffect(() => {
    if ((messages && messages.length > 0) || isTyping) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Auto-return timer (1-2 minutes random)
  const startAutoReturnTimer = () => {
    if (autoReturnTimer.current) {
      clearTimeout(autoReturnTimer.current);
    }
    
    const randomDelay = Math.floor(Math.random() * 60000) + 60000; // 1-2 minutes
    autoReturnTimer.current = setTimeout(() => {
      setIsFloatingMode(true);
    }, randomDelay);
  };

  // Switch to full chat mode
  const switchToFullChat = () => {
    setIsFloatingMode(false);
    startAutoReturnTimer();
  };

  // Handle double tap to return to floating mode
  const handleDoubleTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE && !isFloatingMode) {
      if (autoReturnTimer.current) {
        clearTimeout(autoReturnTimer.current);
      }
      setIsFloatingMode(true);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoReturnTimer.current) {
        clearTimeout(autoReturnTimer.current);
      }
    };
  }, []);

  // Generate random delay between 1-7 seconds for natural feeling
  const getRandomDelay = () => {
    return Math.floor(Math.random() * 6000) + 1000; // 1000ms to 7000ms
  };

  // Send message function with realistic timing
  const handleSendMessage = async (message?: string) => {
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

      // Send the message but don't await it immediately
      const messagePromise = sendMessage({
        conversationId: activeConversation._id,
        userId: testQuery._id,
        content: messageToSend,
        language: testQuery.language || 'en'
      });

      // Wait for both the message to be sent AND the random delay
      const delay = getRandomDelay();
      await Promise.all([
        messagePromise,
        new Promise(resolve => setTimeout(resolve, delay))
      ]);

      // Hide typing indicator
      setIsTyping(false);
      
      // Generate quick replies based on the conversation
      if (messages && messages.length > 0) {
        generateQuickReplies({
          lastMessage: messages[messages.length - 1]?.content || messageToSend,
          conversationContext: messages.slice(-3).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          userInfo: testQuery,
          language: testQuery?.language || 'en',
        }).then(replies => {
          setQuickReplies(replies);
        }).catch(error => {
          console.error('Error generating quick replies:', error);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  // Convert messages to floating format
  const floatingMessages = (messages || []).map(msg => ({
    id: msg._id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    timestamp: msg.timestamp || Date.now(),
  }));

  // Render floating mode
  if (isFloatingMode) {
    return (
      <FloatingChatMode
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        recentMessages={floatingMessages}
        onSwitchToFullChat={switchToFullChat}
        quickReplies={quickReplies}
      />
    );
  }

  // Render traditional chat mode
  return (
    <TapGestureHandler
      ref={doubleTapRef}
      numberOfTaps={2}
      onHandlerStateChange={handleDoubleTap}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header without back button - this is a tab screen */}
            <SafeAreaView style={[styles.header, { backgroundColor: theme.colors.background.primary, borderBottomColor: theme.colors.system.border }]}>
              <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
                {t("chat.title")}
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
                Double-tap to return to floating mode
              </Text>
            </SafeAreaView>

            <KeyboardAvoidingView 
              style={styles.chatContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              {/* Messages List */}
              <View style={styles.messagesContainer}>
                {messages && messages.length > 0 ? (
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    
                    // LEVER: Performance optimizations for large conversations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={20}
                    getItemLayout={(data, index) => ({
                      length: 80, // Estimated height
                      offset: 80 * index,
                      index,
                    })}
                    onEndReached={loadOlderMessages}
                    onEndReachedThreshold={0.1}
                    
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onLongPress={() => handleMessageLongPress(item._id)}
                        activeOpacity={0.8}
                        style={[
                          styles.messageBubble,
                          {
                            backgroundColor: item.role === 'user' ? theme.colors.interactive.primary : theme.colors.background.secondary,
                            alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                            borderColor: item.role === 'user' ? 'transparent' : theme.colors.system.border
                          }
                        ]}>
                        <Text style={[
                          styles.messageText,
                          { color: item.role === 'user' ? theme.colors.text.inverse : theme.colors.text.primary }
                        ]}>
                          {item.content}
                        </Text>
                        
                        {/* LEVER: Extend existing bubble with reactions display */}
                        {item.reactions && item.reactions.length > 0 && (
                          <View style={styles.reactionsContainer}>
                            {item.reactions.map((reaction: any, index: number) => (
                              <View key={index} style={styles.reactionBadge}>
                                <Text style={styles.reactionText}>
                                  {reaction.type === 'helpful' ? '👍' : 
                                   reaction.type === 'not-helpful' ? '👎' : 
                                   reaction.emoji || '❤️'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <ContentUnavailable
                      title={t("chat.welcome")}
                      systemImage="message.fill"
                      description={t("chat.startConversation")}
                    />
                  </View>
                )}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <View style={styles.typingContainer}>
                    <TypingIndicator visible={isTyping} />
                  </View>
                )}
              </View>
              
              
              {/* Quick Reply Suggestions for Traditional Mode */}
              <QuickReplySuggestions
                suggestions={quickReplies}
                onSelect={(text) => {
                  setMessageText(text);
                  // Auto-send the quick reply
                  setTimeout(() => handleSendMessage(), 100);
                }}
                mode="traditional"
                isVisible={quickReplies.length > 0 && !isTyping}
              />
              
              {/* Message Input */}
              {activeConversation && (
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderTopColor: theme.colors.system.separator }]}>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary,
                      borderColor: theme.colors.system.border
                    }]}
                    placeholder={t("chat.placeholder")}
                    placeholderTextColor={theme.colors.text.placeholder}
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    maxLength={1000}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, { 
                      backgroundColor: messageText.trim() ? theme.colors.interactive.primary : theme.colors.interactive.disabled,
                      opacity: messageText.trim() ? 1 : 0.5
                    }]}
                    onPress={() => handleSendMessage()}
                    disabled={!messageText.trim()}
                  >
                    <IconSymbol name="paperplane.fill" size={20} color={theme.colors.text.inverse} />
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: '80%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // LEVER: Extend existing styles with reaction styles
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  reactionBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  reactionText: {
    fontSize: 12,
  },
});