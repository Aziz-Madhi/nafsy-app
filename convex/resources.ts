import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a new resource
export const addResource = mutation({
  args: {
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
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resourceId = await ctx.db.insert("resources", {
      title: args.title,
      description: args.description,
      type: args.type,
      url: args.url,
      content: args.content,
      tags: args.tags,
      language: args.language,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      isPublic: args.isPublic,
      isEmergency: args.isEmergency,
      country: args.country,
      phone: args.phone,
    });

    return resourceId;
  },
});

// Get resources by filters
export const getResources = query({
  args: {
    type: v.optional(v.union(v.literal("article"), v.literal("video"), v.literal("audio"), v.literal("exercise"), v.literal("hotline"), v.literal("emergency"))),
    language: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("resources");

    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type));
    } else if (args.language) {
      query = query.withIndex("by_language", (q) => q.eq("language", args.language));
    } else if (args.difficulty) {
      query = query.withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty));
    }

    let resources = await query
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(args.limit || 50);

    // Filter by language if not using language index
    if (args.language && !args.language) {
      resources = resources.filter(r => r.language === args.language);
    }

    // Filter by difficulty if not using difficulty index
    if (args.difficulty && !args.difficulty) {
      resources = resources.filter(r => r.difficulty === args.difficulty);
    }

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      resources = resources.filter(r => 
        r.tags && args.tags!.some(tag => r.tags.includes(tag))
      );
    }

    return resources;
  },
});

// Get resource by ID
export const getResource = query({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resourceId);
  },
});

// Get emergency resources (hotlines, crisis support)
export const getEmergencyResources = query({
  args: {
    language: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let resources = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("isEmergency"), true))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    if (args.language) {
      resources = resources.filter(r => r.language === args.language);
    }

    if (args.country) {
      resources = resources.filter(r => r.country === args.country);
    }

    return resources;
  },
});

// Update resource
export const updateResource = mutation({
  args: {
    resourceId: v.id("resources"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    estimatedDuration: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { resourceId, ...updates } = args;
    await ctx.db.patch(resourceId, updates);
  },
});

// Delete resource
export const deleteResource = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.resourceId);
  },
});

// Search resources by text
export const searchResources = query({
  args: {
    searchTerm: v.string(),
    language: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(args.limit || 50);

    const searchTerm = args.searchTerm.toLowerCase();
    
    return resources.filter(resource => {
      const titleMatch = resource.title.toLowerCase().includes(searchTerm);
      const descMatch = resource.description.toLowerCase().includes(searchTerm);
      const tagMatch = resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
      const languageMatch = !args.language || resource.language === args.language;
      
      return (titleMatch || descMatch || tagMatch) && languageMatch;
    });
  },
});