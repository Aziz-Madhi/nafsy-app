import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Optimized schema after migration
export default defineSchema({
  resources: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("article"), v.literal("video"), v.literal("audio"), v.literal("exercise"), v.literal("hotline"), v.literal("emergency")),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    language: v.string(),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    estimatedDuration: v.optional(v.number()),
    isPublic: v.boolean(),
    isEmergency: v.optional(v.boolean()),
    metadata: v.optional(v.object({
      source: v.optional(v.string()),
      author: v.optional(v.string()),
      lastUpdated: v.optional(v.number()),
      version: v.optional(v.string()),
      externalId: v.optional(v.string()),
    })),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_type", ["type"])
    .index("by_language", ["language"]),

  // Keep all other tables the same as the optimized schema
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()), // User's preferred name from onboarding
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    onboardingData: v.optional(v.object({
      primaryGoal: v.optional(v.string()), // What brings them to Nafsy
      initialMood: v.optional(v.string()), // Their mood during onboarding
      completedAt: v.optional(v.number()), // When they completed onboarding
    })),
    preferences: v.optional(v.object({
      notifications: v.optional(v.boolean()),
      reminderTime: v.optional(v.string()),
      privacy: v.optional(v.string()),
      dailyCheckInTime: v.optional(v.string()),
      enableNotifications: v.optional(v.boolean()),
      theme: v.optional(v.string()),
      voiceEnabled: v.optional(v.boolean()),
    })),
    createdAt: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    type: v.optional(v.union(v.literal("general"), v.literal("onboarding"), v.literal("crisis"))),
    isActive: v.boolean(),
    lastMessageAt: v.optional(v.number()),
    messageCount: v.number(),
    metadata: v.optional(v.object({
      mood: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      onboardingStep: v.optional(v.string()), // Track current onboarding step
    })),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_active", ["isActive"])
    .index("by_type", ["type"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
    audioUrl: v.optional(v.string()),
    sentiment: v.optional(v.object({
      score: v.number(),
      label: v.string(),
    })),
    metadata: v.optional(v.object({
      isEmergency: v.optional(v.boolean()),
      exerciseType: v.optional(v.string()),
      language: v.optional(v.string()),
      chatMode: v.optional(v.string()),
      chunks: v.optional(v.array(v.string())), // For chunked responses
    })),
    reactions: v.optional(v.array(v.object({
      userId: v.id("users"),
      type: v.union(v.literal("helpful"), v.literal("not-helpful"), v.literal("emoji")),
      emoji: v.optional(v.string()),
      timestamp: v.number(),
    }))),
  }).index("by_conversation", ["conversationId"]),

  moods: defineTable({
    userId: v.id("users"),
    rating: v.number(),
    note: v.optional(v.string()),
    factors: v.optional(v.array(v.string())),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  exercises: defineTable({
    userId: v.id("users"),
    type: v.string(),
    completedAt: v.number(),
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
  }).index("by_user", ["userId"])
    .index("by_type", ["type"]),

  emergencyContacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
    isPrimary: v.boolean(),
  }).index("by_user", ["userId"]),

  // User summaries for adaptive AI learning
  userSummaries: defineTable({
    userId: v.id("users"),
    summary: v.string(),
    keyThemes: v.array(v.string()),
    emotionalPatterns: v.array(v.string()),
    preferredApproaches: v.array(v.string()),
    triggerWords: v.array(v.string()),
    progress: v.object({
      overallMoodTrend: v.optional(v.string()),
      commonChallenges: v.array(v.string()),
      successfulStrategies: v.array(v.string()),
      areas_of_growth: v.array(v.string()),
    }),
    conversationCount: v.number(),
    lastUpdated: v.number(),
    version: v.number(),
  }).index("by_user", ["userId"]),

  // Individual conversation summaries
  conversationSummaries: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    summary: v.string(),
    keyTopics: v.array(v.string()),
    moodProgression: v.string(),
    therapeuticInsights: v.array(v.string()),
    suggestedNextSteps: v.array(v.string()),
    sentimentAnalysis: v.object({
      overallSentiment: v.string(),
      emotionalRange: v.array(v.string()),
      crisisIndicators: v.array(v.string()),
    }),
    generatedAt: v.number(),
  }).index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"]),
});