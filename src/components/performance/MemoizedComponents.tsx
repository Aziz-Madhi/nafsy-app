/**
 * Performance-optimized React components with React.memo
 * Following LEVER framework - memoized versions of frequently re-rendered components
 * 
 * Components included:
 * - MoodCard: For displaying mood entries
 * - ExerciseCard: For displaying exercise sessions  
 * - ConversationCard: For displaying chat conversations
 * - MessageBubble: For chat message display
 * - UserAvatar: For user profile pictures
 * - StatCard: For dashboard statistics
 * - LoadingSkeleton: For loading states
 * - EmptyState: For empty data states
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Image } from '@/components/ui/img';
import * as AC from '@bacons/apple-colors';
import { useAppTheme } from '@/theme';
import { 
  formatDate, 
  formatTime, 
  formatRelativeTime, 
  getMoodLabel, 
  getMoodColor,
  extractInitials,
  formatDuration 
} from '@/utils/helpers';
import { 
  MoodEntry, 
  ExerciseEntry, 
  ConversationEntry, 
  MessageEntry,
  Locale 
} from '@/types';

// Mood Card Component
export interface MoodCardProps {
  mood: MoodEntry;
  onPress?: (mood: MoodEntry) => void;
  locale?: Locale;
  compact?: boolean;
  showDetails?: boolean;
}

export const MoodCard = memo<MoodCardProps>(function MoodCard({
  mood,
  onPress,
  locale = 'en',
  compact = false,
  showDetails = true,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const moodColor = getMoodColor(mood.rating);
  const moodLabel = getMoodLabel(mood.rating, locale);

  const cardStyle = [
    styles.card,
    compact && styles.compactCard,
    { backgroundColor: colors.surface },
  ];

  const handlePress = () => onPress?.(mood);

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Mood entry: ${moodLabel}, ${formatDate(mood.timestamp, locale)}`}
    >
      <View style={styles.moodHeader}>
        <View style={[styles.moodIndicator, { backgroundColor: moodColor }]}>
          <Text style={styles.moodRating}>{mood.rating}</Text>
        </View>
        <View style={styles.moodInfo}>
          <Text style={[styles.moodLabel, { color: colors.text }]}>
            {moodLabel}
          </Text>
          <Text style={[styles.moodDate, { color: colors.secondaryText }]}>
            {formatDate(mood.timestamp, locale)}
          </Text>
        </View>
      </View>

      {showDetails && !compact && (
        <>
          {mood.emotions.length > 0 && (
            <View style={styles.emotionsContainer}>
              {mood.emotions.slice(0, 3).map((emotion, index) => (
                <View key={index} style={[styles.emotionChip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.emotionText, { color: colors.secondaryText }]}>
                    {emotion}
                  </Text>
                </View>
              ))}
              {mood.emotions.length > 3 && (
                <Text style={[styles.moreEmotions, { color: colors.secondaryText }]}>
                  +{mood.emotions.length - 3} more
                </Text>
              )}
            </View>
          )}

          {mood.note && (
            <Text 
              style={[styles.moodNote, { color: colors.secondaryText }]}
              numberOfLines={2}
            >
              {mood.note}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
});

// Exercise Card Component
export interface ExerciseCardProps {
  exercise: ExerciseEntry;
  onPress?: (exercise: ExerciseEntry) => void;
  locale?: Locale;
  compact?: boolean;
  showProgress?: boolean;
}

export const ExerciseCard = memo<ExerciseCardProps>(function ExerciseCard({
  exercise,
  onPress,
  locale = 'en',
  compact = false,
  showProgress = true,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const cardStyle = [
    styles.card,
    compact && styles.compactCard,
    { backgroundColor: colors.surface },
  ];

  const handlePress = () => onPress?.(exercise);
  const durationText = exercise.duration ? formatDuration(exercise.duration, locale) : '';
  const effectiveness = exercise.data.effectiveness || 0;

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Exercise: ${exercise.type}, completed ${formatDate(exercise.completedAt, locale)}`}
    >
      <View style={styles.exerciseHeader}>
        <View style={[styles.exerciseIcon, { backgroundColor: colors.tint }]}>
          <Image source="sf:figure.mind.and.body" size={24} tintColor={AC.white} />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseTitle, { color: colors.text }]}>
            {exercise.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
          <Text style={[styles.exerciseDate, { color: colors.secondaryText }]}>
            {formatDate(exercise.completedAt, locale)}
          </Text>
        </View>
        {durationText && (
          <Text style={[styles.exerciseDuration, { color: colors.secondaryText }]}>
            {durationText}
          </Text>
        )}
      </View>

      {showProgress && !compact && effectiveness > 0 && (
        <View style={styles.effectivenessContainer}>
          <Text style={[styles.effectivenessLabel, { color: colors.secondaryText }]}>
            Effectiveness
          </Text>
          <View style={styles.effectivenessBar}>
            <View 
              style={[
                styles.effectivenessFill, 
                { 
                  backgroundColor: colors.tint,
                  width: `${(effectiveness / 5) * 100}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.effectivenessValue, { color: colors.secondaryText }]}>
            {effectiveness}/5
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Conversation Card Component
export interface ConversationCardProps {
  conversation: ConversationEntry;
  onPress?: (conversation: ConversationEntry) => void;
  locale?: Locale;
  compact?: boolean;
  showMetadata?: boolean;
}

export const ConversationCard = memo<ConversationCardProps>(function ConversationCard({
  conversation,
  onPress,
  locale = 'en',
  compact = false,
  showMetadata = true,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const cardStyle = [
    styles.card,
    compact && styles.compactCard,
    { backgroundColor: colors.surface },
  ];

  const handlePress = () => onPress?.(conversation);

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Conversation: ${conversation.title || 'Untitled'}`}
    >
      <View style={styles.conversationHeader}>
        <View style={[styles.conversationIcon, { backgroundColor: colors.tint }]}>
          <Image source="sf:message.fill" size={20} tintColor={AC.white} />
        </View>
        <View style={styles.conversationInfo}>
          <Text 
            style={[styles.conversationTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {conversation.title || 'Chat Session'}
          </Text>
          <Text style={[styles.conversationDate, { color: colors.secondaryText }]}>
            {formatRelativeTime(conversation.lastMessageAt, locale)}
          </Text>
        </View>
        <View style={styles.conversationMeta}>
          <Text style={[styles.messageCount, { color: colors.secondaryText }]}>
            {conversation.messageCount} messages
          </Text>
          {conversation.isActive && (
            <View style={[styles.activeIndicator, { backgroundColor: colors.tint }]} />
          )}
        </View>
      </View>

      {showMetadata && !compact && conversation.metadata && (
        <View style={styles.conversationMetadata}>
          {conversation.metadata.primaryTopic && (
            <Text style={[styles.topicText, { color: colors.secondaryText }]}>
              Topic: {conversation.metadata.primaryTopic}
            </Text>
          )}
          {conversation.metadata.emotionalTone && (
            <Text style={[styles.toneText, { color: colors.secondaryText }]}>
              Tone: {conversation.metadata.emotionalTone}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

// Message Bubble Component
export interface MessageBubbleProps {
  message: MessageEntry;
  isOwn?: boolean;
  locale?: Locale;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  onPress?: (message: MessageEntry) => void;
  onLongPress?: (message: MessageEntry) => void;
}

export const MessageBubble = memo<MessageBubbleProps>(function MessageBubble({
  message,
  isOwn = false,
  locale = 'en',
  showTimestamp = true,
  showAvatar = false,
  onPress,
  onLongPress,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const bubbleStyle = [
    styles.messageBubble,
    isOwn ? styles.ownMessage : styles.otherMessage,
    {
      backgroundColor: isOwn ? colors.tint : colors.surface,
    },
  ];

  const textStyle = [
    styles.messageText,
    { color: isOwn ? AC.white : colors.text },
  ];

  const handlePress = () => onPress?.(message);
  const handleLongPress = () => onLongPress?.(message);

  return (
    <View style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}>
      {showAvatar && !isOwn && (
        <UserAvatar 
          name="Assistant" 
          size={32} 
          backgroundColor={colors.secondary}
        />
      )}
      
      <TouchableOpacity
        style={bubbleStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={!onPress && !onLongPress}
        activeOpacity={0.7}
      >
        <Text style={textStyle}>{message.content}</Text>
        
        {showTimestamp && (
          <Text style={[
            styles.messageTimestamp, 
            { color: isOwn ? AC.white : colors.secondaryText }
          ]}>
            {formatTime(message.timestamp, locale)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

// User Avatar Component
export interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
}

export const UserAvatar = memo<UserAvatarProps>(function UserAvatar({
  name,
  imageUrl,
  size = 40,
  backgroundColor,
  textColor,
  onPress,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const initials = extractInitials(name);

  const avatarStyle = [
    styles.avatar,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: backgroundColor || colors.secondary,
    },
  ];

  const textStyle = [
    styles.avatarText,
    {
      fontSize: size * 0.4,
      color: textColor || AC.white,
    },
  ];

  if (imageUrl) {
    return (
      <TouchableOpacity 
        style={avatarStyle} 
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="image"
        accessibilityLabel={`Avatar for ${name}`}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={avatarStyle} 
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text style={textStyle}>{initials}</Text>
    </TouchableOpacity>
  );
});

// Stat Card Component
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
}

export const StatCard = memo<StatCardProps>(function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onPress,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const cardStyle = [
    styles.statCard,
    { backgroundColor: colors.surface },
  ];

  const iconColor = color || colors.tint;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'sf:arrow.up';
      case 'down': return 'sf:arrow.down';
      default: return 'sf:minus';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return colors.tint;
      case 'down': return colors.destructive;
      default: return colors.secondaryText;
    }
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={styles.statHeader}>
        {icon && (
          <View style={[styles.statIcon, { backgroundColor: iconColor }]}>
            <Image source={icon as any} size={20} tintColor={AC.white} />
          </View>
        )}
        <View style={styles.statContent}>
          <Text style={[styles.statTitle, { color: colors.secondaryText }]}>
            {title}
          </Text>
          <View style={styles.statValueContainer}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {value}
            </Text>
            {trend && (
              <Image 
                source={getTrendIcon() as any} 
                size={16} 
                tintColor={getTrendColor()} 
              />
            )}
          </View>
          {subtitle && (
            <Text style={[styles.statSubtitle, { color: colors.secondaryText }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Loading Skeleton Component
export interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const skeletonStyle = [
    styles.skeleton,
    {
      width,
      height,
      borderRadius,
      backgroundColor: colors.surface,
    },
    style,
  ];

  return <View style={skeletonStyle} />;
});

// Empty State Component
export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  title,
  subtitle,
  icon,
  illustration,
  action,
  style,
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const containerStyle = [
    styles.emptyState,
    style,
  ];

  return (
    <View style={containerStyle}>
      {illustration || (icon && (
        <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
          <Image source={icon as any} size={40} tintColor={colors.secondaryText} />
        </View>
      ))}
      
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
          {subtitle}
        </Text>
      )}
      
      {action}
    </View>
  );
});

const styles = StyleSheet.create({
  // Card styles
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: AC.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactCard: {
    padding: 12,
    marginVertical: 2,
  },

  // Mood Card styles
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moodRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AC.white,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodDate: {
    fontSize: 14,
    marginTop: 2,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  emotionChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionText: {
    fontSize: 12,
  },
  moreEmotions: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  moodNote: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },

  // Exercise Card styles
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseDate: {
    fontSize: 14,
    marginTop: 2,
  },
  exerciseDuration: {
    fontSize: 12,
  },
  effectivenessContainer: {
    marginTop: 12,
  },
  effectivenessLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  effectivenessBar: {
    height: 4,
    backgroundColor: AC.systemFill,
    borderRadius: 2,
    overflow: 'hidden',
  },
  effectivenessFill: {
    height: '100%',
    borderRadius: 2,
  },
  effectivenessValue: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },

  // Conversation Card styles
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationDate: {
    fontSize: 14,
    marginTop: 2,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  messageCount: {
    fontSize: 12,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  conversationMetadata: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AC.separator,
  },
  topicText: {
    fontSize: 12,
  },
  toneText: {
    fontSize: 12,
    marginTop: 2,
  },

  // Message Bubble styles
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  ownMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  // Avatar styles
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontWeight: '600',
  },

  // Stat Card styles
  statCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: AC.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Loading Skeleton styles
  skeleton: {
    opacity: 0.3,
  },

  // Empty State styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});