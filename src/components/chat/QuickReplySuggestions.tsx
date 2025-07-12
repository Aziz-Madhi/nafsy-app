import { useTheme } from '@/theme';
import { colorUtils } from '@/theme/colors';
import React, { memo, useCallback } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface QuickReply {
  id: string;
  text: string;
  icon?: string;
  sentiment: 'positive' | 'neutral' | 'supportive' | 'mindful' | 'encouraging';
  moodContext?: 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';
}

interface QuickReplySuggestionsProps {
  suggestions: QuickReply[];
  onSelect: (text: string) => void;
  mode: 'floating' | 'traditional';
  isVisible: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Mood-appropriate color mapping based on context
const MOOD_COLORS = {
  excellent: '#4CAF50',   // Calming green
  good: '#8BC34A',        // Light green
  okay: '#4A90E2',        // Soft blue (neutral/calming) - colors.interactive.primary
  bad: '#F8A25D',         // Warm peach (supportive)
  terrible: '#7ED321',    // Muted green (hopeful) - colors.wellness.growth
};

const SENTIMENT_COLORS = {
  positive: '#4CAF50',    // Success green
  neutral: '#4A90E2',     // Soft blue - colors.interactive.primary
  supportive: '#F8A25D',  // Warm peach
  mindful: '#9B59B6',     // Soft purple
  encouraging: '#7ED321', // Muted green - colors.wellness.growth
};

/**
 * QuickReplySuggestions - Contextual reply options for mental health chat
 * LEVER Framework: Reuses existing theme system, animations, and touch patterns
 * 
 * Features:
 * - Mode-aware rendering (floating vs traditional)
 * - Mental health focused suggestions
 * - Reuses existing theme and styling patterns
 * - Accessibility support
 * - Smooth animations
 */
const QuickReplySuggestionsComponent: React.FC<QuickReplySuggestionsProps> = ({
  suggestions,
  onSelect,
  mode,
  isVisible,
}) => {
  const { theme } = useTheme();

  const handleSelect = useCallback((text: string) => {
    onSelect(text);
  }, [onSelect]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  // Render for floating mode - horizontal scroll like traditional mode but styled differently
  if (mode === 'floating') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.floatingScrollContent}
      >
        {suggestions.slice(0, 3).map((suggestion, index) => {
          const moodColor = suggestion.moodContext 
            ? MOOD_COLORS[suggestion.moodContext] 
            : getSentimentColor(suggestion.sentiment, theme);
          
          return (
            <AnimatedTouchableOpacity
              key={suggestion.id}
              style={[
                styles.floatingChip,
                {
                  backgroundColor: colorUtils.withOpacity(moodColor, 0.15),
                  borderColor: moodColor,
                }
              ]}
              onPress={() => handleSelect(suggestion.text)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Quick reply: ${suggestion.text}`}
            >
              <Text 
                style={[
                  styles.floatingChipText, 
                  { color: theme.scheme === 'dark' ? theme.colors.text.primary : moodColor }
                ]} 
                numberOfLines={1}
              >
                {suggestion.text}
              </Text>
            </AnimatedTouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Render for traditional mode - chips above keyboard
  return (
    <View style={[styles.traditionalContainer, { backgroundColor: theme.colors.background.secondary }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion) => {
          const moodColor = suggestion.moodContext 
            ? MOOD_COLORS[suggestion.moodContext] 
            : getSentimentColor(suggestion.sentiment, theme);
          
          return (
            <AnimatedTouchableOpacity
              key={suggestion.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colorUtils.withOpacity(moodColor, 0.1),
                  borderColor: colorUtils.withOpacity(moodColor, 0.3),
                }
              ]}
              onPress={() => handleSelect(suggestion.text)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Quick reply: ${suggestion.text}`}
            >
              <Text 
                style={[
                  styles.chipText, 
                  { 
                    color: theme.scheme === 'dark' 
                      ? theme.colors.text.primary 
                      : colorUtils.darken(moodColor, 0.2) 
                  }
                ]}
                numberOfLines={1}
              >
                {suggestion.text}
              </Text>
            </AnimatedTouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

QuickReplySuggestionsComponent.displayName = 'QuickReplySuggestions';

export const QuickReplySuggestions = memo(QuickReplySuggestionsComponent);

// Helper functions for floating mode positioning
function _getFloatingPosition(index: number) {
  const positions = [
    { left: width * 0.15, top: -30 }, // Top left
    { left: width * 0.6, top: -20 },  // Top right
    { left: width * 0.35, top: -50 }, // Top center
  ];
  return positions[index] || positions[0];
}

function getSentimentColor(
  sentiment: QuickReply['sentiment'], 
  theme: ReturnType<typeof useTheme>['theme']
): string {
  // Use our new evidence-based colors
  return SENTIMENT_COLORS[sentiment] || theme.colors.interactive.primary;
}

const styles = StyleSheet.create({
  // Floating mode styles
  floatingScrollContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  floatingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingChipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Traditional mode styles
  traditionalContainer: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});