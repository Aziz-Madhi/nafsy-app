// Import validation rules first to use in constants
import { VALIDATION_RULES } from './useFormValidation';

// Form management hooks
export {
  useForm,
  useAuthForm,
  useMultiStepForm,
  type UseFormConfig,
} from './useForm';

export {
  useFormState,
  useSimpleFormState,
  type FormState,
  type FormActions,
  type UseFormStateConfig,
} from './useFormState';

export {
  useFormValidation,
  VALIDATION_RULES,
  type ValidationRule,
  type FieldValidation,
  type FormValidationConfig,
  type ValidationError,
} from './useFormValidation';

// Common validation configurations
export const AUTH_VALIDATION = {
  email: {
    rules: [VALIDATION_RULES.email],
    required: true,
  },
  password: {
    rules: [VALIDATION_RULES.password],
    required: true,
  },
  confirmPassword: {
    rules: [
      VALIDATION_RULES.password,
      {
        validate: (value: string, formData: any) => value === formData.password,
        message: (locale: string) => 
          locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
      },
    ],
    required: true,
  },
  firstName: {
    rules: [VALIDATION_RULES.minLength(2)],
    required: true,
  },
  lastName: {
    rules: [VALIDATION_RULES.minLength(2)],
    required: true,
  },
  phoneNumber: {
    rules: [VALIDATION_RULES.phoneNumber],
    required: false,
  },
} as const;

export const MOOD_VALIDATION = {
  mood: {
    rules: [VALIDATION_RULES.range(1, 5)],
    required: true,
  },
  notes: {
    rules: [VALIDATION_RULES.maxLength(500)],
    required: false,
  },
  factors: {
    rules: [],
    required: false,
  },
} as const;

export const EXERCISE_VALIDATION = {
  title: {
    rules: [VALIDATION_RULES.minLength(3), VALIDATION_RULES.maxLength(100)],
    required: true,
  },
  description: {
    rules: [VALIDATION_RULES.maxLength(500)],
    required: false,
  },
  duration: {
    rules: [VALIDATION_RULES.range(1, 120)],
    required: true,
  },
} as const;