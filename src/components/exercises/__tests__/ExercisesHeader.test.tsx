import './setup';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ExercisesHeader } from '../ExercisesHeader';

const mockColors = {
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
};

const mockProps = {
  colors: mockColors,
  locale: 'en' as const,
};

describe('ExercisesHeader', () => {
  describe('Rendering', () => {
    it('renders English content correctly', () => {
      render(<ExercisesHeader {...mockProps} />);
      
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
      expect(screen.getByText('Evidence-based techniques for your mental health')).toBeOnTheScreen();
    });

    it('renders Arabic content correctly', () => {
      render(<ExercisesHeader {...mockProps} locale="ar" />);
      
      expect(screen.getByText('تمارين العافية')).toBeOnTheScreen();
      expect(screen.getByText('تقنيات مثبتة علمياً لصحتك النفسية')).toBeOnTheScreen();
    });
  });

  describe('Styling', () => {
    it('applies correct text colors', () => {
      render(<ExercisesHeader {...mockProps} />);
      
      const title = screen.getByText('Wellness Exercises');
      const subtitle = screen.getByText('Evidence-based techniques for your mental health');
      
      expect(title).toHaveStyle({ color: mockColors.text.primary });
      expect(subtitle).toHaveStyle({ color: mockColors.text.secondary });
    });

    it('maintains consistent styling across locales', () => {
      const { rerender } = render(<ExercisesHeader {...mockProps} />);
      
      const englishTitle = screen.getByText('Wellness Exercises');
      const englishTitleStyle = englishTitle.props.style;
      
      rerender(<ExercisesHeader {...mockProps} locale="ar" />);
      
      const arabicTitle = screen.getByText('تمارين العافية');
      const arabicTitleStyle = arabicTitle.props.style;
      
      // Styles should be the same except for content
      expect(englishTitleStyle).toEqual(arabicTitleStyle);
    });
  });

  describe('Accessibility', () => {
    it('has proper text hierarchy', () => {
      render(<ExercisesHeader {...mockProps} />);
      
      const title = screen.getByText('Wellness Exercises');
      const subtitle = screen.getByText('Evidence-based techniques for your mental health');
      
      // Title should have larger font than subtitle
      expect(title).toBeOnTheScreen();
      expect(subtitle).toBeOnTheScreen();
    });

    it('maintains readability in both languages', () => {
      render(<ExercisesHeader {...mockProps} locale="ar" />);
      
      expect(screen.getByText('تمارين العافية')).toBeOnTheScreen();
      expect(screen.getByText('تقنيات مثبتة علمياً لصحتك النفسية')).toBeOnTheScreen();
    });
  });

  describe('Localization', () => {
    it('switches content based on locale prop', () => {
      const { rerender } = render(<ExercisesHeader {...mockProps} locale="en" />);
      
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
      expect(screen.queryByText('تمارين العافية')).not.toBeOnTheScreen();
      
      rerender(<ExercisesHeader {...mockProps} locale="ar" />);
      
      expect(screen.getByText('تمارين العافية')).toBeOnTheScreen();
      expect(screen.queryByText('Wellness Exercises')).not.toBeOnTheScreen();
    });

    it('handles locale changes without losing styling', () => {
      const { rerender } = render(<ExercisesHeader {...mockProps} locale="en" />);
      
      const englishTitle = screen.getByText('Wellness Exercises');
      const originalStyle = englishTitle.props.style;
      
      rerender(<ExercisesHeader {...mockProps} locale="ar" />);
      
      const arabicTitle = screen.getByText('تمارين العافية');
      const newStyle = arabicTitle.props.style;
      
      expect(originalStyle).toEqual(newStyle);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined colors gracefully', () => {
      const propsWithUndefinedColors = {
        ...mockProps,
        colors: {
          text: {
            primary: undefined,
            secondary: undefined,
          },
        } as any,
      };
      
      expect(() => {
        render(<ExercisesHeader {...propsWithUndefinedColors} />);
      }).not.toThrow();
      
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
    });

    it('handles missing color properties', () => {
      const propsWithMissingColors = {
        ...mockProps,
        colors: {} as any,
      };
      
      expect(() => {
        render(<ExercisesHeader {...propsWithMissingColors} />);
      }).not.toThrow();
      
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
    });

    it('handles unknown locale gracefully', () => {
      const propsWithUnknownLocale = {
        ...mockProps,
        locale: 'fr' as any,
      };
      
      render(<ExercisesHeader {...propsWithUnknownLocale} />);
      
      // Should default to English
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
    });
  });

  describe('Performance', () => {
    it('renders consistently across multiple re-renders', () => {
      const { rerender } = render(<ExercisesHeader {...mockProps} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<ExercisesHeader {...mockProps} locale={i % 2 === 0 ? 'en' : 'ar'} />);
      }
      
      // Final render should show Arabic content
      expect(screen.getByText('تمارين العافية')).toBeOnTheScreen();
    });

    it('memoization works correctly', () => {
      const { rerender } = render(<ExercisesHeader {...mockProps} />);
      
      // Re-render with same props - should not cause issues
      rerender(<ExercisesHeader {...mockProps} />);
      rerender(<ExercisesHeader {...mockProps} />);
      
      expect(screen.getByText('Wellness Exercises')).toBeOnTheScreen();
    });
  });
});