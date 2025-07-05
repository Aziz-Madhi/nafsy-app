import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/theme';

/**
 * Error Boundary Components for Nafsy app
 * Following LEVER framework - centralized error handling across the app
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Graceful fallback UI
 * - Error reporting capabilities
 * - Recovery mechanisms
 * - Different error types handling
 */

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error to logging service
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 */
interface DefaultErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: DefaultErrorFallbackProps) {
  const { theme, styles: commonStyles } = useAppTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{error.message}</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={resetErrorBoundary}
        >
          <Text style={commonStyles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Specialized Error Boundaries for different app sections
 */

// Screen-level error boundary
export function ScreenErrorBoundary({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log screen-level errors
        console.error('Screen Error:', error.message);
        // TODO: Send to crash reporting service
      }}
      fallback={
        <View style={styles.screenErrorContainer}>
          <Text style={styles.errorEmoji}>📱</Text>
          <Text style={styles.errorTitle}>Screen Error</Text>
          <Text style={styles.errorMessage}>
            This screen encountered an error. Please go back and try again.
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode;
  componentName?: string;
}) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Component Error in ${componentName}:`, error.message);
      }}
      fallback={
        <View style={styles.componentErrorContainer}>
          <Text style={styles.componentErrorText}>
            {componentName ? `${componentName} unavailable` : 'Component unavailable'}
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Network operation error boundary
export function NetworkErrorBoundary({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Network Error:', error.message);
      }}
      fallback={
        <View style={styles.networkErrorContainer}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            Unable to connect. Please check your internet connection and try again.
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error Boundary Hook for functional components
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
  };
}

/**
 * Higher-Order Component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Async Error Handler for promises and async operations
 */
export function handleAsyncError(error: Error, context?: string) {
  console.error(`Async Error${context ? ` in ${context}` : ''}:`, error);
  
  // TODO: Send to error reporting service
  
  // Return user-friendly error message
  if (error.message.includes('Network')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.message.includes('Auth') || error.message.includes('401')) {
    return 'Authentication failed. Please sign in again.';
  }
  
  if (error.message.includes('403')) {
    return 'Access denied. You don\'t have permission for this action.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => ({
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  errorContent: {
    alignItems: 'center' as const,
    maxWidth: 300,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  debugInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  debugTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.status.error,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  screenErrorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  componentErrorContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    alignItems: 'center' as const,
  },
  componentErrorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
  networkErrorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
});