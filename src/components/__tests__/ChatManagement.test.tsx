/**
 * Comprehensive Tests for ChatManagement Component
 * Tests modal functionality, conversation management, search, and user interactions
 */

import './setup';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ChatManagement } from '../ui/ChatManagement';
import { useTranslation, useLocale } from '@/hooks/useLocale';

// Mock dependencies
const mockTranslation = jest.fn((key: string) => key);
const mockLocale = {
  locale: 'en' as const,
  setLocale: jest.fn(),
  t: mockTranslation,
  isRTL: false,
};

jest.mocked(useTranslation).mockReturnValue(mockTranslation);
jest.mocked(useLocale).mockReturnValue(mockLocale);

// Mock conversation helpers
jest.mock('@/utils/conversationHelpers', () => ({
  formatMessageTime: jest.fn((timestamp: number) => new Date(timestamp).toLocaleTimeString()),
  groupConversationsByDate: jest.fn((conversations: any[]) => [
    {
      date: 'Today',
      conversations: conversations.slice(0, 2),
    },
    {
      date: 'Yesterday',
      conversations: conversations.slice(2),
    },
  ]),
}));

describe('ChatManagement Component', () => {
  const mockConversations = [
    {
      _id: 'conv1',
      title: 'Mental Health Chat',
      lastMessage: {
        content: 'How are you feeling today?',
        timestamp: Date.now() - 1000,
        role: 'assistant' as const,
      },
      firstMessage: {
        content: 'I need help with anxiety',
        timestamp: Date.now() - 3600000,
        role: 'user' as const,
      },
      messageCount: 15,
      timestamp: Date.now() - 1000,
      isActive: true,
    },
    {
      _id: 'conv2',
      title: 'Stress Management',
      lastMessage: {
        content: 'Thanks for the advice',
        timestamp: Date.now() - 7200000,
        role: 'user' as const,
      },
      firstMessage: {
        content: 'I am feeling overwhelmed',
        timestamp: Date.now() - 86400000,
        role: 'user' as const,
      },
      messageCount: 8,
      timestamp: Date.now() - 7200000,
      isActive: false,
    },
    {
      _id: 'conv3',
      title: 'Mood Tracking',
      lastMessage: null,
      firstMessage: {
        content: 'Help me track my mood',
        timestamp: Date.now() - 172800000,
        role: 'user' as const,
      },
      messageCount: 3,
      timestamp: Date.now() - 172800000,
      isActive: false,
    },
  ];

  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    onNewChat: jest.fn(),
    onSelectConversation: jest.fn(),
    onDeleteConversation: jest.fn(),
    onArchiveConversation: jest.fn(),
    conversations: mockConversations,
    currentConversationId: 'conv1',
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible', () => {
      const { getByText } = render(<ChatManagement {...defaultProps} />);
      
      expect(getByText('chat_management.title')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <ChatManagement {...defaultProps} isVisible={false} />
      );
      
      expect(queryByText('chat_management.title')).toBeNull();
    });

    it('should render conversation list', () => {
      const { getByText } = render(<ChatManagement {...defaultProps} />);
      
      expect(getByText('Mental Health Chat')).toBeTruthy();
      expect(getByText('Stress Management')).toBeTruthy();
      expect(getByText('Mood Tracking')).toBeTruthy();
    });

    it('should display message previews', () => {
      const { getByText } = render(<ChatManagement {...defaultProps} />);
      
      expect(getByText('How are you feeling today?')).toBeTruthy();
      expect(getByText('Thanks for the advice')).toBeTruthy();
    });

    it('should show message count for each conversation', () => {
      const { getByText } = render(<ChatManagement {...defaultProps} />);
      
      expect(getByText('15 messages')).toBeTruthy();
      expect(getByText('8 messages')).toBeTruthy();
      expect(getByText('3 messages')).toBeTruthy();
    });

    it('should highlight active conversation', () => {
      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const activeConversation = getByTestId('conversation-conv1');
      expect(activeConversation.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: expect.any(String),
        })
      );
    });
  });

  describe('Modal Functionality', () => {
    it('should call onClose when close button is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onClose={onClose} />
      );
      
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onClose={onClose} />
      );
      
      const backdrop = getByTestId('modal-backdrop');
      fireEvent.press(backdrop);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should support swipe to close gesture', async () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onClose={onClose} />
      );
      
      const gestureHandler = getByTestId('swipe-gesture-handler');
      
      // Simulate swipe down gesture
      act(() => {
        fireEvent(gestureHandler, 'onHandlerStateChange', {
          nativeEvent: {
            state: 5, // END state
            translationY: 200, // Sufficient swipe distance
            velocityY: 500,
          },
        });
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Conversation Selection', () => {
    it('should call onSelectConversation when conversation is tapped', () => {
      const onSelectConversation = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onSelectConversation={onSelectConversation} />
      );
      
      const conversation = getByTestId('conversation-conv2');
      fireEvent.press(conversation);
      
      expect(onSelectConversation).toHaveBeenCalledWith('conv2');
    });

    it('should not call onSelectConversation for active conversation', () => {
      const onSelectConversation = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onSelectConversation={onSelectConversation} />
      );
      
      const activeConversation = getByTestId('conversation-conv1');
      fireEvent.press(activeConversation);
      
      expect(onSelectConversation).not.toHaveBeenCalled();
    });

    it('should provide haptic feedback on conversation selection', () => {
      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const conversation = getByTestId('conversation-conv2');
      fireEvent.press(conversation);
      
      // Haptic feedback should be triggered (mocked in setup)
      expect(jest.requireMock('expo-haptics').impactAsync).toHaveBeenCalled();
    });
  });

  describe('New Chat Functionality', () => {
    it('should call onNewChat when new chat button is pressed', () => {
      const onNewChat = jest.fn();
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} onNewChat={onNewChat} />
      );
      
      const newChatButton = getByTestId('new-chat-button');
      fireEvent.press(newChatButton);
      
      expect(onNewChat).toHaveBeenCalled();
    });

    it('should show new chat button prominently', () => {
      const { getByTestId, getByText } = render(<ChatManagement {...defaultProps} />);
      
      const newChatButton = getByTestId('new-chat-button');
      expect(newChatButton).toBeTruthy();
      expect(getByText('chat_management.new_chat')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      const { getByPlaceholderText } = render(<ChatManagement {...defaultProps} />);
      
      expect(getByPlaceholderText('chat_management.search_placeholder')).toBeTruthy();
    });

    it('should filter conversations based on search query', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <ChatManagement {...defaultProps} />
      );
      
      const searchInput = getByPlaceholderText('chat_management.search_placeholder');
      
      await act(async () => {
        fireEvent.changeText(searchInput, 'Mental');
      });

      expect(getByText('Mental Health Chat')).toBeTruthy();
      expect(queryByText('Stress Management')).toBeNull();
      expect(queryByText('Mood Tracking')).toBeNull();
    });

    it('should search in message content', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <ChatManagement {...defaultProps} />
      );
      
      const searchInput = getByPlaceholderText('chat_management.search_placeholder');
      
      await act(async () => {
        fireEvent.changeText(searchInput, 'feeling');
      });

      expect(getByText('Mental Health Chat')).toBeTruthy(); // Contains "How are you feeling today?"
      expect(queryByText('Stress Management')).toBeNull();
    });

    it('should handle empty search results', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ChatManagement {...defaultProps} />
      );
      
      const searchInput = getByPlaceholderText('chat_management.search_placeholder');
      
      await act(async () => {
        fireEvent.changeText(searchInput, 'nonexistent');
      });

      expect(getByText('chat_management.no_results')).toBeTruthy();
    });

    it('should clear search when input is empty', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ChatManagement {...defaultProps} />
      );
      
      const searchInput = getByPlaceholderText('chat_management.search_placeholder');
      
      // First search
      await act(async () => {
        fireEvent.changeText(searchInput, 'Mental');
      });

      // Clear search
      await act(async () => {
        fireEvent.changeText(searchInput, '');
      });

      // All conversations should be visible again
      expect(getByText('Mental Health Chat')).toBeTruthy();
      expect(getByText('Stress Management')).toBeTruthy();
      expect(getByText('Mood Tracking')).toBeTruthy();
    });
  });

  describe('Conversation Actions', () => {
    it('should show action menu when long pressed', async () => {
      const { getByTestId, getByText } = render(<ChatManagement {...defaultProps} />);
      
      const conversation = getByTestId('conversation-conv2');
      
      await act(async () => {
        fireEvent(conversation, 'onLongPress');
      });

      expect(getByText('chat_management.delete')).toBeTruthy();
      expect(getByText('chat_management.archive')).toBeTruthy();
    });

    it('should call onDeleteConversation when delete is confirmed', async () => {
      const onDeleteConversation = jest.fn();
      const { getByTestId, getByText } = render(
        <ChatManagement {...defaultProps} onDeleteConversation={onDeleteConversation} />
      );
      
      const conversation = getByTestId('conversation-conv2');
      
      await act(async () => {
        fireEvent(conversation, 'onLongPress');
      });

      const deleteButton = getByText('chat_management.delete');
      fireEvent.press(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(getByText('chat_management.delete_confirmation')).toBeTruthy();
      });

      const confirmButton = getByText('chat_management.confirm_delete');
      fireEvent.press(confirmButton);

      expect(onDeleteConversation).toHaveBeenCalledWith('conv2');
    });

    it('should call onArchiveConversation when archive is pressed', async () => {
      const onArchiveConversation = jest.fn();
      const { getByTestId, getByText } = render(
        <ChatManagement {...defaultProps} onArchiveConversation={onArchiveConversation} />
      );
      
      const conversation = getByTestId('conversation-conv2');
      
      await act(async () => {
        fireEvent(conversation, 'onLongPress');
      });

      const archiveButton = getByText('chat_management.archive');
      fireEvent.press(archiveButton);

      expect(onArchiveConversation).toHaveBeenCalledWith('conv2');
    });

    it('should not show action menu for active conversation', async () => {
      const { getByTestId, queryByText } = render(<ChatManagement {...defaultProps} />);
      
      const activeConversation = getByTestId('conversation-conv1');
      
      await act(async () => {
        fireEvent(activeConversation, 'onLongPress');
      });

      expect(queryByText('chat_management.delete')).toBeNull();
      expect(queryByText('chat_management.archive')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} isLoading={true} />
      );
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should disable interactions when loading', () => {
      const onSelectConversation = jest.fn();
      const { getByTestId } = render(
        <ChatManagement 
          {...defaultProps} 
          isLoading={true}
          onSelectConversation={onSelectConversation}
        />
      );
      
      const conversation = getByTestId('conversation-conv2');
      fireEvent.press(conversation);
      
      expect(onSelectConversation).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no conversations', () => {
      const { getByText } = render(
        <ChatManagement {...defaultProps} conversations={[]} />
      );
      
      expect(getByText('chat_management.no_conversations')).toBeTruthy();
      expect(getByText('chat_management.start_first_chat')).toBeTruthy();
    });

    it('should show new chat button in empty state', () => {
      const { getByTestId } = render(
        <ChatManagement {...defaultProps} conversations={[]} />
      );
      
      expect(getByTestId('new-chat-button')).toBeTruthy();
    });
  });

  describe('Localization', () => {
    it('should display Arabic content when locale is Arabic', () => {
      jest.mocked(useLocale).mockReturnValue({
        ...mockLocale,
        locale: 'ar',
        isRTL: true,
      });

      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const container = getByTestId('chat-management-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          direction: 'rtl',
        })
      );
    });

    it('should format timestamps according to locale', () => {
      const { getByText } = render(<ChatManagement {...defaultProps} />);
      
      // Should use formatMessageTime function which respects locale
      expect(getByText(/\d+:\d+/)).toBeTruthy(); // Time format pattern
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const conversation = getByTestId('conversation-conv1');
      expect(conversation.props.accessibilityLabel).toContain('Mental Health Chat');
      expect(conversation.props.accessibilityLabel).toContain('15 messages');
    });

    it('should announce conversation selection', () => {
      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const conversation = getByTestId('conversation-conv2');
      expect(conversation.props.accessibilityRole).toBe('button');
      expect(conversation.props.accessibilityHint).toBe('chat_management.select_conversation_hint');
    });

    it('should have proper modal accessibility', () => {
      const { getByTestId } = render(<ChatManagement {...defaultProps} />);
      
      const modal = getByTestId('chat-management-modal');
      expect(modal.props.accessibilityRole).toBe('dialog');
      expect(modal.props.accessibilityLabel).toBe('chat_management.modal_title');
    });
  });

  describe('Performance', () => {
    it('should handle large conversation lists efficiently', () => {
      const largeConversationList = Array.from({ length: 1000 }, (_, i) => ({
        _id: `conv${i}`,
        title: `Conversation ${i}`,
        lastMessage: {
          content: `Message ${i}`,
          timestamp: Date.now() - i * 1000,
          role: 'user' as const,
        },
        firstMessage: {
          content: `First message ${i}`,
          timestamp: Date.now() - i * 3600000,
          role: 'user' as const,
        },
        messageCount: i + 1,
        timestamp: Date.now() - i * 1000,
        isActive: false,
      }));

      const start = performance.now();
      const { getByText } = render(
        <ChatManagement {...defaultProps} conversations={largeConversationList} />
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should render within 1 second
      expect(getByText('Conversation 0')).toBeTruthy();
    });

    it('should handle rapid search input changes efficiently', async () => {
      const { getByPlaceholderText } = render(<ChatManagement {...defaultProps} />);
      
      const searchInput = getByPlaceholderText('chat_management.search_placeholder');
      const start = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          fireEvent.changeText(searchInput, `search${i}`);
        });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Should handle rapid changes within 500ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle conversations without last message', () => {
      const conversationsWithoutLastMessage = [
        {
          ...mockConversations[0],
          lastMessage: null,
        },
      ];

      const { getByText } = render(
        <ChatManagement {...defaultProps} conversations={conversationsWithoutLastMessage} />
      );
      
      expect(getByText('Mental Health Chat')).toBeTruthy();
      expect(getByText('chat_management.no_messages')).toBeTruthy();
    });

    it('should handle conversations without titles', () => {
      const conversationsWithoutTitles = [
        {
          ...mockConversations[0],
          title: undefined,
        },
      ];

      const { getByText } = render(
        <ChatManagement {...defaultProps} conversations={conversationsWithoutTitles} />
      );
      
      expect(getByText('chat_management.untitled_conversation')).toBeTruthy();
    });

    it('should handle network errors gracefully', async () => {
      const onDeleteConversation = jest.fn().mockRejectedValue(new Error('Network error'));
      const { getByTestId, getByText } = render(
        <ChatManagement {...defaultProps} onDeleteConversation={onDeleteConversation} />
      );
      
      const conversation = getByTestId('conversation-conv2');
      
      await act(async () => {
        fireEvent(conversation, 'onLongPress');
      });

      const deleteButton = getByText('chat_management.delete');
      fireEvent.press(deleteButton);

      const confirmButton = getByText('chat_management.confirm_delete');
      await act(async () => {
        fireEvent.press(confirmButton);
      });

      await waitFor(() => {
        expect(getByText('chat_management.error_deleting')).toBeTruthy();
      });
    });
  });
});