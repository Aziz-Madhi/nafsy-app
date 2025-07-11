# Unified Form System

The unified form system provides a comprehensive, type-safe, and consistent approach to building forms throughout the Nafsy app. It consolidates validation, state management, styling, and user experience patterns into reusable components and hooks.

## Overview

The form system consists of:
- **Form State Management** - Centralized form data and state handling
- **Validation System** - Type-safe validation with localized error messages
- **Input Components** - Consistent, themed input fields with built-in validation
- **Button Components** - Unified button patterns with loading and disabled states
- **Form Hooks** - Complete form management combining state and validation

## Quick Start

### Basic Form Example

```tsx
import { useForm, VALIDATION_RULES } from '@/hooks/forms';
import { EmailField, PasswordField, PrimaryButton } from '@/components/forms';

function LoginForm() {
  const form = useForm({
    initialData: { email: '', password: '' },
    validationConfig: {
      email: {
        rules: [VALIDATION_RULES.email],
        required: true,
      },
      password: {
        rules: [VALIDATION_RULES.password],
        required: true,
      },
    },
    onSubmit: async (data) => {
      await signIn(data.email, data.password);
    },
  });

  return (
    <View>
      <EmailField
        label="Email"
        {...form.getFieldProps('email')}
      />
      
      <PasswordField
        label="Password"
        {...form.getFieldProps('password')}
      />
      
      <PrimaryButton
        title="Sign In"
        onPress={form.submitForm}
        disabled={!form.canSubmit}
        loading={form.isSubmitting}
      />
    </View>
  );
}
```

## Components

### Input Components

#### BaseInput
Universal input component with multiple variants and full theming support.

```tsx
<BaseInput
  label="Email Address"
  placeholder="Enter your email"
  variant="outlined"          // 'default' | 'glass' | 'outlined' | 'filled'
  size="medium"              // 'small' | 'medium' | 'large'
  leftIcon="envelope"
  rightIcon="eye"
  onRightIconPress={() => {}}
  error="Invalid email"
  helperText="We'll never share your email"
  required
  disabled={false}
  loading={false}
/>
```

#### Specialized Input Fields

```tsx
// Email with built-in validation styling
<EmailField
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

// Password with visibility toggle
<PasswordField
  label="Password"
  value={password}
  onChangeText={setPassword}
  showPasswordToggle={true}
/>

// Search with clear button
<SearchField
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search..."
/>

// Multi-line text area
<TextAreaField
  label="Notes"
  value={notes}
  onChangeText={setNotes}
  minHeight={100}
  maxHeight={200}
/>

// Phone number input
<PhoneField
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
/>

// Numeric input
<NumericField
  label="Age"
  value={age}
  onChangeText={setAge}
/>
```

### Button Components

#### BaseButton
Universal button component with multiple variants and states.

```tsx
<BaseButton
  title="Submit"
  onPress={handleSubmit}
  variant="primary"           // 'primary' | 'secondary' | 'tertiary' | 'glass' | 'danger'
  size="medium"              // 'small' | 'medium' | 'large'
  fullWidth={true}
  disabled={false}
  loading={false}
  leftIcon="plus"
  rightIcon="arrow.right"
/>
```

#### Pre-configured Button Variants

```tsx
// Primary action button
<PrimaryButton
  title="Sign In"
  onPress={handleSignIn}
  loading={isLoading}
/>

// Secondary action button
<SecondaryButton
  title="Cancel"
  onPress={handleCancel}
/>

// Subtle action button
<TertiaryButton
  title="Forgot Password?"
  onPress={handleForgotPassword}
/>

// Glass effect button
<GlassButton
  title="Continue"
  onPress={handleContinue}
/>

// Destructive action button
<DangerButton
  title="Delete Account"
  onPress={handleDelete}
/>
```

## Form Hooks

### useForm
Complete form management hook combining state and validation.

```tsx
const form = useForm({
  initialData: { email: '', password: '' },
  validationConfig: {
    email: {
      rules: [VALIDATION_RULES.email],
      required: true,
    },
  },
  onSubmit: async (data) => {
    await submitForm(data);
  },
  showValidationAlerts: true,
  validateOnChange: true,
  validateOnSubmit: true,
});

// Available properties and methods
form.data              // Current form data
form.updateField       // Update single field
form.submitForm        // Submit with validation
form.validateForm      // Manual validation
form.resetForm         // Reset to initial state
form.canSubmit         // Can form be submitted?
form.isValid           // Is form currently valid?
form.isSubmitting      // Is form being submitted?
form.isDirty           // Has form been modified?
form.getFieldProps     // Get props for form field
```

### useAuthForm
Pre-configured form hook for authentication flows.

