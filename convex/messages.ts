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

// Add reaction to a message (LEVER: Extending existing message functionality)
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    type: v.union(v.literal("helpful"), v.literal("not-helpful"), v.literal("emoji")),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const reactions = message.reactions || [];
    
    // Remove existing reaction from this user if any
    const filteredReactions = reactions.filter(r => r.userId !== args.userId);
    
    // Add new reaction
    const newReaction = {
      userId: args.userId,
      type: args.type,
      emoji: args.emoji,
      timestamp: Date.now(),
    };
    
    await ctx.db.patch(args.messageId, {
      reactions: [...filteredReactions, newReaction],
    });

    return newReaction;
  },
});

// Remove reaction from a message
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const reactions = message.reactions || [];
    const filteredReactions = reactions.filter(r => r.userId !== args.userId);
    
    await ctx.db.patch(args.messageId, {
      reactions: filteredReactions,
    });

    return true;
  },
});

// Get messages for a conversation with pagination support
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()), // For pagination - can be null for first page
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 100); // Cap at 100 for performance
    
    let query = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc"); // Latest first for better UX

    // Apply cursor pagination if provided
    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }

    const messages = await query.take(limit + 1); // Take one extra to check if there are more

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;
    
    // Generate next cursor from the last message
    const nextCursor = hasMore && results.length > 0 
      ? results[results.length - 1]._creationTime.toString()
      : null;

    return {
      messages: results.reverse(), // Reverse to show oldest first in UI
      nextCursor,
      hasMore,
      total: results.length,
    };
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

    // Enhanced crisis detection (LEVER: Extending existing emergency check)
    const isEmergency = await detectCrisisSignals(args.content, args.language);
    const urgencyLevel = getCrisisUrgencyLevel(args.content, args.language);

    if (isEmergency) {
      // Enhanced emergency response based on urgency level
      const emergencyResponse = getCrisisResponse(urgencyLevel, args.language);
      
      await ctx.runMutation(api.messages.addMessage, {
        conversationId: args.conversationId,
        userId: args.userId,
        role: "assistant",
        content: emergencyResponse,
        metadata: { 
          isEmergency: true,
          language: args.language 
        },
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

    // Map messages to format expected by AI function
    const formattedMessages = recentMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    // Call AI action to generate response
    const aiResponse: any = await ctx.runAction(api.ai.generateResponse, {
      messages: formattedMessages,
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

// Enhanced Crisis Detection System (LEVER: Extending existing safety features)

interface CrisisKeywords {
  immediate: string[];   // Requires immediate intervention
  high: string[];       // High risk, needs urgent support
  moderate: string[];   // Concerning, needs close monitoring
}

const crisisKeywords: { en: CrisisKeywords; ar: CrisisKeywords } = {
  en: {
    immediate: [
      "suicide", "kill myself", "end my life", "want to die", "better off dead",
      "going to hurt myself", "planning to", "tonight", "right now"
    ],
    high: [
      "self-harm", "hurt myself", "cut myself", "overdose", "can't go on",
      "no point", "hopeless", "worthless", "burden", "everyone hates me"
    ],
    moderate: [
      "depressed", "anxious", "panic", "scared", "alone", "sad", "worried",
      "stressed", "overwhelmed", "can't cope", "struggling"
    ]
  },
  ar: {
    immediate: [
      "انتحار", "أقتل نفسي", "أنهي حياتي", "أريد أن أموت", "الأفضل أن أموت",
      "سأؤذي نفسي", "أخطط", "الليلة", "الآن"
    ],
    high: [
      "أؤذي نفسي", "أجرح نفسي", "أقطع نفسي", "جرعة زائدة", "لا أستطيع المتابعة",
      "لا معنى", "يائس", "بلا قيمة", "عبء", "الجميع يكرهني"
    ],
    moderate: [
      "مكتئب", "قلق", "خوف", "خائف", "وحيد", "حزين", "قلق",
      "مضغوط", "مرهق", "لا أستطيع التأقلم", "أكافح"
    ]
  }
};

async function detectCrisisSignals(content: string, language: string): Promise<boolean> {
  const lowerContent = content.toLowerCase();
  const keywords = crisisKeywords[language as 'en' | 'ar'] || crisisKeywords.en;
  
  // Check for immediate crisis indicators
  const hasImmediateCrisis = keywords.immediate.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
  
  // Check for high-risk indicators
  const hasHighRisk = keywords.high.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
  
  return hasImmediateCrisis || hasHighRisk;
}

function getCrisisUrgencyLevel(content: string, language: string): 'immediate' | 'high' | 'moderate' {
  const lowerContent = content.toLowerCase();
  const keywords = crisisKeywords[language as 'en' | 'ar'] || crisisKeywords.en;
  
  // Check in order of severity
  if (keywords.immediate.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return 'immediate';
  }
  
  if (keywords.high.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return 'high';
  }
  
  return 'moderate';
}

function getCrisisResponse(urgencyLevel: 'immediate' | 'high' | 'moderate', language: string): string {
  const responses = {
    en: {
      immediate: "🚨 I'm very concerned about you right now. You mentioned thoughts of suicide or self-harm. Please reach out for immediate help:\n\n• Saudi Crisis Helpline: 920033360\n• Emergency Services: 911\n• Go to your nearest hospital\n\nYou are not alone. People care about you and want to help. Your life has value and meaning.",
      
      high: "I can hear you're in significant emotional pain right now. This is concerning, and I want to make sure you have support:\n\n• Crisis Helpline: 920033360\n• Text 'HELLO' to 741741 for crisis support\n• Consider reaching out to a trusted friend or family member\n\nYour feelings are valid, but you don't have to face this alone. Professional help is available.",
      
      moderate: "I notice you're going through a difficult time. It's important to acknowledge these feelings. Consider:\n\n• Speaking with a counselor or therapist\n• Crisis Helpline if you need immediate support: 920033360\n• Connecting with supportive friends or family\n\nRemember, seeking help is a sign of strength, not weakness."
    },
    ar: {
      immediate: "🚨 أنا قلق جداً عليك الآن. ذكرت أفكار الانتحار أو إيذاء النفس. يرجى طلب المساعدة الفورية:\n\n• خط المساعدة للأزمات السعودي: 920033360\n• خدمات الطوارئ: 911\n• اذهب إلى أقرب مستشفى\n\nأنت لست وحدك. الناس يهتمون بك ويريدون مساعدتك. حياتك لها قيمة ومعنى.",
      
      high: "أستطيع أن أسمع أنك تعاني من ألم عاطفي كبير الآن. هذا مقلق، وأريد التأكد من حصولك على الدعم:\n\n• خط المساعدة للأزمات: 920033360\n• فكر في التواصل مع صديق أو فرد من العائلة تثق به\n\nمشاعرك مبررة، لكن لا يجب أن تواجه هذا وحدك. المساعدة المهنية متاحة.",
      
      moderate: "ألاحظ أنك تمر بوقت صعب. من المهم الاعتراف بهذه المشاعر. فكر في:\n\n• التحدث مع مستشار أو معالج نفسي\n• خط المساعدة للأزمات إذا كنت بحاجة لدعم فوري: 920033360\n• التواصل مع الأصدقاء أو العائلة الداعمين\n\nتذكر، طلب المساعدة علامة على القوة، وليس الضعف."
    }
  };
  
  return responses[language as 'en' | 'ar']?.[urgencyLevel] || responses.en[urgencyLevel];
}