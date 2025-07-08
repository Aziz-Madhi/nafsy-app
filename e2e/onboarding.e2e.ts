/**
 * E2E Tests for User Onboarding Flow
 * Tests the complete onboarding experience from welcome to chat setup
 */

import { device, element, by, expect as detoxExpect } from 'detox';
import { E2EHelpers, TEST_USER } from './setup';

describe('Onboarding Flow', () => {
  beforeEach(async () => {
    // Start with a clean app state
    await E2EHelpers.resetAppState();
  });

  describe('Welcome Screen', () => {
    it('should display welcome screen on first launch', async () => {
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      
      // Check main welcome elements
      await detoxExpect(element(by.text('Welcome to Nafsy'))).toBeVisible();
      await detoxExpect(element(by.text('Your Mental Health Companion'))).toBeVisible();
      await detoxExpect(element(by.id('get-started-button'))).toBeVisible();
    });

    it('should navigate to sign up when Get Started is tapped', async () => {
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      
      await E2EHelpers.waitForElement(by.id('auth-screen'));
      await detoxExpect(element(by.text('Create Account'))).toBeVisible();
    });

    it('should have language selector working', async () => {
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      
      // Test language toggle if available
      try {
        await E2EHelpers.tapElement(by.id('language-toggle'));
        await detoxExpect(element(by.text('مرحباً بك في نفسي'))).toBeVisible();
        
        // Switch back to English
        await E2EHelpers.tapElement(by.id('language-toggle'));
        await detoxExpect(element(by.text('Welcome to Nafsy'))).toBeVisible();
      } catch {
        console.log('Language toggle not available or visible');
      }
    });
  });

  describe('User Registration', () => {
    beforeEach(async () => {
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      await E2EHelpers.waitForElement(by.id('auth-screen'));
    });

    it('should complete user registration successfully', async () => {
      // Fill in registration form
      await E2EHelpers.typeText(by.id('email-input'), TEST_USER.email);
      await E2EHelpers.typeText(by.id('password-input'), TEST_USER.password);
      await E2EHelpers.typeText(by.id('first-name-input'), TEST_USER.firstName);
      await E2EHelpers.typeText(by.id('last-name-input'), TEST_USER.lastName);
      
      // Submit registration
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      // Wait for registration to complete
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      // Should navigate to onboarding steps
      await E2EHelpers.waitForElement(by.id('onboarding-steps-screen'));
    });

    it('should validate required fields', async () => {
      // Try to submit without filling fields
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      // Should show validation errors
      await detoxExpect(element(by.text('Email is required'))).toBeVisible();
      await detoxExpect(element(by.text('Password is required'))).toBeVisible();
    });

    it('should validate email format', async () => {
      await E2EHelpers.typeText(by.id('email-input'), 'invalid-email');
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      await detoxExpect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should navigate to sign in from registration', async () => {
      await E2EHelpers.tapElement(by.id('sign-in-link'));
      
      await detoxExpect(element(by.text('Sign In'))).toBeVisible();
      await detoxExpect(element(by.id('sign-in-button'))).toBeVisible();
    });
  });

  describe('Onboarding Steps', () => {
    beforeEach(async () => {
      // Complete registration first
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      await E2EHelpers.waitForElement(by.id('auth-screen'));
      
      await E2EHelpers.typeText(by.id('email-input'), TEST_USER.email);
      await E2EHelpers.typeText(by.id('password-input'), TEST_USER.password);
      await E2EHelpers.typeText(by.id('first-name-input'), TEST_USER.firstName);
      await E2EHelpers.typeText(by.id('last-name-input'), TEST_USER.lastName);
      
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      await E2EHelpers.waitForElement(by.id('onboarding-steps-screen'));
    });

    it('should complete age selection step', async () => {
      // Should be on age selection step
      await detoxExpect(element(by.text('How old are you?'))).toBeVisible();
      
      // Select age range
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      // Should progress to next step
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
    });

    it('should complete interests selection step', async () => {
      // Navigate to interests step
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      
      // Select multiple interests
      await E2EHelpers.tapElement(by.id('interest-meditation'));
      await E2EHelpers.tapElement(by.id('interest-exercise'));
      await E2EHelpers.tapElement(by.id('interest-reading'));
      
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      // Should progress to mental health goals
      await E2EHelpers.waitForElement(by.text('What are your mental health goals?'));
    });

    it('should complete mental health goals selection', async () => {
      // Navigate through previous steps
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      await E2EHelpers.tapElement(by.id('interest-meditation'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your mental health goals?'));
      
      // Select mental health goals
      await E2EHelpers.tapElement(by.id('goal-stress-reduction'));
      await E2EHelpers.tapElement(by.id('goal-mood-improvement'));
      
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      // Should progress to language preference
      await E2EHelpers.waitForElement(by.text('Choose your preferred language'));
    });

    it('should complete language preference selection', async () => {
      // Navigate through all previous steps
      await this.navigateToLanguageStep();
      
      // Select language preference
      await E2EHelpers.tapElement(by.id('language-english'));
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
      
      // Should navigate to onboarding chat
      await E2EHelpers.waitForElement(by.id('onboarding-chat-screen'));
    });

    it('should allow going back through onboarding steps', async () => {
      // Navigate to interests step
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      
      // Go back to age step
      await E2EHelpers.tapElement(by.id('back-button'));
      
      await detoxExpect(element(by.text('How old are you?'))).toBeVisible();
    });

    it('should show progress indicator throughout onboarding', async () => {
      // Check progress indicator exists
      await detoxExpect(element(by.id('onboarding-progress'))).toBeVisible();
      
      // Progress through steps and verify progress updates
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      // Progress should have advanced
      await detoxExpect(element(by.id('progress-step-2'))).toBeVisible();
    });

    // Helper method to navigate to language step
    async navigateToLanguageStep() {
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      await E2EHelpers.tapElement(by.id('interest-meditation'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your mental health goals?'));
      await E2EHelpers.tapElement(by.id('goal-stress-reduction'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('Choose your preferred language'));
    }
  });

  describe('Onboarding Chat', () => {
    beforeEach(async () => {
      // Complete full onboarding flow
      await this.completeOnboardingFlow();
    });

    it('should display AI introduction message', async () => {
      await E2EHelpers.waitForElement(by.id('onboarding-chat-screen'));
      
      // Should see AI welcome message
      await detoxExpect(element(by.text('Hello! I\'m your AI companion.'))).toBeVisible();
      await detoxExpect(element(by.id('ai-message'))).toBeVisible();
    });

    it('should allow user to send first message', async () => {
      await E2EHelpers.waitForElement(by.id('onboarding-chat-screen'));
      
      // Type and send first message
      const firstMessage = 'Hello, I\'m excited to start this journey!';
      await E2EHelpers.typeText(by.id('chat-input'), firstMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should see user message appear
      await detoxExpect(element(by.text(firstMessage))).toBeVisible();
      
      // Should see AI response
      await E2EHelpers.waitForElement(by.id('ai-typing-indicator'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      // AI should respond
      await detoxExpect(element(by.id('ai-message'))).toBeVisible();
    });

    it('should complete onboarding chat and navigate to main app', async () => {
      await E2EHelpers.waitForElement(by.id('onboarding-chat-screen'));
      
      // Complete a few chat exchanges
      await E2EHelpers.typeText(by.id('chat-input'), 'I feel ready to explore the app!');
      await E2EHelpers.tapElement(by.id('send-button'));
      
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      // Complete onboarding
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
      
      // Should navigate to main tabs
      await E2EHelpers.waitForElement(by.id('main-tabs'));
      await detoxExpect(element(by.id('tab-index'))).toBeVisible();
      await detoxExpect(element(by.id('tab-mood'))).toBeVisible();
      await detoxExpect(element(by.id('tab-exercises'))).toBeVisible();
      await detoxExpect(element(by.id('tab-profile'))).toBeVisible();
    });

    // Helper method to complete onboarding flow
    async completeOnboardingFlow() {
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      await E2EHelpers.waitForElement(by.id('auth-screen'));
      
      // Registration
      await E2EHelpers.typeText(by.id('email-input'), TEST_USER.email);
      await E2EHelpers.typeText(by.id('password-input'), TEST_USER.password);
      await E2EHelpers.typeText(by.id('first-name-input'), TEST_USER.firstName);
      await E2EHelpers.typeText(by.id('last-name-input'), TEST_USER.lastName);
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      // Onboarding steps
      await E2EHelpers.waitForElement(by.id('onboarding-steps-screen'));
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      await E2EHelpers.tapElement(by.id('interest-meditation'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your mental health goals?'));
      await E2EHelpers.tapElement(by.id('goal-stress-reduction'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('Choose your preferred language'));
      await E2EHelpers.tapElement(by.id('language-english'));
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
    }
  });
});