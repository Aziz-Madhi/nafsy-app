import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { colorUtils } from "@/theme/colors";

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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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
      {group.messages.map((item, index) => {
        const isUser = item.role === 'user';
        const bubbleContent = (
          <>
            <Text
              style={[
                styles.messageText,
                {
                  color: isUser 
                    ? theme.colors.text.inverse 
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
                <View key={`${item._id}-reaction-${index}`} style={styles.reactionBubble}>
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
                  color: isUser 
                    ? colorUtils.withOpacity(theme.colors.text.inverse, 0.8)
                    : theme.colors.text.tertiary,
                },
              ]}
            >
              {formatMessageTime(item._creationTime)}
            </Text>
          </>
        );

        return (
          <AnimatedTouchableOpacity
            key={item._id || `${group.id}-message-${index}`}
            entering={FadeInDown.delay(index * 50).springify()}
            onLongPress={(event) => onMessageLongPress(event, item._id)}
            activeOpacity={0.8}
            style={[
              styles.messageBubble,
              {
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                marginLeft: isUser ? 60 : 16,
                marginRight: isUser ? 16 : 60,
              },
            ]}
          >
            {isUser ? (
              <LinearGradient
                colors={[
                  theme.colors.interactive.primary,
                  colorUtils.lighten(theme.colors.interactive.primary, 0.15),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBubble}
              >
                {bubbleContent}
              </LinearGradient>
            ) : (
              <View 
                style={[
                  styles.assistantBubble,
                  {
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: theme.colors.system.border,
                  }
                ]}
              >
                {bubbleContent}
              </View>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
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
    marginVertical: 4,
    maxWidth: '85%',
  },
  gradientBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  assistantBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 14,
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
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});