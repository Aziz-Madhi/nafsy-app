import { ContentUnavailable } from "@/components/ui/ContentUnavailable";
import { FloatingChatMode } from "@/components/ui/FloatingChatMode";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { QuickReplySuggestions } from "@/components/ui/QuickReplySuggestions";
import { useChatManager } from "@/hooks/useChatManager";
import { useTranslation } from "@/hooks/useLocale";
import { useTheme } from "@/theme";
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
  View
} from "react-native";
import { State, TapGestureHandler } from 'react-native-gesture-handler';

export default function ChatScreen() {
  const { t } = useTranslation();
  const [isFloatingMode, setIsFloatingMode] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  // Use proper timer type that works across platforms
  const autoReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  // Use the extracted chat management hook
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
    loadOlderMessages,
  } = useChatManager();


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