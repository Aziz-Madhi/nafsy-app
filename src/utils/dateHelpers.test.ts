/**
 * Comprehensive Unit Tests for Date Helper Functions
 * Tests date formatting, message grouping, and time utilities
 */

import { 
  formatMessageDate, 
  groupMessagesByDate, 
  formatMessageTime 
} from './dateHelpers';

// Mock Intl.DateTimeFormat for consistent testing across environments
const mockFormat = jest.fn();
const mockDateTimeFormat = jest.fn(() => ({ format: mockFormat }));
global.Intl = { DateTimeFormat: mockDateTimeFormat } as any;

describe('Date Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Use fixed Date implementation for testing
    const OriginalDate = Date;
    const mockDate = new OriginalDate('2024-01-15T12:00:00.000Z');
    
    global.Date = jest.fn(((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new OriginalDate(...args);
    }) as any) as DateConstructor;
    
    Object.setPrototypeOf(global.Date, OriginalDate);
    Object.defineProperty(global.Date, 'now', {
      value: jest.fn(() => mockDate.getTime()),
      writable: true
    });
  });

  describe('formatMessageDate', () => {
    it('should return "Today" for messages sent today (English)', () => {
      const today = new Date('2024-01-15T10:00:00.000Z');
      const timestamp = today.getTime();
      
      const result = formatMessageDate(timestamp, 'en');
      expect(result).toBe('Today');
    });

    it('should return "اليوم" for messages sent today (Arabic)', () => {
      const today = new Date('2024-01-15T10:00:00.000Z');
      const timestamp = today.getTime();
      
      const result = formatMessageDate(timestamp, 'ar');
      expect(result).toBe('اليوم');
    });

    it('should return "Yesterday" for messages sent yesterday (English)', () => {
      const yesterday = new Date('2024-01-14T10:00:00.000Z');
      const timestamp = yesterday.getTime();
      
      const result = formatMessageDate(timestamp, 'en');
      expect(result).toBe('Yesterday');
    });

    it('should return "أمس" for messages sent yesterday (Arabic)', () => {
      const yesterday = new Date('2024-01-14T10:00:00.000Z');
      const timestamp = yesterday.getTime();
      
      const result = formatMessageDate(timestamp, 'ar');
      expect(result).toBe('أمس');
    });

    it('should use Intl.DateTimeFormat for dates within a week', () => {
      const threeDaysAgo = new Date('2024-01-12T10:00:00.000Z');
      const timestamp = threeDaysAgo.getTime();
      
      mockFormat.mockReturnValue('Friday');
      
      const result = formatMessageDate(timestamp, 'en');
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', { weekday: 'long' });
      expect(mockFormat).toHaveBeenCalledWith(threeDaysAgo);
      expect(result).toBe('Friday');
    });

    it('should use Arabic locale for dates within a week', () => {
      const threeDaysAgo = new Date('2024-01-12T10:00:00.000Z');
      const timestamp = threeDaysAgo.getTime();
      
      mockFormat.mockReturnValue('الجمعة');
      
      const result = formatMessageDate(timestamp, 'ar');
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('ar-SA', { weekday: 'long' });
      expect(result).toBe('الجمعة');
    });

    it('should use full date format for dates older than a week', () => {
      const twoWeeksAgo = new Date('2024-01-01T10:00:00.000Z');
      const timestamp = twoWeeksAgo.getTime();
      
      mockFormat.mockReturnValue('January 1, 2024');
      
      const result = formatMessageDate(timestamp, 'en');
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      expect(result).toBe('January 1, 2024');
    });

    it('should default to English locale when no locale provided', () => {
      const today = new Date('2024-01-15T10:00:00.000Z');
      const timestamp = today.getTime();
      
      const result = formatMessageDate(timestamp);
      expect(result).toBe('Today');
    });

    it('should handle edge case where message is from different day but less than 24 hours ago', () => {
      // Message sent at 23:00 yesterday, now it's 01:00 today
      const lateYesterday = new Date('2024-01-14T23:00:00.000Z');
      const timestamp = lateYesterday.getTime();
      
      // Mock current time as early today
      const earlyToday = new Date('2024-01-15T01:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) {
          return earlyToday;
        }
        return new (Date as any)(...args);
      });
      
      const result = formatMessageDate(timestamp, 'en');
      expect(result).toBe('Yesterday');
    });

    it('should handle timestamps at exact midnight boundaries', () => {
      const exactMidnight = new Date('2024-01-15T00:00:00.000Z');
      const timestamp = exactMidnight.getTime();
      
      const result = formatMessageDate(timestamp, 'en');
      expect(result).toBe('Today');
    });

    it('should handle future timestamps gracefully', () => {
      const future = new Date('2024-01-16T10:00:00.000Z');
      const timestamp = future.getTime();
      
      mockFormat.mockReturnValue('Tomorrow');
      
      const result = formatMessageDate(timestamp, 'en');
      
      // Should treat as a regular date since it's not today/yesterday
      expect(mockDateTimeFormat).toHaveBeenCalled();
    });
  });

  describe('groupMessagesByDate', () => {
    const mockMessages = [
      { id: 1, content: 'Message 1', timestamp: new Date('2024-01-15T10:00:00.000Z').getTime() },
      { id: 2, content: 'Message 2', timestamp: new Date('2024-01-15T11:00:00.000Z').getTime() },
      { id: 3, content: 'Message 3', timestamp: new Date('2024-01-14T10:00:00.000Z').getTime() },
      { id: 4, content: 'Message 4', timestamp: new Date('2024-01-14T15:00:00.000Z').getTime() },
      { id: 5, content: 'Message 5', timestamp: new Date('2024-01-13T10:00:00.000Z').getTime() }
    ];

    it('should group messages by date correctly', () => {
      const result = groupMessagesByDate(mockMessages, 'en');
      
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('Today');
      expect(result[0].messages).toHaveLength(2);
      expect(result[1].date).toBe('Yesterday');
      expect(result[1].messages).toHaveLength(2);
    });

    it('should maintain message order within groups', () => {
      const result = groupMessagesByDate(mockMessages, 'en');
      
      // Messages within each group should maintain their original order
      expect(result[0].messages[0].id).toBe(1);
      expect(result[0].messages[1].id).toBe(2);
      expect(result[1].messages[0].id).toBe(3);
      expect(result[1].messages[1].id).toBe(4);
    });

    it('should handle empty message array', () => {
      const result = groupMessagesByDate([], 'en');
      expect(result).toEqual([]);
    });

    it('should handle single message', () => {
      const singleMessage = [mockMessages[0]];
      const result = groupMessagesByDate(singleMessage, 'en');
      
      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0]).toBe(singleMessage[0]);
    });

    it('should use Arabic locale when specified', () => {
      const result = groupMessagesByDate(mockMessages, 'ar');
      
      expect(result[0].date).toBe('اليوم');
      expect(result[1].date).toBe('أمس');
    });

    it('should default to English locale', () => {
      const result = groupMessagesByDate(mockMessages);
      
      expect(result[0].date).toBe('Today');
      expect(result[1].date).toBe('Yesterday');
    });

    it('should handle messages with same timestamp', () => {
      const sameTimeMessages = [
        { id: 1, content: 'Message 1', timestamp: 1000 },
        { id: 2, content: 'Message 2', timestamp: 1000 },
        { id: 3, content: 'Message 3', timestamp: 1000 }
      ];
      
      const result = groupMessagesByDate(sameTimeMessages, 'en');
      
      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(3);
    });

    it('should handle large number of messages efficiently', () => {
      const largeMessageArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        content: `Message ${i}`,
        timestamp: new Date('2024-01-15T10:00:00.000Z').getTime() + (i * 1000)
      }));
      
      const start = performance.now();
      const result = groupMessagesByDate(largeMessageArray, 'en');
      const end = performance.now();
      
      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('formatMessageTime', () => {
    it('should format time in 12-hour format for English', () => {
      const timestamp = new Date('2024-01-15T14:30:00.000Z').getTime();
      
      mockFormat.mockReturnValue('2:30 PM');
      
      const result = formatMessageTime(timestamp, 'en');
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      expect(result).toBe('2:30 PM');
    });

    it('should format time in 24-hour format for Arabic', () => {
      const timestamp = new Date('2024-01-15T14:30:00.000Z').getTime();
      
      mockFormat.mockReturnValue('14:30');
      
      const result = formatMessageTime(timestamp, 'ar');
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('ar-SA', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      });
      expect(result).toBe('14:30');
    });

    it('should default to English format', () => {
      const timestamp = new Date('2024-01-15T14:30:00.000Z').getTime();
      
      mockFormat.mockReturnValue('2:30 PM');
      
      const result = formatMessageTime(timestamp);
      
      expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    });

    it('should handle midnight correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00.000Z').getTime();
      
      mockFormat.mockReturnValue('12:00 AM');
      
      const result = formatMessageTime(midnight, 'en');
      expect(result).toBe('12:00 AM');
    });

    it('should handle noon correctly', () => {
      const noon = new Date('2024-01-15T12:00:00.000Z').getTime();
      
      mockFormat.mockReturnValue('12:00 PM');
      
      const result = formatMessageTime(noon, 'en');
      expect(result).toBe('12:00 PM');
    });

    it('should handle single digit minutes with proper padding', () => {
      const timestamp = new Date('2024-01-15T14:05:00.000Z').getTime();
      
      mockFormat.mockReturnValue('2:05 PM');
      
      const result = formatMessageTime(timestamp, 'en');
      expect(result).toBe('2:05 PM');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid timestamps gracefully', () => {
      const invalidTimestamp = NaN;
      
      expect(() => formatMessageDate(invalidTimestamp, 'en')).not.toThrow();
      expect(() => formatMessageTime(invalidTimestamp, 'en')).not.toThrow();
    });

    it('should handle very old timestamps', () => {
      const veryOld = new Date('1970-01-01T00:00:00.000Z').getTime();
      
      mockFormat.mockReturnValue('January 1, 1970');
      
      const result = formatMessageDate(veryOld, 'en');
      expect(result).toBe('January 1, 1970');
    });

    it('should handle very future timestamps', () => {
      const veryFuture = new Date('2099-12-31T23:59:59.999Z').getTime();
      
      mockFormat.mockReturnValue('December 31, 2099');
      
      const result = formatMessageDate(veryFuture, 'en');
      expect(result).toBe('December 31, 2099');
    });

    it('should handle timezone differences gracefully', () => {
      // The functions should work with UTC timestamps regardless of local timezone
      const utcTimestamp = new Date('2024-01-15T12:00:00.000Z').getTime();
      
      expect(() => formatMessageDate(utcTimestamp, 'en')).not.toThrow();
      expect(() => formatMessageTime(utcTimestamp, 'en')).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should format dates efficiently in bulk', () => {
      const timestamps = Array.from({ length: 1000 }, (_, i) => 
        new Date('2024-01-15T10:00:00.000Z').getTime() + (i * 60000)
      );
      
      const start = performance.now();
      
      timestamps.forEach(timestamp => {
        formatMessageDate(timestamp, 'en');
        formatMessageTime(timestamp, 'en');
      });
      
      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Should complete within 500ms
    });

    it('should group large message sets efficiently', () => {
      const largeMessageSet = Array.from({ length: 5000 }, (_, i) => ({
        id: i,
        content: `Message ${i}`,
        timestamp: new Date('2024-01-15T10:00:00.000Z').getTime() + (i * 60000)
      }));
      
      const start = performance.now();
      const result = groupMessagesByDate(largeMessageSet, 'en');
      const end = performance.now();
      
      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(200); // Should complete within 200ms
    });
  });
});