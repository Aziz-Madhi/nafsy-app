/**
 * Comprehensive Unit Tests for General Helper Functions
 * Tests all utility functions in helpers.ts including date, validation, string, number, and mental health utilities
 */

import {
  formatDate, formatDuration,
  getDateRange, isToday, isYesterday,
  validateEmail, validatePhone, validateName, validatePassword, validateMoodRating,
  validateUrl,
  truncateText, capitalizeFirst, capitalizeWords, slugify, extractInitials,
  generateRandomId, generateUUID,
  roundToDecimal, clamp, average, median, standardDeviation,
  groupBy, sortBy, uniqueBy, chunk, intersection, difference, shuffle,
  pick, omit, isEmpty, deepClone, isEqual,
  getMoodLabel, getMoodColor, calculateMoodTrend, calculateStreak,
  debounce, throttle, delay, retry, timeout
} from './helpers';

// Mock Intl APIs for consistent testing
const mockFormat = jest.fn();
const mockDateTimeFormat = jest.fn(() => ({ format: mockFormat }));
const mockNumberFormat = jest.fn(() => ({ format: mockFormat }));
const mockRelativeTimeFormat = jest.fn(() => ({ format: mockFormat }));

global.Intl = {
  DateTimeFormat: mockDateTimeFormat,
  NumberFormat: mockNumberFormat,
  RelativeTimeFormat: mockRelativeTimeFormat,
} as any;

