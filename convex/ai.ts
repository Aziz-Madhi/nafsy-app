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
      
      // Get mood insights
      const moodInsights = await ctx.runQuery(api.moods.getMoodInsights, {
        userId: args.userInfo.userId,
      });
      
      if (moodInsights) {
        contextualInfo += args.language === "ar"
          ? `\n\nرؤى المزاج:\n- المزاج الحالي: ${moodInsights.currentMood}/10\n- متوسط المزاج: ${moodInsights.averageRating.toFixed(1)}/10\n- التقلب: ${moodInsights.volatility > 2 ? 'عالي' : moodInsights.volatility > 1 ? 'متوسط' : 'منخفض'}\n- أفضل وقت في اليوم: ${moodInsights.bestTimeOfDay || 'غير محدد'}\n- العوامل الإيجابية: ${moodInsights.positiveMoodFactors.join(", ") || 'لا يوجد'}\n- العوامل السلبية: ${moodInsights.negativeMoodFactors.join(", ") || 'لا يوجد'}`
          : `\n\nMood Insights:\n- Current mood: ${moodInsights.currentMood}/10\n- Average mood: ${moodInsights.averageRating.toFixed(1)}/10\n- Volatility: ${moodInsights.volatility > 2 ? 'High' : moodInsights.volatility > 1 ? 'Moderate' : 'Low'}\n- Best time of day: ${moodInsights.bestTimeOfDay || 'Not determined'}\n- Positive factors: ${moodInsights.positiveMoodFactors.join(", ") || 'None'}\n- Negative factors: ${moodInsights.negativeMoodFactors.join(", ") || 'None'}`;
      }
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
    const exerciseStats = await ctx.runQuery(api.exercises.getMostEffectiveExercises, {
      userId: args.userId,
      limit: 5,
    });

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

