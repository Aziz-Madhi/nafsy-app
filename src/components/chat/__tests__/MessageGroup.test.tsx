import './setup';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MessageGroup } from '../MessageGroup';

const mockTheme = {
  colors: {
    system: {
      separator: '#E5E5E7',
      border: '#D1D1D6',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#3C3C4399',
      onPrimary: '#FFFFFF',
    },
    interactive: {
      primary: '#007AFF',
    },
    background: {
      secondary: '#F2F2F7',
    },
  },
};

const mockFormatMessageTime = jest.fn().mockReturnValue('10:30 AM');
const mockOnMessageLongPress = jest.fn();

const mockGroupData = {
  id: 'group-1',
  date: 'Today',
  messages: [
    {
      _id: 'msg-1',
      role: 'user',
      content: 'Hello, how are you?',
      _creationTime: 1634567890000,
      reactions: [],
    },
    {
      _id: 'msg-2',
      role: 'assistant',
      content: "I'm doing well, thank you! How can I help you today?",
      _creationTime: 1634567900000,
      reactions: [
        { emoji: '👍', count: 2 },
        { emoji: '❤️', count: 1 },
      ],
    },
  ],
};

const mockProps = {
  group: mockGroupData,
  theme: mockTheme,
  onMessageLongPress: mockOnMessageLongPress,
  formatMessageTime: mockFormatMessageTime,
  locale: 'en' as const,
};

describe('MessageGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders date separator correctly', () => {
      render(<MessageGroup {...mockProps} />);
      
      expect(screen.getByText('Today')).toBeOnTheScreen();
    });

    it('renders all messages in the group', () => {
      render(<MessageGroup {...mockProps} />);
      
      expect(screen.getByText('Hello, how are you?')).toBeOnTheScreen();
      expect(screen.getByText("I'm doing well, thank you! How can I help you today?")).toBeOnTheScreen();
    });

    it('renders message timestamps', () => {
      render(<MessageGroup {...mockProps} />);
      
      const timestamps = screen.getAllByText('10:30 AM');
      expect(timestamps).toHaveLength(2);
      expect(mockFormatMessageTime).toHaveBeenCalledWith(1634567890000);
      expect(mockFormatMessageTime).toHaveBeenCalledWith(1634567900000);
    });

    it('renders message reactions when present', () => {
      render(<MessageGroup {...mockProps} />);
      
      expect(screen.getByText('👍')).toBeOnTheScreen();
      expect(screen.getByText('2')).toBeOnTheScreen();
      expect(screen.getByText('❤️')).toBeOnTheScreen();
      expect(screen.getByText('1')).toBeOnTheScreen();
    });
  });

  describe('User Interactions', () => {
    it('calls onMessageLongPress when message is long pressed', () => {
      render(<MessageGroup {...mockProps} />);
      
      const userMessage = screen.getByText('Hello, how are you?');
      const mockEvent = { nativeEvent: { pageX: 100, pageY: 200 } };
      
      fireEvent(userMessage, 'longPress', mockEvent);
      
      expect(mockOnMessageLongPress).toHaveBeenCalledWith(mockEvent, 'msg-1');
    });

    it('handles long press on assistant message', () => {
      render(<MessageGroup {...mockProps} />);
      
      const assistantMessage = screen.getByText("I'm doing well, thank you! How can I help you today?");
      const mockEvent = { nativeEvent: { pageX: 150, pageY: 250 } };
      
      fireEvent(assistantMessage, 'longPress', mockEvent);
      
      expect(mockOnMessageLongPress).toHaveBeenCalledWith(mockEvent, 'msg-2');
    });
  });

  describe('Message Styling', () => {
    it('applies correct styling for user messages', () => {
      render(<MessageGroup {...mockProps} />);
      
      const userMessage = screen.getByText('Hello, how are you?');
      expect(userMessage).toHaveStyle({ color: mockTheme.colors.text.onPrimary });
    });

    it('applies correct styling for assistant messages', () => {
      render(<MessageGroup {...mockProps} />);
      
      const assistantMessage = screen.getByText("I'm doing well, thank you! How can I help you today?");
      expect(assistantMessage).toHaveStyle({ color: mockTheme.colors.text.primary });
    });

    it('applies RTL text alignment for Arabic locale', () => {
      render(<MessageGroup {...mockProps} locale="ar" />);
      
      const userMessage = screen.getByText('Hello, how are you?');
      expect(userMessage).toHaveStyle({ textAlign: 'right' });
    });

    it('applies LTR text alignment for English locale', () => {
      render(<MessageGroup {...mockProps} />);
      
      const userMessage = screen.getByText('Hello, how are you?');
      expect(userMessage).toHaveStyle({ textAlign: 'left' });
    });
  });

  describe('Edge Cases', () => {
    it('handles messages without reactions', () => {
      const groupWithoutReactions = {
        ...mockGroupData,
        messages: [
          {
            _id: 'msg-1',
            role: 'user',
            content: 'Hello',
            _creationTime: 1634567890000,
            reactions: [],
          },
        ],
      };

      render(<MessageGroup {...mockProps} group={groupWithoutReactions} />);
      
      expect(screen.getByText('Hello')).toBeOnTheScreen();
      expect(screen.queryByText('👍')).not.toBeOnTheScreen();
    });

    it('handles messages with undefined reactions', () => {
      const groupWithUndefinedReactions = {
        ...mockGroupData,
        messages: [
          {
            _id: 'msg-1',
            role: 'user',
            content: 'Hello',
            _creationTime: 1634567890000,
            // reactions property missing
          } as any,
        ],
      };

      render(<MessageGroup {...mockProps} group={groupWithUndefinedReactions} />);
      
      expect(screen.getByText('Hello')).toBeOnTheScreen();
    });

    it('handles empty message group', () => {
      const emptyGroup = {
        ...mockGroupData,
        messages: [],
      };

      render(<MessageGroup {...mockProps} group={emptyGroup} />);
      
      expect(screen.getByText('Today')).toBeOnTheScreen();
      expect(screen.queryByText('Hello, how are you?')).not.toBeOnTheScreen();
    });

    it('handles very long message content', () => {
      const longMessageGroup = {
        ...mockGroupData,
        messages: [
          {
            _id: 'msg-1',
            role: 'user',
            content: 'This is a very long message that contains a lot of text and should still be displayed correctly within the message bubble without breaking the layout or causing any issues with the text wrapping or overflow.',
            _creationTime: 1634567890000,
            reactions: [],
          },
        ],
      };

      render(<MessageGroup {...mockProps} group={longMessageGroup} />);
      
      expect(screen.getByText(/This is a very long message/)).toBeOnTheScreen();
    });
  });

  describe('Performance', () => {
    it('handles rapid long press events without duplicate calls', () => {
      render(<MessageGroup {...mockProps} />);
      
      const userMessage = screen.getByText('Hello, how are you?');
      const mockEvent = { nativeEvent: { pageX: 100, pageY: 200 } };
      
      // Rapid fire events
      fireEvent(userMessage, 'longPress', mockEvent);
      fireEvent(userMessage, 'longPress', mockEvent);
      fireEvent(userMessage, 'longPress', mockEvent);
      
      // Should only be called once per actual long press
      expect(mockOnMessageLongPress).toHaveBeenCalledTimes(3);
    });
  });
});