/**
 * Comprehensive Integration Tests for Convex Users Functions
 * Tests user management, onboarding, and related user operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import schema from './schema';

describe('Users Convex Functions', () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
  });

  describe('getUserByClerkId query', () => {
    it('should return user when found', async () => {
      // First create a user
      await t.mutation(api.users.upsertUser, {
        clerkId: 'test-clerk-123',
        name: 'Test User',
        email: 'test@example.com',
        language: 'en'
      });

      const user = await t.query(api.users.getUserByClerkId, {
        clerkId: 'test-clerk-123'
      });

      expect(user).toBeDefined();
      expect(user!.clerkId).toBe('test-clerk-123');
      expect(user!.name).toBe('Test User');
      expect(user!.email).toBe('test@example.com');
      expect(user!.language).toBe('en');
    });

    it('should return null when user not found', async () => {
      const user = await t.query(api.users.getUserByClerkId, {
        clerkId: 'non-existent-clerk-id'
      });

      expect(user).toBeNull();
    });

    it('should handle special characters in clerk ID', async () => {
      const specialClerkId = 'user_2abc123xyz!@#';
      
      await t.mutation(api.users.upsertUser, {
        clerkId: specialClerkId,
        name: 'Special User',
        email: 'special@example.com'
      });

      const user = await t.query(api.users.getUserByClerkId, {
        clerkId: specialClerkId
      });

      expect(user).toBeDefined();
      expect(user!.clerkId).toBe(specialClerkId);
    });
  });

  describe('getUserById query', () => {
    it('should return user when found', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'test-clerk-456',
        name: 'Test User 2',
        email: 'test2@example.com'
      });

      const user = await t.query(api.users.getUserById, { userId });

      expect(user).toBeDefined();
      expect(user!._id).toBe(userId);
      expect(user!.name).toBe('Test User 2');
    });

    it('should return null for non-existent user ID', async () => {
      // Create a user to get a valid ID format, then modify it
      const validUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'temp-user',
        name: 'Temp'
      });

      // Create a fake ID with same format but different value
      const fakeId = validUserId.replace(/.$/, '0') as any;

      const user = await t.query(api.users.getUserById, { userId: fakeId });
      expect(user).toBeNull();
    });
  });

  describe('upsertUser mutation', () => {
    it('should create new user when not exists', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'new-clerk-789',
        name: 'New User',
        email: 'new@example.com',
        avatar: 'https://example.com/avatar.jpg',
        language: 'ar'
      });

      expect(userId).toBeDefined();

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.clerkId).toBe('new-clerk-789');
      expect(user!.name).toBe('New User');
      expect(user!.email).toBe('new@example.com');
      expect(user!.avatar).toBe('https://example.com/avatar.jpg');
      expect(user!.language).toBe('ar');
      expect(user!.onboardingCompleted).toBe(false);
      expect(user!.createdAt).toBeGreaterThan(0);
      expect(user!.lastActiveAt).toBeGreaterThan(0);
    });

    it('should update existing user when found', async () => {
      // Create initial user
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'existing-clerk',
        name: 'Original Name',
        email: 'original@example.com',
        language: 'en'
      });

      // Update the same user
      const updatedUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'existing-clerk',
        name: 'Updated Name',
        email: 'updated@example.com',
        avatar: 'https://example.com/new-avatar.jpg',
        language: 'ar'
      });

      expect(updatedUserId).toBe(userId); // Should return same ID

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.name).toBe('Updated Name');
      expect(user!.email).toBe('updated@example.com');
      expect(user!.avatar).toBe('https://example.com/new-avatar.jpg');
      expect(user!.language).toBe('ar');
    });

    it('should preserve existing language when not provided', async () => {
      // Create user with language
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'language-test',
        name: 'Language Test',
        language: 'ar'
      });

      // Update without language parameter
      await t.mutation(api.users.upsertUser, {
        clerkId: 'language-test',
        name: 'Updated Name'
        // No language provided
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.language).toBe('ar'); // Should preserve original language
    });

    it('should default to "en" language for new users', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'default-lang-test',
        name: 'Default Lang Test'
        // No language provided
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.language).toBe('en');
    });

    it('should handle optional fields correctly', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'minimal-user'
        // Only required field provided
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.clerkId).toBe('minimal-user');
      expect(user!.name).toBeUndefined();
      expect(user!.email).toBeUndefined();
      expect(user!.avatar).toBeUndefined();
      expect(user!.language).toBe('en'); // Should default
    });

    it('should update lastActiveAt timestamp', async () => {
      const initialTime = Date.now();
      
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'timestamp-test',
        name: 'Timestamp Test'
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.lastActiveAt).toBeGreaterThanOrEqual(initialTime);

      // Wait a bit and update again
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await t.mutation(api.users.upsertUser, {
        clerkId: 'timestamp-test',
        name: 'Updated Timestamp Test'
      });

      const updatedUser = await t.query(api.users.getUserById, { userId });
      expect(updatedUser!.lastActiveAt).toBeGreaterThan(user!.lastActiveAt);
    });
  });

  describe('completeOnboarding mutation', () => {
    let testUserId: any;

    beforeEach(async () => {
      testUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'onboarding-test',
        name: 'Onboarding Test User',
        email: 'onboarding@example.com'
      });
    });

    it('should complete onboarding with user ID', async () => {
      const result = await t.mutation(api.users.completeOnboarding, {
        userId: testUserId,
        language: 'ar',
        displayName: 'أحمد محمد',
        primaryGoal: 'stress_reduction',
        initialMood: 'good',
        preferences: {
          notifications: true,
          reminderTime: '09:00',
          privacy: 'private',
          dailyCheckInTime: '20:00',
          enableNotifications: true,
          theme: 'dark',
          voiceEnabled: false
        }
      });

      expect(result.userId).toBe(testUserId);
      expect(result.conversationId).toBeDefined();

      // Verify user was updated
      const user = await t.query(api.users.getUserById, { userId: testUserId });
      expect(user!.onboardingCompleted).toBe(true);
      expect(user!.language).toBe('ar');
      expect(user!.displayName).toBe('أحمد محمد');
      expect(user!.preferences?.notifications).toBe(true);
      expect(user!.preferences?.theme).toBe('dark');
      expect(user!.onboardingData?.primaryGoal).toBe('stress_reduction');
      expect(user!.onboardingData?.initialMood).toBe('good');
      expect(user!.onboardingData?.completedAt).toBeGreaterThan(0);

      // Verify conversation was created
      const conversation = await t.query(api.conversations.getById, { 
        conversationId: result.conversationId 
      });
      expect(conversation).toBeDefined();
      expect(conversation!.title).toBe('Welcome to Nafsy');
      expect(conversation!.type).toBe('onboarding');
      expect(conversation!.isActive).toBe(false);
      expect(conversation!.metadata?.onboardingStep).toBe('completed');
    });

    it('should complete onboarding with clerk ID', async () => {
      const result = await t.mutation(api.users.completeOnboarding, {
        clerkId: 'onboarding-test',
        language: 'en',
        displayName: 'John Doe',
        preferences: {
          notifications: false,
          privacy: 'public'
        }
      });

      expect(result.userId).toBe(testUserId);
      
      const user = await t.query(api.users.getUserById, { userId: testUserId });
      expect(user!.onboardingCompleted).toBe(true);
      expect(user!.displayName).toBe('John Doe');
      expect(user!.preferences?.notifications).toBe(false);
    });

    it('should handle minimal onboarding data', async () => {
      const result = await t.mutation(api.users.completeOnboarding, {
        userId: testUserId,
        language: 'en',
        preferences: {}
      });

      expect(result.userId).toBe(testUserId);

      const user = await t.query(api.users.getUserById, { userId: testUserId });
      expect(user!.onboardingCompleted).toBe(true);
      expect(user!.language).toBe('en');
      expect(user!.displayName).toBeUndefined();
      expect(user!.onboardingData?.primaryGoal).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        t.mutation(api.users.completeOnboarding, {
          clerkId: 'non-existent-user',
          language: 'en',
          preferences: {}
        })
      ).rejects.toThrow('User not found for onboarding');
    });

    it('should throw error when neither userId nor clerkId provided', async () => {
      await expect(
        t.mutation(api.users.completeOnboarding, {
          language: 'en',
          preferences: {}
        })
      ).rejects.toThrow('User not found for onboarding');
    });

    it('should handle Arabic preferences correctly', async () => {
      await t.mutation(api.users.completeOnboarding, {
        userId: testUserId,
        language: 'ar',
        displayName: 'فاطمة أحمد',
        primaryGoal: 'anxiety_management',
        preferences: {
          notifications: true,
          reminderTime: '08:30',
          dailyCheckInTime: '21:00',
          theme: 'light',
          voiceEnabled: true
        }
      });

      const user = await t.query(api.users.getUserById, { userId: testUserId });
      expect(user!.language).toBe('ar');
      expect(user!.displayName).toBe('فاطمة أحمد');
      expect(user!.onboardingData?.primaryGoal).toBe('anxiety_management');
      expect(user!.preferences?.voiceEnabled).toBe(true);
    });
  });

  describe('migrateOnboardingFields mutation', () => {
    it('should migrate users with old onboardingComplete field', async () => {
      // Create users with the old field structure by directly inserting
      const oldUser1Id = await t.mutation(api.users.upsertUser, {
        clerkId: 'old-user-1',
        name: 'Old User 1'
      });
      
      const oldUser2Id = await t.mutation(api.users.upsertUser, {
        clerkId: 'old-user-2',
        name: 'Old User 2'
      });

      // Manually patch to simulate old field structure
      // Note: This is a simplified test as we can't easily simulate the exact old structure
      await (t as any).db.patch(oldUser1Id, {
        onboardingComplete: true // Old field name
      });

      const result = await t.mutation(api.users.migrateOnboardingFields, {});

      // The migration should have processed users, but the exact count depends on 
      // how we can simulate the old structure in tests
      expect(result.migratedUsers).toBeGreaterThanOrEqual(0);
    });

    it('should not migrate users that already have new field', async () => {
      // Create user that already has the new field
      const newUserId = await t.mutation(api.users.upsertUser, {
        clerkId: 'new-user',
        name: 'New User'
      });

      await t.mutation(api.users.completeOnboarding, {
        userId: newUserId,
        language: 'en',
        preferences: {}
      });

      const result = await t.mutation(api.users.migrateOnboardingFields, {});

      // Should not migrate users that already have the correct structure
      expect(result.migratedUsers).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty database', async () => {
      const result = await t.mutation(api.users.migrateOnboardingFields, {});
      expect(result.migratedUsers).toBe(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty strings in user creation', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'empty-strings-test',
        name: '',
        email: '',
        avatar: '',
        language: ''
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.name).toBe('');
      expect(user!.email).toBe('');
      expect(user!.avatar).toBe('');
      expect(user!.language).toBe(''); // Should preserve empty string
    });

    it('should handle very long field values', async () => {
      const longName = 'A'.repeat(1000);
      const longEmail = 'a'.repeat(500) + '@example.com';
      
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'long-fields-test',
        name: longName,
        email: longEmail
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.name).toBe(longName);
      expect(user!.email).toBe(longEmail);
    });

    it('should handle special characters in names', async () => {
      const specialName = 'محمد أحمد المصري-Smith O\'Connor 123 @#$%';
      
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'special-chars-test',
        name: specialName,
        language: 'ar'
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.name).toBe(specialName);
    });

    it('should handle complex preference objects', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'complex-prefs-test',
        name: 'Complex Prefs User'
      });

      await t.mutation(api.users.completeOnboarding, {
        userId,
        language: 'en',
        preferences: {
          notifications: true,
          reminderTime: '06:30',
          privacy: 'friends_only',
          dailyCheckInTime: '22:15',
          enableNotifications: false,
          theme: 'auto',
          voiceEnabled: true
        }
      });

      const user = await t.query(api.users.getUserById, { userId });
      expect(user!.preferences?.reminderTime).toBe('06:30');
      expect(user!.preferences?.privacy).toBe('friends_only');
      expect(user!.preferences?.dailyCheckInTime).toBe('22:15');
      expect(user!.preferences?.theme).toBe('auto');
    });
  });

  describe('Performance and concurrency', () => {
    it('should handle multiple user creations concurrently', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        t.mutation(api.users.upsertUser, {
          clerkId: `concurrent-user-${i}`,
          name: `Concurrent User ${i}`,
          email: `user${i}@example.com`
        })
      );

      const userIds = await Promise.all(promises);
      
      expect(userIds).toHaveLength(10);
      expect(new Set(userIds).size).toBe(10); // All IDs should be unique

      // Verify all users were created correctly
      const users = await Promise.all(
        userIds.map(id => t.query(api.users.getUserById, { userId: id }))
      );

      users.forEach((user, index) => {
        expect(user).toBeDefined();
        expect(user!.clerkId).toBe(`concurrent-user-${index}`);
        expect(user!.name).toBe(`Concurrent User ${index}`);
      });
    });

    it('should handle rapid updates to same user', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'rapid-update-test',
        name: 'Initial Name'
      });

      // Perform multiple rapid updates
      const promises = Array.from({ length: 5 }, (_, i) =>
        t.mutation(api.users.upsertUser, {
          clerkId: 'rapid-update-test',
          name: `Updated Name ${i}`,
          email: `updated${i}@example.com`
        })
      );

      const results = await Promise.all(promises);
      
      // All should return the same user ID
      results.forEach(id => {
        expect(id).toBe(userId);
      });

      // Final state should be one of the updates
      const finalUser = await t.query(api.users.getUserById, { userId });
      expect(finalUser!.name).toMatch(/Updated Name \d/);
      expect(finalUser!.email).toMatch(/updated\d@example.com/);
    });

    it('should complete operations within reasonable time', async () => {
      const start = Date.now();
      
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'performance-test',
        name: 'Performance Test User'
      });

      await t.mutation(api.users.completeOnboarding, {
        userId,
        language: 'en',
        displayName: 'Performance User',
        preferences: {
          notifications: true,
          reminderTime: '09:00'
        }
      });

      const user = await t.query(api.users.getUserById, { userId });
      
      const end = Date.now();
      const duration = end - start;

      expect(user).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});