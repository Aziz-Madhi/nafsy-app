import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

// Language detection function (duplicated from ai.ts for consistency)
function detectMessageLanguage(text: string): 'en' | 'ar' {
  // Arabic character range detection
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  // Arabic keywords
  const arabicKeywords = ['انا', 'هذا', 'هل', 'ماذا', 'كيف', 'متى', 'اين', 'لماذا', 'من', 'الى', 'في', 'على', 'مع', 'بعد', 'قبل'];
  
  // English keywords
  const englishKeywords = ['i', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const lowerText = text.toLowerCase();
  
  // Check for Arabic characters first
  if (arabicRegex.test(text)) {
    return 'ar';
  }
  
  // Check for Arabic keywords
  const arabicCount = arabicKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const englishCount = englishKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // If we found Arabic keywords, assume Arabic
  if (arabicCount > 0) {
    return 'ar';
  }
  
  // If we found more English keywords, assume English
  if (englishCount > arabicCount) {
    return 'en';
  }
  
  // Default to English if unclear
  return 'en';
}

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
      chatMode: v.optional(v.string()),
      chunks: v.optional(v.array(v.string())), // For chunked responses
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

// Search messages in a conversation
export const searchMessages = query({
  args: {
    conversationId: v.id("conversations"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 100);
    const searchLower = args.searchQuery.toLowerCase();
    
    // Get all messages for the conversation
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .collect();
    
    // Filter messages that contain the search query
    const matchingMessages = allMessages.filter(message => 
      message.content.toLowerCase().includes(searchLower)
    );
    
    // Return limited results with metadata
    const results = matchingMessages.slice(0, limit);
    
    return {
      messages: results,
      totalMatches: matchingMessages.length,
      searchQuery: args.searchQuery,
    };
  },
});

// Send message and get AI response
export const sendMessage = action({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    content: v.string(),
    language: v.string(),
    chatMode: v.optional(v.union(v.literal("floating"), v.literal("full"))), // New chat mode parameter
    recentMessages: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
    }))),
    userInfo: v.optional(v.object({
      name: v.optional(v.string()),
      language: v.optional(v.string()),
      preferences: v.optional(v.object({
        notifications: v.optional(v.boolean()),
        reminderTime: v.optional(v.string()),
        privacy: v.optional(v.string()),
        dailyCheckInTime: v.optional(v.string()),
        enableNotifications: v.optional(v.boolean()),
        theme: v.optional(v.string()),
        voiceEnabled: v.optional(v.boolean()),
      })),
    })),
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

    // Enhanced crisis detection with AI
    const detectedLanguage = detectMessageLanguage(args.content);
    
    // Use comprehensive AI-powered crisis detection
    const crisisAnalysis = await ctx.runAction(api.ai.detectCrisis, {
      message: args.content,
      language: detectedLanguage,
      userId: args.userId,
      conversationId: args.conversationId,
    });

    if (crisisAnalysis.isCrisis) {
      // Build emergency response based on severity
      let emergencyResponse = '';
      
      if (detectedLanguage === 'ar') {
        emergencyResponse = crisisAnalysis.severity === 'critical' 
          ? '🚨 أرى أنك تمر بوقت عصيب جداً. سلامتك هي الأولوية القصوى.\n\n'
          : crisisAnalysis.severity === 'high'
          ? '💙 أشعر بألمك وأريد أن أساعدك. أنت لست وحدك.\n\n'
          : '💛 أفهم أنك تواجه صعوبات. دعني أساعدك.\n\n';
      } else {
        emergencyResponse = crisisAnalysis.severity === 'critical'
          ? '🚨 I can see you\'re going through an extremely difficult time. Your safety is the top priority.\n\n'
          : crisisAnalysis.severity === 'high'
          ? '💙 I can feel your pain and I want to help. You\'re not alone.\n\n'
          : '💛 I understand you\'re facing difficulties. Let me help you.\n\n';
      }
      
      // Add suggested actions
      if (crisisAnalysis.suggestedActions.length > 0) {
        emergencyResponse += crisisAnalysis.suggestedActions.join('\n') + '\n\n';
      }
      
      // Add resources if available
      if (crisisAnalysis.resources && crisisAnalysis.resources.length > 0) {
        emergencyResponse += detectedLanguage === 'ar' ? '📞 موارد المساعدة:\n' : '📞 Help Resources:\n';
        crisisAnalysis.resources.forEach(resource => {
          emergencyResponse += `• ${resource.title}`;
          if (resource.phone) emergencyResponse += ` - ${resource.phone}`;
          emergencyResponse += '\n';
        });
      }
      
      await ctx.runMutation(api.messages.addMessage, {
        conversationId: args.conversationId,
        userId: args.userId,
        role: "assistant",
        content: emergencyResponse,
        metadata: { 
          isEmergency: true,
          language: detectedLanguage,
          crisisSeverity: crisisAnalysis.severity,
          crisisIndicators: crisisAnalysis.indicators,
        },
      });
      
      // For critical cases, also continue with AI response for therapeutic support
      if (crisisAnalysis.severity !== 'critical') {
        return;
      }
    }

    // Require context to be provided by the client to avoid extra DB round-trips
    if (!args.recentMessages || !args.userInfo) {
      throw new Error("sendMessage now requires recentMessages and userInfo to be supplied by the client.");
    }

    // Ensure the freshly received user message is included in the context sent to the AI
    const formattedMessages = (() => {
      const msgs = [...args.recentMessages];
      const last = msgs[msgs.length - 1];
      if (!last || last.role !== 'user' || last.content !== args.content) {
        msgs.push({
          role: 'user',
          content: args.content,
          timestamp: Date.now(),
        });
      }
      return msgs;
    })();

    const user = args.userInfo;

    // Route to appropriate AI action based on chat mode
    const chatMode = args.chatMode || 'full'; // Default to full mode
    let aiResponse: any;

    if (chatMode === 'floating') {
      // Use floating chat AI for brief, conversational responses
      aiResponse = await ctx.runAction(api.ai.generateFloatingResponse, {
        messages: formattedMessages,
        userInfo: user,
        language: detectedLanguage,
      });
    } else {
      // Use full chat AI for detailed responses
      aiResponse = await ctx.runAction(api.ai.generateResponse, {
        messages: formattedMessages,
        userInfo: user,
        language: detectedLanguage,
      });
    }

    // Add AI response to conversation with chunks if available
    await ctx.runMutation(api.messages.addMessage, {
      conversationId: args.conversationId,
      userId: args.userId,
      role: "assistant",
      content: aiResponse.content,
      sentiment: aiResponse.sentiment,
      metadata: { 
        language: detectedLanguage,
        chatMode,
        chunks: aiResponse.chunks || undefined, // Store chunks for floating mode
      },
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