import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { analyzeSentiment, detectMessageLanguage, smartChunkResponse } from "./aiHelpers";

// OpenAI integration for generating AI responses
export const generateResponse = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.float64(),
    })),
    userInfo: v.optional(v.object({
      userId: v.optional(v.id("users")),
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
    language: v.string(),
  },
  returns: v.object({
    content: v.string(),
    sentiment: v.object({
      score: v.number(),
      label: v.string(),
    }),
  }),
  handler: async (ctx, args) => {
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Detect language from user's recent message to ensure response matching
    const lastUserMessage = args.messages.filter(msg => msg.role === 'user').pop();
    const inputLanguage = lastUserMessage ? detectMessageLanguage(lastUserMessage.content) : args.language;
    
    // Prepare system prompt with explicit language instruction
    const systemPrompt = inputLanguage === "ar" 
      ? `أنت مدرب صحة نفسية ودود ومتعاطف يُدعى نفسي. أنت هنا لدعم المستخدم ${args.userInfo?.name || ""} في رحلته نحو الصحة النفسية والنمو الشخصي. 

المبادئ الأساسية:
- كن متعاطفاً ومستمعاً جيداً
- استخدم لغة دافئة وودودة
- اعترف بمشاعر المستخدم وصحّحها
- قدم نصائح عملية مبنية على العلاج المعرفي السلوكي
- احترم الثقافة والقيم المحلية
- لا تقدم تشخيصات طبية أو وصفات دوائية
- شجع المستخدم على طلب المساعدة المهنية عند الحاجة

مهم جداً: يجب أن ترد باللغة العربية فقط. لا تستخدم الإنجليزية أبداً في ردودك.

تذكر: أنت مدرب داعم، وليس معالجاً مرخصاً.`
      : `You are a warm and empathetic mental wellness coach named Nafsy. You are here to support ${args.userInfo?.name || "the user"} in their journey towards mental wellness and personal growth.

Core principles:
- Be empathetic and a good listener
- Use warm and friendly language
- Acknowledge and validate the user's feelings
- Provide practical advice based on CBT principles
- Respect cultural values and local context
- Never provide medical diagnoses or prescriptions
- Encourage seeking professional help when needed

VERY IMPORTANT: You must respond in English ONLY. Never use Arabic in your responses.

Remember: You are a supportive coach, not a licensed therapist.`;

    // Prepare conversation history for context
    const conversationHistory = args.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add user's adaptive profile and mood insights if available
    let contextualInfo = "";
    if (args.userInfo?.userId) {
      // Get user's adaptive profile
      const userSummary = await ctx.runQuery(api.ai.getUserSummary, {
        userId: args.userInfo.userId,
      });
      
      if (userSummary) {
        contextualInfo += args.language === "ar" 
          ? `\n\nالملف الشخصي للمستخدم:\n- الملخص: ${userSummary.summary}\n- المواضيع الرئيسية: ${userSummary.keyThemes.join(", ")}\n- الأنماط العاطفية: ${userSummary.emotionalPatterns.join(", ")}\n- الأساليب المفضلة: ${userSummary.preferredApproaches.join(", ")}\n- التحديات الشائعة: ${userSummary.progress.commonChallenges.join(", ")}\n- الاستراتيجيات الناجحة: ${userSummary.progress.successfulStrategies.join(", ")}\n- عدد المحادثات السابقة: ${userSummary.conversationCount}`
          : `\n\nUser Profile:\n- Summary: ${userSummary.summary}\n- Key themes: ${userSummary.keyThemes.join(", ")}\n- Emotional patterns: ${userSummary.emotionalPatterns.join(", ")}\n- Preferred approaches: ${userSummary.preferredApproaches.join(", ")}\n- Common challenges: ${userSummary.progress.commonChallenges.join(", ")}\n- Successful strategies: ${userSummary.progress.successfulStrategies.join(", ")}\n- Previous conversations: ${userSummary.conversationCount}`;
      }
      
      // TODO: Implement getMoodInsights query in moods.ts
      // const moodInsights = await ctx.runQuery(api.moods.getMoodInsights, {
      //   userId: args.userInfo.userId,
      // });
      // ... rest of mood insights logic
    }

    try {
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          // Model Options:
          // "gpt-4-turbo-preview" - Most capable, slower, expensive
          // "gpt-4" - Very capable, balanced
          // "gpt-3.5-turbo" - Fast, cheaper, good quality
          // "gpt-4o" - Optimized for speed and cost
          model: "gpt-4o",
          
          messages: [
            { role: "system", content: systemPrompt + contextualInfo },
            ...conversationHistory,
          ],
          
          // Temperature: 0.0-2.0 (0 = deterministic, 2 = very creative)
          temperature: 0.8,
          
          // Max tokens: Response length limit (1-4000+ depending on model)
          max_tokens: 300,
          
          // Optional: Add other parameters
          // frequency_penalty: 0.0,    // Reduce repetition (-2.0 to 2.0)
          // presence_penalty: 0.0,     // Encourage new topics (-2.0 to 2.0)
          // top_p: 1.0,               // Alternative to temperature (0.0-1.0)
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0].message.content;

      // Analyze sentiment of AI response
      const sentiment = analyzeSentiment(aiContent);

      return {
        content: aiContent,
        sentiment,
      };
    } catch (error) {
      console.error("AI generation error:", error);
      
      // Fallback response
      const fallbackResponse = args.language === "ar"
        ? "أعتذر، واجهت صعوبة في معالجة رسالتك. هل يمكنك إعادة صياغتها أو المحاولة مرة أخرى؟"
        : "I apologize, I had difficulty processing your message. Could you rephrase or try again?";

      return {
        content: fallbackResponse,
        sentiment: { score: 0, label: "neutral" },
      };
    }
  },
});

