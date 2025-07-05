import { mutation } from "./_generated/server";

// Initialize the database with sample data
export const initializeDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already initialized
    const existingResources = await ctx.db.query("resources").take(1);
    if (existingResources.length > 0) {
      return { message: "Database already initialized" };
    }

    // Add sample resources
    const sampleResources = [
      {
        title: "Deep Breathing Exercise",
        description: "A simple 5-minute breathing exercise to reduce anxiety and stress",
        type: "exercise" as const,
        content: "1. Sit comfortably with your back straight\n2. Close your eyes and breathe naturally\n3. Breathe in slowly for 4 counts\n4. Hold for 4 counts\n5. Breathe out slowly for 6 counts\n6. Repeat for 5 minutes",
        tags: ["anxiety", "stress", "breathing", "relaxation"],
        language: "en",
        difficulty: "beginner" as const,
        estimatedDuration: 5,
        isPublic: true,
      },
      {
        title: "تمرين التنفس العميق",
        description: "تمرين تنفس بسيط لمدة 5 دقائق لتقليل القلق والتوتر",
        type: "exercise" as const,
        content: "1. اجلس بوضعية مريحة واستقم ظهرك\n2. أغمض عينيك وتنفس بشكل طبيعي\n3. استنشق ببطء لمدة 4 عدات\n4. احبس أنفاسك لمدة 4 عدات\n5. ازفر ببطء لمدة 6 عدات\n6. كرر لمدة 5 دقائق",
        tags: ["قلق", "توتر", "تنفس", "استرخاء"],
        language: "ar",
        difficulty: "beginner" as const,
        estimatedDuration: 5,
        isPublic: true,
      },
      {
        title: "Understanding Mental Health",
        description: "A comprehensive guide to understanding mental health basics",
        type: "article" as const,
        content: "Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices.",
        tags: ["education", "basics", "mental health", "awareness"],
        language: "en",
        difficulty: "beginner" as const,
        estimatedDuration: 10,
        isPublic: true,
      },
      {
        title: "فهم الصحة النفسية",
        description: "دليل شامل لفهم أساسيات الصحة النفسية",
        type: "article" as const,
        content: "تشمل الصحة النفسية رفاهيتنا العاطفية والنفسية والاجتماعية. إنها تؤثر على طريقة تفكيرنا وشعورنا وتصرفنا. كما تساعد في تحديد كيفية التعامل مع التوتر والتواصل مع الآخرين واتخاذ القرارات.",
        tags: ["تعليم", "أساسيات", "صحة نفسية", "وعي"],
        language: "ar",
        difficulty: "beginner" as const,
        estimatedDuration: 10,
        isPublic: true,
      },
    ];

    for (const resource of sampleResources) {
      await ctx.db.insert("resources", resource);
    }

    return { message: "Database initialized with sample data" };
  },
});