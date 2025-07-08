/**
 * Jest setup file for Nafsy App testing
 * Configures global test environment and mocks
 */

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      CONVEX_URL: 'https://test.convex.cloud',
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// Mock Clerk authentication
jest.mock('@clerk/clerk-expo', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  })),
  useAuth: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: jest.fn(() => Promise.resolve('mock-token')),
  })),
}));

// Mock Convex React hooks
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  ConvexProvider: ({ children }) => children,
}));

// Mock performance.now for testing
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T12:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

// Mock React Native specific globals
global.__DEV__ = true;

// Setup test timeout
jest.setTimeout(10000);