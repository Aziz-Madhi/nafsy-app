/**
 * GenericList usage examples for Nafsy app
 * Following LEVER framework - demonstrating reusable list patterns
 */
import React from 'react';
import { View, Text } from 'react-native';
import { GenericList, SimpleListItem } from '@/components/ui/GenericList';
import { useAppTheme } from '@/theme';

// Example data interfaces
interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  notes?: string;
  createdAt: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'breathing' | 'meditation' | 'mindfulness';
  completed: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

/**
 * Example 1: Mood History List
 */
export function MoodHistoryList({
  moods,
  loading,
  onRefresh,
  onMoodPress,
}: {
  moods: MoodEntry[];
  loading: boolean;
  onRefresh: () => void;
  onMoodPress: (mood: MoodEntry) => void;
}) {
  const { theme } = useAppTheme();
  const moodItemStyles = createMoodItemStyles(theme);
  
  const renderMoodItem = ({ item }: { item: MoodEntry }) => {
    const moodEmojis = {
      great: '😄',
      good: '😊',
      okay: '😐',
      bad: '😞',
      terrible: '😢',
    };

    return (
      <View style={moodItemStyles.container}>
        <View style={moodItemStyles.emojiContainer}>
          <Text style={moodItemStyles.emoji}>{moodEmojis[item.mood]}</Text>
        </View>
        <View style={moodItemStyles.content}>
          <Text style={moodItemStyles.date}>{item.date}</Text>
          {item.notes && (
            <Text style={moodItemStyles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <GenericList
      data={moods}
      renderItem={renderMoodItem}
      loading={loading}
      onRefresh={onRefresh}
      onItemPress={onMoodPress}
      emptyTitle="No mood entries yet"
      emptyDescription="Start tracking your mood to see insights and patterns"
      estimatedItemHeight={80}
      accessibilityLabel="Mood history list"
    />
  );
}

/**
 * Example 2: Exercise List with Categories
 */
export function ExercisesList({
  exercises,
  loading,
  loadingMore,
  onRefresh,
  onLoadMore,
  onExercisePress,
}: {
  exercises: Exercise[];
  loading: boolean;
  loadingMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onExercisePress: (exercise: Exercise) => void;
}) {
  const { theme } = useAppTheme();
  const exerciseItemStyles = createExerciseItemStyles(theme);
  
  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const categoryColors = {
      breathing: theme.colors.tint,
      meditation: theme.colors.secondary,
      mindfulness: theme.colors.tint,
    };

    return (
      <View style={exerciseItemStyles.container}>
        <View style={[
          exerciseItemStyles.categoryIndicator,
          { backgroundColor: categoryColors[item.category] }
        ]} />
        <View style={exerciseItemStyles.content}>
          <Text style={exerciseItemStyles.title}>{item.title}</Text>
          <Text style={exerciseItemStyles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={exerciseItemStyles.duration}>
            {item.duration} minutes
          </Text>
        </View>
        {item.completed && (
          <View style={exerciseItemStyles.checkmark}>
            <Text style={exerciseItemStyles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <GenericList
      data={exercises}
      renderItem={renderExerciseItem}
      loading={loading}
      loadingMore={loadingMore}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onItemPress={onExercisePress}
      emptyTitle="No exercises available"
      emptyDescription="Check back later for therapeutic exercises"
      estimatedItemHeight={100}
      maxToRenderPerBatch={8}
      windowSize={8}
      accessibilityLabel="Exercises list"
    />
  );
}

/**
 * Example 3: Simple Settings List
 */
export function SettingsList({
  settings,
  onSettingPress,
}: {
  settings: Array<{ id: string; title: string; subtitle?: string; value?: string }>;
  onSettingPress: (setting: any) => void;
}) {
  const renderSettingItem = ({ item }: { item: any }) => (
    <SimpleListItem
      title={item.title}
      subtitle={item.subtitle}
      rightText={item.value}
    />
  );

  return (
    <GenericList
      data={settings}
      renderItem={renderSettingItem}
      onItemPress={onSettingPress}
      showSeparators
      emptyTitle="No settings available"
      estimatedItemHeight={60}
      accessibilityLabel="Settings list"
    />
  );
}

/**
 * Example 4: Chat Messages (Optimized for Real-time)
 */
export function ChatMessagesList({
  messages,
  loading,
  onRefresh,
}: {
  messages: ChatMessage[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { theme } = useAppTheme();
  const chatStyles = createChatStyles(theme);
  
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        chatStyles.messageContainer,
        isUser ? chatStyles.userMessage : chatStyles.aiMessage
      ]}>
        <Text style={[
          chatStyles.messageText,
          isUser ? chatStyles.userMessageText : chatStyles.aiMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={chatStyles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <GenericList
      data={messages}
      renderItem={renderMessage}
      loading={loading}
      onRefresh={onRefresh}
      showSeparators={false}
      emptyTitle="Start a conversation"
      emptyDescription="Ask me anything about your mental wellness"
      // Optimized for chat - more items rendered for smooth scrolling
      maxToRenderPerBatch={20}
      windowSize={15}
      initialNumToRender={15}
      // Inverted for chat (newest at bottom)
      inverted
      accessibilityLabel="Chat messages"
    />
  );
}

// Styles for mood items
const createMoodItemStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: theme.spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  notes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondaryText,
    marginTop: 4,
  },
});

// Styles for exercise items
const createExerciseItemStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  categoryIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondaryText,
    marginBottom: 4,
  },
  duration: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondaryText,
    fontWeight: theme.fontWeight.medium,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.tint,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkmarkText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
});

// Styles for chat messages
const createChatStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => ({
  messageContainer: {
    marginHorizontal: theme.spacing.md,
    marginVertical: 4,
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  userMessage: {
    alignSelf: 'flex-end' as const,
    backgroundColor: theme.colors.tint,
  },
  aiMessage: {
    alignSelf: 'flex-start' as const,
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.background,
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 4,
    alignSelf: 'flex-end' as const,
  },
});