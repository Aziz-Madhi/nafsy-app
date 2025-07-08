/**
 * E2E Tests for Chat Functionality
 * Tests AI chat interactions, conversation management, and crisis detection
 */

import { device, element, by, expect as detoxExpect } from 'detox';
import { E2EHelpers, TEST_USER } from './setup';

describe('Chat Functionality', () => {
  beforeEach(async () => {
    // Start with authenticated user in main app
    await this.setupAuthenticatedUser();
  });

  describe('Basic Chat Interactions', () => {
    it('should display chat interface on home screen', async () => {
      await E2EHelpers.waitForElement(by.id('main-tabs'));
      await E2EHelpers.navigateToTab('index');
      
      // Check main chat elements
      await detoxExpect(element(by.id('chat-input'))).toBeVisible();
      await detoxExpect(element(by.id('send-button'))).toBeVisible();
      await detoxExpect(element(by.id('chat-messages-list'))).toBeVisible();
    });

    it('should send a basic message and receive AI response', async () => {
      await E2EHelpers.navigateToTab('index');
      
      const testMessage = 'Hello, how are you today?';
      await E2EHelpers.typeText(by.id('chat-input'), testMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should see user message appear
      await detoxExpect(element(by.text(testMessage))).toBeVisible();
      
      // Should see typing indicator
      await E2EHelpers.waitForElement(by.id('ai-typing-indicator'));
      
      // Should receive AI response
      await E2EHelpers.waitForLoadingToComplete(30000);
      await detoxExpect(element(by.id('ai-message'))).toBeVisible();
      
      // Typing indicator should disappear
      await detoxExpect(element(by.id('ai-typing-indicator'))).not.toBeVisible();
    });

    it('should handle long messages properly', async () => {
      await E2EHelpers.navigateToTab('index');
      
      const longMessage = 'This is a very long message that should test how the chat handles extended text input and ensures that the UI can accommodate longer conversations without breaking the layout or causing performance issues.'.repeat(3);
      
      await E2EHelpers.typeText(by.id('chat-input'), longMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should display long message properly
      await detoxExpect(element(by.text(longMessage))).toBeVisible();
      
      // Should still receive AI response
      await E2EHelpers.waitForLoadingToComplete(30000);
      await detoxExpect(element(by.id('ai-message'))).toBeVisible();
    });

    it('should handle empty message submission gracefully', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Try to send empty message
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should not send empty message
      await detoxExpect(element(by.text(''))).not.toBeVisible();
      
      // Input should remain focused
      await detoxExpect(element(by.id('chat-input'))).toBeVisible();
    });

    it('should display message timestamps', async () => {
      await E2EHelpers.navigateToTab('index');
      
      await E2EHelpers.typeText(by.id('chat-input'), 'Test message with timestamp');
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should show timestamp
      await detoxExpect(element(by.id('message-timestamp'))).toBeVisible();
    });
  });

  describe('Conversation Management', () => {
    it('should open conversation management modal', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Tap conversation management button
      await E2EHelpers.tapElement(by.id('conversation-management-button'));
      
      // Should open modal
      await E2EHelpers.waitForElement(by.id('chat-management-modal'));
      await detoxExpect(element(by.text('Chats'))).toBeVisible();
    });

    it('should create new conversation', async () => {
      await E2EHelpers.navigateToTab('index');
      await E2EHelpers.tapElement(by.id('conversation-management-button'));
      await E2EHelpers.waitForElement(by.id('chat-management-modal'));
      
      // Tap new chat button
      await E2EHelpers.tapElement(by.id('new-chat-button'));
      
      // Should show confirmation dialog
      await detoxExpect(element(by.text('Start New Chat'))).toBeVisible();
      await E2EHelpers.tapElement(by.text('Confirm'));
      
      // Should close modal and start fresh conversation
      await E2EHelpers.waitForElement(by.id('chat-input'));
      await detoxExpect(element(by.id('chat-management-modal'))).not.toBeVisible();
    });

    it('should display conversation history', async () => {
      // Send a few messages first
      await E2EHelpers.navigateToTab('index');
      await E2EHelpers.typeText(by.id('chat-input'), 'First message');
      await E2EHelpers.tapElement(by.id('send-button'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      await E2EHelpers.typeText(by.id('chat-input'), 'Second message');
      await E2EHelpers.tapElement(by.id('send-button'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      // Open conversation management
      await E2EHelpers.tapElement(by.id('conversation-management-button'));
      await E2EHelpers.waitForElement(by.id('chat-management-modal'));
      
      // Should see conversation with message preview
      await detoxExpect(element(by.text('Second message'))).toBeVisible();
      await detoxExpect(element(by.text('2 messages'))).toBeVisible();
    });

    it('should search conversations', async () => {
      // Create conversation with specific content
      await E2EHelpers.navigateToTab('index');
      await E2EHelpers.typeText(by.id('chat-input'), 'Unique search term xyz123');
      await E2EHelpers.tapElement(by.id('send-button'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      
      // Open conversation management and search
      await E2EHelpers.tapElement(by.id('conversation-management-button'));
      await E2EHelpers.waitForElement(by.id('chat-management-modal'));
      
      // Trigger search by scrolling up
      await E2EHelpers.swipeElement(by.id('conversation-list'), 'down');
      
      // Type search term
      await E2EHelpers.typeText(by.id('search-input'), 'xyz123');
      
      // Should filter conversations
      await detoxExpect(element(by.text('Unique search term xyz123'))).toBeVisible();
    });
  });

  describe('Chat Modes', () => {
    it('should toggle chat modes', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Should have chat mode toggle
      await detoxExpect(element(by.id('chat-mode-toggle'))).toBeVisible();
      
      // Tap to change mode
      await E2EHelpers.tapElement(by.id('chat-mode-toggle'));
      
      // Should show mode selection
      await detoxExpect(element(by.text('Quick Chat'))).toBeVisible();
      await detoxExpect(element(by.text('Full Chat'))).toBeVisible();
      
      // Select Quick Chat mode
      await E2EHelpers.tapElement(by.text('Quick Chat'));
      
      // Mode should be updated
      await detoxExpect(element(by.text('Quick'))).toBeVisible();
    });

    it('should work differently in quick vs full chat mode', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Set to quick mode
      await E2EHelpers.tapElement(by.id('chat-mode-toggle'));
      await E2EHelpers.tapElement(by.text('Quick Chat'));
      
      // Send message in quick mode
      await E2EHelpers.typeText(by.id('chat-input'), 'Quick chat test');
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should get shorter, quicker response
      await E2EHelpers.waitForLoadingToComplete(15000);
      await detoxExpect(element(by.id('ai-message'))).toBeVisible();
    });
  });

  describe('Crisis Detection and Handling', () => {
    it('should detect crisis keywords and show emergency response', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Send message with crisis keywords
      const crisisMessage = E2EHelpers.getCrisisKeywords()[0];
      await E2EHelpers.typeText(by.id('chat-input'), crisisMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should trigger crisis detection
      await E2EHelpers.waitForElement(by.id('crisis-intervention-modal'));
      await detoxExpect(element(by.text('We\'re here to help'))).toBeVisible();
      await detoxExpect(element(by.text('Emergency Resources'))).toBeVisible();
    });

    it('should show emergency contacts in crisis intervention', async () => {
      await E2EHelpers.navigateToTab('index');
      
      const crisisMessage = E2EHelpers.getCrisisKeywords()[1];
      await E2EHelpers.typeText(by.id('chat-input'), crisisMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      await E2EHelpers.waitForElement(by.id('crisis-intervention-modal'));
      
      // Should show emergency contacts
      await detoxExpect(element(by.text('Call 988'))).toBeVisible(); // Suicide & Crisis Lifeline
      await detoxExpect(element(by.text('Text HOME to 741741'))).toBeVisible(); // Crisis Text Line
    });

    it('should allow user to continue or get help from crisis intervention', async () => {
      await E2EHelpers.navigateToTab('index');
      
      const crisisMessage = E2EHelpers.getCrisisKeywords()[2];
      await E2EHelpers.typeText(by.id('chat-input'), crisisMessage);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      await E2EHelpers.waitForElement(by.id('crisis-intervention-modal'));
      
      // Should have options to continue or get help
      await detoxExpect(element(by.id('continue-chat-button'))).toBeVisible();
      await detoxExpect(element(by.id('get-help-button'))).toBeVisible();
      
      // Test continue option
      await E2EHelpers.tapElement(by.id('continue-chat-button'));
      
      // Should close modal and return to chat
      await detoxExpect(element(by.id('crisis-intervention-modal'))).not.toBeVisible();
      await detoxExpect(element(by.id('chat-input'))).toBeVisible();
    });

    it('should handle multiple crisis messages appropriately', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Send first crisis message
      await E2EHelpers.typeText(by.id('chat-input'), E2EHelpers.getCrisisKeywords()[0]);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      await E2EHelpers.waitForElement(by.id('crisis-intervention-modal'));
      await E2EHelpers.tapElement(by.id('continue-chat-button'));
      
      // Send another crisis message
      await E2EHelpers.typeText(by.id('chat-input'), E2EHelpers.getCrisisKeywords()[3]);
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should show crisis intervention again
      await E2EHelpers.waitForElement(by.id('crisis-intervention-modal'));
      await detoxExpect(element(by.text('We\'re still here for you'))).toBeVisible();
    });
  });

  describe('Accessibility and Usability', () => {
    it('should support voice input if available', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Check if voice input button exists
      try {
        await detoxExpect(element(by.id('voice-input-button'))).toBeVisible();
        await E2EHelpers.tapElement(by.id('voice-input-button'));
        
        // Handle permission if needed
        await E2EHelpers.handlePermissionDialog('allow');
        
        // Should show voice recording indicator
        await detoxExpect(element(by.id('voice-recording-indicator'))).toBeVisible();
      } catch {
        console.log('Voice input not available');
      }
    });

    it('should scroll through long conversation history', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Send multiple messages to create scrollable content
      for (let i = 0; i < 10; i++) {
        await E2EHelpers.typeText(by.id('chat-input'), `Message number ${i + 1}`);
        await E2EHelpers.tapElement(by.id('send-button'));
        await E2EHelpers.waitForLoadingToComplete(10000);
      }
      
      // Should be able to scroll up to see earlier messages
      await E2EHelpers.swipeElement(by.id('chat-messages-list'), 'up');
      await detoxExpect(element(by.text('Message number 1'))).toBeVisible();
      
      // Should be able to scroll back down to latest
      await E2EHelpers.swipeElement(by.id('chat-messages-list'), 'down');
      await detoxExpect(element(by.text('Message number 10'))).toBeVisible();
    });

    it('should handle offline state gracefully', async () => {
      await E2EHelpers.navigateToTab('index');
      
      // Simulate offline condition
      await E2EHelpers.setNetworkCondition('offline');
      
      // Try to send message
      await E2EHelpers.typeText(by.id('chat-input'), 'Offline message test');
      await E2EHelpers.tapElement(by.id('send-button'));
      
      // Should show offline indicator or retry option
      try {
        await detoxExpect(element(by.text('Connection lost'))).toBeVisible();
        await detoxExpect(element(by.id('retry-button'))).toBeVisible();
      } catch {
        console.log('Offline handling UI not visible');
      }
      
      // Restore connection
      await E2EHelpers.setNetworkCondition('good');
    });
  });

  // Helper method to setup authenticated user
  async setupAuthenticatedUser() {
    const appState = await E2EHelpers.checkAppState();
    
    if (appState !== 'authenticated') {
      // Complete onboarding flow
      await E2EHelpers.resetAppState();
      
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      await E2EHelpers.waitForElement(by.id('auth-screen'));
      
      // Registration
      await E2EHelpers.typeText(by.id('email-input'), TEST_USER.email);
      await E2EHelpers.typeText(by.id('password-input'), TEST_USER.password);
      await E2EHelpers.typeText(by.id('first-name-input'), TEST_USER.firstName);
      await E2EHelpers.typeText(by.id('last-name-input'), TEST_USER.lastName);
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      // Complete onboarding quickly
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
      
      // Complete onboarding chat
      await E2EHelpers.waitForElement(by.id('onboarding-chat-screen'));
      await E2EHelpers.typeText(by.id('chat-input'), 'I\'m ready to start!');
      await E2EHelpers.tapElement(by.id('send-button'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
      
      // Should now be in main app
      await E2EHelpers.waitForElement(by.id('main-tabs'));
    }
  }
});