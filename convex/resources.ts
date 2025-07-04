import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Seed initial crisis resources (should be called once during setup)
export const seedResources = mutation({
  args: {},
  handler: async (ctx) => {
    // Saudi Arabia crisis resources
    const saudiResources = [
      {
        title: "National Suicide Prevention Hotline",
        titleAr: "الخط الوطني للوقاية من الانتحار",
        description: "24/7 crisis support line for immediate help",
        descriptionAr: "خط دعم الأزمات على مدار الساعة للمساعدة الفورية",
        type: "hotline",
        language: "ar",
        country: "SA",
        phone: "920033360",
        category: ["crisis", "suicide", "emergency"],
        isEmergency: true,
        metadata: {
          hours: "24/7",
          languages: ["ar", "en"],
        },
      },
      {
        title: "Mental Health Support Line",
        titleAr: "خط دعم الصحة النفسية",
        description: "Professional mental health counseling and support",
        descriptionAr: "استشارات ودعم مهني للصحة النفسية",
        type: "hotline",
        language: "ar",
        country: "SA",
        phone: "920033360",
        category: ["mental_health", "counseling", "support"],
        isEmergency: false,
        metadata: {
          hours: "24/7",
          languages: ["ar", "en"],
        },
      },
      {
        title: "Nearest Hospital Emergency",
        titleAr: "طوارئ أقرب مستشفى",
        description: "Go to your nearest hospital emergency department",
        descriptionAr: "توجه إلى قسم الطوارئ في أقرب مستشفى",
        type: "emergency",
        language: "ar",
        country: "SA",
        phone: "997",
        category: ["emergency", "crisis", "hospital"],
        isEmergency: true,
        metadata: {
          service: "ambulance",
        },
      },
    ];

    // International resources (English)
    const internationalResources = [
      {
        title: "Crisis Text Line",
        description: "Free, 24/7 support for those in crisis",
        type: "hotline",
        language: "en",
        url: "https://www.crisistextline.org",
        category: ["crisis", "text", "support"],
        isEmergency: true,
        metadata: {
          textNumber: "741741",
          availability: "US, UK, Canada",
        },
      },
      {
        title: "Mental Health Resources",
        description: "Comprehensive mental health information and tools",
        type: "article",
        language: "en",
        url: "https://www.mentalhealth.gov",
        category: ["education", "resources", "information"],
        isEmergency: false,
      },
    ];

    // Insert all resources
    for (const resource of [...saudiResources, ...internationalResources]) {
      await ctx.db.insert("resources", {
        title: resource.title,
        description: resource.description,
        type: resource.type,
        language: resource.language,
        country: (resource as any).country,
        url: (resource as any).url,
        phone: (resource as any).phone,
        category: resource.category,
        isEmergency: resource.isEmergency,
        metadata: resource.metadata,
      });
    }

    return { success: true, count: saudiResources.length + internationalResources.length };
  },
});

// Get emergency resources by country/language
export const getEmergencyResources = query({
  args: {
    language: v.string(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let resources = await ctx.db
      .query("resources")
      .withIndex("by_emergency", (q) => q.eq("isEmergency", true))
      .filter((q) => q.eq(q.field("language"), args.language))
      .collect();

    // Filter by country if provided
    if (args.country) {
      resources = resources.filter(r => 
        r.country === args.country || !r.country // Include global resources
      );
    }

    return resources;
  },
});

// Get resources by category
export const getResourcesByCategory = query({
  args: {
    category: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_language", (q) => q.eq("language", args.language))
      .collect();

    // Filter by category in memory since Convex array filtering helper isn't available
    return resources.filter((r) => r.category.includes(args.category));
  },
});

// Get all crisis hotlines
export const getCrisisHotlines = query({
  args: {
    language: v.string(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let hotlines = await ctx.db
      .query("resources")
      .withIndex("by_type", (q) => q.eq("type", "hotline"))
      .filter((q) => 
        q.and(
          q.eq(q.field("language"), args.language),
          q.eq(q.field("isEmergency"), true)
        )
      )
      .collect();

    if (args.country) {
      hotlines = hotlines.filter(h => 
        h.country === args.country || !h.country
      );
    }

    return hotlines;
  },
});

// Add custom resource (for admin use)
export const addResource = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    language: v.string(),
    country: v.optional(v.string()),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    category: v.array(v.string()),
    isEmergency: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const resourceId = await ctx.db.insert("resources", args);
    return resourceId;
  },
});