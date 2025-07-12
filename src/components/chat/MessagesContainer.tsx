import React from "react";
import { View, StyleSheet, Vibration } from "react-native";
import { GenericList } from '@/components/data-display/GenericList';
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MessageGroup } from "./MessageGroup";
import { groupMessagesByDate, formatMessageTime } from "@/utils/dateHelpers";

interface MessageGroupData {
  id: string;
  date: string;
  messages: any[];
}

interface MessagesContainerProps {
  messages: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  isTyping: boolean;
  theme: any;
  locale: string;
  listRef: React.RefObject<any>;
  onLoadOlderMessages: () => void;
  onMessageLongPress: (position: { x: number; y: number }, messageId: string) => void;
}

export function MessagesContainer({
  messages,
  isLoading,
  isLoadingMore,
  hasMoreMessages,
  isTyping,
  theme,
  locale,
  listRef,
  onLoadOlderMessages,
  onMessageLongPress,
}: MessagesContainerProps) {
  return (
    <View style={styles.messagesContainer}>
      <GenericList<MessageGroupData>
        ref={listRef}
        data={groupMessagesByDate(messages, locale).map((group, index) => ({
          id: `${group.date}-${index}-${group.messages.length}`,
          date: group.date,
          messages: group.messages,
        }))}
        loading={Boolean(isLoading && (!messages || messages.length === 0))}
        loadingMore={Boolean(isLoadingMore && hasMoreMessages)}
        onEndReached={onLoadOlderMessages}
        emptyTitle="No messages yet"
        emptyDescription="Start a conversation by typing a message below"
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        maxToRenderPerBatch={10}
        windowSize={10}
        showSeparators={false}
        inverted={false}
        
        renderItem={({ item: group }) => (
          <MessageGroup
            group={group}
            theme={theme}
            onMessageLongPress={(event, messageId) => {
              const { pageX, pageY } = event.nativeEvent;
              onMessageLongPress({ x: pageX, y: pageY }, messageId);
              Vibration.vibrate(50);
            }}
            formatMessageTime={formatMessageTime}
            locale={locale}
          />
        )}
      />
      
      {/* Typing Indicator */}
      {!!isTyping && (
        <View style={styles.typingContainer}>
          <TypingIndicator visible={isTyping} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});