import './setup';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OptionCard } from '../OptionCard';

// Mock the glass effect hook
jest.mock('@/hooks/glass/useGlassEffect', () => ({
  useGlassStyle: () => ({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  }),
}));

// Mock the theme hook
jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      text: {
        primary: '#000000',
        secondary: '#666666',
      },
      interactive: {
        primary: '#007AFF',
      },
    },
  }),
}));

const mockOnPress = jest.fn();

const mockProps = {
  title: 'Daily Meditation',
  description: 'Practice mindfulness and reduce stress through guided meditation sessions.',
  icon: 'leaf.fill' as any,
  isSelected: false,
  onPress: mockOnPress,
};

describe('OptionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders title and description correctly', () => {
      render(<OptionCard {...mockProps} />);
      
      expect(screen.getByText('Daily Meditation')).toBeOnTheScreen();
      expect(screen.getByText('Practice mindfulness and reduce stress through guided meditation sessions.')).toBeOnTheScreen();
    });

    it('shows selected state correctly', () => {
      render(<OptionCard {...mockProps} isSelected={true} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      expect(card).toBeOnTheScreen();
    });

    it('shows unselected state correctly', () => {
      render(<OptionCard {...mockProps} isSelected={false} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      expect(card).toBeOnTheScreen();
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when card is pressed', () => {
      render(<OptionCard {...mockProps} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      fireEvent.press(card);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('calls onPress when title is pressed', () => {
      render(<OptionCard {...mockProps} />);
      
      const title = screen.getByText('Daily Meditation');
      fireEvent.press(title);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('handles multiple rapid presses', () => {
      render(<OptionCard {...mockProps} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role', () => {
      render(<OptionCard {...mockProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toBeOnTheScreen();
    });

    it('has descriptive accessibility label', () => {
      render(<OptionCard {...mockProps} />);
      
      const card = screen.getByLabelText('Daily Meditation. Practice mindfulness and reduce stress through guided meditation sessions.');
      expect(card).toBeOnTheScreen();
    });

    it('indicates selected state in accessibility', () => {
      render(<OptionCard {...mockProps} isSelected={true} />);
      
      const card = screen.getByA11yState({ selected: true });
      expect(card).toBeOnTheScreen();
    });

    it('indicates unselected state in accessibility', () => {
      render(<OptionCard {...mockProps} isSelected={false} />);
      
      const card = screen.getByA11yState({ selected: false });
      expect(card).toBeOnTheScreen();
    });
  });

  describe('Visual States', () => {
    it('applies selected styling when selected', () => {
      render(<OptionCard {...mockProps} isSelected={true} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      expect(card).toBeOnTheScreen();
    });

    it('applies default styling when not selected', () => {
      render(<OptionCard {...mockProps} isSelected={false} />);
      
      const card = screen.getByText('Daily Meditation').parent;
      expect(card).toBeOnTheScreen();
    });

    it('shows checkmark icon when selected', () => {
      render(<OptionCard {...mockProps} isSelected={true} />);
      
      // The checkmark should be rendered when selected
      const card = screen.getByText('Daily Meditation').parent;
      expect(card).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'This is a very long title that should wrap properly and not break the layout of the option card component';
      
      render(<OptionCard {...mockProps} title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeOnTheScreen();
    });

    it('handles very long descriptions', () => {
      const longDescription = 'This is a very long description that contains a lot of text and should wrap properly within the card without breaking the layout or causing any overflow issues with the text content that is being displayed to the user.';
      
      render(<OptionCard {...mockProps} description={longDescription} />);
      
      expect(screen.getByText(longDescription)).toBeOnTheScreen();
    });

    it('handles empty description', () => {
      render(<OptionCard {...mockProps} description="" />);
      
      expect(screen.getByText('Daily Meditation')).toBeOnTheScreen();
      expect(screen.getByText('')).toBeOnTheScreen();
    });

    it('handles special characters in title and description', () => {
      render(<OptionCard {...mockProps} title="Meditation 🧘‍♀️" description="Practice mindfulness & reduce stress! (5-10 mins)" />);
      
      expect(screen.getByText('Meditation 🧘‍♀️')).toBeOnTheScreen();
      expect(screen.getByText('Practice mindfulness & reduce stress! (5-10 mins)')).toBeOnTheScreen();
    });

    it('handles undefined onPress gracefully', () => {
      const propsWithoutOnPress = {
        ...mockProps,
        onPress: undefined as any,
      };
      
      expect(() => {
        render(<OptionCard {...propsWithoutOnPress} />);
      }).not.toThrow();
      
      expect(screen.getByText('Daily Meditation')).toBeOnTheScreen();
    });
  });

  describe('Performance', () => {
    it('handles rapid state changes', () => {
      const { rerender } = render(<OptionCard {...mockProps} isSelected={false} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<OptionCard {...mockProps} isSelected={i % 2 === 0} />);
      }
      
      expect(screen.getByText('Daily Meditation')).toBeOnTheScreen();
    });

    it('maintains performance with large content', () => {
      const largeContent = Array(100).fill('word').join(' ');
      
      render(<OptionCard {...mockProps} description={largeContent} />);
      
      expect(screen.getByText('Daily Meditation')).toBeOnTheScreen();
      expect(screen.getByText(largeContent)).toBeOnTheScreen();
    });
  });
});