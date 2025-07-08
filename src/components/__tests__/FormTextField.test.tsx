/**
 * Comprehensive Tests for FormTextField Component
 * Tests text input functionality, styling, validation, and accessibility
 */

import './setup';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TextField } from '../ui/Form/FormTextField';
import { useAppTheme } from '@/theme';

// Mock the theme hook
const mockTheme = {
  colors: {
    text: {
      placeholder: '#8E8E93',
    },
  },
};

jest.mocked(useAppTheme).mockReturnValue(mockTheme as any);

// Mock form font helper
jest.mock('../ui/Form/fontHelpers', () => ({
  useFormFont: jest.fn(() => ({
    default: {
      fontSize: 16,
      fontWeight: '400',
    },
  })),
}));

describe('FormTextField Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByDisplayValue } = render(
        <TextField value="test" onChangeText={() => {}} />
      );
      
      expect(getByDisplayValue('test')).toBeTruthy();
    });

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <TextField placeholder="Enter your name" />
      );
      
      expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    });

    it('should apply default font styling', () => {
      const { getByDisplayValue } = render(
        <TextField value="test" />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.style).toEqual(
        expect.objectContaining({
          fontSize: 16,
          fontWeight: '400',
        })
      );
    });

    it('should apply placeholder text color from theme', () => {
      const { getByPlaceholderText } = render(
        <TextField placeholder="Test placeholder" />
      );
      
      const textInput = getByPlaceholderText('Test placeholder');
      expect(textInput.props.placeholderTextColor).toBe('#8E8E93');
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = {
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
      };

      const { getByDisplayValue } = render(
        <TextField value="test" style={customStyle} />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.style).toEqual(
        expect.objectContaining({
          fontSize: 16,
          fontWeight: '400',
          borderWidth: 1,
          borderColor: '#000',
          padding: 10,
        })
      );
    });
  });

  describe('Text Input Functionality', () => {
    it('should handle text input changes', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="" onChangeText={onChangeText} />
      );
      
      const textInput = getByDisplayValue('');
      
      act(() => {
        fireEvent.changeText(textInput, 'Hello World');
      });

      expect(onChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('should handle multiline text input', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField 
          value="" 
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
        />
      );
      
      const textInput = getByDisplayValue('');
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      
      act(() => {
        fireEvent.changeText(textInput, multilineText);
      });

      expect(onChangeText).toHaveBeenCalledWith(multilineText);
      expect(textInput.props.multiline).toBe(true);
      expect(textInput.props.numberOfLines).toBe(4);
    });

    it('should handle secure text entry', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="password123" 
          secureTextEntry
        />
      );
      
      const textInput = getByDisplayValue('password123');
      expect(textInput.props.secureTextEntry).toBe(true);
    });

    it('should handle different keyboard types', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="john@example.com" 
          keyboardType="email-address"
        />
      );
      
      const textInput = getByDisplayValue('john@example.com');
      expect(textInput.props.keyboardType).toBe('email-address');
    });

    it('should handle auto-capitalization settings', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="john doe" 
          autoCapitalize="words"
        />
      );
      
      const textInput = getByDisplayValue('john doe');
      expect(textInput.props.autoCapitalize).toBe('words');
    });

    it('should handle auto-correction settings', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="test text" 
          autoCorrect={false}
        />
      );
      
      const textInput = getByDisplayValue('test text');
      expect(textInput.props.autoCorrect).toBe(false);
    });
  });

  describe('Focus and Blur Events', () => {
    it('should handle focus events', () => {
      const onFocus = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="test" onFocus={onFocus} />
      );
      
      const textInput = getByDisplayValue('test');
      
      act(() => {
        fireEvent(textInput, 'focus');
      });

      expect(onFocus).toHaveBeenCalled();
    });

    it('should handle blur events', () => {
      const onBlur = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="test" onBlur={onBlur} />
      );
      
      const textInput = getByDisplayValue('test');
      
      act(() => {
        fireEvent(textInput, 'blur');
      });

      expect(onBlur).toHaveBeenCalled();
    });

    it('should handle end editing events', () => {
      const onEndEditing = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="final text" onEndEditing={onEndEditing} />
      );
      
      const textInput = getByDisplayValue('final text');
      
      act(() => {
        fireEvent(textInput, 'endEditing', { nativeEvent: { text: 'final text' } });
      });

      expect(onEndEditing).toHaveBeenCalledWith({ nativeEvent: { text: 'final text' } });
    });
  });

  describe('Validation and Error States', () => {
    it('should accept maxLength prop', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="short" 
          maxLength={10}
        />
      );
      
      const textInput = getByDisplayValue('short');
      expect(textInput.props.maxLength).toBe(10);
    });

    it('should handle text selection', () => {
      const onSelectionChange = jest.fn();
      const { getByDisplayValue } = render(
        <TextField 
          value="selectable text" 
          onSelectionChange={onSelectionChange}
        />
      );
      
      const textInput = getByDisplayValue('selectable text');
      
      act(() => {
        fireEvent(textInput, 'selectionChange', {
          nativeEvent: { selection: { start: 0, end: 5 } }
        });
      });

      expect(onSelectionChange).toHaveBeenCalledWith({
        nativeEvent: { selection: { start: 0, end: 5 } }
      });
    });

    it('should handle editable prop', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="read only text" 
          editable={false}
        />
      );
      
      const textInput = getByDisplayValue('read only text');
      expect(textInput.props.editable).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="test" 
          accessibilityLabel="Name input field"
        />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.accessibilityLabel).toBe('Name input field');
    });

    it('should have proper accessibility hint', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="test" 
          accessibilityHint="Enter your full name"
        />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.accessibilityHint).toBe('Enter your full name');
    });

    it('should have proper accessibility role', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="test" 
          accessibilityRole="search"
        />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.accessibilityRole).toBe('search');
    });

    it('should support accessibility state', () => {
      const { getByDisplayValue } = render(
        <TextField 
          value="test" 
          accessibilityState={{ disabled: true }}
        />
      );
      
      const textInput = getByDisplayValue('test');
      expect(textInput.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Special Input Types', () => {
    it('should handle numeric input', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField 
          value="123" 
          keyboardType="numeric"
          onChangeText={onChangeText}
        />
      );
      
      const textInput = getByDisplayValue('123');
      
      act(() => {
        fireEvent.changeText(textInput, '12345');
      });

      expect(onChangeText).toHaveBeenCalledWith('12345');
      expect(textInput.props.keyboardType).toBe('numeric');
    });

    it('should handle phone number input', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField 
          value="+1 (555) 123-4567" 
          keyboardType="phone-pad"
          onChangeText={onChangeText}
        />
      );
      
      const textInput = getByDisplayValue('+1 (555) 123-4567');
      expect(textInput.props.keyboardType).toBe('phone-pad');
    });

    it('should handle email input', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField 
          value="user@example.com" 
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
        />
      );
      
      const textInput = getByDisplayValue('user@example.com');
      expect(textInput.props.keyboardType).toBe('email-address');
      expect(textInput.props.autoCapitalize).toBe('none');
      expect(textInput.props.autoCorrect).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle rapid text changes efficiently', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="" onChangeText={onChangeText} />
      );
      
      const textInput = getByDisplayValue('');
      const start = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        act(() => {
          fireEvent.changeText(textInput, `text${i}`);
        });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
      expect(onChangeText).toHaveBeenCalledTimes(100);
    });

    it('should handle large text input efficiently', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="" onChangeText={onChangeText} />
      );
      
      const textInput = getByDisplayValue('');
      const largeText = 'A'.repeat(10000); // 10,000 characters
      
      const start = performance.now();
      act(() => {
        fireEvent.changeText(textInput, largeText);
      });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
      expect(onChangeText).toHaveBeenCalledWith(largeText);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string input', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="some text" onChangeText={onChangeText} />
      );
      
      const textInput = getByDisplayValue('some text');
      
      act(() => {
        fireEvent.changeText(textInput, '');
      });

      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('should handle null/undefined values gracefully', () => {
      const { container } = render(
        <TextField value={undefined as any} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle special characters and emojis', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <TextField value="" onChangeText={onChangeText} />
      );
      
      const textInput = getByDisplayValue('');
      const specialText = '🎉 Hello! @#$%^&*()_+ 测试 العربية';
      
      act(() => {
        fireEvent.changeText(textInput, specialText);
      });

      expect(onChangeText).toHaveBeenCalledWith(specialText);
    });

    it('should handle very long placeholder text', () => {
      const longPlaceholder = 'This is a very long placeholder text that might overflow or cause layout issues in some cases'.repeat(3);
      
      const { getByPlaceholderText } = render(
        <TextField placeholder={longPlaceholder} />
      );
      
      expect(getByPlaceholderText(longPlaceholder)).toBeTruthy();
    });

    it('should handle simultaneous prop changes', () => {
      const { getByDisplayValue, rerender } = render(
        <TextField 
          value="initial" 
          placeholder="Initial placeholder"
          keyboardType="default"
        />
      );
      
      expect(getByDisplayValue('initial')).toBeTruthy();
      
      rerender(
        <TextField 
          value="updated" 
          placeholder="Updated placeholder"
          keyboardType="email-address"
          secureTextEntry
        />
      );
      
      const updatedInput = getByDisplayValue('updated');
      expect(updatedInput.props.keyboardType).toBe('email-address');
      expect(updatedInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Theme Integration', () => {
    it('should update placeholder color when theme changes', () => {
      const initialTheme = {
        colors: { text: { placeholder: '#8E8E93' } },
      };
      
      const updatedTheme = {
        colors: { text: { placeholder: '#FF0000' } },
      };
      
      jest.mocked(useAppTheme).mockReturnValue(initialTheme as any);
      
      const { getByPlaceholderText, rerender } = render(
        <TextField placeholder="Test" />
      );
      
      expect(getByPlaceholderText('Test').props.placeholderTextColor).toBe('#8E8E93');
      
      jest.mocked(useAppTheme).mockReturnValue(updatedTheme as any);
      
      rerender(<TextField placeholder="Test" />);
      
      expect(getByPlaceholderText('Test').props.placeholderTextColor).toBe('#FF0000');
    });
  });
});