// Generate exercise suggestions based on user state
export const suggestExercise = action({
  args: {
    userId: v.id("users"),
    currentMood: v.number(),
    recentEmotions: v.array(v.string()),
    language: v.string(),
  },
  returns: v.object({
    type: v.string(),
    reason: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get user's exercise history
    // TODO: Implement getMostEffectiveExercises query in exercises.ts
    // const exerciseStats = await ctx.runQuery(api.exercises.getMostEffectiveExercises, {
    //   userId: args.userId,
    // });
    const exerciseStats: any[] = [];

    // Logic to suggest appropriate exercise
    let suggestedType = "breathing"; // Default
    
    if (args.currentMood <= 3) {
      // Low mood - suggest grounding or breathing
      suggestedType = "grounding";
    } else if (args.recentEmotions.includes("anxious") || args.recentEmotions.includes("قلق")) {
      suggestedType = "breathing";
    } else if (args.recentEmotions.includes("negative thoughts") || args.recentEmotions.includes("أفكار سلبية")) {
      suggestedType = "thoughtChallenge";
    } else if (args.currentMood >= 7) {
      // Good mood - suggest gratitude to maintain it
      suggestedType = "gratitude";
    }

    // If user has history, prioritize their most effective exercises
    if (exerciseStats.length > 0 && exerciseStats[0].averageEffectiveness >= 4) {
      suggestedType = exerciseStats[0].type;
    }

    return {
      type: suggestedType,
      reason: args.language === "ar" 
        ? "بناءً على حالتك الحالية، أعتقد أن هذا التمرين قد يساعدك"
        : "Based on your current state, I think this exercise might help you",
    };
  },
});

// Generate brief, conversational response for floating chat mode
export const generateFloatingResponse = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.float64(),
    })),
    userInfo: v.optional(v.object({
      userId: v.optional(v.id("users")),
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
    language: v.string(),
  },
  returns: v.object({
    content: v.string(),
    chunks: v.array(v.string()),
    sentiment: v.object({
      score: v.number(),
      label: v.string(),
    }),
  }),
  handler: async (ctx, args) => {
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Detect language from user's recent message to ensure response matching
    const lastUserMessage = args.messages.filter(msg => msg.role === 'user').pop();
    const inputLanguage = lastUserMessage ? detectMessageLanguage(lastUserMessage.content) : args.language;
    
    // Prepare system prompt optimized for floating chat mode
    const systemPrompt = inputLanguage === "ar" 
      ? `أنت صديق داعم ودود يدعى نفسي. أنت تتحدث مع ${args.userInfo?.name || "صديقك"} في محادثة سريعة وودودة.

قواعد مهمة للدردشة السريعة:
- اكتب كما لو كنت ترسل رسالة نصية لصديق مقرب
- اجعل ردودك قصيرة جداً (40-60 حرف كحد أقصى)
- استخدم لغة بسيطة وودودة ومألوفة
- ركز على نقطة واحدة فقط في كل رد
- لا تستخدم قوائم أو تعداد نقطي أو هيكل رسمي
- كن متعاطفاً ومشجعاً
- اسأل أسئلة بسيطة للمتابعة

مهم جداً: يجب أن ترد باللغة العربية فقط. اجعل ردك قصير جداً كرسالة نصية.`
      : `You are a supportive friend named Nafsy chatting with ${args.userInfo?.name || "your friend"} in a quick, friendly conversation.

Important rules for floating chat:
- Write like you're texting a close friend
- Keep responses very short (40-60 characters max)
- Use simple, warm, casual language
- Focus on ONE main point per response
- NO lists, bullet points, or formal structure
- Be empathetic and encouraging
- Ask simple follow-up questions

VERY IMPORTANT: You must respond in English ONLY. Keep it very brief like a text message.`;

    // Prepare conversation history for context
    const conversationHistory = args.messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add minimal user context for floating mode
    let contextualInfo = "";
    if (args.userInfo?.userId) {
      // Get user's adaptive profile but use minimal info for floating mode
      const userSummary = await ctx.runQuery(api.ai.getUserSummary, {
        userId: args.userInfo.userId,
      });
      
      if (userSummary && userSummary.keyThemes.length > 0) {
        const topThemes = userSummary.keyThemes.slice(0, 2); // Only top 2 themes
        contextualInfo = inputLanguage === "ar" 
          ? `\n\nتذكر: صديقك يتحدث عادة عن: ${topThemes.join(", ")}`
          : `\n\nRemember: your friend usually talks about: ${topThemes.join(", ")}`;
      }
    }

    try {
      // Call OpenAI API with optimized settings for brief responses
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt + contextualInfo },
            ...conversationHistory,
          ],
          temperature: 0.9, // Higher creativity for conversational feel
          max_tokens: 50,   // Very short responses
          presence_penalty: 0.2,
          frequency_penalty: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0].message.content.trim();

      // Smart chunking for floating display
      const chunks = smartChunkResponse(aiContent, 50); // 50 char chunks for floating

      // Analyze sentiment of AI response
      const sentiment = analyzeSentiment(aiContent);

      return {
        content: aiContent,
        chunks,
        sentiment,
      };
    } catch (error) {
      console.error("Floating AI generation error:", error);
      
      // Fallback response
      const fallbackResponse = inputLanguage === "ar"
        ? "عذراً، هل يمكنك إعادة المحاولة؟"
        : "Sorry, can you try again?";

      return {
        content: fallbackResponse,
        chunks: [fallbackResponse],
        sentiment: { score: 0, label: "neutral" },
      };
    }
  },
});

