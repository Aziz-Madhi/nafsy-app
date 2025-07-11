import React from 'react';
import { useLocale } from '@/hooks/useLocale';

// Common validation rule types
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string | ((locale: string) => string);
}

export interface FieldValidation {
  rules: ValidationRule[];
  required?: boolean;
  requiredMessage?: string | ((locale: string) => string);
}

export interface FormValidationConfig {
  [fieldName: string]: FieldValidation;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Common validation rules
export const VALIDATION_RULES = {
  email: {
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message: (locale: string) => 
      locale === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email address',
  },
  
  password: {
    validate: (value: string) => value.length >= 8,
    message: (locale: string) => 
      locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
  },
  
  passwordStrong: {
    validate: (value: string) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
    },
    message: (locale: string) => 
      locale === 'ar' 
        ? 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص'
        : 'Password must contain uppercase, lowercase, number, and special character',
  },
  
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: (locale: string) => 
      locale === 'ar' ? `يجب أن يكون ${min} أحرف على الأقل` : `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: (locale: string) => 
      locale === 'ar' ? `يجب ألا يزيد عن ${max} حرف` : `Must be no more than ${max} characters`,
  }),
  
  range: (min: number, max: number) => ({
    validate: (value: number) => value >= min && value <= max,
    message: (locale: string) => 
      locale === 'ar' ? `يجب أن يكون بين ${min} و ${max}` : `Must be between ${min} and ${max}`,
  }),
  
  phoneNumber: {
    validate: (value: string) => {
      // Simple phone validation - can be enhanced based on requirements
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      return phoneRegex.test(value);
    },
    message: (locale: string) => 
      locale === 'ar' ? 'رقم الهاتف غير صالح' : 'Invalid phone number',
  },
  
  required: (locale: string) => 
    locale === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required',
} as const;

/**
 * Form validation hook with centralized validation logic
 */
export function useFormValidation<T extends Record<string, any>>(
  validationConfig: FormValidationConfig,
  formData: T
) {
  const { locale } = useLocale();
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [touched, setTouched] = React.useState<Set<string>>(new Set());

  // Validate a single field
  const validateField = React.useCallback((fieldName: string, value: any): string | null => {
    const fieldConfig = validationConfig[fieldName];
    if (!fieldConfig) return null;

    // Check required validation
    if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      const message = fieldConfig.requiredMessage || VALIDATION_RULES.required;
      return typeof message === 'function' ? message(locale) : message;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Run validation rules
    for (const rule of fieldConfig.rules) {
      if (!rule.validate(value)) {
        return typeof rule.message === 'function' ? rule.message(locale) : rule.message;
      }
    }

    return null;
  }, [validationConfig, locale]);

  // Validate all fields
  const validateForm = React.useCallback((): boolean => {
    const newErrors: ValidationError[] = [];

    Object.keys(validationConfig).forEach(fieldName => {
      const value = formData[fieldName];
      const error = validateField(fieldName, value);
      
      if (error) {
        newErrors.push({ field: fieldName, message: error });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [validationConfig, formData, validateField]);

  // Mark field as touched
  const touchField = React.useCallback((fieldName: string) => {
    setTouched(prev => new Set([...prev, fieldName]));
  }, []);

  // Get error for specific field
  const getFieldError = React.useCallback((fieldName: string): string | null => {
    if (!touched.has(fieldName)) return null;
    
    const error = errors.find(err => err.field === fieldName);
    return error?.message || null;
  }, [errors, touched]);

  // Get all errors for display
  const getAllErrors = React.useCallback((): string[] => {
    return errors.map(err => err.message);
  }, [errors]);

  // Check if field has error
  const hasFieldError = React.useCallback((fieldName: string): boolean => {
    return touched.has(fieldName) && errors.some(err => err.field === fieldName);
  }, [errors, touched]);

  // Check if form is valid
  const isValid = React.useMemo(() => {
    return errors.length === 0;
  }, [errors]);

  // Reset validation state
  const resetValidation = React.useCallback(() => {
    setErrors([]);
    setTouched(new Set());
  }, []);

  // Validate field on change
  const validateFieldOnChange = React.useCallback((fieldName: string, value: any) => {
    touchField(fieldName);
    
    const error = validateField(fieldName, value);
    
    setErrors(prev => {
      const filtered = prev.filter(err => err.field !== fieldName);
      return error ? [...filtered, { field: fieldName, message: error }] : filtered;
    });
  }, [validateField, touchField]);

  return {
    // Validation methods
    validateForm,
    validateField,
    validateFieldOnChange,
    touchField,
    resetValidation,
    
    // State
    errors,
    touched,
    isValid,
    
    // Helper methods
    getFieldError,
    getAllErrors,
    hasFieldError,
  };
}