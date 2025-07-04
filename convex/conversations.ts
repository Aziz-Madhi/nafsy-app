import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new conversation
export const createConversation = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      userId: args.userId,
      title: args.title,
      lastMessageAt: Date.now(),
      messageCount: 0,
      isActive: true,
    });

    return conversationId;
  },
});

// Get user's conversations
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        return {
          ...conv,
          lastMessage: lastMessage ? lastMessage.content : null,
        };
      })
    );

    return conversationsWithLastMessage;
  },
});

// Get active conversation for user
export const getActiveConversation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Archive a conversation
export const archiveConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      isActive: false,
    });
  },
});

// Update conversation metadata
export const updateConversationMetadata = mutation({
  args: {
    conversationId: v.id("conversations"),
    metadata: v.object({
      primaryTopic: v.optional(v.string()),
      emotionalTone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      metadata: args.metadata,
    });
  },
});