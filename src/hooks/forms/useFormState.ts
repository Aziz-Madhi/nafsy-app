import React from 'react';

export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  isLoading: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FormActions<T> {
  updateField: (field: keyof T, value: T[keyof T]) => void;
  updateFields: (updates: Partial<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: (newData?: T) => void;
  submit: () => void;
}

export interface UseFormStateConfig<T> {
  initialData: T;
  onSubmit?: (data: T) => Promise<void> | void;
  onReset?: (data: T) => void;
  enableDirtyTracking?: boolean;
}

/**
 * Comprehensive form state management hook
 */
export function useFormState<T extends Record<string, any>>({
  initialData,
  onSubmit,
  onReset,
  enableDirtyTracking = true,
}: UseFormStateConfig<T>): FormState<T> & FormActions<T> {
  
  const [data, setData] = React.useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitCount, setSubmitCount] = React.useState(0);
  
  // Track initial data for dirty checking
  const initialDataRef = React.useRef<T>(initialData);
  
  // Update initial data reference when initialData changes
  React.useEffect(() => {
    initialDataRef.current = initialData;
    setData(initialData);
  }, [initialData]);

  // Calculate if form is dirty
  const isDirty = React.useMemo(() => {
    if (!enableDirtyTracking) return false;
    
    return JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
  }, [data, enableDirtyTracking]);

  // Update single field
  const updateField = React.useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update multiple fields
  const updateFields = React.useCallback((updates: Partial<T>) => {
    setData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Set submitting state
  const setSubmitting = React.useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // Set loading state
  const setLoading = React.useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // Reset form to initial or provided data
  const reset = React.useCallback((newData?: T) => {
    const resetData = newData || initialDataRef.current;
    setData(resetData);
    setIsSubmitting(false);
    setIsLoading(false);
    setSubmitCount(0);
    
    if (newData) {
      initialDataRef.current = newData;
    }
    
    onReset?.(resetData);
  }, [onReset]);

  // Submit form
  const submit = React.useCallback(async () => {
    if (isSubmitting || !onSubmit) return;
    
    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);
    
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, isSubmitting, onSubmit]);

  return {
    // State
    data,
    isSubmitting,
    isLoading,
    isDirty,
    submitCount,
    
    // Actions
    updateField,
    updateFields,
    setSubmitting,
    setLoading,
    reset,
    submit,
  };
}

/**
 * Simpler form state hook for basic forms
 */
export function useSimpleFormState<T extends Record<string, any>>(
  initialData: T
) {
  const [data, setData] = React.useState<T>(initialData);
  
  const updateField = React.useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);
  
  const reset = React.useCallback(() => {
    setData(initialData);
  }, [initialData]);
  
  return {
    data,
    updateField,
    reset,
    setData,
  };
}