// Generate or update user summary for adaptive learning
export const generateUserSummary = action({
  args: {
    userId: v.id("users"),
    language: v.string(),
    newConversationSummary: v.object({
      summary: v.string(),
      keyTopics: v.array(v.string()),
      moodProgression: v.string(),
      therapeuticInsights: v.array(v.string()),
      suggestedNextSteps: v.array(v.string()),
    }),
  },
  returns: v.object({
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
  }),
  handler: async (ctx, args): Promise<{
    summary: string;
    keyThemes: string[];
    emotionalPatterns: string[];
    preferredApproaches: string[];
    triggerWords: string[];
    progress: {
      overallMoodTrend?: string;
      commonChallenges: string[];
      successfulStrategies: string[];
      areas_of_growth: string[];
    };
    conversationCount: number;
  }> => {
    // Get existing user summary if available
    const existingUserSummary: {
      summary: string;
      keyThemes: string[];
      emotionalPatterns: string[];
      preferredApproaches: string[];
      triggerWords: string[];
      progress: {
        overallMoodTrend?: string;
        commonChallenges: string[];
        successfulStrategies: string[];
        areas_of_growth: string[];
      };
      conversationCount: number;
    } | null = await ctx.runQuery(api.ai.getUserSummary, {
      userId: args.userId,
    });

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = args.language === "ar"
      ? `أنت محلل ذكي للصحة النفسية متخصص في تحليل الأنماط وتطوير الملفات الشخصية للمستخدمين. 

مهمتك هي تحليل ملخص المحادثة الجديد وتحديث الملف الشخصي للمستخدم بناءً على:
1. الملف الشخصي الحالي (إذا كان موجوداً)
2. ملخص المحادثة الجديد

يجب أن تقدم JSON يحتوي على:
- summary: ملخص شامل للمستخدم وتحدياته وتقدمه
- keyThemes: المواضيع الرئيسية التي يناقشها المستخدم
- emotionalPatterns: الأنماط العاطفية والمشاعر المتكررة
- preferredApproaches: الأساليب العلاجية التي يستجيب لها المستخدم
- triggerWords: الكلمات أو المواضيع التي تثير ردود فعل قوية
- progress: تحليل تقدم المستخدم
- conversationCount: عدد المحادثات المُحدث

ركز على الأنماط طويلة المدى والتقدم التدريجي.`
      : `You are an intelligent mental health analyst specializing in pattern analysis and user profiling.

Your task is to analyze the new conversation summary and update the user profile based on:
1. The current user profile (if exists)
2. The new conversation summary

You must provide JSON containing:
- summary: Comprehensive summary of the user's challenges and progress
- keyThemes: Main topics the user discusses
- emotionalPatterns: Recurring emotional patterns and feelings
- preferredApproaches: Therapeutic approaches the user responds to
- triggerWords: Words or topics that trigger strong reactions
- progress: Analysis of user's progress
- conversationCount: Updated conversation count

Focus on long-term patterns and gradual progress.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Current User Profile: ${JSON.stringify(existingUserSummary)}\n\nNew Conversation Summary: ${JSON.stringify(args.newConversationSummary)}`
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const userProfile = JSON.parse(data.choices[0].message.content);

      // Update conversation count
      const conversationCount = (existingUserSummary?.conversationCount || 0) + 1;
      userProfile.conversationCount = conversationCount;

      // Save updated user summary
      await ctx.runMutation(api.ai.upsertUserSummary, {
        userId: args.userId,
        ...userProfile,
      });

      return userProfile;
    } catch (error) {
      console.error("User summary generation error:", error);
      
      // Return existing summary or default
      return existingUserSummary || {
        summary: args.language === "ar" ? "ملف شخصي جديد للمستخدم" : "New user profile",
        keyThemes: [],
        emotionalPatterns: [],
        preferredApproaches: [],
        triggerWords: [],
        progress: {
          overallMoodTrend: undefined,
          commonChallenges: [],
          successfulStrategies: [],
          areas_of_growth: [],
        },
        conversationCount: 1,
      };
    }
  },
});

