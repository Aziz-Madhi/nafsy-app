import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// OpenAI integration for generating AI responses
export const generateResponse = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.float64(),
    })),
    userInfo: v.any(),
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
      // Return fallback response instead of throwing
      return {
        content: "I'm here to listen and support you. How are you feeling today?",
        sentiment: { score: 0.5, label: "neutral" },
      };
    }

    // Prepare system prompt based on language and user info
    const systemPrompt = args.language === "ar" 
      ? `أنت مدرب صحة نفسية ودود ومتعاطف يُدعى نفسي. أنت هنا لدعم المستخدم ${args.userInfo?.name || ""} في رحلته نحو الصحة النفسية والنمو الشخصي. 

تذكر:
- استخدم لغة دافئة ومطمئنة
- استمع بفعالية وأظهر التعاطف
- قدم نصائح عملية مفيدة عند الحاجة
- شجع على طلب المساعدة المهنية عند اللزوم
- احتفظ بالحدود المهنية المناسبة
- تأكد من أن ردودك مناسبة ثقافياً للسياق العربي السعودي
- إذا لم تكن متأكداً من شيء ما، اعترف بذلك
- ركز على تقوية المستخدم وبناء الثقة بالنفس

رد دائماً بجمل قصيرة ومفهومة. كن مفيداً وعملياً.`
      : `You are Nafsy, a friendly and empathetic mental health coach. You're here to support the user ${args.userInfo?.name || ""} on their mental health and personal growth journey.

Remember to:
- Use warm, reassuring language
- Listen actively and show empathy  
- Provide practical, helpful advice when appropriate
- Encourage professional help when needed
- Maintain appropriate professional boundaries
- Ensure your responses are culturally appropriate for the Saudi context
- If you're unsure about something, acknowledge it
- Focus on empowerment and building self-confidence

Always respond with concise, understandable sentences. Be helpful and practical.`;

    // Map conversation history for OpenAI
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...args.messages.slice(-8).map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          max_tokens: 300,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || "I'm here to support you.";

      // Simple sentiment analysis based on content
      const sentiment = analyzeSentiment(aiContent);

      return {
        content: aiContent,
        sentiment,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      
      // Fallback responses based on language
      const fallbackResponse = args.language === "ar" 
        ? "أشكرك لمشاركتك معي. أنا هنا للاستماع ودعمك. كيف تشعر اليوم؟"
        : "Thank you for sharing with me. I'm here to listen and support you. How are you feeling today?";

      return {
        content: fallbackResponse,
        sentiment: { score: 0.5, label: "neutral" },
      };
    }
  },
});

// Generate quick reply suggestions based on conversation context
export const generateQuickReplies = action({
  args: {
    lastMessage: v.string(),
    conversationContext: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
    userInfo: v.any(),
    language: v.string(),
  },
  returns: v.array(v.object({
    id: v.string(),
    text: v.string(),
    sentiment: v.union(v.literal("positive"), v.literal("neutral"), v.literal("supportive")),
  })),
  handler: async (ctx, args) => {
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Return default suggestions based on language
      return getDefaultQuickReplies(args.language);
    }

    const systemPrompt = args.language === "ar" 
      ? `أنت مساعد ذكي لتطبيق الصحة النفسية "نفسي". مهمتك هي إنشاء 3 اقتراحات سريعة للرد يمكن للمستخدم النقر عليها للمتابعة في المحادثة.

المتطلبات:
- كل اقتراح يجب أن يكون 4-8 كلمات كحد أقصى
- يجب أن تكون الاقتراحات ذات صلة بآخر رسالة في المحادثة
- استخدم لغة إيجابية وداعمة
- تجنب الأسئلة المعقدة أو الشخصية جداً
- ركز على المشاعر والأفكار والأفعال
- يجب أن يشعر المستخدم بالراحة عند استخدام هذه الاقتراحات

أرجع النتيجة كـ JSON فقط بهذا التنسيق:
[{"text": "النص باللغة العربية", "sentiment": "positive|neutral|supportive"}, ...]`
      : `You are an AI assistant for the mental health app "Nafsy". Your task is to generate 3 quick reply suggestions that users can tap to continue the conversation.

Requirements:
- Each suggestion should be 4-8 words maximum
- Suggestions should be relevant to the last message in the conversation
- Use positive, supportive language
- Avoid complex or overly personal questions
- Focus on feelings, thoughts, and actions
- User should feel comfortable using these suggestions

Return result as JSON only in this format:
[{"text": "text in English", "sentiment": "positive|neutral|supportive"}, ...]`;

    const contextString = args.conversationContext
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = `Last message: "${args.lastMessage}"\n\nConversation context:\n${contextString}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        try {
          const suggestions = JSON.parse(content);
          return suggestions.map((suggestion: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            text: suggestion.text,
            sentiment: suggestion.sentiment || "neutral",
          }));
        } catch (parseError) {
          console.error("Failed to parse AI quick replies:", parseError);
        }
      }
    } catch (error) {
      console.error("OpenAI API error for quick replies:", error);
    }

    // Fallback to default suggestions
    return getDefaultQuickReplies(args.language);
  },
});

// Helper function for sentiment analysis
function analyzeSentiment(content: string): { score: number; label: string } {
  const positiveWords = ["good", "great", "better", "happy", "hopeful", "progress", "proud", "strong"];
  const negativeWords = ["bad", "worse", "sad", "hopeless", "difficult", "hard", "struggle", "pain"];
  
  const lowerContent = content.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  let score = 0.5; // neutral
  let label = "neutral";
  
  if (positiveCount > negativeCount) {
    score = 0.7;
    label = "positive";
  } else if (negativeCount > positiveCount) {
    score = 0.3;
    label = "negative";
  }
  
  return { score, label };
}

// Default quick replies when AI is unavailable
function getDefaultQuickReplies(language: string) {
  if (language === "ar") {
    return [
      { id: "ar-1", text: "أشعر بتحسن", sentiment: "positive" as const },
      { id: "ar-2", text: "أحتاج المساعدة", sentiment: "supportive" as const },
      { id: "ar-3", text: "أخبرني المزيد", sentiment: "neutral" as const },
    ];
  }
  
  return [
    { id: "en-1", text: "I'm feeling better", sentiment: "positive" as const },
    { id: "en-2", text: "I need help", sentiment: "supportive" as const },
    { id: "en-3", text: "Tell me more", sentiment: "neutral" as const },
  ];
}