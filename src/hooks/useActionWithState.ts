import { useAction } from 'convex/react';
import { useState, useCallback } from 'react';
import { FunctionReference } from 'convex/server';

/**
 * Enhanced Convex action hook with consistent loading/error states
 * Following LEVER framework - wrapper for external API calls through Convex actions
 * 
 * Features:
 * - Consistent loading states
 * - Error handling with retry logic
 * - Success callbacks
 * - Optimistic updates support
 */

export interface ActionState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ActionOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
  optimisticUpdate?: T;
  resetOnCall?: boolean;
}

export function useActionWithState<Args extends Record<string, any>, ReturnValue>(
  action: FunctionReference<'action', 'public', Args, ReturnValue>,
  options: ActionOptions<ReturnValue> = {}
) {
  const convexAction = useAction(action);
  
  const [state, setState] = useState<ActionState<ReturnValue>>({
    data: options.optimisticUpdate || null,
    loading: false,
    error: null,
    success: false,
  });

  const {
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
    resetOnCall = true,
  } = options;

  const execute = useCallback(
    async (args: Args, retryCount = 0): Promise<ReturnValue | null> => {
      if (resetOnCall) {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: true }));
      }

      try {
        const result = await convexAction(args);
        
        setState({
          data: result,
          loading: false,
          error: null,
          success: true,
        });

        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        
        // Retry logic
        if (retryCount < retryAttempts) {
          setTimeout(() => {
            execute(args, retryCount + 1);
          }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return null;
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });

        onError?.(errorMessage);
        return null;
      }
    },
    [convexAction, onSuccess, onError, retryAttempts, retryDelay, resetOnCall]
  );

  const reset = useCallback(() => {
    setState({
      data: options.optimisticUpdate || null,
      loading: false,
      error: null,
      success: false,
    });
  }, [options.optimisticUpdate]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

/**
 * Simplified version for fire-and-forget actions
 */
export function useSimpleAction<Args extends Record<string, any>, ReturnValue>(
  action: FunctionReference<'action', 'public', Args, ReturnValue>
) {
  const convexAction = useAction(action);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (args: Args) => {
      setLoading(true);
      try {
        const result = await convexAction(args);
        return result;
      } catch (error) {
        console.error('Action failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [convexAction]
  );

  return { execute, loading };
}

/**
 * Hook for actions that need to be called immediately on mount
 */
export function useActionOnMount<Args extends Record<string, any>, ReturnValue>(
  action: FunctionReference<'action', 'public', Args, ReturnValue>,
  args: Args,
  options: ActionOptions<ReturnValue> & { enabled?: boolean } = {}
) {
  const { enabled = true, ...actionOptions } = options;
  const actionState = useActionWithState(action, actionOptions);

  // Execute on mount if enabled
  useState(() => {
    if (enabled) {
      actionState.execute(args);
    }
  });

  return actionState;
}

/**
 * Hook for actions with debouncing (useful for search, etc.)
 */
export function useDebouncedAction<Args extends Record<string, any>, ReturnValue>(
  action: FunctionReference<'action', 'public', Args, ReturnValue>,
  delay: number = 300,
  options: ActionOptions<ReturnValue> = {}
) {
  const actionState = useActionWithState(action, options);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (args: Args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        actionState.execute(args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [actionState, delay, timeoutId]
  );

  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  return {
    ...actionState,
    execute: debouncedExecute,
    cancel,
  };
}

/**
 * Type-safe error handling for common action patterns
 */
export const ActionErrors = {
  NETWORK: 'Network connection failed',
  TIMEOUT: 'Request timed out',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION: 'Invalid data provided',
  RATE_LIMIT: 'Too many requests',
  SERVER: 'Server error occurred',
} as const;

export type ActionError = typeof ActionErrors[keyof typeof ActionErrors];

/**
 * Helper to create typed action hooks for specific features
 */
export function createTypedActionHook<Args extends Record<string, any>, ReturnValue>(
  action: FunctionReference<'action', 'public', Args, ReturnValue>
) {
  return (options?: ActionOptions<ReturnValue>) => 
    useActionWithState(action, options);
}