import React from 'react';
import { Alert } from 'react-native';
import { useFormState, UseFormStateConfig } from './useFormState';
import { useFormValidation, FormValidationConfig } from './useFormValidation';
import { useLocale } from '@/hooks/useLocale';

export interface UseFormConfig<T extends Record<string, any>> 
  extends Omit<UseFormStateConfig<T>, 'onSubmit'> {
  validationConfig?: FormValidationConfig;
  onSubmit?: (data: T) => Promise<void> | void;
  onValidationError?: (errors: string[]) => void;
  showValidationAlerts?: boolean;
  validateOnChange?: boolean;
  validateOnSubmit?: boolean;
}

/**
 * Complete form management hook combining state and validation
 */
export function useForm<T extends Record<string, any>>({
  initialData,
  validationConfig = {},
  onSubmit,
  onValidationError,
  onReset,
  showValidationAlerts = true,
  validateOnChange = true,
  validateOnSubmit = true,
  enableDirtyTracking = true,
}: UseFormConfig<T>) {
  const { locale } = useLocale();
  
  // Form state management
  const formState = useFormState({
    initialData,
    enableDirtyTracking,
    onReset,
    onSubmit: async (data: T) => {
      if (validateOnSubmit && !validateForm()) {
        handleValidationError();
        return;
      }
      
      if (onSubmit) {
        await onSubmit(data);
      }
    },
  });

  // Form validation
  const validation = useFormValidation(validationConfig, formState.data);

  // Handle validation errors
  const handleValidationError = React.useCallback(() => {
    const errors = validation.getAllErrors();
    
    if (onValidationError) {
      onValidationError(errors);
    } else if (showValidationAlerts && errors.length > 0) {
      const errorTitle = locale === 'ar' ? 'خطأ في التحقق' : 'Validation Error';
      const errorMessage = errors.join('\n');
      
      Alert.alert(errorTitle, errorMessage);
    }
  }, [validation, onValidationError, showValidationAlerts, locale]);

  // Enhanced field update with validation
  const updateField = React.useCallback((field: keyof T, value: T[keyof T]) => {
    formState.updateField(field, value);
    
    if (validateOnChange) {
      validation.validateFieldOnChange(field as string, value);
    }
  }, [formState, validation, validateOnChange]);

  // Enhanced submit with validation
  const submitForm = React.useCallback(async () => {
    await formState.submit();
  }, [formState]);

  // Manual validation trigger
  const validateForm = React.useCallback(() => {
    return validation.validateForm();
  }, [validation]);

  // Reset form with validation reset
  const resetForm = React.useCallback((newData?: T) => {
    formState.reset(newData);
    validation.resetValidation();
  }, [formState, validation]);

  // Check if form can be submitted
  const canSubmit = React.useMemo(() => {
    return !formState.isSubmitting && 
           !formState.isLoading && 
           validation.isValid;
  }, [formState.isSubmitting, formState.isLoading, validation.isValid]);

  // Form field helpers
  const getFieldProps = React.useCallback((fieldName: keyof T) => ({
    value: formState.data[fieldName],
    onChangeText: (value: string) => updateField(fieldName, value as T[keyof T]),
    onBlur: () => validation.touchField(fieldName as string),
    error: validation.getFieldError(fieldName as string),
    hasError: validation.hasFieldError(fieldName as string),
  }), [formState.data, updateField, validation]);

  return {
    // Form data and state
    ...formState,
    
    // Validation state
    ...validation,
    
    // Enhanced actions
    updateField,
    submitForm,
    validateForm,
    resetForm,
    
    // Form status
    canSubmit,
    
    // Helper methods
    getFieldProps,
    handleValidationError,
  };
}

/**
 * Form hook specifically for authentication flows
 */
export function useAuthForm<T extends Record<string, any>>(
  initialData: T,
  validationConfig: FormValidationConfig,
  onSubmit: (data: T) => Promise<void>
) {
  return useForm({
    initialData,
    validationConfig,
    onSubmit,
    showValidationAlerts: true,
    validateOnChange: true,
    validateOnSubmit: true,
    enableDirtyTracking: false, // Auth forms don't need dirty tracking
  });
}

/**
 * Form hook for multi-step forms
 */
export function useMultiStepForm<T extends Record<string, any>>(
  initialData: T,
  steps: {
    fields: (keyof T)[];
    validation?: FormValidationConfig;
  }[],
  onSubmit: (data: T) => Promise<void>
) {
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const currentStepConfig = steps[currentStep];
  const currentValidationConfig = currentStepConfig?.validation || {};
  
  const form = useForm({
    initialData,
    validationConfig: currentValidationConfig,
    onSubmit,
    validateOnSubmit: false, // Handle validation per step
  });

  // Step validation at top level
  const stepData = React.useMemo(() => {
    if (!currentStepConfig) return {};
    return Object.fromEntries(
      currentStepConfig.fields.map(field => [field, form.data[field]])
    );
  }, [currentStepConfig, form.data]);
  
  const stepValidation = useFormValidation(currentValidationConfig, stepData);
  
  // Validate current step
  const validateCurrentStep = React.useCallback(() => {
    if (!currentStepConfig) return true;
    return stepValidation.validateForm();
  }, [currentStepConfig, stepValidation]);

  // Move to next step
  const nextStep = React.useCallback(() => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length, validateCurrentStep]);

  // Move to previous step
  const previousStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Check if current step is valid
  const isCurrentStepValid = React.useMemo(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  return {
    ...form,
    
    // Step management
    currentStep,
    totalSteps: steps.length,
    nextStep,
    previousStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    isCurrentStepValid,
    validateCurrentStep,
    
    // Progress
    progress: (currentStep + 1) / steps.length,
  };
}