/**
 * Comprehensive Integration Tests for Convex Conversations Functions
 * Tests conversation management, CRUD operations, and conversation switching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import schema from './schema';

describe('Conversations Convex Functions', () => {
  let t: ConvexTestingHelper<typeof schema>;
  let testUserId: any;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
    
    // Create test user
    testUserId = await t.mutation(api.users.upsertUser, {
      clerkId: 'test-conv-user',
      name: 'Conversation Test User',
      email: 'conv@example.com'
    });
  });

  describe('createConversation mutation', () => {
    it('should create conversation with title', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Test Conversation'
      });

      expect(conversationId).toBeDefined();

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });
      
      expect(conversation).toBeDefined();
      expect(conversation!.userId).toBe(testUserId);
      expect(conversation!.title).toBe('Test Conversation');
      expect(conversation!.isActive).toBe(true);
      expect(conversation!.messageCount).toBe(0);
      expect(conversation!.createdAt).toBeGreaterThan(0);
    });

    it('should create conversation without title', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.title).toBeUndefined();
      expect(conversation!.isActive).toBe(true);
    });

    it('should create multiple conversations for same user', async () => {
      const conv1Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'First Conversation'
      });

      const conv2Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Second Conversation'
      });

      expect(conv1Id).not.toBe(conv2Id);

      const conversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });

      expect(conversations).toHaveLength(2);
    });
  });

  describe('getActiveConversation query', () => {
    it('should return active conversation', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Active Conversation'
      });

      const activeConversation = await t.query(api.conversations.getActiveConversation, {
        userId: testUserId
      });

      expect(activeConversation).toBeDefined();
      expect(activeConversation!._id).toBe(conversationId);
      expect(activeConversation!.isActive).toBe(true);
    });

    it('should return null when no active conversation', async () => {
      const activeConversation = await t.query(api.conversations.getActiveConversation, {
        userId: testUserId
      });

      expect(activeConversation).toBeNull();
    });

    it('should return correct conversation when multiple exist', async () => {
      // Create first conversation
      const conv1Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'First'
      });

      // Archive first conversation
      await t.mutation(api.conversations.archiveConversation, {
        conversationId: conv1Id
      });

      // Create second conversation
      const conv2Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Second Active'
      });

      const activeConversation = await t.query(api.conversations.getActiveConversation, {
        userId: testUserId
      });

      expect(activeConversation!._id).toBe(conv2Id);
      expect(activeConversation!.title).toBe('Second Active');
    });
  });

  describe('getUserConversations query', () => {
    it('should return all user conversations in descending order', async () => {
      // Create conversations with delay to ensure different timestamps
      const conv1Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'First Conversation'
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const conv2Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Second Conversation'
      });

      const conversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });

      expect(conversations).toHaveLength(2);
      // Should be in descending order (newest first)
      expect(conversations[0]._id).toBe(conv2Id);
      expect(conversations[1]._id).toBe(conv1Id);
    });

    it('should return empty array for user with no conversations', async () => {
      const conversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });

      expect(conversations).toEqual([]);
    });

    it('should include both active and archived conversations', async () => {
      const conv1Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Active'
      });

      const conv2Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'To Archive'
      });

      await t.mutation(api.conversations.archiveConversation, {
        conversationId: conv2Id
      });

      const conversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });

      expect(conversations).toHaveLength(2);
      expect(conversations.find(c => c._id === conv1Id)?.isActive).toBe(true);
      expect(conversations.find(c => c._id === conv2Id)?.isActive).toBe(false);
    });
  });

  describe('updateConversationTitle mutation', () => {
    it('should update conversation title', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Original Title'
      });

      await t.mutation(api.conversations.updateConversationTitle, {
        conversationId,
        title: 'Updated Title'
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.title).toBe('Updated Title');
    });

    it('should handle special characters in title', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId
      });

      const specialTitle = 'محادثة حول الصحة النفسية - @#$%^&*() "quotes" and emoji 🧠💚';

      await t.mutation(api.conversations.updateConversationTitle, {
        conversationId,
        title: specialTitle
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.title).toBe(specialTitle);
    });

    it('should handle very long titles', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId
      });

      const longTitle = 'A'.repeat(500);

      await t.mutation(api.conversations.updateConversationTitle, {
        conversationId,
        title: longTitle
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.title).toBe(longTitle);
    });
  });

  describe('archiveConversation mutation', () => {
    it('should archive conversation', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'To Archive'
      });

      await t.mutation(api.conversations.archiveConversation, {
        conversationId
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.isActive).toBe(false);
    });

    it('should handle archiving already archived conversation', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Already Archived'
      });

      // Archive twice
      await t.mutation(api.conversations.archiveConversation, {
        conversationId
      });

      await t.mutation(api.conversations.archiveConversation, {
        conversationId
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });

      expect(conversation!.isActive).toBe(false);
    });
  });

  describe('startNewConversation mutation', () => {
    it('should create new conversation and archive current one', async () => {
      const currentConvId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Current'
      });

      const newConvId = await t.mutation(api.conversations.startNewConversation, {
        userId: testUserId,
        currentConversationId: currentConvId
      });

      expect(newConvId).not.toBe(currentConvId);

      // Check current conversation is archived
      const currentConv = await t.query(api.conversations.getById, { 
        conversationId: currentConvId 
      });
      expect(currentConv!.isActive).toBe(false);

      // Check new conversation is active
      const newConv = await t.query(api.conversations.getById, { 
        conversationId: newConvId 
      });
      expect(newConv!.isActive).toBe(true);
      expect(newConv!.userId).toBe(testUserId);
    });

    it('should create new conversation without current conversation', async () => {
      const newConvId = await t.mutation(api.conversations.startNewConversation, {
        userId: testUserId
      });

      const newConv = await t.query(api.conversations.getById, { 
        conversationId: newConvId 
      });

      expect(newConv!.isActive).toBe(true);
      expect(newConv!.userId).toBe(testUserId);
      expect(newConv!.messageCount).toBe(0);
    });
  });

  describe('switchToConversation mutation', () => {
    it('should switch active conversation', async () => {
      const conv1Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'First'
      });

      const conv2Id = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Second'
      });

      // Both should be active initially
      const initialConversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });
      expect(initialConversations.filter(c => c.isActive)).toHaveLength(2);

      // Switch to first conversation
      const result = await t.mutation(api.conversations.switchToConversation, {
        userId: testUserId,
        conversationId: conv1Id
      });

      expect(result.success).toBe(true);

      // Check that only conv1 is active
      const conv1 = await t.query(api.conversations.getById, { 
        conversationId: conv1Id 
      });
      const conv2 = await t.query(api.conversations.getById, { 
        conversationId: conv2Id 
      });

      expect(conv1!.isActive).toBe(true);
      expect(conv2!.isActive).toBe(false);

      // Switch to second conversation
      await t.mutation(api.conversations.switchToConversation, {
        userId: testUserId,
        conversationId: conv2Id
      });

      // Check that only conv2 is active
      const conv1Updated = await t.query(api.conversations.getById, { 
        conversationId: conv1Id 
      });
      const conv2Updated = await t.query(api.conversations.getById, { 
        conversationId: conv2Id 
      });

      expect(conv1Updated!.isActive).toBe(false);
      expect(conv2Updated!.isActive).toBe(true);
    });

    it('should handle switching to already active conversation', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Active'
      });

      const result = await t.mutation(api.conversations.switchToConversation, {
        userId: testUserId,
        conversationId
      });

      expect(result.success).toBe(true);

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });
      expect(conversation!.isActive).toBe(true);
    });
  });

  describe('getUserConversationsWithPreview query', () => {
    beforeEach(async () => {
      // Create conversation with messages for preview testing
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Preview Test'
      });

      // Add some messages
      await t.mutation(api.messages.addMessage, {
        conversationId,
        userId: testUserId,
        role: 'user',
        content: 'First message'
      });

      await t.mutation(api.messages.addMessage, {
        conversationId,
        userId: testUserId,
        role: 'assistant',
        content: 'AI response'
      });

      await t.mutation(api.messages.addMessage, {
        conversationId,
        userId: testUserId,
        role: 'user',
        content: 'Last message'
      });
    });

    it('should return conversations with message previews', async () => {
      const conversations = await t.query(api.conversations.getUserConversationsWithPreview, {
        userId: testUserId
      });

      expect(conversations).toHaveLength(1);

      const conversation = conversations[0];
      expect(conversation.title).toBe('Preview Test');
      expect(conversation.messageCount).toBe(3);

      expect(conversation.firstMessage).toBeDefined();
      expect(conversation.firstMessage!.content).toBe('First message');
      expect(conversation.firstMessage!.role).toBe('user');

      expect(conversation.lastMessage).toBeDefined();
      expect(conversation.lastMessage!.content).toBe('Last message');
      expect(conversation.lastMessage!.role).toBe('user');
    });

    it('should handle conversations with no messages', async () => {
      await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Empty Conversation'
      });

      const conversations = await t.query(api.conversations.getUserConversationsWithPreview, {
        userId: testUserId
      });

      const emptyConversation = conversations.find(c => c.title === 'Empty Conversation');
      expect(emptyConversation).toBeDefined();
      expect(emptyConversation!.firstMessage).toBeNull();
      expect(emptyConversation!.lastMessage).toBeNull();
      expect(emptyConversation!.messageCount).toBe(0);
    });

    it('should handle conversation with single message', async () => {
      const singleMsgConvId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Single Message'
      });

      await t.mutation(api.messages.addMessage, {
        conversationId: singleMsgConvId,
        userId: testUserId,
        role: 'user',
        content: 'Only message'
      });

      const conversations = await t.query(api.conversations.getUserConversationsWithPreview, {
        userId: testUserId
      });

      const singleMsgConv = conversations.find(c => c.title === 'Single Message');
      expect(singleMsgConv!.messageCount).toBe(1);
      expect(singleMsgConv!.firstMessage!.content).toBe('Only message');
      expect(singleMsgConv!.lastMessage!.content).toBe('Only message');
    });
  });

  describe('archiveConversationWithSummary action', () => {
    it('should archive conversation with many messages and trigger summarization', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Summary Test'
      });

      // Add more than 2 messages to trigger summarization
      for (let i = 0; i < 5; i++) {
        await t.mutation(api.messages.addMessage, {
          conversationId,
          userId: testUserId,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`
        });
      }

      // Update message count
      await t.mutation(api.conversations.updateMessageCount, {
        conversationId,
        count: 5
      });

      const result = await t.action(api.conversations.archiveConversationWithSummary, {
        conversationId,
        language: 'en'
      });

      expect(result.archived).toBe(true);
      expect(result.summarized).toBe(true);

      // Verify conversation is archived
      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });
      expect(conversation!.isActive).toBe(false);
    });

    it('should archive conversation with few messages without summarization', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'No Summary Test'
      });

      // Add only 1 message
      await t.mutation(api.messages.addMessage, {
        conversationId,
        userId: testUserId,
        role: 'user',
        content: 'Single message'
      });

      const result = await t.action(api.conversations.archiveConversationWithSummary, {
        conversationId,
        language: 'en'
      });

      expect(result.archived).toBe(true);
      expect(result.summarized).toBe(false);
    });

    it('should handle non-existent conversation', async () => {
      const fakeId = testUserId.replace(/.$/, '0') as any; // Create fake ID

      await expect(
        t.action(api.conversations.archiveConversationWithSummary, {
          conversationId: fakeId,
          language: 'en'
        })
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('startNewConversationWithSummary action', () => {
    it('should start new conversation and trigger summarization of previous', async () => {
      const currentConvId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Current with Messages'
      });

      // Add messages to trigger summarization
      for (let i = 0; i < 4; i++) {
        await t.mutation(api.messages.addMessage, {
          conversationId: currentConvId,
          userId: testUserId,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`
        });
      }

      // Update message count
      await t.mutation(api.conversations.updateMessageCount, {
        conversationId: currentConvId,
        count: 4
      });

      const result = await t.action(api.conversations.startNewConversationWithSummary, {
        userId: testUserId,
        currentConversationId: currentConvId,
        language: 'en'
      });

      expect(result.newConversationId).toBeDefined();
      expect(result.previousConversationSummarized).toBe(true);

      // Verify old conversation is archived
      const oldConv = await t.query(api.conversations.getById, { 
        conversationId: currentConvId 
      });
      expect(oldConv!.isActive).toBe(false);

      // Verify new conversation is active
      const newConv = await t.query(api.conversations.getById, { 
        conversationId: result.newConversationId 
      });
      expect(newConv!.isActive).toBe(true);
    });

    it('should start new conversation without summarization for short previous conversation', async () => {
      const currentConvId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Short Conversation'
      });

      // Add only 1 message (below threshold)
      await t.mutation(api.messages.addMessage, {
        conversationId: currentConvId,
        userId: testUserId,
        role: 'user',
        content: 'Short message'
      });

      const result = await t.action(api.conversations.startNewConversationWithSummary, {
        userId: testUserId,
        currentConversationId: currentConvId,
        language: 'en'
      });

      expect(result.newConversationId).toBeDefined();
      expect(result.previousConversationSummarized).toBe(false);
    });

    it('should start new conversation without previous conversation', async () => {
      const result = await t.action(api.conversations.startNewConversationWithSummary, {
        userId: testUserId,
        language: 'en'
      });

      expect(result.newConversationId).toBeDefined();
      expect(result.previousConversationSummarized).toBe(false);

      const newConv = await t.query(api.conversations.getById, { 
        conversationId: result.newConversationId 
      });
      expect(newConv!.isActive).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid conversation IDs gracefully', async () => {
      const fakeId = 'invalid-id' as any;

      await expect(
        t.mutation(api.conversations.updateConversationTitle, {
          conversationId: fakeId,
          title: 'Test'
        })
      ).rejects.toThrow();
    });

    it('should handle concurrent conversation operations', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: 'Concurrent Test'
      });

      // Perform multiple operations concurrently
      const promises = [
        t.mutation(api.conversations.updateConversationTitle, {
          conversationId,
          title: 'Updated Title 1'
        }),
        t.mutation(api.conversations.updateConversationTitle, {
          conversationId,
          title: 'Updated Title 2'
        }),
        t.mutation(api.conversations.archiveConversation, {
          conversationId
        })
      ];

      await Promise.all(promises);

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });
      
      // Should complete without errors
      expect(conversation).toBeDefined();
      expect(conversation!.isActive).toBe(false); // Archive should have succeeded
    });

    it('should handle empty string titles', async () => {
      const conversationId = await t.mutation(api.conversations.createConversation, {
        userId: testUserId,
        title: ''
      });

      const conversation = await t.query(api.conversations.getById, { 
        conversationId 
      });
      expect(conversation!.title).toBe('');
    });
  });

  describe('Performance tests', () => {
    it('should handle large number of conversations efficiently', async () => {
      const start = Date.now();

      // Create many conversations
      const promises = Array.from({ length: 50 }, (_, i) =>
        t.mutation(api.conversations.createConversation, {
          userId: testUserId,
          title: `Conversation ${i}`
        })
      );

      await Promise.all(promises);

      const conversations = await t.query(api.conversations.getUserConversations, {
        userId: testUserId
      });

      const end = Date.now();
      const duration = end - start;

      expect(conversations).toHaveLength(50);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle conversation switching efficiently', async () => {
      // Create multiple conversations
      const conversationIds = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          t.mutation(api.conversations.createConversation, {
            userId: testUserId,
            title: `Switch Test ${i}`
          })
        )
      );

      const start = Date.now();

      // Switch between conversations multiple times
      for (let i = 0; i < 5; i++) {
        const randomId = conversationIds[Math.floor(Math.random() * conversationIds.length)];
        await t.mutation(api.conversations.switchToConversation, {
          userId: testUserId,
          conversationId: randomId
        });
      }

      const end = Date.now();
      const duration = end - start;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});