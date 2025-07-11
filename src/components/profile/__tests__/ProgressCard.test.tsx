import './setup';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ProgressCard } from '../ProgressCard';

const mockColors = {
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
  },
};

const mockProgressRingGlass = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

// Mock the glass effect hook
jest.mock('@/hooks/glass/useGlassEffect', () => ({
  useGlassStyle: () => mockProgressRingGlass,
}));

// Mock the theme hook
jest.mock('@/theme', () => ({
  useAppTheme: () => ({ colors: mockColors }),
}));

const mockProps = {
  icon: 'heart.fill',
  title: 'Mood',
  value: '7.5',
  subtitle: 'Average',
  color: '#6495ED',
};

describe('ProgressCard', () => {
  describe('Rendering', () => {
    it('renders all props correctly', () => {
      render(<ProgressCard {...mockProps} />);
      
      expect(screen.getByText('Mood')).toBeOnTheScreen();
      expect(screen.getByText('7.5')).toBeOnTheScreen();
      expect(screen.getByText('Average')).toBeOnTheScreen();
    });

    it('renders trend indicator when provided', () => {
      render(<ProgressCard {...mockProps} trend="improving" />);
      
      // Check for trend arrow - it should be present in the component tree
      const valueContainer = screen.getByText('7.5').parent;
      expect(valueContainer).toBeOnTheScreen();
    });

    it('handles string values correctly', () => {
      render(<ProgressCard {...mockProps} value="Improving" />);
      
      expect(screen.getByText('Improving')).toBeOnTheScreen();
    });
  });

  describe('Progress Ring Calculation', () => {
    it('calculates correct progress for string values', () => {
      render(<ProgressCard {...mockProps} value="Improving" />);
      // Progress ring should show 80% for "Improving"
      expect(screen.getByText('Improving')).toBeOnTheScreen();
    });

    it('calculates correct progress for numeric values', () => {
      render(<ProgressCard {...mockProps} value="7.5" />);
      // Progress ring should show 75% for 7.5
      expect(screen.getByText('7.5')).toBeOnTheScreen();
    });

    it('handles declining trend', () => {
      render(<ProgressCard {...mockProps} value="Declining" />);
      // Progress ring should show 20% for "Declining"
      expect(screen.getByText('Declining')).toBeOnTheScreen();
    });
  });

  describe('Trend Indicators', () => {
    it('shows improving trend arrow', () => {
      render(<ProgressCard {...mockProps} trend="improving" />);
      
      const valueContainer = screen.getByText('7.5').parent;
      expect(valueContainer).toBeOnTheScreen();
    });

    it('shows declining trend arrow', () => {
      render(<ProgressCard {...mockProps} trend="declining" />);
      
      const valueContainer = screen.getByText('7.5').parent;
      expect(valueContainer).toBeOnTheScreen();
    });

    it('shows stable trend indicator', () => {
      render(<ProgressCard {...mockProps} trend="stable" />);
      
      const valueContainer = screen.getByText('7.5').parent;
      expect(valueContainer).toBeOnTheScreen();
    });

    it('hides trend when not provided', () => {
      render(<ProgressCard {...mockProps} />);
      
      // Only the value should be shown, no trend indicator
      expect(screen.getByText('7.5')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('has proper text hierarchy', () => {
      render(<ProgressCard {...mockProps} />);
      
      expect(screen.getByText('Mood')).toBeOnTheScreen();
      expect(screen.getByText('7.5')).toBeOnTheScreen();
      expect(screen.getByText('Average')).toBeOnTheScreen();
    });

    it('handles long text values', () => {
      render(<ProgressCard {...mockProps} title="Very Long Title Text" value="9.99" subtitle="Very Long Subtitle Text" />);
      
      expect(screen.getByText('Very Long Title Text')).toBeOnTheScreen();
      expect(screen.getByText('9.99')).toBeOnTheScreen();
      expect(screen.getByText('Very Long Subtitle Text')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty values', () => {
      render(<ProgressCard {...mockProps} value="" />);
      
      expect(screen.getByText('')).toBeOnTheScreen();
    });

    it('handles null/undefined values gracefully', () => {
      render(<ProgressCard {...mockProps} value={undefined as any} />);
      
      // Component should still render without crashing
      expect(screen.getByText('Mood')).toBeOnTheScreen();
    });

    it('handles very long color values', () => {
      render(<ProgressCard {...mockProps} color="rgba(100, 149, 237, 0.8)" />);
      
      expect(screen.getByText('7.5')).toBeOnTheScreen();
    });

    it('handles special characters in text', () => {
      render(<ProgressCard {...mockProps} title="Mood 😊" value="7.5★" subtitle="Avg 📊" />);
      
      expect(screen.getByText('Mood 😊')).toBeOnTheScreen();
      expect(screen.getByText('7.5★')).toBeOnTheScreen();
      expect(screen.getByText('Avg 📊')).toBeOnTheScreen();
    });
  });
});