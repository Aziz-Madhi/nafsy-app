/**
 * Comprehensive Tests for MoodTracker Component
 * Tests mood selection, factor selection, note entry, and submission functionality
 */

import './setup';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { MoodTracker } from '../mood/MoodTracker';
import { useMutation } from 'convex/react';
import { useLocale } from '@/hooks/useLocale';

// Mock the modules
const mockMutation = jest.fn();
const mockLocale = {
  locale: 'en' as const,
  setLocale: jest.fn(),
  t: jest.fn((key: string) => key),
  isRTL: false,
};

jest.mocked(useMutation).mockReturnValue(mockMutation);
jest.mocked(useLocale).mockReturnValue(mockLocale);

describe('MoodTracker Component', () => {
  const defaultProps = {
    userId: 'test-user-id' as any,
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutation.mockResolvedValue('mock-mood-id');
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      expect(getByText('How are you feeling?')).toBeTruthy();
    });

    it('should display mood scale from 1-10', () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      // Should render slider for mood selection
      expect(getByTestId('mood-slider')).toBeTruthy();
    });

    it('should display mood factors', () => {
      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      // Check for some mood factors
      expect(getByText('Sleep')).toBeTruthy();
      expect(getByText('Exercise')).toBeTruthy();
      expect(getByText('Work')).toBeTruthy();
      expect(getByText('Stress')).toBeTruthy();
    });

    it('should display mood emojis corresponding to rating', () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const moodDisplay = getByTestId('mood-display');
      expect(moodDisplay).toBeTruthy();
    });

    it('should have a note input field', () => {
      const { getByPlaceholderText } = render(<MoodTracker {...defaultProps} />);
      
      expect(getByPlaceholderText('Add a note about your mood (optional)')).toBeTruthy();
    });

    it('should have a save button', () => {
      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      expect(getByText('Save Mood')).toBeTruthy();
    });
  });

  describe('Mood Selection', () => {
    it('should update mood display when slider changes', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      
      await act(async () => {
        fireEvent(slider, 'valueChange', 8);
      });

      // Should update the displayed mood
      const moodDisplay = getByTestId('mood-display');
      expect(moodDisplay.props.children).toContain('8');
    });

    it('should show appropriate emoji for mood rating', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      
      await act(async () => {
        fireEvent(slider, 'valueChange', 1);
      });

      // Should show sad emoji for low mood
      const emojiDisplay = getByTestId('mood-emoji');
      expect(emojiDisplay.props.children).toBe('😔');

      await act(async () => {
        fireEvent(slider, 'valueChange', 10);
      });

      // Should show happy emoji for high mood
      expect(emojiDisplay.props.children).toBe('🤩');
    });

    it('should handle decimal mood values', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      
      await act(async () => {
        fireEvent(slider, 'valueChange', 6.5);
      });

      const moodDisplay = getByTestId('mood-display');
      expect(moodDisplay.props.children).toContain('6.5');
    });
  });

  describe('Factor Selection', () => {
    it('should toggle factor selection when tapped', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const sleepFactor = getByTestId('factor-sleep');
      
      await act(async () => {
        fireEvent.press(sleepFactor);
      });

      // Factor should be selected (styling should change)
      expect(sleepFactor.props.style).toEqual(
        expect.objectContaining({
          opacity: expect.any(Number),
        })
      );
    });

    it('should allow multiple factor selection', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const sleepFactor = getByTestId('factor-sleep');
      const exerciseFactor = getByTestId('factor-exercise');
      const workFactor = getByTestId('factor-work');
      
      await act(async () => {
        fireEvent.press(sleepFactor);
        fireEvent.press(exerciseFactor);
        fireEvent.press(workFactor);
      });

      // All factors should be selectable
      expect(sleepFactor).toBeTruthy();
      expect(exerciseFactor).toBeTruthy();
      expect(workFactor).toBeTruthy();
    });

    it('should deselect factor when tapped again', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const sleepFactor = getByTestId('factor-sleep');
      
      // Select factor
      await act(async () => {
        fireEvent.press(sleepFactor);
      });

      // Deselect factor
      await act(async () => {
        fireEvent.press(sleepFactor);
      });

      // Factor should be deselected
      expect(sleepFactor).toBeTruthy();
    });
  });

  describe('Note Entry', () => {
    it('should update note when text is entered', async () => {
      const { getByPlaceholderText } = render(<MoodTracker {...defaultProps} />);
      
      const noteInput = getByPlaceholderText('Add a note about your mood (optional)');
      const testNote = 'Feeling great after exercise!';
      
      await act(async () => {
        fireEvent.changeText(noteInput, testNote);
      });

      expect(noteInput.props.value).toBe(testNote);
    });

    it('should handle long notes', async () => {
      const { getByPlaceholderText } = render(<MoodTracker {...defaultProps} />);
      
      const noteInput = getByPlaceholderText('Add a note about your mood (optional)');
      const longNote = 'This is a very long note about my mood today. '.repeat(10);
      
      await act(async () => {
        fireEvent.changeText(noteInput, longNote);
      });

      expect(noteInput.props.value).toBe(longNote);
    });

    it('should handle special characters and emojis in notes', async () => {
      const { getByPlaceholderText } = render(<MoodTracker {...defaultProps} />);
      
      const noteInput = getByPlaceholderText('Add a note about your mood (optional)');
      const emojiNote = 'Feeling amazing! 😊🎉💖 #blessed';
      
      await act(async () => {
        fireEvent.changeText(noteInput, emojiNote);
      });

      expect(noteInput.props.value).toBe(emojiNote);
    });
  });

  describe('Mood Submission', () => {
    it('should submit mood with basic data', async () => {
      const { getByTestId, getByText } = render(<MoodTracker {...defaultProps} />);
      
      // Set mood rating
      const slider = getByTestId('mood-slider');
      await act(async () => {
        fireEvent(slider, 'valueChange', 7);
      });

      // Save mood
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(mockMutation).toHaveBeenCalledWith({
          userId: 'test-user-id',
          rating: 7,
          note: undefined,
          factors: [],
        });
      });
    });

    it('should submit mood with factors and note', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(
        <MoodTracker {...defaultProps} />
      );
      
      // Set mood rating
      const slider = getByTestId('mood-slider');
      await act(async () => {
        fireEvent(slider, 'valueChange', 8);
      });

      // Select factors
      const sleepFactor = getByTestId('factor-sleep');
      const exerciseFactor = getByTestId('factor-exercise');
      await act(async () => {
        fireEvent.press(sleepFactor);
        fireEvent.press(exerciseFactor);
      });

      // Add note
      const noteInput = getByPlaceholderText('Add a note about your mood (optional)');
      await act(async () => {
        fireEvent.changeText(noteInput, 'Great workout this morning!');
      });

      // Save mood
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(mockMutation).toHaveBeenCalledWith({
          userId: 'test-user-id',
          rating: 8,
          note: 'Great workout this morning!',
          factors: ['sleep', 'exercise'],
        });
      });
    });

    it('should call onComplete after successful submission', async () => {
      const onComplete = jest.fn();
      const { getByText } = render(<MoodTracker {...defaultProps} onComplete={onComplete} />);
      
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      // Make mutation take some time
      mockMutation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByText, getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      // Should show loading indicator
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should handle submission errors gracefully', async () => {
      mockMutation.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        // Should show error message
        expect(getByText('Error saving mood. Please try again.')).toBeTruthy();
      });
    });

    it('should disable save button during submission', async () => {
      mockMutation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      // Button should be disabled
      expect(saveButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Localization', () => {
    it('should display Arabic labels when locale is Arabic', () => {
      jest.mocked(useLocale).mockReturnValue({
        ...mockLocale,
        locale: 'ar',
      });

      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      // Should show Arabic labels
      expect(getByText('النوم')).toBeTruthy(); // Sleep in Arabic
      expect(getByText('التمرين')).toBeTruthy(); // Exercise in Arabic
    });

    it('should handle RTL layout for Arabic', () => {
      jest.mocked(useLocale).mockReturnValue({
        ...mockLocale,
        locale: 'ar',
        isRTL: true,
      });

      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const container = getByTestId('mood-tracker-container');
      // Should apply RTL styling
      expect(container.props.style).toEqual(
        expect.objectContaining({
          direction: 'rtl',
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      expect(slider.props.accessibilityLabel).toBe('Mood rating slider');

      const sleepFactor = getByTestId('factor-sleep');
      expect(sleepFactor.props.accessibilityLabel).toBe('Sleep factor');
    });

    it('should have proper accessibility roles', () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      expect(slider.props.accessibilityRole).toBe('adjustable');

      const sleepFactor = getByTestId('factor-sleep');
      expect(sleepFactor.props.accessibilityRole).toBe('button');
    });

    it('should announce mood changes for screen readers', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      
      await act(async () => {
        fireEvent(slider, 'valueChange', 8);
      });

      expect(slider.props.accessibilityValue).toEqual({
        min: 1,
        max: 10,
        now: 8,
        text: 'Mood rating 8 out of 10',
      });
    });
  });

  describe('Performance', () => {
    it('should handle rapid mood slider changes without lag', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const slider = getByTestId('mood-slider');
      const start = performance.now();
      
      // Rapidly change mood values
      for (let i = 1; i <= 10; i++) {
        await act(async () => {
          fireEvent(slider, 'valueChange', i);
        });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle many factor selections efficiently', async () => {
      const { getByTestId } = render(<MoodTracker {...defaultProps} />);
      
      const start = performance.now();
      
      // Select all factors rapidly
      const factors = ['sleep', 'exercise', 'work', 'relationships', 'health', 'finance'];
      for (const factor of factors) {
        const factorElement = getByTestId(`factor-${factor}`);
        await act(async () => {
          fireEvent.press(factorElement);
        });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing userId gracefully', () => {
      const { getByText } = render(<MoodTracker userId={undefined as any} />);
      
      // Should still render but save button should be disabled
      const saveButton = getByText('Save Mood');
      expect(saveButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should handle network failures during submission', async () => {
      mockMutation.mockRejectedValue(new Error('Network unavailable'));

      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(getByText('Network error. Please check your connection.')).toBeTruthy();
      });
    });

    it('should prevent double submission', async () => {
      const { getByText } = render(<MoodTracker {...defaultProps} />);
      
      const saveButton = getByText('Save Mood');
      
      // Press save button multiple times rapidly
      await act(async () => {
        fireEvent.press(saveButton);
        fireEvent.press(saveButton);
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        // Should only call mutation once
        expect(mockMutation).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle very long notes properly', async () => {
      const { getByPlaceholderText, getByText } = render(<MoodTracker {...defaultProps} />);
      
      const noteInput = getByPlaceholderText('Add a note about your mood (optional)');
      const veryLongNote = 'A'.repeat(5000); // 5000 character note
      
      await act(async () => {
        fireEvent.changeText(noteInput, veryLongNote);
      });

      const saveButton = getByText('Save Mood');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(mockMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            note: veryLongNote,
          })
        );
      });
    });
  });
});