// Detect crisis or emergency situations in messages
export const detectCrisis = action({
  args: {
    message: v.string(),
    language: v.string(),
    userId: v.optional(v.id("users")),
    conversationId: v.optional(v.id("conversations")),
  },
  returns: v.object({
    isCrisis: v.boolean(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    indicators: v.array(v.string()),
    suggestedActions: v.array(v.string()),
    resources: v.optional(v.array(v.object({
      type: v.string(),
      title: v.string(),
      description: v.string(),
      url: v.optional(v.string()),
      phone: v.optional(v.string()),
    }))),
  }),
  handler: async (ctx, args) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Enhanced crisis detection keywords with severity scoring
    const crisisKeywords = {
      en: {
        critical: [
          // Direct self-harm and suicide threats
          'kill myself', 'suicide', 'suicidal', 'end my life', 'want to die',
          'better off dead', 'no reason to live', 'can\'t go on', 'end it all',
          'harm myself', 'self harm', 'cutting myself', 'overdose', 'take my life',
          'not worth living', 'ready to die', 'planning to die', 'goodbye forever',
          'final message', 'last words', 'won\'t be here tomorrow', 'pills to end it',
          // Self-harm methods
          'razor blade', 'jump off', 'hang myself', 'rope around neck', 'gas in car',
          'sleeping pills', 'bridge jump', 'train tracks', 'gun to head',
          // Immediate danger phrases
          'doing it tonight', 'can\'t wait anymore', 'this is it', 'final decision',
          'made my choice', 'peace at last', 'time to go', 'had enough'
        ],
        high: [
          // Severe hopelessness and despair
          'hopeless', 'worthless', 'no point', 'give up', 'can\'t take it',
          'unbearable', 'too much pain', 'nobody cares', 'all alone',
          'meaningless life', 'waste of space', 'burden to everyone',
          'failed at everything', 'nothing left', 'empty inside',
          // Physical crisis symptoms
          'panic attack', 'can\'t breathe', 'dying', 'heart attack', 'chest pain',
          'hyperventilating', 'losing consciousness', 'going crazy',
          'out of control', 'can\'t stop shaking', 'vision blurry',
          // Severe emotional distress
          'completely broken', 'destroyed inside', 'can\'t function',
          'lost my mind', 'going insane', 'mental breakdown',
          'psychotic episode', 'hearing voices', 'seeing things',
          // Isolation and abandonment
          'no one understands', 'completely alone', 'abandoned by all',
          'no friends left', 'family hates me', 'everyone left me'
        ],
        medium: [
          // Depression and anxiety indicators
          'depressed', 'anxious', 'scared', 'overwhelmed', 'breaking down',
          'falling apart', 'can\'t cope', 'losing control', 'desperate',
          'struggling daily', 'hard to breathe', 'constant worry',
          'sleepless nights', 'no energy', 'feel numb', 'emotionally drained',
          // Stress and pressure
          'under pressure', 'too much stress', 'can\'t handle', 'burning out',
          'at breaking point', 'need help', 'don\'t know what to do',
          'losing hope', 'giving up hope', 'things getting worse',
          // Relationship and social issues
          'relationship problems', 'family issues', 'work stress',
          'financial problems', 'health concerns', 'feeling stuck',
          'no direction', 'lost and confused', 'need support'
        ]
      },
      ar: {
        critical: [
          // Direct self-harm and suicide threats
          'انتحر', 'اقتل نفسي', 'انهي حياتي', 'اموت', 'الموت',
          'لا أريد العيش', 'لا فائدة من الحياة', 'أؤذي نفسي',
          'أقتل نفسي', 'أنهي حياتي', 'أريد الموت', 'الحياة لا تستحق',
          'وداعاً للأبد', 'رسالة أخيرة', 'كلمات أخيرة', 'لن أكون هنا غداً',
          'حبوب لإنهاء الأمر', 'قررت الانتحار', 'هذا هو الوقت',
          // Self-harm methods in Arabic
          'شفرة حلاقة', 'أقفز من', 'أشنق نفسي', 'حبل حول رقبتي',
          'غاز في السيارة', 'حبوب منومة', 'قفز من الجسر', 'خطوط القطار',
          'مسدس في رأسي', 'سكين في قلبي',
          // Immediate danger phrases
          'سأفعلها الليلة', 'لا أستطيع الانتظار', 'هذا هو الأمر',
          'قرار نهائي', 'اتخذت قراري', 'السلام أخيراً', 'وقت الذهاب',
          'لقد سئمت', 'انتهيت من كل شيء'
        ],
        high: [
          // Severe hopelessness and despair
          'يائس', 'لا أمل', 'لا قيمة', 'لا فائدة', 'لا أستطيع',
          'لا أتحمل', 'ألم شديد', 'لا أحد يهتم', 'وحيد',
          'حياة لا معنى لها', 'مضيعة مساحة', 'عبء على الجميع',
          'فشلت في كل شيء', 'لا شيء متبقي', 'فارغ من الداخل',
          // Physical crisis symptoms
          'نوبة هلع', 'لا أستطيع التنفس', 'أموت', 'نوبة قلبية',
          'ألم في الصدر', 'أتنفس بصعوبة', 'أفقد الوعي', 'أصبح مجنوناً',
          'خارج السيطرة', 'لا أستطيع التوقف عن الاهتزاز', 'رؤية ضبابية',
          // Severe emotional distress
          'منكسر تماماً', 'مدمر من الداخل', 'لا أستطيع العمل',
          'فقدت عقلي', 'أصبح مجنوناً', 'انهيار عصبي',
          'نوبة ذهانية', 'أسمع أصواتاً', 'أرى أشياء',
          // Isolation and abandonment
          'لا أحد يفهم', 'وحيد تماماً', 'هجرني الجميع',
          'لا أصدقاء متبقين', 'عائلتي تكرهني', 'الجميع تركني'
        ],
        medium: [
          // Depression and anxiety indicators
          'مكتئب', 'قلق', 'خائف', 'مرهق', 'انهار',
          'أتفكك', 'لا أستطيع التأقلم', 'أفقد السيطرة', 'يائس',
          'أكافح يومياً', 'صعب في التنفس', 'قلق مستمر',
          'ليالي بلا نوم', 'لا طاقة', 'أشعر بالخدر', 'منهك عاطفياً',
          // Stress and pressure
          'تحت ضغط', 'ضغط كبير', 'لا أستطيع التعامل', 'أحترق',
          'في نقطة الانهيار', 'أحتاج مساعدة', 'لا أعرف ماذا أفعل',
          'أفقد الأمل', 'أستسلم للأمل', 'الأمور تزداد سوءاً',
          // Relationship and social issues
          'مشاكل في العلاقة', 'مشاكل عائلية', 'ضغط العمل',
          'مشاكل مالية', 'مخاوف صحية', 'أشعر بالعجز',
          'لا اتجاه', 'ضائع ومرتبك', 'أحتاج دعماً'
        ]
      }
    };

    // Enhanced keyword detection with severity scoring
    const messageLower = args.message.toLowerCase();
    const keywords = crisisKeywords[args.language as keyof typeof crisisKeywords] || crisisKeywords.en;
    
    // Severity scoring system
    const severityScores = {
      critical: 100,
      high: 50,
      medium: 10,
      low: 1
    };
    
    let totalScore = 0;
    let immediateSeverity: "low" | "medium" | "high" | "critical" = "low";
    const foundIndicators: string[] = [];
    
    // Check for critical keywords (any critical keyword triggers critical severity)
    for (const keyword of keywords.critical) {
      if (messageLower.includes(keyword)) {
        immediateSeverity = "critical";
        foundIndicators.push(keyword);
        totalScore += severityScores.critical;
      }
    }
    
    // Check for high severity keywords
    for (const keyword of keywords.high) {
      if (messageLower.includes(keyword)) {
        foundIndicators.push(keyword);
        totalScore += severityScores.high;
      }
    }
    
    // Check for medium severity keywords
    for (const keyword of keywords.medium) {
      if (messageLower.includes(keyword)) {
        foundIndicators.push(keyword);
        totalScore += severityScores.medium;
      }
    }
    
    // Calculate final severity based on total score if not already critical
    if (immediateSeverity !== "critical") {
      if (totalScore >= 100) {
        immediateSeverity = "critical";
      } else if (totalScore >= 50) {
        immediateSeverity = "high";
      } else if (totalScore >= 10) {
        immediateSeverity = "medium";
      } else {
        immediateSeverity = "low";
      }
    }
    
    // Language-specific contextual analysis for severity escalation
    const contextualFactors = args.language === "ar" ? {
      // Arabic time references
      hasTimeReference: /\b(الليلة|اليوم|الآن|قريباً|غداً|هذا الأسبوع|هذه الليلة|الليلة|اليوم|فوراً|حالاً|الآن|سريعاً)\b/i.test(args.message),
      // Arabic method references
      hasMethodReference: /\b(حبوب|حبل|شفرة|أقفز|قفز|مسدس|سكين|جسر|قطار|غاز|أشنق|أقتل|أطعن|أرمي)\b/i.test(args.message),
      // Arabic isolation indicators
      hasIsolationIndicators: /\b(وحيد|لا أحد|لا يوجد أحد|معزول|مهجور|متروك|وحدي|بمفردي|لا أصدقاء|لا عائلة)\b/i.test(args.message),
      // Arabic hopelessness indicators
      hasHopelessnessIndicators: /\b(يائس|لا أمل|لا قيمة|لا معنى|لا فائدة|عديم الفائدة|بلا قيمة|بلا معنى|لا جدوى)\b/i.test(args.message),
      // Arabic emotional intensity indicators
      hasEmotionalIntensity: /\b(لا أستطيع|لا أقدر|لن أستطيع|لا أريد|لا أعود|أبداً|دائماً|كل شيء|لا شيء|كل|كله|جميع)\b/i.test(args.message),
      // Arabic religious/cultural distress indicators
      hasReligiousCulturalDistress: /\b(الله لا يريدني|لعنة|معاقب|مذنب|حرام|عار|خجل|فضيحة|عيب|حقير|مرفوض)\b/i.test(args.message),
      // Arabic family/honor related distress
      hasFamilyHonorDistress: /\b(عار العائلة|خجل الأهل|فضيحة الأسرة|سمعة العائلة|شرف العائلة|خذلت أهلي|أهانت عائلتي)\b/i.test(args.message)
    } : {
      // English contextual factors
      hasTimeReference: /\b(tonight|today|now|soon|tomorrow|this week|right now|immediately|shortly|very soon)\b/i.test(args.message),
      hasMethodReference: /\b(pills|rope|blade|jump|gun|knife|bridge|train|gas|hang|kill|stab|throw|overdose)\b/i.test(args.message),
      hasIsolationIndicators: /\b(alone|nobody|no one|isolated|abandoned|lonely|by myself|no friends|no family)\b/i.test(args.message),
      hasHopelessnessIndicators: /\b(hopeless|worthless|pointless|meaningless|useless|no hope|no point|no meaning|no purpose)\b/i.test(args.message),
      hasEmotionalIntensity: /\b(can't|couldn't|won't|don't|never|always|everything|nothing|all|every|completely|totally)\b/i.test(args.message),
      hasReligiousCulturalDistress: /\b(god hates me|cursed|punishment|sinful|shame|disgrace|dishonor|rejected|condemned)\b/i.test(args.message),
      hasFamilyHonorDistress: /\b(family shame|disappointed family|dishonored family|failed parents|let down family|embarrassed family)\b/i.test(args.message)
    };
    
    // Escalate severity based on contextual factors
    const contextScore = Object.values(contextualFactors).filter(Boolean).length;
    if (contextScore >= 3 && immediateSeverity !== "critical") {
      if (immediateSeverity === "high") {
        immediateSeverity = "critical";
      } else if (immediateSeverity === "medium") {
        immediateSeverity = "high";
      } else if (immediateSeverity === "low") {
        immediateSeverity = "medium";
      }
    }
    
    // Add cultural context indicators to found indicators
    const culturalContext = [];
    if (args.language === "ar") {
      if (contextualFactors.hasReligiousCulturalDistress) culturalContext.push("Religious/Cultural Distress");
      if (contextualFactors.hasFamilyHonorDistress) culturalContext.push("Family/Honor Related Distress");
    } else {
      if (contextualFactors.hasReligiousCulturalDistress) culturalContext.push("Religious/Cultural Distress");
      if (contextualFactors.hasFamilyHonorDistress) culturalContext.push("Family/Honor Related Distress");
    }
    foundIndicators.push(...culturalContext);

    // Use AI for more nuanced analysis
    const systemPrompt = args.language === "ar"
      ? `أنت خبير في الصحة النفسية متخصص في تقييم المخاطر. قم بتحليل الرسالة التالية لتحديد ما إذا كانت تشير إلى أزمة أو حالة طوارئ.

يجب عليك تقديم JSON يحتوي على:
- isCrisis: true إذا كانت الرسالة تشير إلى أزمة
- severity: "low", "medium", "high", أو "critical"
- indicators: قائمة بالمؤشرات المحددة في الرسالة
- suggestedActions: إجراءات مقترحة للاستجابة

معايير التقييم:
- critical: تهديدات فورية بإيذاء النفس أو الانتحار
- high: أفكار انتحارية، نوبات هلع شديدة، يأس شديد
- medium: اكتئاب شديد، قلق شديد، صعوبة في التأقلم
- low: ضائقة عامة دون مخاطر فورية`
      : `You are a mental health expert specializing in risk assessment. Analyze the following message to determine if it indicates a crisis or emergency situation.

You must provide JSON containing:
- isCrisis: true if the message indicates a crisis
- severity: "low", "medium", "high", or "critical"
- indicators: list of specific indicators found in the message
- suggestedActions: suggested response actions

Assessment criteria:
- critical: Immediate threats of self-harm or suicide
- high: Suicidal ideation, severe panic attacks, extreme hopelessness
- medium: Severe depression, severe anxiety, difficulty coping
- low: General distress without immediate risk`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.message },
          ],
          temperature: 0.3, // Lower temperature for more consistent crisis detection
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      // Combine keyword detection with AI analysis
      const finalSeverity = immediateSeverity === "critical" ? "critical" : 
                           (analysis.severity === "critical" ? "critical" : 
                            immediateSeverity === "high" || analysis.severity === "high" ? "high" :
                            immediateSeverity === "medium" || analysis.severity === "medium" ? "medium" : "low");
      
      const allIndicators = [...new Set([...foundIndicators, ...(analysis.indicators || [])])];

      // Get emergency resources based on severity
      let resources: any[] = [];
      if (finalSeverity === "critical" || finalSeverity === "high") {
        // Fetch emergency resources from the database
        const emergencyResources = await ctx.runQuery(api.resources.getEmergencyResources, {
          language: args.language,
          limit: 5,
        });
        
        resources = emergencyResources.map(r => ({
          type: r.type,
          title: r.title,
          description: r.description,
          url: r.url,
          phone: r.phone,
        }));
      }

      // Prepare suggested actions based on severity and language
      const suggestedActions = args.language === "ar" 
        ? getSuggestedActionsAr(finalSeverity)
        : getSuggestedActionsEn(finalSeverity);

      return {
        isCrisis: finalSeverity !== "low",
        severity: finalSeverity,
        indicators: allIndicators,
        suggestedActions: [...suggestedActions, ...(analysis.suggestedActions || [])],
        resources,
      };
    } catch (error) {
      console.error("Crisis detection error:", error);
      
      // In case of error, use keyword-based detection only
      return {
        isCrisis: immediateSeverity !== "low",
        severity: immediateSeverity,
        indicators: foundIndicators,
        suggestedActions: args.language === "ar" 
          ? getSuggestedActionsAr(immediateSeverity)
          : getSuggestedActionsEn(immediateSeverity),
        resources: [],
      };
    }
  },
});

