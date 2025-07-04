import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update last active time
      await ctx.db.patch(existing._id, {
        lastActiveAt: Date.now(),
        ...(args.email && { email: args.email }),
        ...(args.name && { name: args.name }),
      });
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      language: args.language || "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      onboardingComplete: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        dailyCheckInTime: "09:00",
        enableNotifications: true,
        voiceEnabled: false,
        theme: "auto",
      },
    });

    return userId;
  },
});

// Complete user onboarding
export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
    language: v.string(),
    preferences: v.object({
      dailyCheckInTime: v.optional(v.string()),
      enableNotifications: v.boolean(),
      voiceEnabled: v.boolean(),
      theme: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      language: args.language,
      onboardingComplete: true,
      preferences: args.preferences,
    });

    return user._id;
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Update user preferences
export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      dailyCheckInTime: v.optional(v.string()),
      enableNotifications: v.optional(v.boolean()),
      voiceEnabled: v.optional(v.boolean()),
      theme: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      preferences: {
        ...user.preferences,
        ...args.preferences,
      },
    });
  },
});

// Update user language
export const updateLanguage = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      language: args.language,
    });
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});