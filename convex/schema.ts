import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user profile and preferences
  users: defineTable({
    clerkId: v.string(), // Clerk authentication ID
    email: v.optional(v.string()),
    name: v.string(),
    language: v.string(), // "en" or "ar"
    timezone: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
    // User preferences
    preferences: v.object({
      dailyCheckInTime: v.optional(v.string()), // Time for daily mood check-in reminder
      enableNotifications: v.boolean(),
      voiceEnabled: v.boolean(),
      theme: v.string(), // "light", "dark", or "auto"
    }),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Conversations table - stores chat sessions
  conversations: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()), // Auto-generated or user-defined
    lastMessageAt: v.number(),
    messageCount: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      primaryTopic: v.optional(v.string()), // Main topic discussed
      emotionalTone: v.optional(v.string()), // Overall emotional tone
    })),
  })
    .index("by_user", ["userId"])
    .index("by_last_message", ["lastMessageAt"]),

  // Messages table - stores individual chat messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
    // Optional fields for enhanced functionality
    audioUrl: v.optional(v.string()), // For voice messages
    sentiment: v.optional(v.object({
      score: v.number(), // -1 to 1
      label: v.string(), // "positive", "negative", "neutral"
    })),
    metadata: v.optional(v.object({
      isEmergency: v.optional(v.boolean()),
      exerciseType: v.optional(v.string()), // If message is part of an exercise
      language: v.optional(v.string()), // Message language
    })),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_timestamp", ["timestamp"]),

  // Moods table - tracks daily mood entries
  moods: defineTable({
    userId: v.id("users"),
    rating: v.number(), // 1-10 scale
    emotions: v.array(v.string()), // Array of emotion labels
    note: v.optional(v.string()), // Optional journal entry
    timestamp: v.number(),
    triggers: v.optional(v.array(v.string())), // What triggered this mood
    activities: v.optional(v.array(v.string())), // Activities before mood entry
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_time", ["userId", "timestamp"]),

  // Exercises table - tracks therapeutic exercises completion
  exercises: defineTable({
    userId: v.id("users"),
    type: v.string(), // "breathing", "cbt_thought_challenge", "grounding", etc.
    completedAt: v.number(),
    duration: v.optional(v.number()), // Duration in seconds
    conversationId: v.optional(v.id("conversations")), // Link to conversation if initiated there
    data: v.object({
      // Flexible object to store exercise-specific data
      inputs: v.optional(v.any()),
      outputs: v.optional(v.any()),
      effectiveness: v.optional(v.number()), // User rating of effectiveness (1-5)
    }),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_completed_at", ["completedAt"]),

  // Goals table - for future goal tracking feature
  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "mental_health", "habits", "personal_growth"
    status: v.string(), // "active", "completed", "paused", "abandoned"
    targetDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    progress: v.optional(v.object({
      current: v.number(),
      target: v.number(),
      unit: v.string(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Emergency contacts table - for crisis situations
  emergencyContacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    relationship: v.optional(v.string()),
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Resources table - stores mental health resources
  resources: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(), // "hotline", "article", "exercise", "video"
    language: v.string(), // "en" or "ar"
    country: v.optional(v.string()), // For location-specific resources
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    category: v.array(v.string()), // ["crisis", "anxiety", "depression", etc.]
    isEmergency: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_type", ["type"])
    .index("by_language", ["language"])
    .index("by_emergency", ["isEmergency"]),
});