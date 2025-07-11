// Centralized utility exports for better tree-shaking
export * from './date';
export * from './haptics';
export * from './accessibility';
export * from './helpers';

// Re-export commonly used utilities with shorter paths
export { useAuthState, useSimpleAuth } from '../hooks/useAuthState';