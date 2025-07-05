import { v } from "convex/values";
import { query } from "./_generated/server";

// Optimized query to get user dashboard data in one call
export const getUserDashboard = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user info
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get active conversation
    const activeConversation = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    // Get latest mood
    const latestMood = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    // Get recent exercises (last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentExercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("completedAt"), weekAgo))
      .take(5);

    // Get conversation count
    const conversationCount = (await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()).length;

    return {
      user,
      activeConversation,
      latestMood,
      recentExercises,
      conversationCount,
    };
  },
});

// Optimized query for chat screen with message count
export const getChatScreenData = query({
  args: { 
    userId: v.id("users"),
    messageLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get active conversation
    const activeConversation = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!activeConversation) {
      return {
        conversation: null,
        messages: [],
        messageCount: 0,
      };
    }

    // Get recent messages
    const limit = args.messageLimit || 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", activeConversation._id))
      .order("desc")
      .take(limit);

    return {
      conversation: activeConversation,
      messages: messages.reverse(),
      messageCount: activeConversation.messageCount,
    };
  },
});

// Optimized analytics query
export const getUserAnalytics = query({
  args: { 
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

    // Get moods
    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();

    // Get exercises
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    // Get conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("createdAt"), cutoffTime))
      .collect();

    // Calculate analytics
    const moodAverage = moods.length > 0
      ? moods.reduce((sum, mood) => sum + mood.rating, 0) / moods.length
      : 0;

    const exerciseTotal = exercises.length;
    const exerciseDuration = exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);

    const conversationTotal = conversations.length;
    const messageTotal = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);

    return {
      period: daysAgo,
      mood: {
        average: moodAverage,
        entries: moods.length,
        data: moods.map(m => ({ rating: m.rating, timestamp: m.timestamp })),
      },
      exercises: {
        total: exerciseTotal,
        duration: exerciseDuration,
        data: exercises.map(e => ({ type: e.type, duration: e.duration, timestamp: e.completedAt })),
      },
      conversations: {
        total: conversationTotal,
        messages: messageTotal,
      },
    };
  },
});