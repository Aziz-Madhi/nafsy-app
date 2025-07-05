import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

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

    // Prepare system prompt based on language and user info
    const systemPrompt = args.language === "ar" 
      ? `أنت مدرب صحة نفسية ودود ومتعاطف يُدعى نفسي. أنت هنا لدعم المستخدم ${args.userInfo?.name || ""} في رحلته نحو الصحة النفسية والنمو الشخصي. 

المبادئ الأساسية:
- كن متعاطفاً ومستمعاً جيداً
- استخدم لغة دافئة وودودة
- اعترف بمشاعر المستخدم وصحّحها
- قدم نصائح عملية مبنية على العلاج المعرفي السلوكي
- احترم الثقافة والقيم المحلية
- لا تقدم تشخيصات طبية أو وصفات دوائية
- شجع المستخدم على طلب المساعدة المهنية عند الحاجة

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

Remember: You are a supportive coach, not a licensed therapist.`;

    // Prepare conversation history for context
    const conversationHistory = args.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add user's mood insights if available
    let contextualInfo = "";
    // TODO: Implement getMoodInsights query in moods.ts
    // if (args.userInfo?.userId) {
    //   const moodInsights = await ctx.runQuery(api.moods.getMoodInsights, {
    //     userId: args.userInfo.userId,
    //   });
    //   ... rest of mood insights logic
    // }

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

// Simple sentiment analysis (can be enhanced with a proper sentiment API)
function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = ["happy", "great", "wonderful", "excellent", "proud", "joy", "سعيد", "رائع", "ممتاز", "فخور", "فرح"];
  const negativeWords = ["sad", "difficult", "hard", "struggle", "pain", "حزين", "صعب", "ألم", "معاناة"];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  let label = "neutral";
  if (score > 0.3) label = "positive";
  else if (score < -0.3) label = "negative";
  
  return { score, label };
}

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