import { useState, useCallback, useMemo } from 'react';
import { useForm, UseFormConfig } from './useForm';

export interface MultiStepFormConfig<T extends Record<string, any>> {
  steps: Step<T>[];
  initialData?: Partial<T>;
  onComplete?: (data: T) => Promise<void> | void;
  onStepChange?: (step: number, data: Partial<T>) => void;
  persistProgress?: boolean;
}

export interface Step<T extends Record<string, any>> {
  id: string;
  title?: string;
  fields: string[];
  validator?: (data: Partial<T>) => boolean | string;
  nextStep?: (data: Partial<T>) => string | null;
}

export interface MultiStepFormReturn<T extends Record<string, any>> {
  // Current step info
  currentStep: number;
  currentStepData: Step<T>;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  
  // Form data and state
  formData: T;
  errors: Record<string, string>;
  isDirty: boolean;
  
  // Navigation
  goToNext: () => Promise<boolean>;
  goToPrevious: () => void;
  goToStep: (stepIndex: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  
  // Form actions
  updateField: (field: keyof T, value: any) => void;
  validateCurrentStep: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  
  // Progress
  progress: number;
  completedSteps: Set<number>;
}

/**
 * Multi-step form management hook with validation and navigation
 */
export function useMultiStepForm<T extends Record<string, any>>({
  steps,
  initialData = {} as T,
  onComplete,
  onStepChange,
  persistProgress = false,
}: MultiStepFormConfig<T>): MultiStepFormReturn<T> {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  // Form state management
  const form = useForm<T>({
    initialData: initialData as T,
    validateOnChange: true,
    showValidationAlerts: false,
  });

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const step = steps[currentStep];
    
    if (step.validator) {
      const result = step.validator(form.data);
      
      if (typeof result === 'string') {
        setStepErrors({ ...stepErrors, [currentStep]: result });
        return false;
      }
      
      if (!result) {
        setStepErrors({ ...stepErrors, [currentStep]: 'Please complete all required fields' });
        return false;
      }
    }
    
    // Clear any previous errors for this step
    const newErrors = { ...stepErrors };
    delete newErrors[currentStep];
    setStepErrors(newErrors);
    
    return true;
  }, [currentStep, form.data, steps, stepErrors]);

  // Navigation functions
  const goToNext = useCallback(async (): Promise<boolean> => {
    if (!validateCurrentStep()) {
      return false;
    }
    
    // Mark current step as completed
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);
    
    // Check if there's a custom next step
    const step = steps[currentStep];
    if (step.nextStep) {
      const nextStepId = step.nextStep(form.data);
      if (nextStepId) {
        const nextIndex = steps.findIndex(s => s.id === nextStepId);
        if (nextIndex !== -1) {
          setCurrentStep(nextIndex);
          onStepChange?.(nextIndex, form.data);
          return true;
        }
      }
    }
    
    // Default to next sequential step
    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep, form.data);
      return true;
    }
    
    // If last step, trigger completion
    if (isLastStep && onComplete) {
      await onComplete(form.data);
    }
    
    return true;
  }, [
    currentStep,
    isLastStep,
    validateCurrentStep,
    completedSteps,
    steps,
    form.data,
    onComplete,
    onStepChange,
  ]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep, form.data);
    }
  }, [currentStep, isFirstStep, form.data, onStepChange]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex, form.data);
    }
  }, [totalSteps, form.data, onStepChange]);

  const resetForm = useCallback(() => {
    form.reset();
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepErrors({});
  }, [form]);

  const submitForm = useCallback(async () => {
    // Validate all steps
    let isValid = true;
    const errors: Record<number, string> = {};
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.validator) {
        const result = step.validator(form.data);
        if (typeof result === 'string') {
          errors[i] = result;
          isValid = false;
        } else if (!result) {
          errors[i] = 'Please complete all required fields';
          isValid = false;
        }
      }
    }
    
    if (!isValid) {
      setStepErrors(errors);
      // Go to first step with error
      const firstErrorStep = Object.keys(errors).map(Number).sort()[0];
      setCurrentStep(firstErrorStep);
      return;
    }
    
    // All valid, submit
    if (onComplete) {
      await onComplete(form.data);
    }
  }, [steps, form.data, onComplete]);

  // Check if can navigate
  const canGoNext = currentStep < totalSteps - 1;
  const canGoPrevious = currentStep > 0;

  return {
    // Current step info
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    
    // Form data and state
    formData: form.data,
    errors: form.errors,
    isDirty: form.isDirty,
    
    // Navigation
    goToNext,
    goToPrevious,
    goToStep,
    canGoNext,
    canGoPrevious,
    
    // Form actions
    updateField: form.updateField,
    validateCurrentStep,
    resetForm,
    submitForm,
    
    // Progress
    progress,
    completedSteps,
  };
}