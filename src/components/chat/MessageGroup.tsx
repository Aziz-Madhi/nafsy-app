import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface MessageGroupData {
  id: string;
  date: string;
  messages: any[];
}

interface MessageGroupProps {
  group: MessageGroupData;
  theme: any;
  onMessageLongPress: (event: any, messageId: string) => void;
  formatMessageTime: (timestamp: any) => string;
  locale: string;
}

export const MessageGroup = React.memo<MessageGroupProps>(({ 
  group, 
  theme, 
  onMessageLongPress, 
  formatMessageTime, 
  locale 
}) => {
  return (
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
          onLongPress={(event) => onMessageLongPress(event, item._id)}
          activeOpacity={0.8}
          style={[
            styles.messageBubble,
            {
              backgroundColor: item.role === 'user' 
                ? theme.colors.interactive.primary 
                : theme.colors.background.secondary,
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              borderColor: item.role === 'user' 
                ? 'transparent' 
                : theme.colors.system.border,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: item.role === 'user' 
                  ? theme.colors.text.onPrimary 
                  : theme.colors.text.primary,
                textAlign: locale === 'ar' ? 'right' : 'left',
              },
            ]}
          >
            {item.content}
          </Text>
          
          {/* Message reactions */}
          {(item.reactions?.length > 0) ? (
            <View style={styles.reactionsContainer}>
              {item.reactions.map((reaction: any, index: number) => (
                <View key={index} style={styles.reactionBubble}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionCount}>{reaction.count}</Text>
                </View>
              ))}
            </View>
          ) : null}
          
          <Text
            style={[
              styles.messageTime,
              {
                color: item.role === 'user' 
                  ? theme.colors.text.onPrimary 
                  : theme.colors.text.tertiary,
              },
            ]}
          >
            {formatMessageTime(item._creationTime)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

MessageGroup.displayName = 'MessageGroup';

const styles = StyleSheet.create({
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
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
});