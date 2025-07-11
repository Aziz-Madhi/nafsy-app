import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

export interface FormFieldProps extends Omit<BaseInputProps, 'value' | 'onChangeText' | 'error'> {
  name: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form field wrapper that integrates with form validation
 */
export function FormField({
  name: _name,
  value,
  onChangeText,
  onBlur,
  error,
  validateOnChange: _validateOnChange = true,
  validateOnBlur: _validateOnBlur = true,
  ...inputProps
}: FormFieldProps) {
  
  const handleChangeText = React.useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  const handleBlur = React.useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  return (
    <BaseInput
      {...inputProps}
      value={value}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      error={error}
    />
  );
}

/**
 * Email input field with built-in validation styling
 */
export function EmailField(props: Omit<FormFieldProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect'>) {
  return (
    <FormField
      {...props}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      leftIcon="envelope"
      placeholder={props.placeholder || 'Email address'}
    />
  );
}

/**
 * Password input field with built-in visibility toggle
 */
export function PasswordField({
  showPasswordToggle = true,
  ...props
}: Omit<FormFieldProps, 'secureTextEntry'> & { showPasswordToggle?: boolean }) {
  const [isSecure, setIsSecure] = React.useState(true);

  const toggleSecureText = React.useCallback(() => {
    setIsSecure(prev => !prev);
  }, []);

  return (
    <FormField
      {...props}
      secureTextEntry={isSecure}
      leftIcon="lock"
      rightIcon={showPasswordToggle ? (isSecure ? 'eye' : 'eye.slash') : undefined}
      onRightIconPress={showPasswordToggle ? toggleSecureText : undefined}
      placeholder={props.placeholder || 'Password'}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

/**
 * Phone number input field
 */
export function PhoneField(props: Omit<FormFieldProps, 'keyboardType'>) {
  return (
    <FormField
      {...props}
      keyboardType="phone-pad"
      leftIcon="phone"
      placeholder={props.placeholder || 'Phone number'}
    />
  );
}

/**
 * Search input field
 */
export function SearchField({
  onClear,
  ...props
}: FormFieldProps & { onClear?: () => void }) {
  const showClearButton = Boolean(props.value && onClear);

  return (
    <FormField
      {...props}
      leftIcon="magnifyingglass"
      rightIcon={showClearButton ? 'xmark.circle.fill' : undefined}
      onRightIconPress={showClearButton ? onClear : undefined}
      placeholder={props.placeholder || 'Search...'}
      returnKeyType="search"
    />
  );
}

/**
 * Textarea field for multi-line input
 */
export function TextAreaField({
  minHeight = 100,
  maxHeight = 200,
  ...props
}: FormFieldProps & { minHeight?: number; maxHeight?: number }) {
  return (
    <FormField
      {...props}
      multiline
      textAlignVertical="top"
      inputStyle={[
        {
          minHeight,
          maxHeight,
          paddingTop: 12,
        },
        props.inputStyle,
      ]}
    />
  );
}

/**
 * Numeric input field
 */
export function NumericField(props: Omit<FormFieldProps, 'keyboardType'>) {
  return (
    <FormField
      {...props}
      keyboardType="numeric"
    />
  );
}

/**
 * Name input field (for first name, last name, etc.)
 */
export function NameField(props: Omit<FormFieldProps, 'autoCapitalize'>) {
  return (
    <FormField
      {...props}
      autoCapitalize="words"
      leftIcon="person"
      placeholder={props.placeholder || 'Name'}
    />
  );
}

/**
 * Verification code input field
 */
export function VerificationCodeField(props: Omit<FormFieldProps, 'keyboardType' | 'maxLength' | 'textAlign'>) {
  return (
    <FormField
      {...props}
      keyboardType="number-pad"
      maxLength={6}
      textAlign="center"
      leftIcon="key"
      placeholder={props.placeholder || '123456'}
    />
  );
}