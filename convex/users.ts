import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatar: args.avatar,
        language: args.language ?? existingUser.language,
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      language: args.language || "en",
      onboardingCompleted: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.optional(v.id("users")),
    clerkId: v.optional(v.string()),
    language: v.string(),
    displayName: v.optional(v.string()),
    primaryGoal: v.optional(v.string()),
    initialMood: v.optional(v.string()),
    preferences: v.object({
      notifications: v.optional(v.boolean()),
      reminderTime: v.optional(v.string()),
      privacy: v.optional(v.string()),
      dailyCheckInTime: v.optional(v.string()),
      enableNotifications: v.optional(v.boolean()),
      theme: v.optional(v.string()),
      voiceEnabled: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    let uid = args.userId;
    if (!uid && args.clerkId) {
      uid = await getUserId(ctx, args.clerkId);
    }

    if (!uid) {
      throw new Error("User not found for onboarding");
    }

    // Update user with onboarding data
    await ctx.db.patch(uid, {
      language: args.language,
      displayName: args.displayName || undefined,
      preferences: args.preferences,
      onboardingCompleted: true,
      onboardingData: {
        primaryGoal: args.primaryGoal || undefined,
        initialMood: args.initialMood || undefined,
        completedAt: Date.now(),
      },
    });

    // Create an onboarding conversation to track the chat history
    const conversationId = await ctx.db.insert("conversations", {
      userId: uid,
      title: "Welcome to Nafsy",
      type: "onboarding",
      isActive: false, // Mark as inactive after completion
      lastMessageAt: Date.now(),
      messageCount: 0,
      metadata: {
        onboardingStep: "completed",
      },
      createdAt: Date.now(),
    });

    return { userId: uid, conversationId };
  },
});

// Migration: Consolidate onboarding fields (one-time operation)
export const migrateOnboardingFields = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;

    for (const user of users) {
      // If user has the old field but not the new one, migrate
      if ((user as any).onboardingComplete !== undefined && user.onboardingCompleted === undefined) {
        await ctx.db.patch(user._id, {
          onboardingCompleted: (user as any).onboardingComplete,
        });
        migratedCount++;
      }
    }

    return { migratedUsers: migratedCount };
  },
});

// Helper function to get user ID from Clerk ID
export async function getUserId(ctx: any, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
  
  return user?._id;
}