import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a mood entry
export const recordMood = mutation({
  args: {
    userId: v.id("users"),
    rating: v.number(),
    note: v.optional(v.string()),
    factors: v.optional(v.array(v.string())),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date(now).toISOString().split('T')[0]; // YYYY-MM-DD
    
    const moodId = await ctx.db.insert("moods", {
      userId: args.userId,
      rating: args.rating,
      note: args.note,
      factors: args.factors,
      emoji: args.emoji,
      timestamp: now,
    });

    // Update streak
    await updateStreak(ctx, args.userId, "mood", today);

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

// Get mood insights for AI context
export const getMoodInsights = query({
  args: { 
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 7; // Default to last 7 days
    const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
    
    // Get recent moods
    const recentMoods = await ctx.db
      .query("moods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .collect();
    
    if (recentMoods.length === 0) {
      return null;
    }
    
    // Calculate insights
    const latestMood = recentMoods[0];
    const averageRating = recentMoods.reduce((sum, mood) => sum + mood.rating, 0) / recentMoods.length;
    
    // Mood variance (how much mood fluctuates)
    const variance = recentMoods.reduce((sum, mood) => 
      sum + Math.pow(mood.rating - averageRating, 2), 0
    ) / recentMoods.length;
    const volatility = Math.sqrt(variance);
    
    // Identify patterns
    const moodsByHour = new Map<number, number[]>();
    const moodsByDay = new Map<string, number[]>();
    
    recentMoods.forEach(mood => {
      const date = new Date(mood.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (!moodsByHour.has(hour)) moodsByHour.set(hour, []);
      if (!moodsByDay.has(day)) moodsByDay.set(day, []);
      
      moodsByHour.get(hour)!.push(mood.rating);
      moodsByDay.get(day)!.push(mood.rating);
    });
    
    // Find best and worst times
    let bestHour = -1;
    let bestHourAvg = 0;
    let worstHour = -1;
    let worstHourAvg = 10;
    
    moodsByHour.forEach((ratings, hour) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avg > bestHourAvg) {
        bestHour = hour;
        bestHourAvg = avg;
      }
      if (avg < worstHourAvg) {
        worstHour = hour;
        worstHourAvg = avg;
      }
    });
    
    // Common factors affecting mood
    const allFactors = recentMoods.flatMap(mood => mood.factors || []);
    const factorFrequency = allFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Separate positive and negative mood factors
    const positiveMoodFactors: string[] = [];
    const negativeMoodFactors: string[] = [];
    
    Object.entries(factorFrequency).forEach(([factor, count]) => {
      const moodsWithFactor = recentMoods.filter(mood => 
        mood.factors?.includes(factor)
      );
      const avgWithFactor = moodsWithFactor.reduce((sum, mood) => 
        sum + mood.rating, 0
      ) / moodsWithFactor.length;
      
      if (avgWithFactor > averageRating + 0.5) {
        positiveMoodFactors.push(factor);
      } else if (avgWithFactor < averageRating - 0.5) {
        negativeMoodFactors.push(factor);
      }
    });
    
    return {
      currentMood: latestMood.rating,
      currentFactors: latestMood.factors || [],
      averageRating,
      volatility,
      totalEntries: recentMoods.length,
      bestTimeOfDay: bestHour >= 0 ? `${bestHour}:00` : null,
      worstTimeOfDay: worstHour >= 0 ? `${worstHour}:00` : null,
      positiveMoodFactors,
      negativeMoodFactors,
      recentNotes: recentMoods
        .filter(mood => mood.note)
        .slice(0, 3)
        .map(mood => mood.note),
    };
  },
});

// Get user's current streak
export const getUserStreak = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("mood"), v.literal("exercise"), v.literal("check-in")),
  },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .first();

    return streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: "",
      streakStartDate: "",
      totalEntries: 0,
    };
  },
});

// Helper function to update streak
async function updateStreak(
  ctx: any,
  userId: any,
  type: "mood" | "exercise" | "check-in",
  currentDate: string
) {
  const existingStreak = await ctx.db
    .query("streaks")
    .withIndex("by_user_type", (q: any) => 
      q.eq("userId", userId).eq("type", type)
    )
    .first();

  if (!existingStreak) {
    // Create new streak
    await ctx.db.insert("streaks", {
      userId,
      type,
      currentStreak: 1,
      longestStreak: 1,
      lastEntryDate: currentDate,
      streakStartDate: currentDate,
      totalEntries: 1,
    });
    return;
  }

  const lastDate = new Date(existingStreak.lastEntryDate);
  const current = new Date(currentDate);
  const daysDiff = Math.floor(
    (current.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newCurrentStreak = existingStreak.currentStreak;
  let newStreakStartDate = existingStreak.streakStartDate;

  if (daysDiff === 0) {
    // Same day, don't update streak
    await ctx.db.patch(existingStreak._id, {
      totalEntries: existingStreak.totalEntries + 1,
    });
    return;
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    newCurrentStreak = existingStreak.currentStreak + 1;
  } else {
    // Streak broken, restart
    newCurrentStreak = 1;
    newStreakStartDate = currentDate;
  }

  const newLongestStreak = Math.max(
    existingStreak.longestStreak,
    newCurrentStreak
  );

  await ctx.db.patch(existingStreak._id, {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastEntryDate: currentDate,
    streakStartDate: newStreakStartDate,
    totalEntries: existingStreak.totalEntries + 1,
  });
}