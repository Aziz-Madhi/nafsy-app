import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a mood entry
export const recordMood = mutation({
  args: {
    userId: v.id("users"),
    rating: v.number(),
    note: v.optional(v.string()),
    factors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const moodId = await ctx.db.insert("moods", {
      userId: args.userId,
      rating: args.rating,
      note: args.note,
      factors: args.factors,
      timestamp: Date.now(),
    });

    return moodId;
  },
});

// Get user's mood history
export const getUserMoods = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const daysAgo = args.days || 30;
    const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .take(limit);

    return moods;
  },
});

// Get mood statistics
export const getMoodStats = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();

    if (moods.length === 0) {
      return {
        averageRating: 0,
        totalEntries: 0,
        trend: "neutral",
        mostCommonFactors: [],
      };
    }

    const averageRating = moods.reduce((sum, mood) => sum + mood.rating, 0) / moods.length;
    
    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(moods.length / 2);
    const firstHalf = moods.slice(0, midpoint);
    const secondHalf = moods.slice(midpoint);
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, mood) => sum + mood.rating, 0) / firstHalf.length 
      : 0;
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, mood) => sum + mood.rating, 0) / secondHalf.length 
      : 0;
    
    let trend = "neutral";
    if (secondHalfAvg > firstHalfAvg + 0.5) trend = "improving";
    else if (secondHalfAvg < firstHalfAvg - 0.5) trend = "declining";
    
    // Get most common factors
    const factorCounts: { [key: string]: number } = {};
    moods.forEach(mood => {
      mood.factors?.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      });
    });
    
    const mostCommonFactors = Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([factor, count]) => ({ factor, count }));

    return {
      averageRating,
      totalEntries: moods.length,
      trend,
      mostCommonFactors,
    };
  },
});

// Get latest mood
export const getLatestMood = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});