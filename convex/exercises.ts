import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record exercise completion
export const recordExercise = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    duration: v.optional(v.number()),
    conversationId: v.optional(v.id("conversations")),
    data: v.object({
      inputs: v.optional(v.any()),
      outputs: v.optional(v.any()),
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
        .filter((q) => q.eq(q.field("userId"), args.userId!));
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
    const days = args.days || 30;
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("completedAt"), startTime))
      .collect();

    // Group by type
    const exercisesByType: Record<string, number> = {};
    let totalDuration = 0;
    let totalEffectiveness = 0;
    let effectivenessCount = 0;

    exercises.forEach((exercise) => {
      exercisesByType[exercise.type] = (exercisesByType[exercise.type] || 0) + 1;
      
      if (exercise.duration) {
        totalDuration += exercise.duration;
      }
      
      if (exercise.data.effectiveness !== undefined) {
        totalEffectiveness += exercise.data.effectiveness;
        effectivenessCount++;
      }
    });

    return {
      totalExercises: exercises.length,
      exercisesByType,
      totalDurationMinutes: Math.round(totalDuration / 60),
      averageEffectiveness: effectivenessCount > 0 
        ? Math.round((totalEffectiveness / effectivenessCount) * 10) / 10 
        : null,
      exercisesPerDay: exercises.length / days,
    };
  },
});

// Get most effective exercises for user
export const getMostEffectiveExercises = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("data.effectiveness"), undefined))
      .collect();

    // Group by type and calculate average effectiveness
    const effectivenessByType: Record<string, { total: number; count: number }> = {};

    exercises.forEach((exercise) => {
      if (exercise.data.effectiveness !== undefined) {
        if (!effectivenessByType[exercise.type]) {
          effectivenessByType[exercise.type] = { total: 0, count: 0 };
        }
        effectivenessByType[exercise.type].total += exercise.data.effectiveness;
        effectivenessByType[exercise.type].count += 1;
      }
    });

    // Calculate averages and sort
    const averages = Object.entries(effectivenessByType)
      .map(([type, data]) => ({
        type,
        averageEffectiveness: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.averageEffectiveness - a.averageEffectiveness)
      .slice(0, 5);

    return averages;
  },
});

// Exercise type definitions
export const exerciseTypes = {
  breathing: {
    name: "Breathing Exercise",
    nameAr: "تمرين التنفس",
    description: "Deep breathing to reduce anxiety and stress",
    descriptionAr: "التنفس العميق لتقليل القلق والتوتر",
  },
  grounding: {
    name: "5-4-3-2-1 Grounding",
    nameAr: "تمرين التأريض",
    description: "Sensory awareness technique to manage anxiety",
    descriptionAr: "تقنية الوعي الحسي للتحكم في القلق",
  },
  thoughtChallenge: {
    name: "Thought Challenge",
    nameAr: "تحدي الأفكار",
    description: "CBT technique to reframe negative thoughts",
    descriptionAr: "تقنية العلاج المعرفي السلوكي لإعادة صياغة الأفكار السلبية",
  },
  gratitude: {
    name: "Gratitude Practice",
    nameAr: "ممارسة الامتنان",
    description: "Focus on positive aspects of life",
    descriptionAr: "التركيز على الجوانب الإيجابية في الحياة",
  },
  bodyProgressive: {
    name: "Progressive Muscle Relaxation",
    nameAr: "الاسترخاء العضلي التدريجي",
    description: "Systematic tension and relaxation of muscle groups",
    descriptionAr: "شد واسترخاء مجموعات العضلات بشكل منهجي",
  },
};