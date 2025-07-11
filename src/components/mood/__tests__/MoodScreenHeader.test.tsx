import './setup';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MoodScreenHeader } from '../MoodScreenHeader';

const mockColors = {
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
  },
  interactive: {
    primary: '#007AFF',
  },
};

const mockProps = {
  colors: mockColors,
  locale: 'en' as const,
  userName: 'John',
  currentStreak: 5,
  onStreakPress: jest.fn(),
};

describe('MoodScreenHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders greeting and streak correctly', () => {
      render(<MoodScreenHeader {...mockProps} />);
      
      expect(screen.getByText('Good morning, John!')).toBeOnTheScreen();
      expect(screen.getByText('5')).toBeOnTheScreen();
      expect(screen.getByText('day streak')).toBeOnTheScreen();
    });

    it('renders Arabic content correctly', () => {
      render(<MoodScreenHeader {...mockProps} locale="ar" />);
      
      expect(screen.getByText('صباح الخير، John!')).toBeOnTheScreen();
      expect(screen.getByText('متتالية لمدة 5 أيام')).toBeOnTheScreen();
    });

    it('handles missing userName gracefully', () => {
      render(<MoodScreenHeader {...mockProps} userName={undefined} />);
      
      expect(screen.getByText('Good morning!')).toBeOnTheScreen();
    });
  });

  describe('User Interactions', () => {
    it('calls onStreakPress when streak container is pressed', () => {
      render(<MoodScreenHeader {...mockProps} />);
      
      const streakContainer = screen.getByText('5').parent;
      fireEvent.press(streakContainer);
      
      expect(mockProps.onStreakPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      render(<MoodScreenHeader {...mockProps} />);
      
      const streakContainer = screen.getByLabelText('Current streak: 5 days');
      expect(streakContainer).toBeOnTheScreen();
    });

    it('has proper accessibility role for streak button', () => {
      render(<MoodScreenHeader {...mockProps} />);
      
      const streakContainer = screen.getByRole('button');
      expect(streakContainer).toBeOnTheScreen();
    });
  });

  describe('Localization', () => {
    it('displays different greetings based on time of day', () => {
      const originalDate = Date;
      
      // Mock morning time
      jest.spyOn(global, 'Date').mockImplementation(() => new originalDate('2023-01-01T08:00:00Z'));
      render(<MoodScreenHeader {...mockProps} />);
      expect(screen.getByText('Good morning, John!')).toBeOnTheScreen();
      
      // Mock afternoon time
      jest.spyOn(global, 'Date').mockImplementation(() => new originalDate('2023-01-01T14:00:00Z'));
      render(<MoodScreenHeader {...mockProps} />);
      expect(screen.getByText('Good afternoon, John!')).toBeOnTheScreen();
      
      // Mock evening time
      jest.spyOn(global, 'Date').mockImplementation(() => new originalDate('2023-01-01T20:00:00Z'));
      render(<MoodScreenHeader {...mockProps} />);
      expect(screen.getByText('Good evening, John!')).toBeOnTheScreen();
      
      global.Date = originalDate;
    });
  });

  describe('Edge Cases', () => {
    it('handles zero streak correctly', () => {
      render(<MoodScreenHeader {...mockProps} currentStreak={0} />);
      
      expect(screen.getByText('0')).toBeOnTheScreen();
      expect(screen.getByText('day streak')).toBeOnTheScreen();
    });

    it('handles large streak numbers', () => {
      render(<MoodScreenHeader {...mockProps} currentStreak={365} />);
      
      expect(screen.getByText('365')).toBeOnTheScreen();
      expect(screen.getByText('day streak')).toBeOnTheScreen();
    });

    it('handles undefined streak', () => {
      render(<MoodScreenHeader {...mockProps} currentStreak={undefined} />);
      
      expect(screen.getByText('0')).toBeOnTheScreen();
    });
  });
});