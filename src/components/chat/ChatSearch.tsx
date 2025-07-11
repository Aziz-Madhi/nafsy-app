import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '../core/Icon/IconSymbol';
import { useTheme } from '@/theme';
import { useTranslation } from '@/hooks/useLocale';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatMessageTime } from '@/utils/dateHelpers';

interface ChatSearchProps {
  isVisible: boolean;
  onClose: () => void;
  conversationId: string | undefined;
  onSelectMessage?: (messageId: string) => void;
  locale: string;
}

export function ChatSearch({ isVisible, onClose, conversationId, onSelectMessage, locale }: ChatSearchProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Query for search results
  const searchResults = useQuery(
    api.messages.searchMessages,
    searchQuery.trim() && conversationId && isSearching
      ? { conversationId: conversationId as any, searchQuery: searchQuery.trim() }
      : 'skip'
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  }, [searchQuery]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Text key={index} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.system.separator }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {t('chat.search.title')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.colors.background.secondary }]}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder={t('chat.search.placeholder')}
              placeholderTextColor={theme.colors.text.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClear}>
                <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            {isSearching && searchResults === undefined ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
              </View>
            ) : searchResults?.messages && searchResults.messages.length > 0 ? (
              <>
                <Text style={[styles.resultCount, { color: theme.colors.text.secondary }]}>
                  {searchResults.totalMatches} {t('chat.search.results')}
                </Text>
                <FlatList
                  data={searchResults.messages}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.resultItem,
                        { 
                          backgroundColor: theme.colors.background.secondary,
                          borderColor: theme.colors.system.border,
                        }
                      ]}
                      onPress={() => {
                        onSelectMessage?.(item._id);
                        onClose();
                      }}
                    >
                      <View style={styles.resultHeader}>
                        <Text style={[styles.resultRole, { color: theme.colors.text.secondary }]}>
                          {item.role === 'user' ? t('chat.you') : t('chat.assistant')}
                        </Text>
                        <Text style={[styles.resultTime, { color: theme.colors.text.secondary }]}>
                          {formatMessageTime(item.timestamp, locale)}
                        </Text>
                      </View>
                      <Text
                        style={[styles.resultContent, { color: theme.colors.text.primary }]}
                        numberOfLines={3}
                      >
                        {highlightText(item.content, searchQuery)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.resultsList}
                />
              </>
            ) : isSearching && searchResults?.messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="magnifyingglass" size={48} color={theme.colors.text.secondary} />
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                  {t('chat.search.noResults')}
                </Text>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultTime: {
    fontSize: 12,
  },
  resultContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    backgroundColor: 'rgba(255, 204, 0, 0.3)',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});