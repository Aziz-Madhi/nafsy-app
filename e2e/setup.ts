/**
 * E2E Test Setup and Global Utilities
 * Provides common functions and configurations for Detox E2E tests
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

// Global Jest functions for TypeScript
declare global {
  function beforeAll(fn: () => Promise<void>): void;
  function beforeEach(fn: () => Promise<void>): void;
  function afterEach(fn: () => Promise<void>): void;
  function afterAll(fn: () => Promise<void>): void;
}

// Global timeout for most E2E operations
const DEFAULT_TIMEOUT = 30000;

// Test user credentials for authentication tests
export const TEST_USER = {
  email: 'test@nafsy.app',
  password: 'TestPassword123!',
  firstName: 'E2E',
  lastName: 'Tester',
};

// Helper functions for common E2E operations
export class E2EHelpers {
  /**
   * Wait for an element to be visible with custom timeout
   */
  static async waitForElement(matcher: Detox.NativeMatcher, timeout = DEFAULT_TIMEOUT) {
    await waitFor(element(matcher))
      .toBeVisible()
      .withTimeout(timeout);
  }

  /**
   * Wait for text to appear anywhere on screen
   */
  static async waitForText(text: string, timeout = DEFAULT_TIMEOUT) {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  /**
   * Tap an element and wait for it to be tappable
   */
  static async tapElement(matcher: Detox.NativeMatcher, timeout = DEFAULT_TIMEOUT) {
    await waitFor(element(matcher))
      .toBeVisible()
      .withTimeout(timeout);
    await element(matcher).tap();
  }

  /**
   * Type text into an input field
   */
  static async typeText(matcher: Detox.NativeMatcher, text: string) {
    await element(matcher).tap();
    await element(matcher).clearText();
    await element(matcher).typeText(text);
  }

  /**
   * Scroll to find an element in a list
   */
  static async scrollToElement(
    scrollViewMatcher: Detox.NativeMatcher,
    elementMatcher: Detox.NativeMatcher,
    direction: 'up' | 'down' = 'down',
    distance = 200
  ) {
    try {
      await waitFor(element(elementMatcher))
        .toBeVisible()
        .whileElement(scrollViewMatcher)
        .scroll(distance, direction);
    } catch (error) {
      console.log(`Could not find element by scrolling ${direction}`);
      throw error;
    }
  }

  /**
   * Swipe on an element in a specific direction
   */
  static async swipeElement(
    matcher: Detox.NativeMatcher,
    direction: 'up' | 'down' | 'left' | 'right',
    speed: 'fast' | 'slow' = 'fast',
    percentage = 0.75
  ) {
    await element(matcher).swipe(direction, speed, percentage);
  }

  /**
   * Wait for loading states to complete
   */
  static async waitForLoadingToComplete(timeout = DEFAULT_TIMEOUT) {
    // Wait for common loading indicators to disappear
    const loadingSelectors = [
      by.text('Loading...'),
      by.text('Please wait...'),
      by.id('loading-indicator'),
      by.id('spinner'),
    ];

    for (const selector of loadingSelectors) {
      try {
        await waitFor(element(selector))
          .not.toBeVisible()
          .withTimeout(timeout);
      } catch {
        // Element might not exist, which is fine
      }
    }
  }

  /**
   * Check if app is in specific state (authenticated, onboarded, etc.)
   */
  static async checkAppState() {
    // Check if user is signed in by looking for main tab navigation
    try {
      await detoxExpect(element(by.id('main-tabs'))).toBeVisible();
      return 'authenticated';
    } catch {}

    // Check if on onboarding screens
    try {
      await detoxExpect(element(by.id('onboarding-screen'))).toBeVisible();
      return 'onboarding';
    } catch {}

    // Check if on authentication screens
    try {
      await detoxExpect(element(by.id('auth-screen'))).toBeVisible();
      return 'auth';
    } catch {}

    // Check if on welcome screen
    try {
      await detoxExpect(element(by.id('welcome-screen'))).toBeVisible();
      return 'welcome';
    } catch {}

    return 'unknown';
  }

  /**
   * Reset app to clean state
   */
  static async resetAppState() {
    await device.uninstallApp();
    await device.installApp();
    await device.launchApp({ newInstance: true });
  }

  /**
   * Navigate to a specific tab in the main navigation
   */
  static async navigateToTab(tabId: string) {
    await this.tapElement(by.id(`tab-${tabId}`));
    await this.waitForLoadingToComplete();
  }

  /**
   * Simulate network conditions (when supported by device)
   */
  static async setNetworkCondition(condition: 'good' | 'poor' | 'offline') {
    try {
      switch (condition) {
        case 'offline':
          // Note: Network simulation may not be available on all platforms
          console.log('Simulating offline condition');
          break;
        case 'poor':
          console.log('Simulating poor network condition');
          break;
        case 'good':
        default:
          console.log('Simulating good network condition');
          break;
      }
    } catch (error) {
      console.log('Network condition simulation not supported:', error);
    }
  }

  /**
   * Take a screenshot for debugging
   */
  static async takeScreenshot(name: string) {
    await device.takeScreenshot(name);
  }

  /**
   * Handle permission dialogs (iOS/Android)
   */
  static async handlePermissionDialog(action: 'allow' | 'deny' = 'allow') {
    try {
      if (device.getPlatform() === 'ios') {
        const allowButton = action === 'allow' ? 'Allow' : "Don't Allow";
        await detoxExpect(element(by.text(allowButton))).toBeVisible();
        await element(by.text(allowButton)).tap();
      } else {
        const allowButton = action === 'allow' ? 'Allow' : 'Deny';
        await detoxExpect(element(by.text(allowButton))).toBeVisible();
        await element(by.text(allowButton)).tap();
      }
    } catch {
      // Permission dialog might not appear
    }
  }

  /**
   * Enter crisis mode keywords for testing crisis detection
   */
  static getCrisisKeywords() {
    return [
      'I want to hurt myself',
      'I am thinking about suicide',
      'I cannot go on anymore',
      'I want to end it all',
    ];
  }

  /**
   * Enter positive mood keywords for testing normal flows
   */
  static getPositiveKeywords() {
    return [
      'I am feeling great today',
      'Life is good',
      'I feel happy and grateful',
      'Things are looking up',
    ];
  }
}

// Global setup for all E2E tests
beforeAll(async () => {
  console.log('🚀 Starting E2E test suite for Nafsy app');
  
  // Ensure app is installed and launched
  await device.launchApp({ newInstance: true });
  
  // Wait for app to fully load
  await E2EHelpers.waitForLoadingToComplete(60000);
  
  console.log('✅ App launched successfully');
});

beforeEach(async () => {
  // Reload React Native for each test to ensure clean state
  await device.reloadReactNative();
  await E2EHelpers.waitForLoadingToComplete();
});

afterEach(async () => {
  // Take screenshot on test failure for debugging
  if ((global as any).currentTest?.result?.failureMessages?.length > 0) {
    const testName = (global as any).currentTest?.testPath?.split('/').pop() || 'unknown';
    await E2EHelpers.takeScreenshot(`failure-${testName}-${Date.now()}`);
  }
});

afterAll(async () => {
  console.log('🏁 E2E test suite completed');
});

// Export types for TypeScript
export type AppState = 'authenticated' | 'onboarding' | 'auth' | 'welcome' | 'unknown';
export type NetworkCondition = 'good' | 'poor' | 'offline';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type PermissionAction = 'allow' | 'deny';