// Summarize conversation with therapeutic insights
export const summarizeConversation = action({
  args: {
    conversationId: v.id("conversations"),
    language: v.string(),
  },
  returns: v.object({
    summary: v.string(),
    keyTopics: v.array(v.string()),
    moodProgression: v.string(),
    therapeuticInsights: v.array(v.string()),
    suggestedNextSteps: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get all messages from the conversation
    const messages = await ctx.runQuery(api.messages.getConversationMessages, {
      conversationId: args.conversationId,
      limit: 100,
    });

    if (!messages.messages || messages.messages.length === 0) {
      return {
        summary: args.language === "ar" ? "لا توجد رسائل للتلخيص" : "No messages to summarize",
        keyTopics: [],
        moodProgression: "",
        therapeuticInsights: [],
        suggestedNextSteps: [],
      };
    }

    // Prepare conversation for analysis
    const conversationText = messages.messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = args.language === "ar"
      ? `أنت محلل محادثات صحة نفسية متخصص. قم بتحليل المحادثة التالية وقدم:
1. ملخص موجز للمحادثة (2-3 جمل)
2. المواضيع الرئيسية التي تمت مناقشتها
3. كيف تطور مزاج المستخدم خلال المحادثة
4. رؤى علاجية مهمة
5. خطوات مقترحة للمستخدم

قدم تحليلاً متعاطفاً ومفيداً يركز على نقاط القوة والنمو.`
      : `You are a mental health conversation analyst. Analyze the following conversation and provide:
1. A brief summary of the conversation (2-3 sentences)
2. Key topics discussed
3. How the user's mood progressed throughout the conversation
4. Important therapeutic insights
5. Suggested next steps for the user

Provide an empathetic and helpful analysis focusing on strengths and growth.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: conversationText },
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      const conversationSummary = {
        summary: analysis.summary || "",
        keyTopics: analysis.keyTopics || [],
        moodProgression: analysis.moodProgression || "",
        therapeuticInsights: analysis.therapeuticInsights || [],
        suggestedNextSteps: analysis.suggestedNextSteps || [],
      };

      // Save conversation summary to database
      await ctx.runMutation(api.ai.saveConversationSummary, {
        conversationId: args.conversationId,
        ...conversationSummary,
        sentimentAnalysis: {
          overallSentiment: analysis.overallSentiment || "neutral",
          emotionalRange: analysis.emotionalRange || [],
          crisisIndicators: analysis.crisisIndicators || [],
        },
      });

      return conversationSummary;
    } catch (error) {
      console.error("Conversation summarization error:", error);
      
      // Fallback response
      const fallbackSummary = {
        summary: args.language === "ar" 
          ? "تعذر تلخيص المحادثة. يرجى المحاولة مرة أخرى."
          : "Unable to summarize conversation. Please try again.",
        keyTopics: [],
        moodProgression: "",
        therapeuticInsights: [],
        suggestedNextSteps: [],
      };

      return fallbackSummary;
    }
  },
});

// Auto-summarize conversation and update user profile
export const autoSummarizeConversation = action({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; conversationSummary?: any; error?: string }> => {
    try {
      // First, summarize the conversation
      const conversationSummary: {
        summary: string;
        keyTopics: string[];
        moodProgression: string;
        therapeuticInsights: string[];
        suggestedNextSteps: string[];
      } = await ctx.runAction(api.ai.summarizeConversation, {
        conversationId: args.conversationId,
        language: args.language,
      });

      // Then, update the user's adaptive profile
      await ctx.runAction(api.ai.generateUserSummary, {
        userId: args.userId,
        language: args.language,
        newConversationSummary: conversationSummary,
      });

      return { success: true, conversationSummary };
    } catch (error) {
      console.error("Auto-summarization error:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

// Query to get user summary
export const getUserSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSummaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Query to get conversation summary
export const getConversationSummary = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversationSummaries")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();
  },
});

// Mutation to save conversation summary
export const saveConversationSummary = mutation({
  args: {
    conversationId: v.id("conversations"),
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
  },
  handler: async (ctx, args) => {
    // Get conversation to get userId
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check if summary already exists
    const existingSummary = await ctx.db
      .query("conversationSummaries")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();

    if (existingSummary) {
      // Update existing summary
      await ctx.db.patch(existingSummary._id, {
        summary: args.summary,
        keyTopics: args.keyTopics,
        moodProgression: args.moodProgression,
        therapeuticInsights: args.therapeuticInsights,
        suggestedNextSteps: args.suggestedNextSteps,
        sentimentAnalysis: args.sentimentAnalysis,
        generatedAt: Date.now(),
      });
      return existingSummary._id;
    } else {
      // Create new summary
      return await ctx.db.insert("conversationSummaries", {
        conversationId: args.conversationId,
        userId: conversation.userId,
        summary: args.summary,
        keyTopics: args.keyTopics,
        moodProgression: args.moodProgression,
        therapeuticInsights: args.therapeuticInsights,
        suggestedNextSteps: args.suggestedNextSteps,
        sentimentAnalysis: args.sentimentAnalysis,
        generatedAt: Date.now(),
      });
    }
  },
});

// Mutation to upsert user summary
export const upsertUserSummary = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if user summary already exists
    const existingSummary = await ctx.db
      .query("userSummaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const summaryData = {
      userId: args.userId,
      summary: args.summary,
      keyThemes: args.keyThemes,
      emotionalPatterns: args.emotionalPatterns,
      preferredApproaches: args.preferredApproaches,
      triggerWords: args.triggerWords,
      progress: args.progress,
      conversationCount: args.conversationCount,
      lastUpdated: Date.now(),
    };

    if (existingSummary) {
      // Update existing summary
      await ctx.db.patch(existingSummary._id, {
        ...summaryData,
        version: existingSummary.version + 1,
      });
      return existingSummary._id;
    } else {
      // Create new summary
      return await ctx.db.insert("userSummaries", {
        ...summaryData,
        version: 1,
      });
    }
  },
});