```tsx
const authForm = useAuthForm(
  { email: '', password: '' },
  {
    email: AUTH_VALIDATION.email,
    password: AUTH_VALIDATION.password,
  },
  async (data) => {
    await signIn(data.email, data.password);
  }
);
```

### useMultiStepForm
Form hook for multi-step forms with step validation.

```tsx
const multiStepForm = useMultiStepForm(
  initialData,
  [
    {
      fields: ['email', 'password'],
      validation: { /* step 1 validation */ },
    },
    {
      fields: ['firstName', 'lastName'],
      validation: { /* step 2 validation */ },
    },
  ],
  onSubmit
);

// Step management
multiStepForm.currentStep        // Current step index
multiStepForm.totalSteps         // Total number of steps
multiStepForm.nextStep()         // Move to next step
multiStepForm.previousStep()     // Move to previous step
multiStepForm.isFirstStep        // Is on first step?
multiStepForm.isLastStep         // Is on last step?
multiStepForm.progress           // Progress (0-1)
```

## Validation System

### Built-in Validation Rules

```tsx
import { VALIDATION_RULES } from '@/hooks/forms';

// Email validation
VALIDATION_RULES.email

// Password validation (min 8 characters)
VALIDATION_RULES.password

// Strong password validation
VALIDATION_RULES.passwordStrong

// Length validation
VALIDATION_RULES.minLength(5)
VALIDATION_RULES.maxLength(100)

// Numeric range validation
VALIDATION_RULES.range(1, 10)

// Phone number validation
VALIDATION_RULES.phoneNumber

// Required field message
VALIDATION_RULES.required
```

### Custom Validation Rules

```tsx
const customValidation = {
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
};
```

### Pre-configured Validation Sets

```tsx
import { AUTH_VALIDATION, MOOD_VALIDATION, EXERCISE_VALIDATION } from '@/hooks/forms';

// Authentication forms
const signUpForm = useForm({
  initialData: { email: '', password: '', confirmPassword: '' },
  validationConfig: {
    email: AUTH_VALIDATION.email,
    password: AUTH_VALIDATION.password,
    confirmPassword: AUTH_VALIDATION.confirmPassword,
  },
  onSubmit: handleSignUp,
});

// Mood tracking forms
const moodForm = useForm({
  initialData: { mood: 0, notes: '' },
  validationConfig: MOOD_VALIDATION,
  onSubmit: handleMoodSubmit,
});
```

## Styling and Theming

### Input Variants

- **`default`**: Standard input with background and border
- **`outlined`**: Transparent background with border
- **`filled`**: Filled background with subtle border
- **`glass`**: Glassmorphic effect with blur

### Button Variants

- **`primary`**: Main action button with brand color
- **`secondary`**: Secondary action with outline
- **`tertiary`**: Subtle text-only button
- **`glass`**: Glassmorphic button with blur effect
- **`danger`**: Destructive action with red color

### Theme Integration

All components automatically adapt to:
- Light/Dark theme modes
- RTL/LTR text direction
- Semantic color tokens
- Consistent spacing and typography

## Migration Guide

### From Manual Forms

**Before:**
```tsx
// Manual validation and state management
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const handleSubmit = async () => {
  const newErrors = {};
  
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    newErrors.email = 'Invalid email';
  }
  
  if (!password || password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  setLoading(true);
  try {
    await signIn(email, password);
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
// Unified form system
const form = useAuthForm(
  { email: '', password: '' },
  {
    email: AUTH_VALIDATION.email,
    password: AUTH_VALIDATION.password,
  },
  async (data) => {
    await signIn(data.email, data.password);
  }
);
```

### Code Reduction Achieved

- **~75-80%** reduction in form boilerplate code
- **Consistent validation** across all forms
- **Automatic error handling** and display
- **Built-in theme support** and RTL compatibility
- **Type-safe** form data and validation
- **Reusable components** for consistent UX

## Best Practices

1. **Use semantic field components** (EmailField, PasswordField) instead of BaseInput when possible
2. **Leverage pre-configured validation** (AUTH_VALIDATION, MOOD_VALIDATION) for consistency
3. **Use form.getFieldProps()** to connect form state with field components
4. **Implement proper loading states** with disabled buttons during submission
5. **Test form validation** thoroughly across different locales
6. **Consider multi-step forms** for complex user flows
7. **Use glass variants** for overlay forms and special contexts

## Performance Considerations

- Form hooks use `React.useMemo` and `React.useCallback` for optimization
- Validation is debounced to prevent excessive re-renders
- Input components are memoized to prevent unnecessary updates
- Theme integration is optimized with context providers

## Accessibility

- All form components include proper accessibility labels
- Error messages are announced to screen readers
- Focus management is handled automatically
- Keyboard navigation is fully supported
- High contrast themes are supported