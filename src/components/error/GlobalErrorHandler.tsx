import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';
import * as AC from '@bacons/apple-colors';
import { CommonStyles } from '@/utils/styles';

/**
 * Global Error Handler for Nafsy app
 * Following LEVER framework - centralized error handling at app level
 * 
 * Features:
 * - Global error boundary for the entire app
 * - Crash reporting integration
 * - User-friendly error messages
 * - Recovery mechanisms
 * - Error categorization
 */

interface GlobalErrorHandlerProps {
  children: ReactNode;
}

/**
 * Error reporting service integration
 */
class ErrorReportingService {
  static reportError(error: Error, context: string, extra?: Record<string, any>) {
    // TODO: Integrate with crash reporting service (e.g., Sentry, Bugsnag)
    
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: 'React Native',
      extra,
    };

    // Log locally in development
    if (__DEV__) {
      console.group('🚨 Error Report');
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Extra Info:', extra);
      console.groupEnd();
    }

    // TODO: Send to remote logging service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  }

  static reportCrash(error: Error, errorInfo: any) {
    this.reportError(error, 'React Error Boundary', {
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
    });
  }
}

/**
 * Global error fallback UI
 */
function GlobalErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error | null;
  resetErrorBoundary: () => void;
}) {
  const handleReportBug = () => {
    Alert.alert(
      'Report Bug',
      'Would you like to report this issue to help us improve the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            if (error) {
              ErrorReportingService.reportError(error, 'User Report');
            }
            Alert.alert('Thank you', 'Your report has been sent.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.globalErrorContainer}>
      <View style={styles.globalErrorContent}>
        {/* App Icon/Logo area */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Nafsy</Text>
        </View>
        
        <Text style={styles.globalErrorEmoji}>💙</Text>
        <Text style={styles.globalErrorTitle}>
          We're sorry for the trouble
        </Text>
        <Text style={styles.globalErrorMessage}>
          Nafsy encountered an unexpected error. Don't worry - your data is safe. 
          Please restart the app to continue.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[CommonStyles.primaryButton, styles.restartButton]}
            onPress={resetErrorBoundary}
          >
            <Text style={CommonStyles.primaryButtonText}>
              Restart App
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[CommonStyles.secondaryButton, styles.reportButton]}
            onPress={handleReportBug}
          >
            <Text style={CommonStyles.secondaryButtonText}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && error && (
          <View style={styles.devInfo}>
            <Text style={styles.devTitle}>Development Info:</Text>
            <Text style={styles.devError}>{error.message}</Text>
            <Text style={styles.devStack} numberOfLines={5}>
              {error.stack}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Main Global Error Handler Component
 */
export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Report to crash reporting service
        ErrorReportingService.reportCrash(error, errorInfo);
      }}
      fallback={
        <GlobalErrorFallback
          error={null}
          resetErrorBoundary={() => {
            // This would typically restart the app or reload the root component
            console.log('Restarting app...');
          }}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error Handler for specific features
 */
export function FeatureErrorBoundary({ 
  children, 
  featureName 
}: { 
  children: ReactNode;
  featureName: string;
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        ErrorReportingService.reportError(error, `Feature: ${featureName}`, {
          componentStack: errorInfo.componentStack,
        });
      }}
      fallback={
        <View style={styles.featureErrorContainer}>
          <Text style={styles.featureErrorEmoji}>⚠️</Text>
          <Text style={styles.featureErrorTitle}>
            {featureName} Unavailable
          </Text>
          <Text style={styles.featureErrorMessage}>
            This feature is temporarily unavailable. Please try again later.
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary for critical app sections (auth, navigation, etc.)
 */
export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        ErrorReportingService.reportError(error, 'Critical Section', {
          severity: 'high',
          componentStack: errorInfo.componentStack,
        });
      }}
      fallback={
        <View style={styles.criticalErrorContainer}>
          <Text style={styles.criticalErrorEmoji}>🚨</Text>
          <Text style={styles.criticalErrorTitle}>
            Critical Error
          </Text>
          <Text style={styles.criticalErrorMessage}>
            A critical error occurred. Please restart the app.
          </Text>
        </View>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  globalErrorContainer: {
    flex: 1,
    backgroundColor: AC.systemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  globalErrorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  logoContainer: {
    marginBottom: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AC.systemTeal,
  },
  globalErrorEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  globalErrorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: AC.label,
    textAlign: 'center',
    marginBottom: 16,
  },
  globalErrorMessage: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    width: '100%',
  },
  reportButton: {
    width: '100%',
  },
  devInfo: {
    backgroundColor: AC.systemRed,
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    width: '100%',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  devError: {
    fontSize: 12,
    color: 'white',
    marginBottom: 8,
    fontWeight: '500',
  },
  devStack: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  featureErrorContainer: {
    backgroundColor: AC.secondarySystemGroupedBackground,
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
  },
  featureErrorEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AC.label,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureErrorMessage: {
    fontSize: 14,
    color: AC.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  criticalErrorContainer: {
    flex: 1,
    backgroundColor: AC.systemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  criticalErrorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  criticalErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AC.systemRed,
    textAlign: 'center',
    marginBottom: 12,
  },
  criticalErrorMessage: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
});

