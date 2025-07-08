import { ContentUnavailable } from "@/components/ui/ContentUnavailable";
import { FloatingChatMode } from "@/components/ui/FloatingChatMode";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { QuickReplySuggestions } from "@/components/ui/QuickReplySuggestions";
import { ChatSearch } from "@/components/ui/ChatSearch";
import { ReactionPicker } from "@/components/ui/ReactionPicker";
import { ConversationSummary } from "@/components/ui/ConversationSummary";
import { ConversationHistory } from "@/components/ui/ConversationHistory";
import { ChatManagement } from "@/components/ui/ChatManagement";
import { useChatManager } from "@/hooks/useChatManager";
import { useTranslation, useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/theme";
import { groupMessagesByDate, formatMessageTime } from "@/utils/dateHelpers";
import React, { useEffect, useRef, useState } from "react";
import {
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
  View,
  ActivityIndicator,
  Vibration,
  Alert
} from "react-native";
import { State, TapGestureHandler } from 'react-native-gesture-handler';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [isFloatingMode, setIsFloatingMode] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  // Use proper timer type that works across platforms
  const autoReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  // Use the extracted chat management hook with chat mode
  const {
    messageText,
    setMessageText,
    isTyping,
    quickReplies,
    messages,
    floatingMessages,
    activeConversation,
    handleSendMessage,
    handleMessageLongPress,
    handleAddReaction,
    loadOlderMessages,
    handleStartNewChat,
    handleSwitchConversation,
    conversations,
    isLoadingMore,
    isLoadingConversations,
    hasMoreMessages,
    user,
  } = useChatManager(isFloatingMode ? 'floating' : 'full');


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
              <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
                    {t("chat.title")}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
                    Double-tap to return to floating mode
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setShowManagement(true)}
                  style={styles.menuButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <IconSymbol name="ellipsis" size={22} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
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
                    data={groupMessagesByDate(messages, locale)}
                    keyExtractor={(item, index) => `group-${index}`}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    
                    // LEVER: Performance optimizations for large conversations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={20}
                    onEndReached={loadOlderMessages}
                    onEndReachedThreshold={0.5}
                    inverted={false}
                    
                    // Loading indicator at top
                    ListHeaderComponent={
                      hasMoreMessages && isLoadingMore ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                        </View>
                      ) : null
                    }
                    
                    renderItem={({ item: group }) => (
                      <View>
                        {/* Date Separator */}
                        <View style={styles.dateSeparator}>
                          <View style={[styles.dateLine, { backgroundColor: theme.colors.system.separator }]} />
                          <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
                            {group.date}
                          </Text>
                          <View style={[styles.dateLine, { backgroundColor: theme.colors.system.separator }]} />
                        </View>
                        
                        {/* Messages in this date group */}
                        {group.messages.map((item) => (
                          <TouchableOpacity
                            key={item._id}
                            onLongPress={(event) => {
                              const { pageX, pageY } = event.nativeEvent;
                              setReactionPickerPosition({ x: pageX, y: pageY });
                              setSelectedMessageId(item._id);
                              setShowReactionPicker(true);
                              Vibration.vibrate(50);
                            }}
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
                            
                            {/* Message time */}
                            <Text style={[
                              styles.messageTime,
                              { color: item.role === 'user' ? theme.colors.text.inverse : theme.colors.text.secondary }
                            ]}>
                              {formatMessageTime(item.timestamp, locale)}
                            </Text>
                            
                            {/* LEVER: Extend existing bubble with reactions display */}
                            {item.reactions && item.reactions.length > 0 ? <View style={styles.reactionsContainer}>
                                {(() => {
                                  // Group reactions by type/emoji
                                  const groupedReactions = item.reactions.reduce((acc: any, reaction: any) => {
                                    const key = reaction.type === 'emoji' ? reaction.emoji : reaction.type;
                                    if (!acc[key]) {
                                      acc[key] = { count: 0, emoji: reaction.type === 'helpful' ? '👍' : reaction.type === 'not-helpful' ? '👎' : reaction.emoji };
                                    }
                                    acc[key].count++;
                                    return acc;
                                  }, {});
                                  
                                  return Object.entries(groupedReactions).map(([key, data]: [string, any]) => (
                                    <TouchableOpacity
                                      key={key}
                                      style={[
                                        styles.reactionBadge,
                                        { backgroundColor: theme.colors.system.secondaryBackground }
                                      ]}
                                      onPress={() => {
                                        // Toggle reaction
                                        const hasUserReacted = item.reactions.some((r: any) => r.userId === user?._id);
                                        if (hasUserReacted) {
                                          // Remove reaction
                                          handleAddReaction(item._id, 'helpful'); // This will toggle off
                                        } else {
                                          // Add reaction
                                          handleAddReaction(item._id, key === '👍' ? 'helpful' : key === '👎' ? 'not-helpful' : 'emoji', key);
                                        }
                                      }}
                                    >
                                      <Text style={styles.reactionText}>
                                        {data.emoji} {data.count > 1 && data.count}
                                      </Text>
                                    </TouchableOpacity>
                                  ));
                                })()}
                              </View> : null}
                          </TouchableOpacity>
                        ))}
                      </View>
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
                {isTyping ? <View style={styles.typingContainer}>
                    <TypingIndicator visible={isTyping} />
                  </View> : null}
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
              {activeConversation ? <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderTopColor: theme.colors.system.separator }]}>
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
                </View> : null}
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
        
        {/* Search Modal */}
        <ChatSearch
          isVisible={showSearch}
          onClose={() => setShowSearch(false)}
          conversationId={activeConversation?._id}
          locale={locale}
          onSelectMessage={(messageId) => {
            // Find the message in the current list and scroll to it
            const messageIndex = messages.findIndex(msg => msg._id === messageId);
            if (messageIndex !== -1 && flatListRef.current) {
              // Calculate which group the message is in
              const groups = groupMessagesByDate(messages, locale);
              let flatIndex = 0;
              let found = false;
              
              for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                const group = groups[groupIndex];
                const messageInGroup = group.messages.findIndex(msg => msg._id === messageId);
                
                if (messageInGroup !== -1) {
                  flatIndex = groupIndex;
                  found = true;
                  break;
                }
              }
              
              if (found) {
                flatListRef.current.scrollToIndex({ index: flatIndex, animated: true });
              }
            }
          }}
        />
        
        {/* Reaction Picker */}
        <ReactionPicker
          isVisible={showReactionPicker}
          onClose={() => {
            setShowReactionPicker(false);
            setSelectedMessageId(null);
          }}
          position={reactionPickerPosition}
          onSelectReaction={(type, emoji) => {
            if (selectedMessageId) {
              handleAddReaction(selectedMessageId, type, emoji);
            }
          }}
        />
        
        {/* Chat Management */}
        <ChatManagement
          isVisible={showManagement}
          onClose={() => setShowManagement(false)}
          onNewChat={handleStartNewChat}
          conversations={conversations}
          isLoadingConversations={isLoadingConversations}
          onSelectConversation={handleSwitchConversation}
          activeConversationId={activeConversation?._id}
          onRequestSummary={(conversationId) => {
            setShowManagement(false);
            setShowSummary(true);
          }}
        />

        {/* Conversation History */}
        <ConversationHistory
          isVisible={showHistory}
          onClose={() => setShowHistory(false)}
          conversations={conversations}
          isLoading={isLoadingConversations}
          onSelectConversation={handleSwitchConversation}
          activeConversationId={activeConversation?._id}
        />

        {/* Conversation Summary */}
        <ConversationSummary
          isVisible={showSummary}
          onClose={() => setShowSummary(false)}
          conversationId={activeConversation?._id}
          language={locale}
        />
      </View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTextContainer: {
    alignItems: 'center',
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
  menuButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    borderRadius: 20,
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
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  reactionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Date separator styles
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  // Message time
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  // Loading indicator
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});