import React from 'react';
import { SwitchProps, TextProps } from 'react-native';
import { Switch } from '@/components/ui/Switch';

interface FormToggleProps extends TextProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Modular FormToggle component extracted from Form.tsx
 * Compatible with existing Form usage patterns
 */
export function FormToggle({ 
  value, 
  onValueChange, 
  disabled = false,
  children,
  ...textProps
}: FormToggleProps) {
  // The Toggle component is designed to work within Form.Section
  // The Switch is handled by the Section component automatically
  // This component just renders the label text
  return <>{children}</>;
}

// For standalone usage
export function Toggle({ 
  value, 
  onValueChange, 
  disabled = false,
  children,
  ...textProps
}: FormToggleProps) {
  return <FormToggle value={value} onValueChange={onValueChange} disabled={disabled} {...textProps}>{children}</FormToggle>;
}