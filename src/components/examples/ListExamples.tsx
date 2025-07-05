/**
 * GenericList usage examples for Nafsy app
 * Following LEVER framework - demonstrating reusable list patterns
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GenericList, SimpleListItem } from '@/components/ui/GenericList';
import { CommonStyles } from '@/utils/styles';
import * as AC from '@bacons/apple-colors';

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
  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const categoryColors = {
      breathing: AC.systemBlue,
      meditation: AC.systemPurple,
      mindfulness: AC.systemGreen,
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
const moodItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AC.systemBackground,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AC.secondarySystemGroupedBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: AC.label,
  },
  notes: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginTop: 4,
  },
});

// Styles for exercise items
const exerciseItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: AC.systemBackground,
  },
  categoryIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AC.label,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: AC.tertiaryLabel,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AC.systemGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

// Styles for chat messages
const chatStyles = StyleSheet.create({
  messageContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: AC.systemBlue,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: AC.label,
  },
  timestamp: {
    fontSize: 11,
    color: AC.tertiaryLabel,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});