// Helper functions for suggested actions
function getSuggestedActionsEn(severity: string): string[] {
  switch (severity) {
    case "critical":
      return [
        "Immediately contact emergency services (911) or crisis hotline",
        "Stay with someone you trust",
        "Remove any means of self-harm",
        "Go to the nearest emergency room if in immediate danger"
      ];
    case "high":
      return [
        "Contact a mental health professional today",
        "Call a crisis helpline for immediate support",
        "Reach out to a trusted friend or family member",
        "Practice emergency coping strategies"
      ];
    case "medium":
      return [
        "Schedule an appointment with a mental health professional",
        "Use coping strategies and self-care techniques",
        "Connect with your support network",
        "Monitor your symptoms closely"
      ];
    default:
      return [
        "Continue using self-care strategies",
        "Maintain regular check-ins with support system",
        "Consider preventive mental health care"
      ];
  }
}

function getSuggestedActionsAr(severity: string): string[] {
  switch (severity) {
    case "critical":
      return [
        "اتصل فوراً بخدمات الطوارئ أو خط الأزمات",
        "ابق مع شخص تثق به",
        "أزل أي وسائل لإيذاء النفس",
        "اذهب إلى أقرب غرفة طوارئ إذا كنت في خطر فوري"
      ];
    case "high":
      return [
        "اتصل بأخصائي صحة نفسية اليوم",
        "اتصل بخط المساعدة في الأزمات للحصول على دعم فوري",
        "تواصل مع صديق موثوق أو أحد أفراد العائلة",
        "مارس استراتيجيات التأقلم الطارئة"
      ];
    case "medium":
      return [
        "حدد موعداً مع أخصائي صحة نفسية",
        "استخدم استراتيجيات التأقلم والرعاية الذاتية",
        "تواصل مع شبكة الدعم الخاصة بك",
        "راقب أعراضك عن كثب"
      ];
    default:
      return [
        "استمر في استخدام استراتيجيات الرعاية الذاتية",
        "حافظ على التواصل المنتظم مع نظام الدعم",
        "فكر في الرعاية الصحية النفسية الوقائية"
      ];
  }
}