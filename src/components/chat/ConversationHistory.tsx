import { useTheme } from '@/theme';
import { useTranslation, useLocale } from '@/hooks/useLocale';
import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { ContentUnavailable } from '@/components/feedback/ContentUnavailable';
import { groupConversationsByDate, generateConversationTitle, formatConversationTime, truncateMessage } from '@/utils/conversationHelpers';
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';


interface ConversationWithPreview {
  _id: string;
  userId: string;
  title?: string;
  isActive: boolean;
  messageCount: number;
  createdAt: number;
  firstMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
  lastMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
}

interface ConversationHistoryProps {
  isVisible: boolean;
  onClose: () => void;
  conversations?: ConversationWithPreview[];
  isLoading?: boolean;
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string;
}

// Separator component extracted to avoid nested component error
const GroupSeparator = () => <View style={styles.groupSeparator} />;

export function ConversationHistory({
  isVisible,
  onClose,
  conversations = [],
  isLoading = false,
  onSelectConversation,
  activeConversationId,
}: ConversationHistoryProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { theme } = useTheme();

  const groupedConversations = groupConversationsByDate(conversations, locale);

  const handleSelectConversation = (conversationId: string) => {
    if (conversationId === activeConversationId) {
      // Already on this conversation, just close the modal
      onClose();
      return;
    }

    Alert.alert(
      t("chat.history.switchConversation.title"),
      t("chat.history.switchConversation.message"),
      [
        { text: t("cancel"), style: "cancel" },
        { 
          text: t("chat.history.switchConversation.confirm"), 
          onPress: () => {
            onSelectConversation(conversationId);
            onClose();
          },
          style: "default"
        }
      ]
    );
  };

  const renderConversationItem = ({ item }: { item: ConversationWithPreview }) => {
    const isActive = item._id === activeConversationId;
    const title = generateConversationTitle(item, locale);
    const lastMessageText = item.lastMessage ? truncateMessage(item.lastMessage.content, 60) : '';
    const timeText = item.lastMessage ? formatConversationTime(item.lastMessage.timestamp, locale) : '';

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: isActive ? theme.colors.interactive.primary : theme.colors.background.secondary,
            borderColor: isActive ? theme.colors.interactive.primary : theme.colors.system.border,
          }
        ]}
        onPress={() => handleSelectConversation(item._id)}
        activeOpacity={0.8}
      >
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text 
              style={[
                styles.conversationTitle,
                { color: isActive ? theme.colors.text.inverse : theme.colors.text.primary }
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text 
              style={[
                styles.conversationTime,
                { color: isActive ? theme.colors.text.inverse : theme.colors.text.secondary }
              ]}
            >
              {timeText}
            </Text>
          </View>
          
          {lastMessageText ? <Text 
              style={[
                styles.conversationPreview,
                { color: isActive ? theme.colors.text.inverse : theme.colors.text.secondary }
              ]}
              numberOfLines={2}
            >
              {lastMessageText}
            </Text> : null}
          
          <View style={styles.conversationMeta}>
            <Text 
              style={[
                styles.messageCount,
                { color: isActive ? theme.colors.text.inverse : theme.colors.text.tertiary }
              ]}
            >
              {item.messageCount} {item.messageCount === 1 ? t("chat.history.message") : t("chat.history.messages")}
            </Text>
            
            {isActive ? <View style={[styles.activeBadge, { backgroundColor: theme.colors.text.inverse }]}>
                <Text style={[styles.activeBadgeText, { color: theme.colors.interactive.primary }]}>
                  {t("chat.history.active")}
                </Text>
              </View> : null}
          </View>
        </View>
        
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={isActive ? theme.colors.text.inverse : theme.colors.text.tertiary} 
        />
      </TouchableOpacity>
    );
  };

  const renderGroupHeader = ({ item }: { item: { date: string; conversations: ConversationWithPreview[] } }) => (
    <View style={styles.groupHeader}>
      <Text style={[styles.groupHeaderText, { color: theme.colors.text.secondary }]}>
        {item.date}
      </Text>
      <View style={[styles.groupHeaderLine, { backgroundColor: theme.colors.system.separator }]} />
    </View>
  );

  const renderGroup = ({ item }: { item: { date: string; conversations: ConversationWithPreview[] } }) => (
    <View style={styles.group}>
      {renderGroupHeader({ item })}
      {item.conversations.map((conversation) => (
        <View key={conversation._id}>
          {renderConversationItem({ item: conversation })}
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary, borderBottomColor: theme.colors.system.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {t("chat.history.title")}
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                {t("chat.history.loading")}
              </Text>
            </View>
          ) : groupedConversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ContentUnavailable
                title={t("chat.history.empty.title")}
                description={t("chat.history.empty.description")}
                systemImage="bubble.left.and.bubble.right"
              />
            </View>
          ) : (
            <FlatList
              data={groupedConversations}
              renderItem={renderGroup}
              keyExtractor={(item) => item.date}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={GroupSeparator}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingVertical: 16,
  },
  group: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  groupHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  groupHeaderLine: {
    flex: 1,
    height: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  conversationContent: {
    flex: 1,
    gap: 6,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  conversationPreview: {
    fontSize: 14,
    lineHeight: 18,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  groupSeparator: {
    height: 16,
  },
});