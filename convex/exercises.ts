import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./users";

// Record exercise completion
export const recordExercise = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    duration: v.optional(v.number()),
    conversationId: v.optional(v.id("conversations")),
    data: v.object({
      inputs: v.optional(v.union(
        v.object({
          breathingPattern: v.optional(v.string()),
          duration: v.optional(v.number()),
          guidedSteps: v.optional(v.array(v.string())),
        }),
        v.object({
          thoughtText: v.optional(v.string()),
          emotions: v.optional(v.array(v.string())),
          evidenceFor: v.optional(v.array(v.string())),
          evidenceAgainst: v.optional(v.array(v.string())),
          reframedThought: v.optional(v.string()),
        }),
        v.object({
          gratitudeItems: v.optional(v.array(v.string())),
          reflectionNotes: v.optional(v.string()),
        }),
        v.object({
          senses: v.optional(v.object({
            see: v.optional(v.array(v.string())),
            hear: v.optional(v.array(v.string())),
            feel: v.optional(v.array(v.string())),
            smell: v.optional(v.array(v.string())),
            taste: v.optional(v.array(v.string())),
          })),
        })
      )),
      outputs: v.optional(v.object({
        moodBefore: v.optional(v.number()),
        moodAfter: v.optional(v.number()),
        insights: v.optional(v.array(v.string())),
        completionNotes: v.optional(v.string()),
      })),
      effectiveness: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const exerciseId = await ctx.db.insert("exercises", {
      userId: args.userId,
      type: args.type,
      completedAt: Date.now(),
      duration: args.duration,
      conversationId: args.conversationId,
      data: args.data,
    });

    return exerciseId;
  },
});

// Get user's exercise history
export const getUserExercises = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.type) {
      query = ctx.db
        .query("exercises")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .filter((q) => q.eq(q.field("userId"), args.userId));
    }

    const exercises = await query
      .order("desc")
      .take(args.limit || 50);

    return exercises;
  },
});

// Get exercise statistics
export const getExerciseStats = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    const totalExercises = exercises.length;
    const totalDuration = exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    
    // Group by type
    const typeStats: { [key: string]: number } = {};
    exercises.forEach(ex => {
      typeStats[ex.type] = (typeStats[ex.type] || 0) + 1;
    });

    // Calculate average effectiveness
    const effectivenessScores = exercises
      .map(ex => ex.data.effectiveness)
      .filter(score => score !== undefined) as number[];
    
    const averageEffectiveness = effectivenessScores.length > 0
      ? effectivenessScores.reduce((sum, score) => sum + score, 0) / effectivenessScores.length
      : 0;

    return {
      totalExercises,
      totalDuration,
      typeStats,
      averageEffectiveness,
      completionRate: totalExercises / daysAgo, // exercises per day
    };
  },
});

// Record exercise by Clerk ID (helper for frontend)
export const recordExerciseByClerkId = mutation({
  args: {
    clerkId: v.string(),
    type: v.string(),
    duration: v.optional(v.number()),
    data: v.object({
      inputs: v.optional(v.union(
        v.object({
          breathingPattern: v.optional(v.string()),
          duration: v.optional(v.number()),
          guidedSteps: v.optional(v.array(v.string())),
        }),
        v.object({
          thoughtText: v.optional(v.string()),
          emotions: v.optional(v.array(v.string())),
          evidenceFor: v.optional(v.array(v.string())),
          evidenceAgainst: v.optional(v.array(v.string())),
          reframedThought: v.optional(v.string()),
        }),
        v.object({
          gratitudeItems: v.optional(v.array(v.string())),
          reflectionNotes: v.optional(v.string()),
        }),
        v.object({
          senses: v.optional(v.object({
            see: v.optional(v.array(v.string())),
            hear: v.optional(v.array(v.string())),
            feel: v.optional(v.array(v.string())),
            smell: v.optional(v.array(v.string())),
            taste: v.optional(v.array(v.string())),
          })),
        })
      )),
      outputs: v.optional(v.object({
        moodBefore: v.optional(v.number()),
        moodAfter: v.optional(v.number()),
        insights: v.optional(v.array(v.string())),
        completionNotes: v.optional(v.string()),
      })),
      effectiveness: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("exercises", {
      userId,
      type: args.type,
      completedAt: Date.now(),
      duration: args.duration,
      data: args.data,
    });
  },
});