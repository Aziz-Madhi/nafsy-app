/**
 * Comprehensive Integration Tests for Exercise Functions
 * Tests all exercise-related Convex functions including recording, querying, statistics, and effectiveness tracking
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import schema from './schema';

describe('Exercises Integration Tests', () => {
  let t: ConvexTestingHelper;
  let testUserId: Id<"users">;
  let testConversationId: Id<"conversations">;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
    
    // Create a test user
    testUserId = await t.mutation(api.users.upsertUser, {
      clerkId: 'test-user-exercises',
      email: 'exercises@test.com',
      firstName: 'Exercise',
      lastName: 'Tester',
      preferredLanguage: 'en',
    });

    // Create a test conversation
    testConversationId = await t.mutation(api.conversations.createConversation, {
      userId: testUserId,
      title: 'Test Exercises Conversation',
    });
  });

  afterEach(async () => {
    await t.cleanup();
  });

  describe('recordExercise mutation', () => {
    it('should record a breathing exercise', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'breathing',
        duration: 300, // 5 minutes
        conversationId: testConversationId,
        data: {
          inputs: {
            breathingPattern: '4-7-8',
            duration: 300,
            guidedSteps: ['Inhale for 4', 'Hold for 7', 'Exhale for 8'],
          },
          outputs: {
            moodBefore: 4,
            moodAfter: 7,
            insights: ['Felt more relaxed', 'Breathing became natural'],
            completionNotes: 'Very effective for stress relief',
          },
          effectiveness: 8,
        },
      });

      expect(exerciseId).toBeDefined();

      // Verify the exercise was stored correctly
      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        limit: 1,
      });

      expect(exercises).toHaveLength(1);
      const exercise = exercises[0];
      expect(exercise.type).toBe('breathing');
      expect(exercise.duration).toBe(300);
      expect(exercise.userId).toBe(testUserId);
      expect(exercise.conversationId).toBe(testConversationId);
      expect(exercise.data.effectiveness).toBe(8);
    });

    it('should record a cognitive behavioral therapy exercise', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'cbt',
        duration: 900, // 15 minutes
        data: {
          inputs: {
            thoughtText: 'I will fail the presentation',
            emotions: ['anxiety', 'fear', 'worry'],
            evidenceFor: ['I have made mistakes before'],
            evidenceAgainst: ['I have succeeded many times', 'I am well prepared'],
            reframedThought: 'I am prepared and capable of giving a good presentation',
          },
          outputs: {
            moodBefore: 3,
            moodAfter: 6,
            insights: ['Recognized catastrophic thinking', 'Found evidence against the thought'],
            completionNotes: 'Helped me see the situation more rationally',
          },
          effectiveness: 7,
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'cbt',
      });

      expect(exercises).toHaveLength(1);
      const exercise = exercises[0];
      expect(exercise.type).toBe('cbt');
      expect(exercise.data.inputs?.thoughtText).toBe('I will fail the presentation');
      expect(exercise.data.inputs?.emotions).toContain('anxiety');
    });

    it('should record a gratitude exercise', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'gratitude',
        duration: 600, // 10 minutes
        data: {
          inputs: {
            gratitudeItems: [
              'My supportive family',
              'Having a safe home',
              'Good health',
              'Opportunities to learn',
            ],
            reflectionNotes: 'Focused on the positive aspects of my life',
          },
          outputs: {
            moodBefore: 5,
            moodAfter: 8,
            insights: ['Realized how much I have to be grateful for'],
            completionNotes: 'Started my day with positivity',
          },
          effectiveness: 9,
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'gratitude',
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].data.inputs?.gratitudeItems).toHaveLength(4);
    });

    it('should record a grounding exercise', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'grounding',
        duration: 420, // 7 minutes
        data: {
          inputs: {
            senses: {
              see: ['Blue sky', 'Green trees', 'My coffee mug'],
              hear: ['Birds chirping', 'Distant traffic'],
              feel: ['Soft chair', 'Cool air'],
              smell: ['Fresh coffee'],
              taste: ['Mint from toothpaste'],
            },
          },
          outputs: {
            moodBefore: 2,
            moodAfter: 6,
            insights: ['Brought me back to the present moment'],
            completionNotes: 'Very effective for anxiety',
          },
          effectiveness: 8,
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'grounding',
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].data.inputs?.senses?.see).toContain('Blue sky');
    });

    it('should record exercise without optional fields', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'meditation',
        data: {
          effectiveness: 6,
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'meditation',
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].duration).toBeUndefined();
      expect(exercises[0].conversationId).toBeUndefined();
    });
  });

  describe('getUserExercises query', () => {
    beforeEach(async () => {
      // Create sample exercise data
      const exerciseTypes = ['breathing', 'cbt', 'gratitude', 'grounding', 'meditation'];
      
      for (let i = 0; i < exerciseTypes.length; i++) {
        await t.mutation(api.exercises.recordExercise, {
          userId: testUserId,
          type: exerciseTypes[i],
          duration: (i + 1) * 300, // Varying durations
          data: {
            effectiveness: (i + 1) * 2, // 2, 4, 6, 8, 10
          },
        });
      }
    });

    it('should return exercises in descending order by completion time', async () => {
      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
      });

      expect(exercises.length).toBeGreaterThan(0);
      
      // Verify descending order
      for (let i = 1; i < exercises.length; i++) {
        expect(exercises[i].completedAt).toBeLessThanOrEqual(exercises[i - 1].completedAt);
      }
    });

    it('should filter exercises by type', async () => {
      const breathingExercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'breathing',
      });

      expect(breathingExercises).toHaveLength(1);
      expect(breathingExercises[0].type).toBe('breathing');

      const cbtExercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'cbt',
      });

      expect(cbtExercises).toHaveLength(1);
      expect(cbtExercises[0].type).toBe('cbt');
    });

    it('should respect limit parameter', async () => {
      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        limit: 3,
      });

      expect(exercises).toHaveLength(3);
    });

    it('should default to reasonable limit', async () => {
      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
      });

      expect(exercises.length).toBeLessThanOrEqual(50); // Default limit
    });

    it('should return empty array for user with no exercises', async () => {
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'empty-exercise-user',
        email: 'emptyexercise@test.com',
        firstName: 'Empty',
        lastName: 'User',
        preferredLanguage: 'en',
      });

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: emptyUserId,
      });

      expect(exercises).toEqual([]);
    });
  });

  describe('getExerciseStats query', () => {
    beforeEach(async () => {
      // Create varied exercise data for statistics
      const exerciseData = [
        { type: 'breathing', duration: 300, effectiveness: 8 },
        { type: 'breathing', duration: 420, effectiveness: 7 },
        { type: 'cbt', duration: 900, effectiveness: 9 },
        { type: 'cbt', duration: 780, effectiveness: 6 },
        { type: 'gratitude', duration: 600, effectiveness: 10 },
        { type: 'grounding', duration: 480, effectiveness: 8 },
        { type: 'meditation', duration: 1200, effectiveness: 7 },
      ];

      for (const exercise of exerciseData) {
        await t.mutation(api.exercises.recordExercise, {
          userId: testUserId,
          type: exercise.type,
          duration: exercise.duration,
          data: {
            effectiveness: exercise.effectiveness,
          },
        });
      }
    });

    it('should calculate correct exercise statistics', async () => {
      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
      });

      expect(stats.totalExercises).toBe(7);
      expect(stats.totalDuration).toBe(4680); // Sum of all durations
      expect(stats.averageEffectiveness).toBeCloseTo(7.86, 1); // Average effectiveness
      expect(stats.completionRate).toBeGreaterThan(0); // Exercises per day
    });

    it('should group exercises by type correctly', async () => {
      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
      });

      expect(stats.typeStats).toBeDefined();
      expect(stats.typeStats['breathing']).toBe(2);
      expect(stats.typeStats['cbt']).toBe(2);
      expect(stats.typeStats['gratitude']).toBe(1);
      expect(stats.typeStats['grounding']).toBe(1);
      expect(stats.typeStats['meditation']).toBe(1);
    });

    it('should filter by days parameter', async () => {
      const statsRecent = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
        days: 1, // Only today
      });

      const statsAll = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
        days: 30, // All recent
      });

      expect(statsRecent.totalExercises).toBeLessThanOrEqual(statsAll.totalExercises);
    });

    it('should handle empty exercise history', async () => {
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'stats-empty-exercise-user',
        email: 'statsemptyexercise@test.com',
        firstName: 'Stats',
        lastName: 'Empty',
        preferredLanguage: 'en',
      });

      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: emptyUserId,
      });

      expect(stats.totalExercises).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageEffectiveness).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.typeStats).toEqual({});
    });
  });

  describe('getMostEffectiveExercises query', () => {
    beforeEach(async () => {
      // Create exercises with varying effectiveness
      const exerciseData = [
        { type: 'breathing', effectiveness: 8, duration: 300 },
        { type: 'breathing', effectiveness: 9, duration: 360 },
        { type: 'breathing', effectiveness: 7, duration: 420 },
        { type: 'cbt', effectiveness: 10, duration: 900 },
        { type: 'cbt', effectiveness: 8, duration: 720 },
        { type: 'gratitude', effectiveness: 9, duration: 600 },
        { type: 'grounding', effectiveness: 6, duration: 480 },
        { type: 'meditation', effectiveness: 7, duration: 1200 },
        { type: 'meditation', effectiveness: 8, duration: 900 },
      ];

      for (const exercise of exerciseData) {
        await t.mutation(api.exercises.recordExercise, {
          userId: testUserId,
          type: exercise.type,
          duration: exercise.duration,
          data: {
            effectiveness: exercise.effectiveness,
          },
        });
      }
    });

    it('should return exercises sorted by average effectiveness', async () => {
      const effectiveExercises = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: testUserId,
      });

      expect(effectiveExercises.length).toBeGreaterThan(0);
      
      // Verify descending order by effectiveness
      for (let i = 1; i < effectiveExercises.length; i++) {
        expect(effectiveExercises[i].averageEffectiveness).toBeLessThanOrEqual(
          effectiveExercises[i - 1].averageEffectiveness
        );
      }

      // CBT should be most effective (average of 10 and 8 = 9)
      expect(effectiveExercises[0].type).toBe('cbt');
      expect(effectiveExercises[0].averageEffectiveness).toBe(9);
    });

    it('should include completion count and duration statistics', async () => {
      const effectiveExercises = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: testUserId,
      });

      const breathingStats = effectiveExercises.find(ex => ex.type === 'breathing');
      expect(breathingStats).toBeDefined();
      expect(breathingStats!.completionCount).toBe(3);
      expect(breathingStats!.totalDuration).toBe(1080); // 300 + 360 + 420
      expect(breathingStats!.averageDuration).toBe(360);
    });

    it('should respect limit parameter', async () => {
      const effectiveExercises = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: testUserId,
        limit: 3,
      });

      expect(effectiveExercises).toHaveLength(3);
    });

    it('should include last completed timestamp', async () => {
      const effectiveExercises = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: testUserId,
      });

      effectiveExercises.forEach(exercise => {
        expect(exercise.lastCompleted).toBeGreaterThan(0);
        expect(typeof exercise.lastCompleted).toBe('number');
      });
    });

    it('should return empty array for user with no exercises', async () => {
      const emptyUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'effective-empty-user',
        email: 'effectiveempty@test.com',
        firstName: 'Effective',
        lastName: 'Empty',
        preferredLanguage: 'en',
      });

      const effectiveExercises = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: emptyUserId,
      });

      expect(effectiveExercises).toEqual([]);
    });
  });

  describe('recordExerciseCompletion mutation', () => {
    it('should record exercise completion with backward compatibility', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExerciseCompletion, {
        userId: testUserId,
        type: 'breathing',
        duration: 300,
        conversationId: testConversationId,
        data: {
          inputs: {
            breathingPattern: '4-4-4-4',
            duration: 300,
          },
          outputs: {
            moodBefore: 4,
            moodAfter: 7,
            effectiveness: 8,
            completionNotes: 'Felt much calmer',
          },
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        limit: 1,
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].type).toBe('breathing');
      expect(exercises[0].data.effectiveness).toBe(8);
    });

    it('should extract effectiveness from outputs', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExerciseCompletion, {
        userId: testUserId,
        type: 'meditation',
        data: {
          outputs: {
            moodBefore: 3,
            moodAfter: 8,
            effectiveness: 9,
          },
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'meditation',
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].data.effectiveness).toBe(9);
    });
  });

  describe('recordExerciseByClerkId mutation', () => {
    it('should record exercise using Clerk ID', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExerciseByClerkId, {
        clerkId: 'test-user-exercises',
        type: 'gratitude',
        duration: 600,
        data: {
          inputs: {
            gratitudeItems: ['Health', 'Family', 'Home'],
            reflectionNotes: 'Feeling grateful today',
          },
          outputs: {
            moodBefore: 5,
            moodAfter: 8,
            insights: ['Noticed positive things around me'],
          },
          effectiveness: 9,
        },
      });

      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'gratitude',
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].data.inputs?.gratitudeItems).toContain('Health');
    });

    it('should throw error for non-existent Clerk ID', async () => {
      await expect(
        t.mutation(api.exercises.recordExerciseByClerkId, {
          clerkId: 'non-existent-user',
          type: 'breathing',
          data: {
            effectiveness: 5,
          },
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of exercises efficiently', async () => {
      const start = performance.now();
      
      // Create many exercise entries
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          t.mutation(api.exercises.recordExercise, {
            userId: testUserId,
            type: 'breathing',
            duration: 300,
            data: {
              effectiveness: (i % 10) + 1,
            },
          })
        );
      }
      
      await Promise.all(promises);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds

      // Test querying large dataset
      const queryStart = performance.now();
      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
      });
      const queryEnd = performance.now();

      expect(queryEnd - queryStart).toBeLessThan(1000); // Should query within 1 second
      expect(stats.totalExercises).toBe(50);
    });

    it('should handle concurrent exercise recordings', async () => {
      const concurrentPromises = [];
      
      for (let i = 0; i < 10; i++) {
        concurrentPromises.push(
          t.mutation(api.exercises.recordExercise, {
            userId: testUserId,
            type: 'meditation',
            duration: (i + 1) * 100,
            data: {
              effectiveness: i + 1,
            },
          })
        );
      }
      
      const results = await Promise.all(concurrentPromises);
      
      // All recordings should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // Verify all exercises were recorded
      const allExercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'meditation',
      });

      expect(allExercises.length).toBeGreaterThanOrEqual(10);
    });

    it('should handle exercises with complex nested data', async () => {
      const complexExercise = {
        userId: testUserId,
        type: 'cbt',
        duration: 1800, // 30 minutes
        data: {
          inputs: {
            thoughtText: 'Complex anxious thought with many facets',
            emotions: ['anxiety', 'fear', 'worry', 'stress'],
            evidenceFor: [
              'Past experience of difficulty',
              'Uncertainty about outcomes',
              'High stakes situation',
            ],
            evidenceAgainst: [
              'Previous successes in similar situations',
              'Strong preparation and skills',
              'Support system available',
              'Multiple backup plans',
            ],
            reframedThought: 'I have handled challenging situations before and have the skills and support to handle this one too',
          },
          outputs: {
            moodBefore: 2,
            moodAfter: 7,
            insights: [
              'Recognized catastrophic thinking pattern',
              'Found substantial evidence against the anxious thought',
              'Realized I have more resources than I initially thought',
            ],
            completionNotes: 'This exercise helped me gain perspective and feel more confident',
          },
          effectiveness: 9,
        },
      };

      const exerciseId = await t.mutation(api.exercises.recordExercise, complexExercise);
      expect(exerciseId).toBeDefined();

      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: testUserId,
        type: 'cbt',
        limit: 1,
      });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].data.inputs?.emotions).toHaveLength(4);
      expect(exercises[0].data.inputs?.evidenceAgainst).toHaveLength(4);
      expect(exercises[0].data.outputs?.insights).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const invalidUserId = 'invalid-user-id' as Id<"users">;

      // These should not throw errors but return empty/null results
      const exercises = await t.query(api.exercises.getUserExercises, {
        userId: invalidUserId,
      });

      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: invalidUserId,
      });

      const effective = await t.query(api.exercises.getMostEffectiveExercises, {
        userId: invalidUserId,
      });

      expect(exercises).toEqual([]);
      expect(stats.totalExercises).toBe(0);
      expect(effective).toEqual([]);
    });

    it('should handle exercises without effectiveness scores', async () => {
      const exerciseId = await t.mutation(api.exercises.recordExercise, {
        userId: testUserId,
        type: 'breathing',
        duration: 300,
        data: {
          // No effectiveness score
        },
      });

      expect(exerciseId).toBeDefined();

      const stats = await t.query(api.exercises.getExerciseStats, {
        userId: testUserId,
      });

      // Should not break calculations
      expect(stats.averageEffectiveness).toBe(0);
    });
  });
});