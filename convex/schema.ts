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
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
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
    isActive: v.boolean(),
    lastMessageAt: v.optional(v.number()),
    messageCount: v.number(),
    metadata: v.optional(v.object({
      mood: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

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
});