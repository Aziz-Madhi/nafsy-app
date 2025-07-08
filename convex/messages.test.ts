/**
 * Comprehensive Integration Tests for Convex Messages Functions
 * Tests the sendMessage action, addMessage mutation, and related message operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import schema from './schema';

// Mock fetch for OpenAI API calls
global.fetch = vi.fn();

describe('Messages Convex Functions', () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Set up default OpenAI API mock response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'This is a helpful AI response to support the user.'
          }
        }]
      })
    });

    // Create test user
    await t.mutation(api.users.create, {
      clerkId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      onboardingData: {
        age: 25,
        interests: ['meditation', 'journaling'],
        mentalHealthGoals: ['stress_reduction', 'better_sleep'],
        preferredLanguage: 'en',
        timeZone: 'UTC',
        hasCompletedOnboarding: true
      }
    });

    // Create test conversation
    await t.mutation(api.conversations.create, {
      userId: await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' }).then(user => user!._id),
      title: 'Test Conversation'
    });
  });

  describe('addMessage mutation', () => {
    it('should successfully add a user message', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const messageId = await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'Hello, I need some help with anxiety.',
        sentiment: {
          score: 0.3,
          label: 'neutral'
        }
      });

      expect(messageId).toBeDefined();

      // Verify message was added
      const message = await t.query(api.messages.getMessageById, { messageId });
      expect(message).toBeDefined();
      expect(message!.content).toBe('Hello, I need some help with anxiety.');
      expect(message!.role).toBe('user');
      expect(message!.sentiment?.label).toBe('neutral');
    });

    it('should successfully add an assistant message with metadata', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const messageId = await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'assistant',
        content: 'I understand you\'re feeling anxious. Let\'s work through this together.',
        metadata: {
          isEmergency: false,
          language: 'en',
          chatMode: 'full',
          aiModel: 'gpt-4',
          responseTime: 1500
        }
      });

      const message = await t.query(api.messages.getMessageById, { messageId });
      expect(message!.metadata?.language).toBe('en');
      expect(message!.metadata?.chatMode).toBe('full');
      expect(message!.metadata?.aiModel).toBe('gpt-4');
    });

    it('should handle Arabic messages correctly', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const messageId = await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'أحتاج إلى مساعدة في التعامل مع القلق',
        metadata: {
          language: 'ar'
        }
      });

      const message = await t.query(api.messages.getMessageById, { messageId });
      expect(message!.content).toBe('أحتاج إلى مساعدة في التعامل مع القلق');
      expect(message!.metadata?.language).toBe('ar');
    });

    it('should handle emergency messages with proper flagging', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const messageId = await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'I am having thoughts of self-harm',
        metadata: {
          isEmergency: true,
          crisisLevel: 'high'
        }
      });

      const message = await t.query(api.messages.getMessageById, { messageId });
      expect(message!.metadata?.isEmergency).toBe(true);
      expect(message!.metadata?.crisisLevel).toBe('high');
    });
  });

  describe('sendMessage action', () => {
    it('should send a message and receive AI response', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'I am feeling stressed about work',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: ['meditation'],
          mentalHealthGoals: ['stress_reduction'],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(true);
      expect(result.userMessageId).toBeDefined();
      expect(result.assistantMessageId).toBeDefined();
      
      // Verify both messages were created
      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      const assistantMessage = await t.query(api.messages.getMessageById, { messageId: result.assistantMessageId! });
      
      expect(userMessage!.content).toBe('I am feeling stressed about work');
      expect(userMessage!.role).toBe('user');
      expect(assistantMessage!.role).toBe('assistant');
      expect(assistantMessage!.content).toContain('helpful');
    });

    it('should handle crisis detection in sendMessage', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      // Mock crisis detection response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                isCrisis: true,
                severity: 'high',
                indicators: ['self-harm'],
                suggestedActions: ['contact_emergency_services']
              })
            }
          }]
        })
      });

      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'I want to hurt myself',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(true);
      expect(result.crisis).toBeDefined();
      expect(result.crisis!.isCrisis).toBe(true);
      expect(result.crisis!.severity).toBe('high');
      
      // Verify user message was flagged as emergency
      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.metadata?.isEmergency).toBe(true);
    });

    it('should handle AI API errors gracefully', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      // Mock API failure
      (global.fetch as any).mockRejectedValue(new Error('API Error'));

      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Hello',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.userMessageId).toBeDefined(); // User message should still be saved
    });

    it('should handle Arabic language detection and response', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'مرحبا، كيف حالك؟',
        language: 'ar',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'ar'
        }
      });

      expect(result.success).toBe(true);
      
      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.metadata?.language).toBe('ar');
    });

    it('should include performance metrics in response', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Test message',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(true);
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics!.totalDuration).toBeGreaterThan(0);
      expect(result.performanceMetrics!.userMessageTime).toBeGreaterThan(0);
      expect(result.performanceMetrics!.aiResponseTime).toBeGreaterThan(0);
    });

    it('should handle floating chat mode correctly', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Quick question',
        language: 'en',
        chatMode: 'floating',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(true);
      
      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.metadata?.chatMode).toBe('floating');
    });
  });

  describe('Message queries', () => {
    beforeEach(async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      // Add test messages
      await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'First message',
      });
      
      await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'assistant',
        content: 'First response',
      });
      
      await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'Second message',
      });
    });

    it('should retrieve messages by conversation', async () => {
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      const messages = await t.query(api.messages.getMessagesByConversation, {
        conversationId: conversation!._id
      });

      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First message');
      expect(messages[1].content).toBe('First response');
      expect(messages[2].content).toBe('Second message');
    });

    it('should support pagination for large message lists', async () => {
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      // Add many messages
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      for (let i = 0; i < 50; i++) {
        await t.mutation(api.messages.addMessage, {
          conversationId: conversation!._id,
          userId: user!._id,
          role: 'user',
          content: `Message ${i}`,
        });
      }

      const paginatedResult = await t.query(api.messages.getMessagesByConversationPaginated, {
        conversationId: conversation!._id,
        paginationOpts: { numItems: 10 }
      });

      expect(paginatedResult.page).toHaveLength(10);
      expect(paginatedResult.isDone).toBe(false);
    });

    it('should filter emergency messages correctly', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      // Add emergency message
      await t.mutation(api.messages.addMessage, {
        conversationId: conversation!._id,
        userId: user!._id,
        role: 'user',
        content: 'Emergency message',
        metadata: {
          isEmergency: true
        }
      });

      const emergencyMessages = await t.query(api.messages.getEmergencyMessages, {
        conversationId: conversation!._id
      });

      expect(emergencyMessages).toHaveLength(1);
      expect(emergencyMessages[0].content).toBe('Emergency message');
    });
  });

  describe('Language detection', () => {
    it('should detect English language correctly', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Hello, how are you doing today?',
        language: 'en', // Explicitly set
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.metadata?.language).toBe('en');
    });

    it('should detect Arabic language correctly', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'مرحبا، كيف حالك اليوم؟ أتمنى أن تكون بخير.',
        language: 'ar',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'ar'
        }
      });

      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.metadata?.language).toBe('ar');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid conversation ID', async () => {
      await expect(
        t.action(api.messages.sendMessage, {
          conversationId: 'invalid-id' as any,
          content: 'Test',
          language: 'en',
          chatMode: 'full',
          recentMessages: [],
          userInfo: {
            age: 25,
            interests: [],
            mentalHealthGoals: [],
            preferredLanguage: 'en'
          }
        })
      ).rejects.toThrow();
    });

    it('should handle empty message content', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: '',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should handle very long messages', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const longMessage = 'A'.repeat(10000);
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: longMessage,
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });

      expect(result.success).toBe(true);
      const userMessage = await t.query(api.messages.getMessageById, { messageId: result.userMessageId! });
      expect(userMessage!.content).toBe(longMessage);
    });

    it('should handle malformed user info gracefully', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Test message',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {} as any // Empty user info
      });

      expect(result.success).toBe(true); // Should still work with fallbacks
    });
  });

  describe('Performance and concurrency', () => {
    it('should handle multiple concurrent message sends', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const promises = Array.from({ length: 5 }, (_, i) => 
        t.action(api.messages.sendMessage, {
          conversationId: conversation!._id,
          content: `Concurrent message ${i}`,
          language: 'en',
          chatMode: 'full',
          recentMessages: [],
          userInfo: {
            age: 25,
            interests: [],
            mentalHealthGoals: [],
            preferredLanguage: 'en'
          }
        })
      );

      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.userMessageId).toBeDefined();
        expect(result.assistantMessageId).toBeDefined();
      });

      // Verify all messages were created
      const messages = await t.query(api.messages.getMessagesByConversation, {
        conversationId: conversation!._id
      });
      
      expect(messages.length).toBeGreaterThanOrEqual(10); // 5 user + 5 assistant messages
    });

    it('should complete operations within reasonable time', async () => {
      const user = await t.query(api.users.getUserByClerkId, { clerkId: 'test-user-123' });
      const conversation = await t.query(api.conversations.getActiveConversation, {});
      
      const start = Date.now();
      
      const result = await t.action(api.messages.sendMessage, {
        conversationId: conversation!._id,
        content: 'Performance test message',
        language: 'en',
        chatMode: 'full',
        recentMessages: [],
        userInfo: {
          age: 25,
          interests: [],
          mentalHealthGoals: [],
          preferredLanguage: 'en'
        }
      });
      
      const end = Date.now();
      const duration = end - start;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});