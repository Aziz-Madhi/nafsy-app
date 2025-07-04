import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Add a message to a conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
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
  },
  handler: async (ctx, args) => {
    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      audioUrl: args.audioUrl,
      sentiment: args.sentiment,
      metadata: args.metadata,
    });

    // Update conversation's last message time and count
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        lastMessageAt: Date.now(),
        messageCount: conversation.messageCount + 1,
      });
    }

    return messageId;
  },
});

// Get messages for a conversation
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .take(limit);

    return messages;
  },
});

// Get recent messages for context
export const getRecentMessages = query({
  args: {
    conversationId: v.id("conversations"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(args.count);

    return messages.reverse();
  },
});

// Send message and get AI response
export const sendMessage = action({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    content: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    // First, add the user's message
    await ctx.runMutation(api.messages.addMessage, {
      conversationId: args.conversationId,
      userId: args.userId,
      role: "user",
      content: args.content,
      metadata: { language: args.language },
    });

    // Check for emergency keywords
    const emergencyKeywords = [
      "suicide", "kill myself", "end my life", "self-harm", "hurt myself",
      "انتحار", "أقتل نفسي", "أنهي حياتي", "أؤذي نفسي"
    ];
    
    const lowerContent = args.content.toLowerCase();
    const isEmergency = emergencyKeywords.some(keyword => lowerContent.includes(keyword));

    if (isEmergency) {
      // Add emergency response
      await ctx.runMutation(api.messages.addMessage, {
        conversationId: args.conversationId,
        userId: args.userId,
        role: "assistant",
        content: args.language === "ar" 
          ? "أسمع أنك تمر بوقت عصيب جداً. أنا قلق عليك. أريدك أن تعلم أنك لست وحدك. هناك أشخاص يريدون مساعدتك الآن. من فضلك اتصل بخط المساعدة على الرقم 920033360 أو توجه إلى أقرب مستشفى. حياتك مهمة."
          : "I hear that you're going through an incredibly difficult time. I'm concerned about you. I want you to know that you're not alone. There are people who want to help you right now. Please call the crisis helpline at 920033360 or go to your nearest hospital. Your life matters.",
        metadata: { isEmergency: true },
      });
      return;
    }

    // Get recent conversation context
    const recentMessages: any = await ctx.runQuery(api.messages.getRecentMessages, {
      conversationId: args.conversationId,
      count: 10,
    });

    // Get user info for personalization
    const user: any = await ctx.runQuery(api.users.getUserById, {
      userId: args.userId,
    });

    // Call AI action to generate response
    const aiResponse: any = await ctx.runAction(api.ai.generateResponse, {
      messages: recentMessages,
      userInfo: user,
      language: args.language,
    });

    // Add AI response to conversation
    await ctx.runMutation(api.messages.addMessage, {
      conversationId: args.conversationId,
      userId: args.userId,
      role: "assistant",
      content: aiResponse.content,
      sentiment: aiResponse.sentiment,
      metadata: { language: args.language },
    });

    return aiResponse;
  },
});