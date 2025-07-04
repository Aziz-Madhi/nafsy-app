import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a mood entry
export const recordMood = mutation({
  args: {
    userId: v.id("users"),
    rating: v.number(),
    emotions: v.array(v.string()),
    note: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
    activities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Validate rating is between 1-10
    if (args.rating < 1 || args.rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

    const moodId = await ctx.db.insert("moods", {
      userId: args.userId,
      rating: args.rating,
      emotions: args.emotions,
      note: args.note,
      timestamp: Date.now(),
      triggers: args.triggers,
      activities: args.activities,
    });

    return moodId;
  },
});

// Get user's mood history
export const getUserMoods = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user_and_time", (q) => 
        q.eq("userId", args.userId).gte("timestamp", startTime)
      )
      .order("desc")
      .collect();

    return moods;
  },
});

// Get today's mood
export const getTodaysMood = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startTime = todayStart.getTime();

    const mood = await ctx.db
      .query("moods")
      .withIndex("by_user_and_time", (q) => 
        q.eq("userId", args.userId).gte("timestamp", startTime)
      )
      .first();

    return mood;
  },
});

// Get mood statistics
export const getMoodStats = query({
  args: {
    userId: v.id("users"),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now() - (args.days * 24 * 60 * 60 * 1000);

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user_and_time", (q) => 
        q.eq("userId", args.userId).gte("timestamp", startTime)
      )
      .collect();

    if (moods.length === 0) {
      return {
        averageRating: 0,
        totalEntries: 0,
        mostCommonEmotions: [],
        trend: "stable",
      };
    }

    // Calculate average rating
    const totalRating = moods.reduce((sum, mood) => sum + mood.rating, 0);
    const averageRating = totalRating / moods.length;

    // Find most common emotions
    const emotionCounts: Record<string, number> = {};
    moods.forEach(mood => {
      mood.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const mostCommonEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => emotion);

    // Calculate trend (simple linear regression)
    let trend = "stable";
    if (moods.length >= 3) {
      const firstThird = moods.slice(0, Math.floor(moods.length / 3));
      const lastThird = moods.slice(-Math.floor(moods.length / 3));
      
      const firstAvg = firstThird.reduce((sum, m) => sum + m.rating, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, m) => sum + m.rating, 0) / lastThird.length;
      
      if (lastAvg - firstAvg > 0.5) trend = "improving";
      else if (firstAvg - lastAvg > 0.5) trend = "declining";
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalEntries: moods.length,
      mostCommonEmotions,
      trend,
    };
  },
});

// Get mood insights for AI
export const getMoodInsights = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const moods = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(30);

    // Group by rating ranges
    const moodGroups = {
      low: moods.filter(m => m.rating <= 3),
      medium: moods.filter(m => m.rating > 3 && m.rating <= 7),
      high: moods.filter(m => m.rating > 7),
    };

    // Find common triggers for low moods
    const lowMoodTriggers: Record<string, number> = {};
    moodGroups.low.forEach(mood => {
      mood.triggers?.forEach(trigger => {
        lowMoodTriggers[trigger] = (lowMoodTriggers[trigger] || 0) + 1;
      });
    });

    // Find activities associated with high moods
    const highMoodActivities: Record<string, number> = {};
    moodGroups.high.forEach(mood => {
      mood.activities?.forEach(activity => {
        highMoodActivities[activity] = (highMoodActivities[activity] || 0) + 1;
      });
    });

    return {
      recentMoods: moods.slice(0, 7),
      commonLowMoodTriggers: Object.entries(lowMoodTriggers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([trigger]) => trigger),
      helpfulActivities: Object.entries(highMoodActivities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([activity]) => activity),
    };
  },
});