describe('Helper Functions', () => {
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

  describe('Date Utilities', () => {
    describe('formatDate', () => {
      it('should format date in English locale', () => {
        const timestamp = new Date('2024-01-15T12:00:00.000Z').getTime();
        mockFormat.mockReturnValue('Jan 15, 2024');
        
        const result = formatDate(timestamp, 'en');
        
        expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        expect(result).toBe('Jan 15, 2024');
      });

      it('should format date in Arabic locale', () => {
        const timestamp = new Date('2024-01-15T12:00:00.000Z').getTime();
        mockFormat.mockReturnValue('15 يناير، 2024');
        
        const result = formatDate(timestamp, 'ar');
        
        expect(mockDateTimeFormat).toHaveBeenCalledWith('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        expect(result).toBe('15 يناير، 2024');
      });

      it('should default to English locale', () => {
        const timestamp = new Date('2024-01-15T12:00:00.000Z').getTime();
        mockFormat.mockReturnValue('Jan 15, 2024');
        
        formatDate(timestamp);
        
        expect(mockDateTimeFormat).toHaveBeenCalledWith('en-US', expect.any(Object));
      });
    });

    describe('formatDuration', () => {
      it('should format duration with hours in English', () => {
        const result = formatDuration(3665, 'en'); // 1h 1m 5s
        expect(result).toBe('1h 1m');
      });

      it('should format duration with only minutes in English', () => {
        const result = formatDuration(125, 'en'); // 2m 5s
        expect(result).toBe('2m');
      });

      it('should format duration with only seconds in English', () => {
        const result = formatDuration(45, 'en');
        expect(result).toBe('45s');
      });

      it('should format duration in Arabic', () => {
        const result = formatDuration(3665, 'ar');
        expect(result).toBe('1 ساعة 1 دقيقة');
      });

      it('should handle zero duration', () => {
        const result = formatDuration(0, 'en');
        expect(result).toBe('0s');
      });
    });

    describe('getDateRange', () => {
      it('should calculate date range correctly', () => {
        const result = getDateRange(7);
        const expectedStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        expect(result.end).toBe(Date.now());
        expect(result.start).toBe(expectedStart);
      });
    });

    describe('isToday', () => {
      it('should return true for today\'s timestamp', () => {
        const today = new Date('2024-01-15T10:00:00.000Z').getTime();
        expect(isToday(today)).toBe(true);
      });

      it('should return false for yesterday\'s timestamp', () => {
        const yesterday = new Date('2024-01-14T10:00:00.000Z').getTime();
        expect(isToday(yesterday)).toBe(false);
      });
    });

    describe('isYesterday', () => {
      it('should return true for yesterday\'s timestamp', () => {
        const yesterday = new Date('2024-01-14T10:00:00.000Z').getTime();
        expect(isYesterday(yesterday)).toBe(true);
      });

      it('should return false for today\'s timestamp', () => {
        const today = new Date('2024-01-15T10:00:00.000Z').getTime();
        expect(isYesterday(today)).toBe(false);
      });
    });
  });

  describe('Validation Utilities', () => {
    describe('validateEmail', () => {
      it('should validate correct email addresses', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(validateEmail('user_name@domain-name.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
        expect(validateEmail('test.domain.com')).toBe(false);
        expect(validateEmail('')).toBe(false);
      });
    });

    describe('validatePhone', () => {
      it('should validate correct phone numbers', () => {
        expect(validatePhone('+1234567890')).toBe(true);
        expect(validatePhone('1234567890')).toBe(true);
        expect(validatePhone('+44 20 7123 4567')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(validatePhone('abc')).toBe(false);
        expect(validatePhone('123')).toBe(false);
        expect(validatePhone('')).toBe(false);
        expect(validatePhone('+abc123')).toBe(false);
      });
    });

    describe('validateName', () => {
      it('should validate correct names', () => {
        expect(validateName('John Doe')).toBe(true);
        expect(validateName('Jane')).toBe(true);
        expect(validateName('محمد علي')).toBe(true);
      });

      it('should reject invalid names', () => {
        expect(validateName('A')).toBe(false); // Too short
        expect(validateName('')).toBe(false); // Empty
        expect(validateName('   ')).toBe(false); // Only whitespace
        expect(validateName('A'.repeat(51))).toBe(false); // Too long
      });
    });

    describe('validatePassword', () => {
      it('should validate strong passwords', () => {
        const result = validatePassword('StrongP@ssw0rd');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should identify missing uppercase', () => {
        const result = validatePassword('strongp@ssw0rd');
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should identify missing special character', () => {
        const result = validatePassword('StrongPassw0rd');
        expect(result.errors).toContain('Password must contain at least one special character');
      });
    });

    describe('validateMoodRating', () => {
      it('should validate valid mood ratings', () => {
        for (let i = 1; i <= 10; i++) {
          expect(validateMoodRating(i)).toBe(true);
        }
      });

      it('should reject invalid mood ratings', () => {
        expect(validateMoodRating(0)).toBe(false);
        expect(validateMoodRating(11)).toBe(false);
        expect(validateMoodRating(5.5)).toBe(false);
        expect(validateMoodRating(-1)).toBe(false);
      });
    });

    describe('validateUrl', () => {
      it('should validate correct URLs', () => {
        expect(validateUrl('https://example.com')).toBe(true);
        expect(validateUrl('http://localhost:3000')).toBe(true);
        expect(validateUrl('ftp://files.example.com')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(validateUrl('invalid-url')).toBe(false);
        expect(validateUrl('http://')).toBe(false);
        expect(validateUrl('')).toBe(false);
      });
    });
  });

  describe('String Utilities', () => {
    describe('truncateText', () => {
      it('should truncate long text', () => {
        const longText = 'This is a very long text that should be truncated';
        const result = truncateText(longText, 20);
        expect(result).toBe('This is a very lo...');
      });

      it('should not truncate short text', () => {
        const shortText = 'Short text';
        const result = truncateText(shortText, 20);
        expect(result).toBe('Short text');
      });

      it('should handle exact length', () => {
        const text = 'Exactly twenty chars';
        const result = truncateText(text, 20);
        expect(result).toBe('Exactly twenty chars');
      });
    });

    describe('capitalizeFirst', () => {
      it('should capitalize first letter', () => {
        expect(capitalizeFirst('hello')).toBe('Hello');
        expect(capitalizeFirst('HELLO')).toBe('Hello');
        expect(capitalizeFirst('hELLO')).toBe('Hello');
      });

      it('should handle empty string', () => {
        expect(capitalizeFirst('')).toBe('');
      });
    });

    describe('capitalizeWords', () => {
      it('should capitalize all words', () => {
        expect(capitalizeWords('hello world')).toBe('Hello World');
        expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');
      });
    });

    describe('slugify', () => {
      it('should create valid slugs', () => {
        expect(slugify('Hello World!')).toBe('hello-world');
        expect(slugify('This is a Test!!!')).toBe('this-is-a-test');
        expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      });
    });

    describe('extractInitials', () => {
      it('should extract initials correctly', () => {
        expect(extractInitials('John Doe')).toBe('JD');
        expect(extractInitials('Jane Mary Smith')).toBe('JM');
        expect(extractInitials('SingleName')).toBe('SI');
      });
    });

    describe('generateRandomId', () => {
      it('should generate random IDs', () => {
        const id1 = generateRandomId();
        const id2 = generateRandomId();
        
        expect(id1).not.toBe(id2);
        expect(id1.length).toBeGreaterThan(0);
        expect(typeof id1).toBe('string');
      });
    });

    describe('generateUUID', () => {
      it('should generate valid UUIDs', () => {
        const uuid = generateUUID();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        expect(uuid).toMatch(uuidRegex);
      });
    });
  });

  describe('Number Utilities', () => {
    describe('roundToDecimal', () => {
      it('should round to specified decimals', () => {
        expect(roundToDecimal(3.14159, 2)).toBe(3.14);
        expect(roundToDecimal(3.14159, 0)).toBe(3);
        expect(roundToDecimal(3.14159, 4)).toBe(3.1416);
      });
    });

    describe('clamp', () => {
      it('should clamp values within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
      });
    });

    describe('average', () => {
      it('should calculate average correctly', () => {
        expect(average([1, 2, 3, 4, 5])).toBe(3);
        expect(average([10, 20, 30])).toBe(20);
        expect(average([])).toBe(0);
      });
    });

    describe('median', () => {
      it('should calculate median for odd length array', () => {
        expect(median([1, 3, 5])).toBe(3);
        expect(median([5, 1, 3])).toBe(3); // Should sort first
      });

      it('should calculate median for even length array', () => {
        expect(median([1, 2, 3, 4])).toBe(2.5);
      });

      it('should handle empty array', () => {
        expect(median([])).toBe(0);
      });
    });

    describe('standardDeviation', () => {
      it('should calculate standard deviation', () => {
        const result = standardDeviation([1, 2, 3, 4, 5]);
        expect(result).toBeCloseTo(1.58, 1);
      });

      it('should handle empty array', () => {
        expect(standardDeviation([])).toBe(0);
      });
    });
  });

  describe('Array Utilities', () => {
    describe('groupBy', () => {
      it('should group array items by key', () => {
        const items = [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'carrot' }
        ];
        
        const result = groupBy(items, 'type');
        
        expect(result.fruit).toHaveLength(2);
        expect(result.vegetable).toHaveLength(1);
      });
    });

    describe('sortBy', () => {
      it('should sort by key ascending', () => {
        const items = [{ age: 30 }, { age: 20 }, { age: 40 }];
        const result = sortBy(items, 'age', 'asc');
        
        expect(result[0].age).toBe(20);
        expect(result[2].age).toBe(40);
      });

      it('should sort by key descending', () => {
        const items = [{ age: 30 }, { age: 20 }, { age: 40 }];
        const result = sortBy(items, 'age', 'desc');
        
        expect(result[0].age).toBe(40);
        expect(result[2].age).toBe(20);
      });
    });

    describe('uniqueBy', () => {
      it('should remove duplicates by key', () => {
        const items = [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
          { id: 1, name: 'John Doe' }
        ];
        
        const result = uniqueBy(items, 'id');
        expect(result).toHaveLength(2);
      });
    });

    describe('chunk', () => {
      it('should split array into chunks', () => {
        const array = [1, 2, 3, 4, 5, 6, 7];
        const result = chunk(array, 3);
        
        expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
      });
    });

    describe('intersection', () => {
      it('should find common elements', () => {
        const result = intersection([1, 2, 3], [2, 3, 4]);
        expect(result).toEqual([2, 3]);
      });
    });

    describe('difference', () => {
      it('should find different elements', () => {
        const result = difference([1, 2, 3], [2, 3, 4]);
        expect(result).toEqual([1]);
      });
    });

    describe('shuffle', () => {
      it('should shuffle array randomly', () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = shuffle(original);
        
        expect(shuffled).toHaveLength(original.length);
        expect(shuffled).not.toBe(original); // Different reference
        // Note: Due to randomness, we can't test exact order
      });
    });
  });

  describe('Object Utilities', () => {
    describe('pick', () => {
      it('should pick specified keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = pick(obj, ['a', 'c']);
        
        expect(result).toEqual({ a: 1, c: 3 });
      });
    });

    describe('omit', () => {
      it('should omit specified keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = omit(obj, ['b']);
        
        expect(result).toEqual({ a: 1, c: 3 });
      });
    });

    describe('isEmpty', () => {
      it('should identify empty values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
        
        expect(isEmpty('text')).toBe(false);
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
      });
    });

    describe('deepClone', () => {
      it('should create deep copies', () => {
        const original = { a: 1, b: { c: 2 } };
        const cloned = deepClone(original);
        
        cloned.b.c = 3;
        expect(original.b.c).toBe(2); // Original unchanged
      });

      it('should handle arrays', () => {
        const original = [1, [2, 3]];
        const cloned = deepClone(original);
        
        cloned[1][0] = 4;
        expect(original[1][0]).toBe(2);
      });

      it('should handle dates', () => {
        const date = new Date('2024-01-01');
        const cloned = deepClone(date);
        
        expect(cloned).toEqual(date);
        expect(cloned).not.toBe(date);
      });
    });

    describe('isEqual', () => {
      it('should compare primitive values', () => {
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual('test', 'test')).toBe(true);
        expect(isEqual(1, 2)).toBe(false);
      });

      it('should compare objects deeply', () => {
        expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
        expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      });

      it('should compare arrays', () => {
        expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      });
    });
  });

  describe('Mental Health Utilities', () => {
    describe('getMoodLabel', () => {
      it('should return correct English labels', () => {
        expect(getMoodLabel(1, 'en')).toBe('Terrible');
        expect(getMoodLabel(5, 'en')).toBe('Okay');
        expect(getMoodLabel(10, 'en')).toBe('Great');
      });

      it('should return correct Arabic labels', () => {
        expect(getMoodLabel(1, 'ar')).toBe('فظيع');
        expect(getMoodLabel(5, 'ar')).toBe('عادي');
        expect(getMoodLabel(10, 'ar')).toBe('ممتاز');
      });
    });

    describe('getMoodColor', () => {
      it('should return correct colors for mood ratings', () => {
        expect(getMoodColor(1)).toBe('#FF3B30'); // red
        expect(getMoodColor(5)).toBe('#FFCC00'); // yellow
        expect(getMoodColor(10)).toBe('#30D158'); // bright green
      });
    });

    describe('calculateMoodTrend', () => {
      it('should calculate upward trend', () => {
        const ratings = [3, 4, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 10, 10]; // Recent higher than previous
        const result = calculateMoodTrend(ratings);
        
        expect(result.trend).toBe('up');
        expect(result.change).toBeGreaterThan(0);
      });

      it('should calculate downward trend', () => {
        const ratings = [7, 8, 9, 10, 10, 9, 8, 3, 4, 5, 4, 3, 2, 1]; // Recent lower than previous
        const result = calculateMoodTrend(ratings);
        
        expect(result.trend).toBe('down');
        expect(result.change).toBeLessThan(0);
      });

      it('should identify stable trend', () => {
        const ratings = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
        const result = calculateMoodTrend(ratings);
        
        expect(result.trend).toBe('stable');
      });

      it('should handle insufficient data', () => {
        const result = calculateMoodTrend([5]);
        expect(result.trend).toBe('stable');
        expect(result.change).toBe(0);
      });
    });

    describe('calculateStreak', () => {
      it('should calculate consecutive daily streak', () => {
        const _now = new Date('2024-01-15T12:00:00.000Z');
        const timestamps = [
          new Date('2024-01-15T10:00:00.000Z').getTime(), // Today
          new Date('2024-01-14T10:00:00.000Z').getTime(), // Yesterday
          new Date('2024-01-13T10:00:00.000Z').getTime(), // Day before
        ];
        
        const _result = calculateStreak(timestamps);
        expect(result).toBe(3);
      });

      it('should handle empty array', () => {
        const result = calculateStreak([]);
        expect(result).toBe(0);
      });

      it('should handle broken streak', () => {
        const timestamps = [
          new Date('2024-01-15T10:00:00.000Z').getTime(), // Today
          new Date('2024-01-13T10:00:00.000Z').getTime(), // Skipped yesterday
        ];
        
        const _result = calculateStreak(timestamps);
        expect(result).toBe(1); // Only today counts
      });
    });
  });

  describe('Async Utilities', () => {
    describe('delay', () => {
      it('should delay execution', async () => {
        const start = Date.now();
        await delay(100);
        const end = Date.now();
        
        expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
      });
    });

    describe('retry', () => {
      it('should retry failed operations', async () => {
        let attempts = 0;
        const fn = jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Failed');
          }
          return 'success';
        });
        
        const result = await retry(fn, 3, 10);
        expect(result).toBe('success');
        expect(attempts).toBe(3);
      });

      it('should throw after max retries', async () => {
        const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
        
        await expect(retry(fn, 2, 10)).rejects.toThrow('Always fails');
        expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });
    });

    describe('timeout', () => {
      it('should resolve if promise completes in time', async () => {
        const promise = delay(50).then(() => 'success');
        const result = await timeout(promise, 100);
        
        expect(result).toBe('success');
      });

      it('should reject if promise takes too long', async () => {
        const promise = delay(200).then(() => 'success');
        
        await expect(timeout(promise, 100)).rejects.toThrow('Operation timed out');
      });
    });
  });

  describe('Function Utilities', () => {
    describe('debounce', () => {
      jest.useFakeTimers();

      it('should debounce function calls', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100);
        
        debouncedFn();
        debouncedFn();
        debouncedFn();
        
        expect(fn).not.toHaveBeenCalled();
        
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
      });

      afterEach(() => {
        jest.clearAllTimers();
      });
    });

    describe('throttle', () => {
      jest.useFakeTimers();

      it('should throttle function calls', () => {
        const fn = jest.fn();
        const throttledFn = throttle(fn, 100);
        
        throttledFn();
        throttledFn();
        throttledFn();
        
        expect(fn).toHaveBeenCalledTimes(1);
        
        jest.advanceTimersByTime(100);
        throttledFn();
        expect(fn).toHaveBeenCalledTimes(2);
      });

      afterEach(() => {
        jest.clearAllTimers();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));
      
      const start = performance.now();
      
      // Test multiple operations
      groupBy(largeArray, 'id');
      sortBy(largeArray, 'value');
      uniqueBy(largeArray, 'id');
      chunk(largeArray, 100);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});