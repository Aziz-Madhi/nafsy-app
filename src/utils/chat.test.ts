/**
 * Unit Tests for Chat Utility Functions
 * Tests the buildRecentMessages function and other chat utilities
 */

import { describe, it, expect } from 'vitest';
import { buildRecentMessages } from './chat';

describe('Chat Utility Functions', () => {
  describe('buildRecentMessages', () => {
    const mockMessages = [
      { _id: '1', role: 'user', content: 'Hello', timestamp: 1000 },
      { _id: '2', role: 'assistant', content: 'Hi there!', timestamp: 2000 },
      { _id: '3', role: 'user', content: 'How are you?', timestamp: 3000 },
      { _id: '4', role: 'assistant', content: 'I am doing well', timestamp: 4000 },
      { _id: '5', role: 'user', content: 'That is great', timestamp: 5000 },
      { _id: '6', role: 'assistant', content: 'Thank you', timestamp: 6000 },
      { _id: '7', role: 'user', content: 'You are welcome', timestamp: 7000 },
      { _id: '8', role: 'assistant', content: 'I appreciate it', timestamp: 8000 },
      { _id: '9', role: 'user', content: 'No problem', timestamp: 9000 },
      { _id: '10', role: 'assistant', content: 'Great to hear', timestamp: 10000 },
      { _id: '11', role: 'user', content: 'Indeed', timestamp: 11000 }
    ] as any[];

    it('should return last 9 messages plus new message', () => {
      const newMessage = 'This is a new message';
      const result = buildRecentMessages(mockMessages, newMessage);

      expect(result).toHaveLength(10);
      expect(result[result.length - 1]).toEqual({
        role: 'user',
        content: newMessage,
        timestamp: expect.any(Number)
      });
    });

    it('should include the 9 most recent existing messages', () => {
      const newMessage = 'New message';
      const result = buildRecentMessages(mockMessages, newMessage);

      // Should have the last 9 messages from mockMessages
      expect(result[0]).toEqual({
        role: 'user',
        content: 'How are you?',
        timestamp: 3000
      });
      expect(result[8]).toEqual({
        role: 'assistant',
        content: 'Great to hear',
        timestamp: 10000
      });
    });

    it('should handle fewer than 9 existing messages', () => {
      const fewMessages = mockMessages.slice(0, 3);
      const newMessage = 'New message';
      const result = buildRecentMessages(fewMessages, newMessage);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        role: 'user',
        content: 'Hello',
        timestamp: 1000
      });
      expect(result[3]).toEqual({
        role: 'user',
        content: newMessage,
        timestamp: expect.any(Number)
      });
    });

    it('should handle empty message history', () => {
      const newMessage = 'First message';
      const result = buildRecentMessages([], newMessage);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        role: 'user',
        content: newMessage,
        timestamp: expect.any(Number)
      });
    });

    it('should preserve message order', () => {
      const newMessage = 'Latest message';
      const result = buildRecentMessages(mockMessages, newMessage);

      // Check that timestamps are in ascending order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].timestamp).toBeGreaterThanOrEqual(result[i - 1].timestamp);
      }
    });

    it('should handle messages with different roles', () => {
      const mixedMessages = [
        { _id: '1', role: 'system', content: 'System message', timestamp: 1000 },
        { _id: '2', role: 'user', content: 'User message', timestamp: 2000 },
        { _id: '3', role: 'assistant', content: 'Assistant message', timestamp: 3000 }
      ] as any[];

      const newMessage = 'New user message';
      const result = buildRecentMessages(mixedMessages, newMessage);

      expect(result).toHaveLength(4);
      expect(result.map(m => m.role)).toEqual(['system', 'user', 'assistant', 'user']);
    });

    it('should generate realistic timestamps for new messages', () => {
      const newMessage = 'Test message';
      const result = buildRecentMessages(mockMessages, newMessage);
      const newMessageTimestamp = result[result.length - 1].timestamp;

      // New message timestamp should be close to current time
      const now = Date.now();
      expect(newMessageTimestamp).toBeGreaterThan(now - 1000); // Within last second
      expect(newMessageTimestamp).toBeLessThanOrEqual(now);
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      const result = buildRecentMessages(mockMessages, longMessage);

      expect(result[result.length - 1].content).toBe(longMessage);
      expect(result).toHaveLength(10);
    });

    it('should handle special characters and emojis', () => {
      const specialMessage = '🎉 Hello! 你好 مرحبا @#$%^&*()';
      const result = buildRecentMessages(mockMessages, specialMessage);

      expect(result[result.length - 1].content).toBe(specialMessage);
    });

    it('should maintain correct message structure', () => {
      const newMessage = 'Test structure';
      const result = buildRecentMessages(mockMessages, newMessage);

      result.forEach(message => {
        expect(message).toHaveProperty('role');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('timestamp');
        expect(['user', 'assistant', 'system']).toContain(message.role);
        expect(typeof message.content).toBe('string');
        expect(typeof message.timestamp).toBe('number');
      });
    });

    it('should handle duplicate messages correctly', () => {
      const duplicateMessages = [
        { _id: '1', role: 'user', content: 'Same message', timestamp: 1000 },
        { _id: '2', role: 'user', content: 'Same message', timestamp: 2000 }
      ] as any[];

      const newMessage = 'Same message';
      const result = buildRecentMessages(duplicateMessages, newMessage);

      expect(result).toHaveLength(3);
      expect(result.every(m => m.content === 'Same message')).toBe(true);
    });

    it('should maintain performance with large message histories', () => {
      // Create a large message history
      const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
        _id: i.toString(),
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: i * 1000
      })) as any[];

      const start = performance.now();
      const result = buildRecentMessages(largeHistory, 'New message');
      const end = performance.now();

      expect(result).toHaveLength(10);
      expect(end - start).toBeLessThan(10); // Should complete within 10ms
    });
  });

  describe('Performance Considerations', () => {
    it('should efficiently handle rapid message building', () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        _id: i.toString(),
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: i * 1000
      })) as any[];

      const start = performance.now();
      
      // Build recent messages 100 times (simulating rapid usage)
      for (let i = 0; i < 100; i++) {
        buildRecentMessages(messages, `Test message ${i}`);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete all operations within 100ms
    });
  });
});