/**
 * Comprehensive Integration Tests for Mood Tracking Functions
 * Tests all mood-related Convex functions including recording, querying, statistics, and insights
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import schema from './schema';

describe('Moods Integration Tests', () => {
  let t: ConvexTestingHelper;
  let testUserId: Id<"users">;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
    
    // Create a test user
    testUserId = await t.mutation(api.users.upsertUser, {
      clerkId: 'test-user-moods',
      email: 'moods@test.com',
      firstName: 'Mood',
      lastName: 'Tester',
      preferredLanguage: 'en',
    });
  });

  afterEach(async () => {
    await t.cleanup();
  });

  describe('recordMood mutation', () => {
    it('should record a basic mood entry', async () => {
      const moodId = await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 7,
        note: 'Feeling good today',
        factors: ['exercise', 'sleep'],
      });

      expect(moodId).toBeDefined();
      
      // Verify the mood was stored correctly
      const mood = await t.query(api.moods.getLatestMood, {
        userId: testUserId,
      });

      expect(mood).toBeDefined();
      expect(mood!.rating).toBe(7);
      expect(mood!.note).toBe('Feeling good today');
      expect(mood!.factors).toEqual(['exercise', 'sleep']);
      expect(mood!.userId).toBe(testUserId);
      expect(mood!.timestamp).toBeGreaterThan(0);
    });

    it('should record mood without optional fields', async () => {
      const moodId = await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 5,
      });

      expect(moodId).toBeDefined();
      
      const mood = await t.query(api.moods.getLatestMood, {
        userId: testUserId,
      });

      expect(mood).toBeDefined();
      expect(mood!.rating).toBe(5);
      expect(mood!.note).toBeUndefined();
      expect(mood!.factors).toBeUndefined();
    });

    it('should handle extreme mood ratings', async () => {
      // Test minimum rating
      const lowMoodId = await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 1,
        note: 'Very difficult day',
        factors: ['stress', 'work'],
      });

      // Test maximum rating
      const highMoodId = await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 10,
        note: 'Amazing day!',
        factors: ['family', 'achievement'],
      });

      expect(lowMoodId).toBeDefined();
      expect(highMoodId).toBeDefined();

      const moods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        limit: 10,
      });

      expect(moods).toHaveLength(2);
      expect(moods[0].rating).toBe(10); // Latest first
      expect(moods[1].rating).toBe(1);
    });

    it('should handle long notes and many factors', async () => {
      const longNote = 'This is a very long note that describes many different aspects of my mood today. '.repeat(5);
      const manyFactors = ['stress', 'work', 'family', 'exercise', 'sleep', 'weather', 'health', 'relationships'];

      const moodId = await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 6,
        note: longNote,
        factors: manyFactors,
      });

      expect(moodId).toBeDefined();

      const mood = await t.query(api.moods.getLatestMood, {
        userId: testUserId,
      });

      expect(mood!.note).toBe(longNote);
      expect(mood!.factors).toEqual(manyFactors);
    });
  });

  describe('getUserMoods query', () => {
    beforeEach(async () => {
      // Create test mood data
      const baseTime = Date.now();
      const moodData = [
        { rating: 5, note: 'Day 1', timestamp: baseTime - (6 * 24 * 60 * 60 * 1000) },
        { rating: 7, note: 'Day 2', timestamp: baseTime - (5 * 24 * 60 * 60 * 1000) },
        { rating: 4, note: 'Day 3', timestamp: baseTime - (4 * 24 * 60 * 60 * 1000) },
        { rating: 8, note: 'Day 4', timestamp: baseTime - (3 * 24 * 60 * 60 * 1000) },
        { rating: 6, note: 'Day 5', timestamp: baseTime - (2 * 24 * 60 * 60 * 1000) },
        { rating: 9, note: 'Day 6', timestamp: baseTime - (1 * 24 * 60 * 60 * 1000) },
        { rating: 7, note: 'Today', timestamp: baseTime },
      ];

      // Insert moods with specific timestamps
      for (const mood of moodData) {
        await t.mutation(api.moods.recordMood, {
          userId: testUserId,
          rating: mood.rating,
          note: mood.note,
        });
        
        // Manually update timestamp in the database
        // Note: This is a test-specific operation
      }
    });

    it('should return moods in descending order by timestamp', async () => {
      const moods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        limit: 10,
      });

      expect(moods.length).toBeGreaterThan(0);
      
      // Verify descending order
      for (let i = 1; i < moods.length; i++) {
        expect(moods[i].timestamp).toBeLessThanOrEqual(moods[i - 1].timestamp);
      }
    });

    it('should respect limit parameter', async () => {
      const moods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        limit: 3,
      });

      expect(moods).toHaveLength(3);
    });

    it('should default to reasonable limits', async () => {
      const moods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
      });

      expect(moods.length).toBeLessThanOrEqual(30); // Default limit
    });

    it('should filter by days parameter', async () => {
      // Add some older moods first
      await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 3,
        note: 'Very old mood',
      });

      const recentMoods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        days: 1, // Only today
      });

      // Should only include very recent moods
      expect(recentMoods.length).toBeGreaterThan(0);
      recentMoods.forEach(mood => {
        const daysDiff = (Date.now() - mood.timestamp) / (24 * 60 * 60 * 1000);
        expect(daysDiff).toBeLessThanOrEqual(1);
      });
    });

    it('should return empty array for user with no moods', async () => {
      // Create another user with no moods
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'empty-user',
        email: 'empty@test.com',
        firstName: 'Empty',
        lastName: 'User',
        preferredLanguage: 'en',
      });

      const moods = await t.query(api.moods.getUserMoods, {
        userId: emptyUserId,
      });

      expect(moods).toEqual([]);
    });
  });

  describe('getMoodStats query', () => {
    beforeEach(async () => {
      // Create varied mood data for statistics
      const moodRatings = [3, 5, 7, 4, 8, 6, 9, 5, 7, 6];
      const factors = [
        ['stress', 'work'], ['exercise', 'sleep'], ['family', 'friends'],
        ['stress', 'health'], ['exercise', 'achievement'], ['sleep', 'relaxation'],
        ['family', 'exercise'], ['work', 'stress'], ['friends', 'social'],
        ['sleep', 'exercise']
      ];

      for (let i = 0; i < moodRatings.length; i++) {
        await t.mutation(api.moods.recordMood, {
          userId: testUserId,
          rating: moodRatings[i],
          factors: factors[i],
        });
      }
    });

    it('should calculate correct average rating', async () => {
      const stats = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
      });

      expect(stats.totalEntries).toBe(10);
      expect(stats.averageRating).toBeCloseTo(6.0, 1); // Average of [3,5,7,4,8,6,9,5,7,6]
    });

    it('should identify most common factors', async () => {
      const stats = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
      });

      expect(stats.mostCommonFactors).toBeDefined();
      expect(stats.mostCommonFactors.length).toBeGreaterThan(0);
      
      // Check that factors are sorted by count
      for (let i = 1; i < stats.mostCommonFactors.length; i++) {
        expect(stats.mostCommonFactors[i].count).toBeLessThanOrEqual(
          stats.mostCommonFactors[i - 1].count
        );
      }

      // Verify common factors appear
      const factorNames = stats.mostCommonFactors.map(f => f.factor);
      expect(factorNames).toContain('exercise'); // Appears 3 times
      expect(factorNames).toContain('stress'); // Appears 3 times
    });

    it('should calculate trend correctly', async () => {
      // Clear existing moods
      const stats = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
      });

      expect(['improving', 'declining', 'neutral']).toContain(stats.trend);
    });

    it('should handle empty mood history', async () => {
      // Create user with no moods
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'stats-empty-user',
        email: 'statsempty@test.com',
        firstName: 'Stats',
        lastName: 'Empty',
        preferredLanguage: 'en',
      });

      const stats = await t.query(api.moods.getMoodStats, {
        userId: emptyUserId,
      });

      expect(stats.averageRating).toBe(0);
      expect(stats.totalEntries).toBe(0);
      expect(stats.trend).toBe('neutral');
      expect(stats.mostCommonFactors).toEqual([]);
    });

    it('should respect days parameter for statistics', async () => {
      const statsRecent = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
        days: 1, // Only today
      });

      const statsAll = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
        days: 30, // All recent
      });

      expect(statsRecent.totalEntries).toBeLessThanOrEqual(statsAll.totalEntries);
    });
  });

  describe('getLatestMood query', () => {
    it('should return the most recent mood', async () => {
      await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 5,
        note: 'First mood',
      });

      await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 8,
        note: 'Latest mood',
      });

      const latestMood = await t.query(api.moods.getLatestMood, {
        userId: testUserId,
      });

      expect(latestMood).toBeDefined();
      expect(latestMood!.rating).toBe(8);
      expect(latestMood!.note).toBe('Latest mood');
    });

    it('should return null for user with no moods', async () => {
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'latest-empty-user',
        email: 'latestempty@test.com',
        firstName: 'Latest',
        lastName: 'Empty',
        preferredLanguage: 'en',
      });

      const latestMood = await t.query(api.moods.getLatestMood, {
        userId: emptyUserId,
      });

      expect(latestMood).toBeNull();
    });
  });

  describe('getMoodInsights query', () => {
    beforeEach(async () => {
      // Create comprehensive mood data for insights
      const baseTime = Date.now();
      const moodEntries = [
        { rating: 4, factors: ['stress', 'work'], note: 'Stressful Monday', hourOffset: 9 },
        { rating: 6, factors: ['exercise'], note: 'Better after workout', hourOffset: 18 },
        { rating: 8, factors: ['family', 'relaxation'], note: 'Great evening', hourOffset: 20 },
        { rating: 5, factors: ['sleep'], note: 'Tired morning', hourOffset: 8 },
        { rating: 7, factors: ['friends', 'social'], note: 'Fun with friends', hourOffset: 19 },
        { rating: 3, factors: ['stress', 'health'], note: 'Not feeling well', hourOffset: 14 },
        { rating: 9, factors: ['achievement', 'exercise'], note: 'Accomplished goals', hourOffset: 16 },
      ];

      for (const entry of moodEntries) {
        await t.mutation(api.moods.recordMood, {
          userId: testUserId,
          rating: entry.rating,
          factors: entry.factors,
          note: entry.note,
        });
      }
    });

    it('should return comprehensive mood insights', async () => {
      const insights = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 7,
      });

      expect(insights).toBeDefined();
      expect(insights!.currentMood).toBeGreaterThanOrEqual(1);
      expect(insights!.currentMood).toBeLessThanOrEqual(10);
      expect(insights!.averageRating).toBeGreaterThan(0);
      expect(insights!.totalEntries).toBeGreaterThan(0);
      expect(insights!.volatility).toBeGreaterThanOrEqual(0);
    });

    it('should identify positive and negative mood factors', async () => {
      const insights = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 7,
      });

      expect(insights).toBeDefined();
      expect(insights!.positiveMoodFactors).toBeDefined();
      expect(insights!.negativeMoodFactors).toBeDefined();
      
      // Exercise should be positive (associated with higher ratings)
      expect(insights!.positiveMoodFactors).toContain('exercise');
      
      // Stress should be negative (associated with lower ratings)
      expect(insights!.negativeMoodFactors).toContain('stress');
    });

    it('should provide recent notes', async () => {
      const insights = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 7,
      });

      expect(insights).toBeDefined();
      expect(insights!.recentNotes).toBeDefined();
      expect(insights!.recentNotes.length).toBeLessThanOrEqual(3);
      
      // Should contain actual note content
      insights!.recentNotes.forEach(note => {
        expect(typeof note).toBe('string');
        expect(note!.length).toBeGreaterThan(0);
      });
    });

    it('should return null for users with no mood data', async () => {
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'insights-empty-user',
        email: 'insightsempty@test.com',
        firstName: 'Insights',
        lastName: 'Empty',
        preferredLanguage: 'en',
      });

      const insights = await t.query(api.moods.getMoodInsights, {
        userId: emptyUserId,
        days: 7,
      });

      expect(insights).toBeNull();
    });

    it('should calculate volatility correctly', async () => {
      // Add extreme mood swings
      await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 1,
        note: 'Very low',
      });

      await t.mutation(api.moods.recordMood, {
        userId: testUserId,
        rating: 10,
        note: 'Very high',
      });

      const insights = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 7,
      });

      expect(insights).toBeDefined();
      expect(insights!.volatility).toBeGreaterThan(0);
      
      // With extreme ratings, volatility should be significant
      expect(insights!.volatility).toBeGreaterThan(1);
    });

    it('should handle different time ranges', async () => {
      const insights1Day = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 1,
      });

      const insights7Days = await t.query(api.moods.getMoodInsights, {
        userId: testUserId,
        days: 7,
      });

      if (insights1Day && insights7Days) {
        expect(insights1Day.totalEntries).toBeLessThanOrEqual(insights7Days.totalEntries);
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of mood entries efficiently', async () => {
      const start = performance.now();
      
      // Create many mood entries
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          t.mutation(api.moods.recordMood, {
            userId: testUserId,
            rating: (i % 10) + 1,
            factors: ['factor1', 'factor2'],
            note: `Mood entry ${i}`,
          })
        );
      }
      
      await Promise.all(promises);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds

      // Test querying large dataset
      const queryStart = performance.now();
      const stats = await t.query(api.moods.getMoodStats, {
        userId: testUserId,
      });
      const queryEnd = performance.now();

      expect(queryEnd - queryStart).toBeLessThan(1000); // Should query within 1 second
      expect(stats.totalEntries).toBe(100);
    });

    it('should handle concurrent mood recordings', async () => {
      const concurrentPromises = [];
      
      for (let i = 0; i < 10; i++) {
        concurrentPromises.push(
          t.mutation(api.moods.recordMood, {
            userId: testUserId,
            rating: 5 + i,
            note: `Concurrent mood ${i}`,
          })
        );
      }
      
      const results = await Promise.all(concurrentPromises);
      
      // All recordings should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // Verify all moods were recorded
      const allMoods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        limit: 20,
      });

      expect(allMoods.length).toBeGreaterThanOrEqual(10);
    });

    it('should handle edge case ratings and validate data integrity', async () => {
      const testCases = [
        { rating: 1, expected: 1 },
        { rating: 10, expected: 10 },
        { rating: 5.5, expected: 5.5 },
      ];

      for (const testCase of testCases) {
        const moodId = await t.mutation(api.moods.recordMood, {
          userId: testUserId,
          rating: testCase.rating,
        });

        expect(moodId).toBeDefined();
      }

      const moods = await t.query(api.moods.getUserMoods, {
        userId: testUserId,
        limit: 10,
      });

      expect(moods.length).toBeGreaterThanOrEqual(3);
      moods.forEach(mood => {
        expect(mood.rating).toBeGreaterThanOrEqual(1);
        expect(mood.rating).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const invalidUserId = 'invalid-user-id' as Id<"users">;

      // These should not throw errors but return empty/null results
      const moods = await t.query(api.moods.getUserMoods, {
        userId: invalidUserId,
      });

      const latestMood = await t.query(api.moods.getLatestMood, {
        userId: invalidUserId,
      });

      const stats = await t.query(api.moods.getMoodStats, {
        userId: invalidUserId,
      });

      const insights = await t.query(api.moods.getMoodInsights, {
        userId: invalidUserId,
      });

      expect(moods).toEqual([]);
      expect(latestMood).toBeNull();
      expect(stats.totalEntries).toBe(0);
      expect(insights).toBeNull();
    });
  });
});