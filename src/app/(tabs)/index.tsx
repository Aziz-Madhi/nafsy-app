import { 
  FloatingChatMode, 
  ChatHeader, 
  MessagesContainer, 
  ChatInput, 
  ChatModals, 
  QuickReplySuggestions 
} from "@/components/chat";
import { useChatManager } from "@/hooks/useChatManager";
import { useTranslation, useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
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
  const listRef = useRef<any>(null);
  const flatListRef = useRef<any>(null); // Add missing flatListRef
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
    handleAddReaction,
    loadOlderMessages,
    handleStartNewChat,
    handleSwitchConversation,
    conversations,
    isLoadingMore,
    isLoadingConversations,
    hasMoreMessages,
  } = useChatManager(isFloatingMode ? 'floating' : 'full');

  // Add missing isLoading variable
  const isLoading = isLoadingConversations;


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
        <ChatHeader
          title={t("chat.title")}
          subtitle={t("chat.floatingModeHint")}
          onMenuPress={() => setShowManagement(true)}
          theme={theme}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>

              <KeyboardAvoidingView 
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
              >
              {/* Messages Container */}
              <MessagesContainer
                messages={messages}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMoreMessages={hasMoreMessages}
                isTyping={isTyping}
                theme={theme}
                locale={locale}
                listRef={listRef}
                onLoadOlderMessages={loadOlderMessages}
                onMessageLongPress={(position, messageId) => {
                  setReactionPickerPosition(position);
                  setSelectedMessageId(messageId);
                  setShowReactionPicker(true);
                }}
              />
              
              
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
              <ChatInput
                messageText={messageText}
                onChangeText={setMessageText}
                onSendMessage={handleSendMessage}
                placeholder={t("chat.placeholder")}
                theme={theme}
                activeConversation={activeConversation}
              />
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </ChatHeader>
        
        {/* All Modals */}
        <ChatModals
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          showSummary={showSummary}
          setShowSummary={setShowSummary}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          showManagement={showManagement}
          setShowManagement={setShowManagement}
          showReactionPicker={showReactionPicker}
          setShowReactionPicker={setShowReactionPicker}
          reactionPickerPosition={reactionPickerPosition}
          selectedMessageId={selectedMessageId}
          setSelectedMessageId={setSelectedMessageId}
          activeConversation={activeConversation}
          conversations={conversations}
          isLoadingConversations={isLoadingConversations}
          messages={messages}
          locale={locale}
          listRef={listRef}
          onStartNewChat={handleStartNewChat}
          onSwitchConversation={handleSwitchConversation}
          onAddReaction={handleAddReaction}
        />
      </View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
});