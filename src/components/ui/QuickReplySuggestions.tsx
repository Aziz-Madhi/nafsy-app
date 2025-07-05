import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as AC from '@bacons/apple-colors';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/hooks/useLocale';

const { width } = Dimensions.get('window');

interface QuickReply {
  id: string;
  text: string;
  icon?: string;
  sentiment: 'positive' | 'neutral' | 'supportive';
}

interface QuickReplySuggestionsProps {
  suggestions: QuickReply[];
  onSelect: (text: string) => void;
  mode: 'floating' | 'traditional';
  isVisible: boolean;
}

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
export const QuickReplySuggestions = memo<QuickReplySuggestionsProps>(({
  suggestions,
  onSelect,
  mode,
  isVisible,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        {suggestions.slice(0, 3).map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.floatingChip,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: getSentimentColor(suggestion.sentiment),
              }
            ]}
            onPress={() => handleSelect(suggestion.text)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Quick reply: ${suggestion.text}`}
          >
            <Text style={[styles.floatingChipText, { color: '#2D3748' }]} numberOfLines={1}>
              {suggestion.text}
            </Text>
          </TouchableOpacity>
        ))}
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
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.chip,
              {
                backgroundColor: theme.colors.interactive.secondary,
                borderColor: theme.colors.system.border,
              }
            ]}
            onPress={() => handleSelect(suggestion.text)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Quick reply: ${suggestion.text}`}
          >
            <Text 
              style={[styles.chipText, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {suggestion.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// Helper functions for floating mode positioning
function getFloatingPosition(index: number) {
  const positions = [
    { left: width * 0.15, top: -30 }, // Top left
    { left: width * 0.6, top: -20 },  // Top right
    { left: width * 0.35, top: -50 }, // Top center
  ];
  return positions[index] || positions[0];
}

function getSentimentColor(sentiment: QuickReply['sentiment']): string {
  switch (sentiment) {
    case 'positive':
      return 'rgba(52, 199, 89, 0.9)'; // systemGreen
    case 'supportive':
      return 'rgba(100, 149, 237, 0.9)'; // systemBlue
    default:
      return 'rgba(255, 255, 255, 0.95)'; // neutral white
  }
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderTopColor: AC.separator,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});