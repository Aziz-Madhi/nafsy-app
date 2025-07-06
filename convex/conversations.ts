import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createConversation = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      userId: args.userId,
      title: args.title,
      isActive: true,
      messageCount: 0,
      createdAt: Date.now(),
    });
  },
});

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

export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
    });
  },
});

export const archiveConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      isActive: false,
    });
  },
});

// Archive conversation and trigger summarization
export const archiveConversationWithSummary = action({
  args: {
    conversationId: v.id("conversations"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    // Get conversation details
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check if conversation has meaningful content (more than 2 messages)
    if (conversation.messageCount > 2) {
      // Archive the conversation
      await ctx.runMutation(api.conversations.archiveConversation, {
        conversationId: args.conversationId,
      });

      // Trigger auto-summarization (async, don't wait for it)
      setTimeout(async () => {
        try {
          await ctx.runAction(api.ai.autoSummarizeConversation, {
            conversationId: args.conversationId,
            userId: conversation.userId,
            language: args.language,
          });
        } catch (error) {
          console.error("Auto-summarization failed:", error);
        }
      }, 0);
    } else {
      // Just archive conversations with minimal content
      await ctx.runMutation(api.conversations.archiveConversation, {
        conversationId: args.conversationId,
      });
    }

    return { archived: true, summarized: conversation.messageCount > 2 };
  },
});

export const startNewConversation = mutation({
  args: {
    userId: v.id("users"),
    currentConversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    // Archive current conversation if provided
    if (args.currentConversationId) {
      await ctx.db.patch(args.currentConversationId, {
        isActive: false,
      });
    }
    
    // Create new conversation
    const newConversationId = await ctx.db.insert("conversations", {
      userId: args.userId,
      title: undefined,
      isActive: true,
      messageCount: 0,
      createdAt: Date.now(),
    });
    
    return newConversationId;
  },
});

// Start new conversation with auto-summarization of previous one
export const startNewConversationWithSummary = action({
  args: {
    userId: v.id("users"),
    currentConversationId: v.optional(v.id("conversations")),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    let shouldSummarize = false;
    
    // Check if current conversation should be summarized
    if (args.currentConversationId) {
      const currentConversation = await ctx.db.get(args.currentConversationId);
      shouldSummarize = currentConversation && currentConversation.messageCount > 2;
    }
    
    // Create new conversation and archive current one
    const newConversationId = await ctx.runMutation(api.conversations.startNewConversation, {
      userId: args.userId,
      currentConversationId: args.currentConversationId,
    });
    
    // Trigger auto-summarization of previous conversation if needed
    if (shouldSummarize && args.currentConversationId) {
      setTimeout(async () => {
        try {
          await ctx.runAction(api.ai.autoSummarizeConversation, {
            conversationId: args.currentConversationId!,
            userId: args.userId,
            language: args.language,
          });
        } catch (error) {
          console.error("Auto-summarization failed:", error);
        }
      }, 0);
    }
    
    return { 
      newConversationId, 
      previousConversationSummarized: shouldSummarize 
    };
  },
});