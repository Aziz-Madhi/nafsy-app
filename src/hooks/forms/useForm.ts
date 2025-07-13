import { useLocale } from '@/hooks/useLocale';
import React from 'react';
import { Alert } from 'react-native';
import { useFormState, UseFormStateConfig } from './useFormState';
import { FormValidationConfig, useFormValidation } from './useFormValidation';

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
  const submitForm = React.useCallback(() => {
    return formState.submit();
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

  // Check if form can be submitted - allow submission even with validation errors initially
  const canSubmit = React.useMemo(() => {
    return !formState.isSubmitting && !formState.isLoading;
  }, [formState.isSubmitting, formState.isLoading]);

  /**
   * ---------------------------------------------------------------------
   * Stable field handlers
   * ---------------------------------------------------------------------
   * We previously used React.useMemo with a Proxy to generate a fresh
   * handlers object each render. Because the memo depended on `updateField`
   * (which itself changes whenever form validation/state changes) the memo
   * was recalculated on *every* render – effectively negating the caching
   * and, in some scenarios, triggering an infinite re-render loop.
   *
   * By switching to `useRef` we can persist the handlers map for the entire
   * lifetime of the form instance. We still capture the *latest* versions of
   * `updateField` and `validation.touchField` safely via refs so the cached
   * callbacks always call up-to-date logic without changing their identity.
   * ---------------------------------------------------------------------
   */

  // Keep live refs to the latest implementation so cached handlers stay fresh
  const updateFieldRef = React.useRef(updateField);
  const touchFieldRef   = React.useRef(validation.touchField);

  React.useEffect(() => {
    updateFieldRef.current = updateField;
    touchFieldRef.current  = validation.touchField;
  }, [updateField, validation.touchField]);

  // One stable object for all field handlers
  const fieldHandlersRef = React.useRef<Record<string, { onChangeText: (value: string) => void; onBlur: () => void }>>({});

  const getFieldHandlers = React.useCallback(
    (fieldName: keyof T) => {
      const key = fieldName as string;
      if (!fieldHandlersRef.current[key]) {
        fieldHandlersRef.current[key] = {
          onChangeText: (value: string) =>
            updateFieldRef.current(key as keyof T, value as T[keyof T]),
          onBlur: () => touchFieldRef.current(key),
        };
      }
      return fieldHandlersRef.current[key];
    },
    [] // stable – ref ensures latest logic is used
  );

  // Form field helpers - now with stable function references
  const getFieldProps = React.useCallback(
    (fieldName: keyof T) => {
      const key = fieldName as string;
      const handlers = getFieldHandlers(fieldName);

      return {
        value: formState.data[fieldName],
        onChangeText: handlers.onChangeText,
        onBlur: handlers.onBlur,
        error: validation.getFieldError(key),
        hasError: validation.hasFieldError(key),
      };
    },
    [formState.data, validation, getFieldHandlers]
  );

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
    validateOnChange: false, // Don't validate on every change to prevent infinite loops
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