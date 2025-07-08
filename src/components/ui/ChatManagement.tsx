import { useTheme } from '@/theme';
import { useTranslation, useLocale } from '@/hooks/useLocale';
import { IconSymbol } from './IconSymbol';
import { formatMessageTime, groupConversationsByDate } from '@/utils/conversationHelpers';
import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface ConversationPreview {
  _id: string;
  title?: string;
  lastMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant';
  } | null;
  firstMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant';
  } | null;
  messageCount: number;
  timestamp?: number;
  createdAt?: number;
  isActive?: boolean;
}

interface ChatManagementProps {
  isVisible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations?: ConversationPreview[];
  isLoadingConversations?: boolean;
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string;
  onRequestSummary: (conversationId: string) => void;
}

interface ConversationItemProps {
  conversation: ConversationPreview;
  onPress: () => void;
  onSummary: () => void;
  isActive?: boolean;
}

const ConversationItem = ({ conversation, onPress, onSummary, isActive }: ConversationItemProps) => {
  const { theme } = useTheme();
  const { locale } = useLocale();
  
  const displayMessage = conversation.lastMessage || conversation.firstMessage;
  const messagePreview = displayMessage && displayMessage.content ? 
    (displayMessage.content.length > 60 ? 
      displayMessage.content.substring(0, 60) + '...' : 
      displayMessage.content
    ) : 'No messages';
    
  const conversationTitle = conversation.title || 
    (displayMessage?.content ? 
      (displayMessage.content.length > 30 ? 
        displayMessage.content.substring(0, 30) + '...' : 
        displayMessage.content
      ) : 
      'New conversation'
    );
  
  // Safely format the timestamp with validation
  const formatTimestamp = (timestamp: number): string => {
    try {
      if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
        return 'Unknown time';
      }
      return formatMessageTime(timestamp, locale);
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp, error);
      return 'Unknown time';
    }
  };
    
  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: isActive ? theme.colors.interactive.primary + '15' : 'transparent',
          borderLeftColor: isActive ? theme.colors.interactive.primary : 'transparent',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[
            styles.conversationTitle,
            { color: theme.colors.text.primary }
          ]}>
            {conversationTitle}
          </Text>
          <View style={styles.headerActions}>
            {isActive ? <View style={[
                styles.activeIndicator,
                { backgroundColor: theme.colors.interactive.primary }
              ]}>
                <Text style={[
                  styles.activeText,
                  { color: theme.colors.text.inverse }
                ]}>
                  Current
                </Text>
              </View> : null}
            <TouchableOpacity
              onPress={onSummary}
              style={styles.summaryButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol 
                name="doc.text.magnifyingglass" 
                size={16} 
                color={theme.colors.text.tertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={[
          styles.conversationPreview,
          { color: theme.colors.text.secondary }
        ]}>
          {messagePreview}
        </Text>
        
        <View style={styles.conversationMeta}>
          <Text style={[
            styles.conversationTime,
            { color: theme.colors.text.tertiary }
          ]}>
            {formatTimestamp(conversation.timestamp)}
          </Text>
          <Text style={[
            styles.messageCount,
            { color: theme.colors.text.tertiary }
          ]}>
            {conversation.messageCount || 0} {(conversation.messageCount || 0) === 1 ? 'message' : 'messages'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SearchSection = ({
  searchAnimValue,
  theme,
  searchInputRef,
  searchText,
  setSearchText,
}: {
  searchAnimValue: any;
  theme: any;
  searchInputRef: React.RefObject<TextInput>;
  searchText: string;
  setSearchText: (text: string) => void;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(searchAnimValue.value, [0, 1], [0, 60]),
      opacity: searchAnimValue.value,
    };
  });

  return (
    <Animated.View style={[
      styles.searchContainer,
      {
        backgroundColor: theme.colors.background.primary,
        borderBottomColor: theme.colors.system.separator,
      },
      animatedStyle,
    ]}>
      <View style={styles.searchInputContainer}>
        <IconSymbol name="magnifyingglass" size={16} color={theme.colors.text.tertiary} />
        <TextInput
          ref={searchInputRef}
          style={[
            styles.searchInput,
            { color: theme.colors.text.primary }
          ]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.text.placeholder}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export function ChatManagement({
  isVisible,
  onClose,
  onNewChat,
  conversations = [],
  isLoadingConversations = false,
  onSelectConversation,
  activeConversationId,
  onRequestSummary,
}: ChatManagementProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const searchAnimValue = useSharedValue(0);
  
  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 50) {
        // Swipe down - hide search
        hideSearch();
      } else if (event.nativeEvent.translationY < -50) {
        // Swipe up - show search
        showSearchInput();
      }
    }
  };
  
  const showSearchInput = () => {
    setShowSearch(true);
    searchAnimValue.value = withTiming(1, { duration: 300 }, () => {
      searchInputRef.current?.focus();
    });
  };
  
  const hideSearch = () => {
    searchAnimValue.value = withTiming(0, { duration: 300 }, () => {
      setShowSearch(false);
      setSearchText('');
    });
  };
  
  // Map conversations to ensure proper data structure
  const mappedConversations = conversations.map(conv => ({
    ...conv,
    timestamp: conv.createdAt || conv.timestamp || Date.now(), // Use createdAt as fallback
  }));

  // Debug logging
  React.useEffect(() => {
    if (conversations && conversations.length > 0) {
      console.log('Conversations received:', conversations.length);
      console.log('First conversation structure:', conversations[0]);
      console.log('Valid conversations after filtering:', validConversations.length);
      console.log('Grouped conversations:', groupedConversations.length);
    } else {
      console.log('No conversations received or conversations is undefined/empty');
    }
  }, [conversations, validConversations, groupedConversations]);

  const validConversations = mappedConversations.filter(conv => 
    conv && 
    conv._id && 
    typeof conv.messageCount === 'number' &&
    conv.timestamp &&
    !isNaN(conv.timestamp)
  );

  const filteredConversations = validConversations.filter(conv => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const title = conv.title?.toLowerCase() || '';
    const lastMessage = conv.lastMessage?.content?.toLowerCase() || '';
    const firstMessage = conv.firstMessage?.content?.toLowerCase() || '';
    return title.includes(searchLower) || lastMessage.includes(searchLower) || firstMessage.includes(searchLower);
  });
  
  const groupedConversations = groupConversationsByDate(filteredConversations, locale);
  
  const handleNewChat = () => {
    Alert.alert(
      t("chat.newChat.title"),
      t("chat.newChat.message"),
      [
        { text: t("cancel"), style: "cancel" },
        { 
          text: t("chat.newChat.confirm"), 
          onPress: () => {
            onClose();
            onNewChat();
          },
          style: "default"
        }
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary }
      ]}>
        {/* Header */}
        <View style={[
          styles.header,
          { 
            backgroundColor: theme.colors.background.primary,
            borderBottomColor: theme.colors.system.separator 
          }
        ]}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="chevron.left" size={20} color={theme.colors.text.primary} />
            <Text style={[
              styles.backText,
              { color: theme.colors.text.primary }
            ]}>
              Home
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[
              styles.headerTitle,
              { color: theme.colors.text.primary }
            ]}>
              Chats
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Section */}
        {showSearch ? <SearchSection
            searchAnimValue={searchAnimValue}
            theme={theme}
            searchInputRef={searchInputRef}
            searchText={searchText}
            setSearchText={setSearchText}
          /> : null}

        {/* Main Content */}
        <PanGestureHandler onHandlerStateChange={handleGestureStateChange}>
          <View style={styles.gestureContainer}>
            <ScrollView 
              ref={scrollRef}
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                if (offsetY <= 0 && !showSearch) {
                  showSearchInput();
                }
              }}
              scrollEventThrottle={16}
            >
              {isLoadingConversations ? (
                <View style={styles.loadingContainer}>
                  <Text style={[
                    styles.loadingText,
                    { color: theme.colors.text.secondary }
                  ]}>
                    Loading conversations...
                  </Text>
                </View>
              ) : !conversations || conversations.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol 
                    name="bubble.left.and.bubble.right" 
                    size={48} 
                    color={theme.colors.text.tertiary} 
                  />
                  <Text style={[
                    styles.emptyTitle,
                    { color: theme.colors.text.primary }
                  ]}>
                    No conversations yet
                  </Text>
                  <Text style={[
                    styles.emptyDescription,
                    { color: theme.colors.text.secondary }
                  ]}>
                    Start chatting to see your conversation history here
                  </Text>
                </View>
              ) : groupedConversations.length > 0 ? (
                groupedConversations.map((group, groupIndex) => (
                  <View key={groupIndex} style={styles.dateGroup}>
                    <Text style={[
                      styles.dateLabel,
                      { color: theme.colors.text.secondary }
                    ]}>
                      {group.date}
                    </Text>
                    {group.conversations.map((conversation) => (
                      <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        onPress={() => {
                          if (conversation._id !== activeConversationId) {
                            onSelectConversation(conversation._id);
                          }
                          onClose();
                        }}
                        onSummary={() => onRequestSummary(conversation._id)}
                        isActive={conversation._id === activeConversationId}
                      />
                    ))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <IconSymbol 
                    name="bubble.left.and.bubble.right" 
                    size={48} 
                    color={theme.colors.text.tertiary} 
                  />
                  <Text style={[
                    styles.emptyTitle,
                    { color: theme.colors.text.primary }
                  ]}>
                    No conversations yet
                  </Text>
                  <Text style={[
                    styles.emptyDescription,
                    { color: theme.colors.text.secondary }
                  ]}>
                    Start chatting to see your conversation history here
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </PanGestureHandler>

        {/* New Chat Button */}
        <View style={[
          styles.bottomContainer,
          { backgroundColor: theme.colors.background.primary }
        ]}>
          <TouchableOpacity
            style={[
              styles.newChatButton,
              { backgroundColor: theme.colors.interactive.primary }
            ]}
            onPress={handleNewChat}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={20} color={theme.colors.text.inverse} />
            <Text style={[
              styles.newChatText,
              { color: theme.colors.text.inverse }
            ]}>
              New Chat
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
  searchContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  gestureContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  dateGroup: {
    marginTop: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conversationItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
  },
  conversationContent: {
    gap: 6,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryButton: {
    padding: 4,
  },
  conversationPreview: {
    fontSize: 15,
    lineHeight: 20,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: 13,
  },
  messageCount: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: '600',
  },
});